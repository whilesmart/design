<script setup lang="ts" generic="E extends TimelineEvent, R extends TimelineRecord">
import { computed, nextTick, ref, watch } from 'vue'
import DsAvatar from '../components/DsAvatar.vue'
import DsIcon from '../components/DsIcon.vue'
import type { AreaColor } from '../areas'
import {
  layoutStream,
  streamMonths,
  streamSizes,
  type StreamLines,
  type StreamShelf,
  type StreamSizes,
  type TimelineEvent,
  type TimelineRecord,
} from './events'
import { kindColors, timeTicks } from './moments'
import { usePanZoom } from './usePanZoom'

export interface StreamTimelineProps<E extends TimelineEvent = TimelineEvent, R extends TimelineRecord = TimelineRecord> {
  events: E[]
  /** What the events touch, gathered into shelves under them. */
  records?: R[]
  /** Which shelf a record sits on. Defaults to its `group`. */
  groupOf?: (record: R) => string
  /** Area colour per record kind. Kinds left out take the palette in order. */
  colors?: Record<string, AreaColor>
  /** Record ids to light, for example the ones an answer cited. */
  lit?: (string | number)[] | null
  sizes?: Partial<StreamSizes>
  minZoom?: number
  maxZoom?: number
  /** How many of the latest days to open on. `all` opens on everything. */
  opening?: number | 'all'
  /** Days of empty time drawn before the rest of a quiet stretch is cut out. `null` keeps calendar scale. */
  squeeze?: number | null
  /** How threads run from cards to shelves. */
  lines?: StreamLines
  label?: string
  locale?: string
}

const props = withDefaults(defineProps<StreamTimelineProps<E, R>>(), {
  records: () => [],
  groupOf: undefined,
  colors: () => ({}),
  lit: null,
  sizes: () => ({}),
  minZoom: 0.05,
  maxZoom: 2,
  opening: 14,
  squeeze: 3,
  lines: 'step',
  label: 'Events over time and what they touched',
  locale: undefined,
})

const emit = defineEmits<{ open: [event: E] }>()

const focus = defineModel<E['id'] | null>('focus', { default: null })
const hidden = defineModel<string[]>('hidden', { default: () => [] })
const opened = defineModel<string | null>('shelf', { default: null })

const sizes = computed<StreamSizes>(() => ({ ...streamSizes, ...props.sizes }))
const shown = computed(() => props.records.filter((r) => !hidden.value.includes(r.kind)))
const seen = ref<{ x: number; width: number } | null>(null)
const layout = computed(() =>
  layoutStream(props.events, shown.value, {
    groupOf: props.groupOf,
    open: opened.value,
    sizes: sizes.value,
    view: seen.value,
    squeeze: props.squeeze,
    lines: props.lines,
  }),
)
const palette = computed(() => kindColors(props.records, props.colors))
const ink = (kind: string) => `var(--ds-area-${palette.value.get(kind) ?? 'slate'}-solid)`

const content = computed(() => ({ width: layout.value.width, height: layout.value.height }))
const { box, zoom, view, grabbing, fit: refit, zoomBy, show, handlers } = usePanZoom(content, {
  min: props.minZoom,
  max: props.maxZoom,
  opening: () => {
    const { last, x, width, cards } = layout.value
    if (props.opening === 'all' || !cards.length) return null
    const from = Math.max(0, x(last - props.opening * 86_400_000) - sizes.value.pad)
    return { x: from, y: 0, width: Math.max(width - from, 320), height: layout.value.height }
  },
})

function hold(el: unknown) {
  box.value = el instanceof HTMLElement ? el : null
}

watch(view, (v) => (seen.value = { x: v.x, width: v.width }))

const hover = ref<E['id'] | null>(null)
function hoverOn(id: E['id'] | null) {
  hover.value = id
}
const active = computed(() => hover.value ?? focus.value)

const touchedBy = computed(() => new Map(layout.value.cards.map((c) => [c.event.id, layout.value.touched(c.event)])))

const lit = computed(() => {
  if (props.lit) return new Set(props.lit)
  if (active.value == null) return null
  return new Set((touchedBy.value.get(active.value) ?? []).map((r) => r.id))
})

const ticks = computed(() => {
  const { first, last, x } = layout.value
  if (!layout.value.cards.length) return []
  const out: { at: number; label: string; x: number }[] = []
  for (const t of timeTicks(first, last, props.locale)) {
    const at = x(t.at)
    if (!out.length || at - out[out.length - 1]!.x >= 56) out.push({ ...t, x: at })
  }
  return out
})

const months = computed(() => {
  const { first, last, x } = layout.value
  if (!layout.value.cards.length) return []
  let edge = -Infinity
  return streamMonths(first, last, x, sizes.value.card.width).filter((m) => {
    if (m.left - edge < 72) return false
    edge = m.left
    return true
  }).map((m) => ({
    ...m,
    label: new Date(m.at).toLocaleDateString(props.locale, { month: 'short', year: 'numeric', timeZone: 'UTC' }),
  }))
})

