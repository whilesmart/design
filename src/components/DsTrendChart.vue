<script setup lang="ts">
import { computed, getCurrentInstance, ref } from 'vue'
import { areaStyle, type AreaColor } from '../areas'
import { axisTicks, dateTicks, nearestIndex, peakOf, plotArea, plotPoints } from '../charts'
import type { TrendPoint } from '../charts'

export type { TrendPoint }

const props = withDefaults(defineProps<{
  title: string
  points: TrendPoint[]
  area?: AreaColor
  unit?: string | null
  valueLabel?: string
  dateLabel?: string
  emptyText?: string
}>(), {
  area: 'indigo',
  unit: null,
  valueLabel: '',
  dateLabel: 'Date',
  emptyText: 'No data for this period.',
})

// One viewBox for every chart on the page: the axis type then scales with the container at
// the same rate everywhere, so two charts side by side read at one size.
const box = { width: 640, height: 220, left: 52, right: 12, top: 16, bottom: 34 }
const plot = plotArea(box)

const emit = defineEmits<{ pointClick: [point: TrendPoint] }>()

const style = computed(() => areaStyle(props.area))
const hovered = ref<number | null>(null)

// The plot takes a pointer only when a pointClick listener is attached. Vue strips
// listeners for declared emits from $attrs, so the raw vnode props are the only place
// that binding can be seen from inside.
const instance = getCurrentInstance()
const drillable = computed(() => Boolean(instance?.vnode.props?.onPointClick))

const peak = computed(() => peakOf(props.points))
const ticks = computed(() => axisTicks(box, peak.value))

const marks = computed(() => plotPoints(props.points, box, peak.value))

const linePath = computed(() => marks.value.map((mark) => `${mark.x},${mark.y}`).join(' '))
const areaPath = computed(() => {
  if (!marks.value.length) return ''
  const base = box.top + plot.height
  const first = marks.value[0]
  const last = marks.value[marks.value.length - 1]
  return `${first.x},${base} ${linePath.value} ${last.x},${base}`
})

const labelledDates = computed(() => dateTicks(marks.value))

const total = computed(() => props.points.reduce((sum, point) => sum + point.value, 0))
const active = computed(() => (hovered.value === null ? null : marks.value[hovered.value] ?? null))

const compactFormat = new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 })
const fullFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 })

const compact = (value: number) => compactFormat.format(value)
const full = (value: number) => {
  const formatted = fullFormat.format(value)
  return props.unit ? `${formatted} ${props.unit}` : formatted
}
const dateFormat = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' })
const shortDate = (date: string) => {
  const parsed = new Date(date)
  return Number.isNaN(parsed.getTime()) ? date : dateFormat.format(parsed)
}

function pointAt(event: MouseEvent): number | null {
  const bounds = (event.currentTarget as SVGRectElement).getBoundingClientRect()
  if (!bounds.width || !marks.value.length) return null
  const ratio = (event.clientX - bounds.left) / bounds.width
  return nearestIndex(marks.value, box.left + ratio * plot.width)
}

function track(event: MouseEvent) {
  hovered.value = pointAt(event)
}

// Resolved from the click, not from hovered: a click with no pointer move before it, such
// as one a screen reader synthesises, would otherwise emit nothing.
function click(event: MouseEvent) {
  const index = pointAt(event)
  if (index === null) return
  hovered.value = index
  const mark = marks.value[index]
  emit('pointClick', { date: mark.date, value: mark.value })
}
</script>

