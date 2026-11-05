<script setup lang="ts" generic="T">
import { computed, ref, watch } from 'vue'
import {
  Handle,
  Position,
  VueFlow,
  type Edge,
  type Node,
  type NodeDragEvent,
  type NodeMouseEvent,
  type VueFlowStore,
} from '@vue-flow/core'
import DsCanvasControls from './DsCanvasControls.vue'
import { forgetPositions, layoutLanes, readSavedPositions, savePosition, type Lane, type Point } from './layout'
import { drawEdges, type CanvasEdge } from './edges'

/**
 * Cards in named columns, with lines between the ones that relate. Placement comes from the
 * lanes and their order, so the same data draws the same picture on every visit, and a card
 * the reader drags is kept where they left it under `storageKey`.
 */

export interface CanvasItem<D> {
  id: string
  lane: string
  data: D
}

export interface CanvasProps<D> {
  lanes: Lane[]
  items: CanvasItem<D>[]
  edges?: CanvasEdge[]
  /** The types of line a reader can switch off, shown as a legend. */
  edgeTypes?: { type: string; label: string }[]
  /** Where dragged positions are kept. Without one, nothing is kept. */
  storageKey?: string
  selected?: string | null
  /** Items not matching dim rather than vanish, so the layout holds still. */
  highlight?: Set<string> | null
}

const props = withDefaults(defineProps<CanvasProps<T>>(), {
  edges: () => [],
  edgeTypes: () => [],
  storageKey: undefined,
  selected: null,
  highlight: null,
})

const emit = defineEmits<{ select: [id: string | null] }>()

defineSlots<{
  card(props: { item: CanvasItem<T>; selected: boolean; dimmed: boolean }): unknown
  lane?(props: { lane: Lane; count: number }): unknown
  empty?(): unknown
}>()

const saved = ref<Record<string, Point>>(props.storageKey ? readSavedPositions(props.storageKey) : {})
watch(
  () => props.storageKey,
  (key) => (saved.value = key ? readSavedPositions(key) : {}),
)

const hidden = ref(new Set<string>())

const byId = computed(() => new Map(props.items.map((i) => [i.id, i])))
const counts = computed(() => {
  const counted = new Map<string, number>()
  for (const item of props.items) counted.set(item.lane, (counted.get(item.lane) ?? 0) + 1)
  return counted
})

const nodes = computed<Node[]>(() => {
  const placed = layoutLanes(props.lanes, props.items, saved.value)
  return [
    ...placed.lanes.map((lane) => ({
      id: `lane:${lane.id}`,
      type: 'lane',
      position: lane.position,
      draggable: false,
      selectable: false,
      focusable: false,
      zIndex: -1,
      style: { width: `${lane.width}px`, height: `${lane.height}px` },
      data: { lane },
    })),
    ...placed.items.map((item) => ({
      id: item.id,
      type: 'card',
      position: item.position,
      data: { item: byId.value.get(item.id)! },
    })),
  ]
})

const laneIds = computed(() => new Set(props.lanes.map((l) => l.id)))

function nodeOf(id: string) {
  if (byId.value.has(id)) return id
  if (laneIds.value.has(id)) return `lane:${id}`
  return null
}

const edges = computed<Edge[]>(() =>
  drawEdges(props.edges, { hidden: hidden.value, selected: props.selected, nodeOf }),
)

function toggle(type: string) {
  const next = new Set(hidden.value)
  if (next.has(type)) next.delete(type)
  else next.add(type)
  hidden.value = next
}

function onDragStop(event: NodeDragEvent) {
  if (!props.storageKey) return
  for (const node of event.nodes) {
    savePosition(props.storageKey, node.id, node.position)
    saved.value = { ...saved.value, [node.id]: { ...node.position } }
  }
}

function reset() {
  if (props.storageKey) forgetPositions(props.storageKey)
  saved.value = {}
}

function onReady(flow: VueFlowStore) {
  flow.fitView({ maxZoom: 1, padding: 0.15 })
}
</script>

<template>
  <div class="ds-canvas">
    <div v-if="!items.length" class="ds-canvas__empty">
      <slot name="empty" />
    </div>
    <VueFlow
      v-else
      :nodes="nodes"
      :edges="edges"
      :min-zoom="0.2"
      :max-zoom="1.6"
      :nodes-connectable="false"
      :elevate-edges-on-select="false"
      class="ds-canvas__flow"
      @pane-ready="onReady"
      @node-click="(e: NodeMouseEvent) => e.node.type === 'card' && emit('select', e.node.id)"
      @pane-click="emit('select', null)"
      @node-drag-stop="onDragStop"
    >
      <template #node-lane="{ data }">
        <Handle type="target" :position="Position.Left" :connectable="false" class="ds-canvas__handle" />
        <Handle type="source" :position="Position.Right" :connectable="false" class="ds-canvas__handle" />
        <div class="ds-canvas__lane">
          <div class="ds-canvas__lane-head">
            <slot name="lane" :lane="data.lane" :count="counts.get(data.lane.id) ?? 0">
              <span class="ds-canvas__lane-name" :title="data.lane.label">{{ data.lane.label }}</span>
              <span>{{ counts.get(data.lane.id) ?? 0 }}</span>
            </slot>
          </div>
        </div>
      </template>
      <template #node-card="{ data }">
        <Handle type="target" :position="Position.Left" :connectable="false" class="ds-canvas__handle" />
        <Handle type="source" :position="Position.Right" :connectable="false" class="ds-canvas__handle" />
        <div class="ds-canvas__card" :class="{ 'is-dim': highlight && !highlight.has(data.item.id) }">
          <slot
            name="card"
            :item="data.item"
            :selected="data.item.id === selected"
            :dimmed="!!highlight && !highlight.has(data.item.id)"
          />
        </div>
      </template>

      <DsCanvasControls :resettable="!!storageKey" @reset="reset" />
    </VueFlow>

    <div v-if="items.length && edgeTypes.length" class="ds-canvas__legend" role="group" aria-label="Lines">
      <button
        v-for="source in edgeTypes"
        :key="source.type"
        type="button"
        :aria-pressed="!hidden.has(source.type)"
        :class="{ 'is-off': hidden.has(source.type) }"
        @click="toggle(source.type)"
      >
        <span class="ds-canvas__swatch" :class="`ds-canvas__swatch--${source.type}`" />
        {{ source.label }}
      </button>
    </div>
  </div>
</template>