const counts = computed(() => {
  const n = new Map<string, number>()
  for (const r of props.records) n.set(r.kind, (n.get(r.kind) ?? 0) + 1)
  return [...n.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
})

function fit() {
  opened.value = null
  refit()
}

function showMonth(month: { left: number; right: number }) {
  show({ x: month.left, y: 0, width: Math.max(month.right - month.left, 320), height: layout.value.cardsBottom + 16 })
}

async function expand(shelf: StreamShelf<R>) {
  if (opened.value === shelf.name) return fit()
  opened.value = shelf.name
  await nextTick()
  const s = layout.value.shelves.find((x) => x.name === shelf.name)
  if (s) show({ x: s.left, y: layout.value.shelfTop - 8, width: Math.max(s.width, 320), height: s.height + 16 })
}

function pick(id: E['id']) {
  focus.value = focus.value === id ? null : id
}

function toggle(kind: string) {
  hidden.value = hidden.value.includes(kind) ? hidden.value.filter((k) => k !== kind) : [...hidden.value, kind]
}

function litFirst(records: R[]) {
  const on = lit.value
  return on ? [...records].sort((a, b) => Number(on.has(b.id)) - Number(on.has(a.id))) : records
}

watch(focus, (id) => {
  if (id == null || zoom.value >= 0.5) return
  const card = layout.value.cards.find((c) => c.event.id === id)
  const w = sizes.value.card.width
  if (card) show({ x: card.left - 400, y: 0, width: w + 800, height: layout.value.cardsBottom + 16 })
})

const named = (kind: string) => kind.charAt(0).toUpperCase() + kind.slice(1).replace(/_/g, ' ')
const day = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString(props.locale, { day: 'numeric', month: 'short', timeZone: 'UTC' }) : ''

defineExpose({ fit, show, zoomBy })
</script>

<template>
  <div class="ds-stream-timeline">
    <div class="ds-stream-timeline__view">
      <div
        :ref="hold"
        class="ds-stream-timeline__box"
        :class="{ 'is-grabbing': grabbing }"
        role="region"
        :aria-label="label"
        @scroll="handlers.scroll"
        @wheel="handlers.wheel"
        @pointerdown="handlers.pointerdown"
        @pointermove="handlers.pointermove"
        @pointerup="handlers.pointerup"
        @pointercancel="handlers.pointercancel"
      >
        <div :style="{ width: `${layout.width * zoom}px`, height: `${layout.height * zoom}px`, position: 'relative' }">
          <div
            class="ds-stream-timeline__sheet"
            :style="{ width: `${layout.width}px`, height: `${layout.height}px`, transform: `scale(${zoom})` }"
          >
            <svg :viewBox="`0 0 ${layout.width} ${layout.height}`" :width="layout.width" :height="layout.height" class="ds-stream-timeline__lines" aria-hidden="true">
              <line
                v-for="t in ticks"
                :key="t.at"
                :x1="t.x"
                :x2="t.x"
                :y1="sizes.axis - 6"
                :y2="layout.shelfTop - 24"
                class="ds-stream-timeline__grid"
              />
              <g v-for="b in layout.breaks" :key="`break-${b.x}`" class="ds-stream-timeline__break">
                <line :x1="b.x" :x2="b.x" :y1="sizes.axis - 6" :y2="layout.cardsBottom" />
                <title>{{ b.days }} quiet days left out</title>
              </g>
              <path
                v-for="t in layout.threads"
                :key="t.key"
                :d="t.d"
                class="ds-stream-timeline__thread"
                :class="{ 'is-on': active === t.event, 'is-off': active != null && active !== t.event }"
                :stroke-width="Math.min(1 + (t.count - 1) * 0.4, 3)"
              />
            </svg>

            <button
              v-for="m in months"
              :key="m.key"
              type="button"
              class="ds-stream-timeline__month"
              :style="{ left: `${m.left}px` }"
              :title="`Show ${m.label}`"
              @click="showMonth(m)"
            >
              {{ m.label }}
            </button>

            <div
              v-for="c in layout.cards"
              :key="c.event.id"
              class="ds-stream-timeline__slot"
              :style="{ left: `${c.left}px`, top: `${c.top}px`, width: `${sizes.card.width}px`, height: `${sizes.card.height}px` }"
              @mouseenter="hoverOn(c.event.id)"
              @mouseleave="hoverOn(null)"
            >
              <slot
                name="card"
                :event="c.event"
                :records="touchedBy.get(c.event.id) ?? []"
                :focused="focus === c.event.id"
                :dimmed="active != null && active !== c.event.id"
                :pick="() => pick(c.event.id)"
              >
                <button
                  type="button"
                  class="ds-stream-timeline__card"
                  :class="{ 'is-focus': focus === c.event.id, 'is-dim': active != null && active !== c.event.id }"
                  @click="pick(c.event.id)"
                >
                  <span class="ds-stream-timeline__card-head">
                    <DsIcon v-if="c.event.icon" :name="c.event.icon as `solar:${string}`" />
                    <span v-if="c.event.place" class="ds-stream-timeline__place">{{ c.event.place.label }}</span>
                    <span class="ds-stream-timeline__day">{{ day(c.event.at) }}</span>
                  </span>
                  <span class="ds-stream-timeline__title">{{ c.event.title }}</span>
                  <span class="ds-stream-timeline__card-foot">
                    <span v-if="c.event.actors?.length" class="ds-stream-timeline__faces">
                      <DsAvatar v-for="a in c.event.actors.slice(0, 4)" :key="a.id" :name="a.name" :src="a.avatar" size="sm" />
                    </span>
                    <span v-if="c.event.count != null" class="ds-stream-timeline__count">
                      <DsIcon name="solar:chat-line-linear" />{{ c.event.count }}
                    </span>
                    <span v-if="(touchedBy.get(c.event.id) ?? []).length" class="ds-stream-timeline__touched">
                      <span
                        v-for="r in (touchedBy.get(c.event.id) ?? []).slice(0, 6)"
                        :key="r.id"
                        class="ds-stream-timeline__swatch"
                        :style="{ background: ink(r.kind) }"
                      />
                      {{ (touchedBy.get(c.event.id) ?? []).length }}
                    </span>
                  </span>
                </button>
              </slot>
              <button
                v-if="c.event.parts"
                type="button"
                class="ds-stream-timeline__parts"
                :aria-label="`Open ${c.event.parts} parts of ${c.event.title}`"
                @click="emit('open', c.event)"
              >
                {{ c.event.parts }}
              </button>
            </div>

            <div
              v-for="s in layout.shelves"
              :key="s.name"
              class="ds-stream-timeline__shelf"
              :style="{ left: `${s.left}px`, width: `${s.width}px`, top: `${layout.shelfTop}px`, height: `${s.height}px` }"
            >
              <button
                type="button"
                class="ds-stream-timeline__shelf-head"
                :class="{ 'is-open': s.open }"
                :aria-expanded="s.open"
                :title="s.name"
                @click="expand(s)"
              >
                <slot name="shelf" :shelf="s">
                  <span class="ds-stream-timeline__shelf-name">{{ s.name }}</span>
                  <span>{{ s.records.length }}</span>
                </slot>
              </button>
              <ul class="ds-stream-timeline__records">
                <li
                  v-for="r in litFirst(s.records).slice(0, s.listed)"
                  :key="r.id"
                  class="ds-stream-timeline__record"
                  :class="{ 'is-lit': lit?.has(r.id), 'is-dim': lit && !lit.has(r.id) }"
                  :title="r.label"
                >
                  <slot name="record" :record="r" :lit="Boolean(lit?.has(r.id))" :color="ink(r.kind)">
                    <span class="ds-stream-timeline__swatch" :style="{ background: ink(r.kind) }" />
                    <span class="ds-stream-timeline__record-label">{{ r.label }}</span>
                  </slot>
                </li>
              </ul>
              <button v-if="s.records.length > s.listed" type="button" class="ds-stream-timeline__more" @click="expand(s)">
                {{ s.records.length - s.listed }} more
              </button>
            </div>

            <div v-if="!layout.cards.length" class="ds-stream-timeline__empty">
              <slot name="empty">No events yet.</slot>
            </div>
          </div>
        </div>
      </div>

      <div class="ds-stream-timeline__controls" role="toolbar" aria-label="Zoom">
        <button type="button" title="Zoom out" aria-label="Zoom out" @click="zoomBy(1 / 1.25)">
          <DsIcon name="solar:minus-circle-linear" />
        </button>
        <span class="ds-stream-timeline__zoom" aria-live="polite">{{ Math.round(zoom * 100) }}%</span>
        <button type="button" title="Zoom in" aria-label="Zoom in" @click="zoomBy(1.25)">
          <DsIcon name="solar:add-circle-linear" />
        </button>
        <button type="button" title="Fit" aria-label="Fit everything" @click="fit()">
          <DsIcon name="solar:maximize-square-minimalistic-linear" />
        </button>
      </div>
    </div>

    <div v-if="counts.length" class="ds-stream-timeline__legend" role="group" aria-label="Kinds">
      <button
        v-for="[kind, count] in counts"
        :key="kind"
        type="button"
        class="ds-stream-timeline__kind"
        :class="{ 'is-off': hidden.includes(kind) }"
        :aria-pressed="!hidden.includes(kind)"
        @click="toggle(kind)"
      >
        <span class="ds-stream-timeline__swatch" :style="{ background: ink(kind) }" />
        {{ named(kind) }}
        <span class="ds-stream-timeline__count">{{ count }}</span>
      </button>
    </div>
  </div>
</template>
