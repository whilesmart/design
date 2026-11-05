<script setup lang="ts" generic="M extends TimelineMoment">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { AreaColor } from '../areas'
import { laneOrder, placeInLanes } from './lanes'
import { typeColors, timeTicks, type TimelineMoment } from './moments'

export interface LaneTimelineProps<M extends TimelineMoment = TimelineMoment> {
  moments: M[]
  /** Which lane a moment runs in. Defaults to its type. */
  laneOf?: (moment: M) => string
  /** Lane order and labels. Lanes not listed follow, busiest first. */
  lanes?: { id: string; label: string }[]
  colors?: Record<string, AreaColor>
  /** Fixed time window in epoch ms. Defaults to the span of the moments. */
  window?: [number, number] | null
  rowHeight?: number
  label?: string
  locale?: string
}

const props = withDefaults(defineProps<LaneTimelineProps<M>>(), {
  laneOf: (m: TimelineMoment) => m.type,
  lanes: () => [],
  colors: () => ({}),
  window: null,
  rowHeight: 44,
  label: 'Moments by lane over time',
  locale: undefined,
})

const focus = defineModel<M['id'] | null>('focus', { default: null })

const box = ref<HTMLElement | null>(null)
const width = ref(1000)
let watcher: ResizeObserver | null = null
onMounted(() => {
  if (!box.value || typeof ResizeObserver === 'undefined') return
  watcher = new ResizeObserver(([entry]) => {
    if (entry!.contentRect.width > 0) width.value = entry!.contentRect.width
  })
  watcher.observe(box.value)
})
onBeforeUnmount(() => watcher?.disconnect())

const order = computed(() => {
  const named = new Map(props.lanes.map((l) => [l.id, l.label]))
  return laneOrder(props.moments, props.laneOf, props.lanes.map((l) => l.id)).map((l) => ({
    ...l,
    label: named.get(l.id) ?? l.label,
  }))
})

const frame = computed(() => ({
  width: width.value,
  height: order.value.length * props.rowHeight + 56,
  left: 148,
  right: 20,
  top: 16,
  bottom: 40,
}))

const layout = computed(() =>
  placeInLanes(props.moments, order.value, props.laneOf, frame.value, props.window ?? undefined),
)
const palette = computed(() => typeColors(props.moments, props.colors))
const ink = (type: string) => `var(--ds-area-${palette.value.get(type) ?? 'slate'}-solid)`

const ticks = computed(() => {
  const { first, last, x } = layout.value
  if (!layout.value.placed.length) return []
  return timeTicks(first, last, props.locale).map((t) => ({ ...t, x: x(t.at) }))
})

const short = (text: string, n = 18) => (text.length > n ? `${text.slice(0, n - 1)}…` : text)

function pick(id: M['id']) {
  focus.value = focus.value === id ? null : id
}
</script>

<template>
  <div ref="box" class="ds-lane-timeline">
    <svg
      :viewBox="`0 0 ${frame.width} ${frame.height}`"
      :height="frame.height"
      class="ds-lane-timeline__svg"
      role="img"
      :aria-label="label"
      @click="focus = null"
    >
      <g v-for="(lane, i) in order" :key="lane.id" class="ds-lane-timeline__lane">
        <rect
          :x="0"
          :y="frame.top + i * layout.row"
          :width="frame.width"
          :height="layout.row"
          :class="{ 'is-alt': i % 2 === 1 }"
          class="ds-lane-timeline__row"
        />
        <text :x="16" :y="frame.top + i * layout.row + layout.row / 2" dominant-baseline="central" class="ds-lane-timeline__name">
          {{ short(lane.label) }}
          <tspan class="ds-lane-timeline__count">{{ ` ${lane.count}` }}</tspan>
        </text>
      </g>
      <g class="ds-lane-timeline__axis">
        <line
          v-for="t in ticks"
          :key="`grid-${t.at}`"
          :x1="t.x"
          :x2="t.x"
          :y1="frame.top"
          :y2="frame.height - frame.bottom"
          class="ds-lane-timeline__grid"
        />
        <text v-for="t in ticks" :key="t.at" :x="t.x" :y="frame.height - 16" text-anchor="middle">{{ t.label }}</text>
      </g>
      <g
        v-for="p in layout.placed"
        :key="p.moment.id"
        class="ds-lane-timeline__moment"
        :class="{ 'is-focus': p.moment.id === focus, 'is-dim': focus != null && p.moment.id !== focus }"
        :data-moment="p.moment.id"
        @click.stop="pick(p.moment.id)"
      >
        <rect
          v-if="p.end !== null"
          :x="p.x"
          :y="p.y - 7"
          :width="Math.max(p.end - p.x, 4)"
          height="14"
          rx="7"
          :fill="ink(p.moment.type)"
          class="ds-lane-timeline__span"
        />
        <slot
          v-else
          name="mark"
          :moment="p.moment"
          :x="p.x"
          :y="p.y"
          :color="ink(p.moment.type)"
          :focused="p.moment.id === focus"
          :dimmed="focus != null && p.moment.id !== focus"
        >
          <circle :cx="p.x" :cy="p.y" r="6" :fill="ink(p.moment.type)" class="ds-lane-timeline__dot" />
        </slot>
        <title>{{ p.moment.label }}</title>
      </g>
    </svg>
  </div>
</template>