<template>
  <figure class="ds-trend" :style="style">
    <figcaption class="ds-trend__head">
      <h3>{{ title }}</h3>
      <span v-if="points.length">{{ full(total) }} total</span>
    </figcaption>

    <p v-if="!points.length" class="ds-trend__empty">{{ emptyText }}</p>

    <div v-else class="ds-trend__plot">
      <svg :viewBox="`0 0 ${box.width} ${box.height}`" role="img" :aria-label="title">
        <g class="ds-trend__grid">
          <line
            v-for="tick in ticks"
            :key="`grid-${tick.value}`"
            :x1="box.left"
            :x2="box.width - box.right"
            :y1="tick.y"
            :y2="tick.y"
          />
        </g>
        <g class="ds-trend__axis">
          <text v-for="tick in ticks" :key="`y-${tick.value}`" :x="box.left - 8" :y="tick.y + 4">
            {{ compact(tick.value) }}
          </text>
          <text
            v-for="mark in labelledDates"
            :key="`x-${mark.index}`"
            :x="mark.x"
            :y="box.height - 14"
            class="ds-trend__axis-x"
          >
            {{ shortDate(mark.date) }}
          </text>
        </g>

        <polygon v-if="marks.length > 1" class="ds-trend__area" :points="areaPath" />
        <polyline v-if="marks.length > 1" class="ds-trend__line" :points="linePath" />
        <circle v-else-if="marks.length" class="ds-trend__dot" :cx="marks[0].x" :cy="marks[0].y" r="4" />

        <g v-if="active" class="ds-trend__cursor">
          <line :x1="active.x" :x2="active.x" :y1="box.top" :y2="box.top + plot.height" />
          <circle :cx="active.x" :cy="active.y" r="5" />
        </g>

        <rect
          :x="box.left"
          :y="box.top"
          :width="plot.width"
          :height="plot.height"
          fill="transparent"
          :class="{ 'ds-trend__hit--drillable': drillable }"
          @mousemove="track"
          @mouseleave="hovered = null"
          @click="click"
        />
      </svg>

      <div v-if="active" class="ds-trend__tooltip" :style="{ left: `${(active.x / box.width) * 100}%` }">
        <strong>{{ full(active.value) }}</strong>
        <span>{{ shortDate(active.date) }}</span>
      </div>
    </div>

    <div v-if="points.length" class="ds-trend__legend">
      <span>{{ valueLabel || title }}{{ unit ? ` (${unit})` : '' }}</span>
      <span>{{ dateLabel }}</span>
    </div>
  </figure>
</template>

<style scoped>
.ds-trend {
  display: grid;
  gap: var(--ds-space-2);
  margin: 0;
}

.ds-trend__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--ds-space-3);
}

.ds-trend__head h3 {
  margin: 0;
  color: var(--ds-text-primary);
  font-size: var(--ds-text-base);
  font-weight: var(--ds-font-semibold);
}

.ds-trend__head span {
  color: var(--ds-text-secondary);
  font-size: var(--ds-text-sm);
  font-variant-numeric: tabular-nums;
}

.ds-trend__empty {
  display: grid;
  min-height: 8rem;
  place-items: center;
  margin: 0;
  color: var(--ds-text-muted);
  font-size: var(--ds-text-sm);
}

.ds-trend__plot {
  position: relative;
}

svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.ds-trend__grid line {
  stroke: var(--ds-border-base);
  stroke-width: 1;
}

.ds-trend__axis text {
  fill: var(--ds-text-muted);
  font-size: 11px;
  text-anchor: end;
}

.ds-trend__axis .ds-trend__axis-x {
  text-anchor: middle;
}

.ds-trend__area {
  fill: var(--ds-area-fill);
}

.ds-trend__line {
  fill: none;
  stroke: var(--ds-area-solid);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}

.ds-trend__dot {
  fill: var(--ds-area-solid);
}

.ds-trend__cursor line {
  stroke: var(--ds-area-solid);
  stroke-dasharray: 3 3;
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}

.ds-trend__cursor circle {
  fill: var(--ds-area-solid);
  stroke: var(--ds-bg-elevated);
  stroke-width: 2;
}

.ds-trend__tooltip {
  display: grid;
  position: absolute;
  top: 0;
  gap: 0.125rem;
  padding: var(--ds-space-2) var(--ds-space-3);
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-radius-lg);
  background: var(--ds-bg-elevated);
  box-shadow: var(--ds-elevation-2);
  pointer-events: none;
  transform: translateX(-50%);
  white-space: nowrap;
}

.ds-trend__tooltip strong {
  color: var(--ds-text-primary);
  font-size: var(--ds-text-sm);
  font-variant-numeric: tabular-nums;
}

.ds-trend__tooltip span {
  color: var(--ds-text-secondary);
  font-size: var(--ds-text-xs);
}

.ds-trend__hit--drillable {
  cursor: pointer;
}

.ds-trend__legend {
  display: flex;
  justify-content: space-between;
  gap: var(--ds-space-3);
  color: var(--ds-text-muted);
  font-size: var(--ds-text-xs);
}
</style>
