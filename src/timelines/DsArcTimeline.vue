<script setup lang="ts" generic="M extends TimelineMoment">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import DsAvatar from '../components/DsAvatar.vue'
import DsIcon from '../components/DsIcon.vue'
import { areaStyle, type AreaColor } from '../areas'
import {
  arcPath,
  inLens,
  kindColors,
  linksFrom,
  placeLabels,
  placeMoments,
  tallyKinds,
  timeTicks,
  type Period,
  type TimelineMoment,
} from './moments'

export interface ArcTimelineProps<M extends TimelineMoment = TimelineMoment> {
  moments: M[]
  /** Area colour per kind. Kinds left out take the palette in order. */
  colors?: Record<string, AreaColor>
  /** Cue kinds that draw an arc between moments. `null` links on every cue kind. */
  linkOn?: string[] | null
  /** Moment ids to light, for example the ones an answer cited. Everything else dims. */
  lit?: (string | number)[] | null
  /** A period to shade without narrowing to it, such as a hovered chapter. */
  shade?: Period | null
  label?: string
  locale?: string
}

const props = withDefaults(defineProps<ArcTimelineProps<M>>(), {
  colors: () => ({}),
  linkOn: null,
  lit: null,
  shade: null,
  label: 'Moments over time, by how they landed',
  locale: undefined,
})

const focus = defineModel<M['id'] | null>('focus', { default: null })
const period = defineModel<Period | null>('period', { default: null })
const kinds = defineModel<string[]>('kinds', { default: () => [] })

const MOODS = [
  { valence: 2, label: 'Good' },
  { valence: 0, label: 'Neutral' },
  { valence: -2, label: 'Bad' },
]

const box = ref<HTMLElement | null>(null)
const size = ref({ width: 1000, height: 420 })
let watcher: ResizeObserver | null = null
onMounted(() => {
  if (!box.value || typeof ResizeObserver === 'undefined') return
  watcher = new ResizeObserver(([entry]) => {
    const { width, height } = entry!.contentRect
    if (width > 0 && height > 0) size.value = { width, height }
  })
  watcher.observe(box.value)
})
onBeforeUnmount(() => watcher?.disconnect())

const frame = computed(() => ({ ...size.value, left: 64, right: 24, top: 36, bottom: 36 }))
const map = computed(() => placeMoments(props.moments, frame.value))
const palette = computed(() => kindColors(props.moments, props.colors))
const tally = computed(() => tallyKinds(props.moments))

const ink = (kind: string) => `var(--ds-area-${palette.value.get(kind) ?? 'slate'}-solid)`
const tone = (valence: number) =>
  valence > 0 ? 'var(--ds-status-success-text)' : valence < 0 ? 'var(--ds-status-error-text)' : 'var(--ds-text-muted)'

const focused = computed(() => map.value.placed.find((p) => p.moment.id === focus.value) ?? null)
const links = computed(() =>
  focused.value ? linksFrom(focused.value.moment, map.value.placed, props.linkOn) : [],
)

const lit = computed(() => {
  if (focused.value) return new Set<M['id']>([focused.value.moment.id, ...links.value.map((l) => l.to.moment.id)])
  const asked = props.lit ? new Set(props.lit) : null
  const lens = { kinds: kinds.value, period: period.value }
  return new Set<M['id']>(
    map.value.placed.filter((p) => (!asked || asked.has(p.moment.id)) && inLens(p.moment, lens)).map((p) => p.moment.id),
  )
})

const labels = computed(() => placeLabels(map.value.placed.filter((p) => lit.value.has(p.moment.id)), frame.value))

const ticks = computed(() => {
  const { first, last, x } = map.value
  if (first == null || last == null) return []
  return timeTicks(first, last, props.locale).map((t) => ({ ...t, x: x(t.at) }))
})

function band(range: Period | null) {
  if (!range || !map.value.placed.length) return null
  const left = Math.max(map.value.x(range[0]), frame.value.left)
  const right = Math.min(map.value.x(range[1]), frame.value.width - frame.value.right)
  return right > left ? { x: left, width: Math.max(right - left, 2) } : null
}

const svg = ref<SVGSVGElement | null>(null)
const brush = ref<{ from: number; to: number } | null>(null)

function svgX(event: PointerEvent) {
  const rect = svg.value!.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * frame.value.width
  return Math.min(Math.max(x, frame.value.left), frame.value.width - frame.value.right)
}

function startBrush(event: PointerEvent) {
  if (!svg.value) return
  const x = svgX(event)
  brush.value = { from: x, to: x }
  svg.value.setPointerCapture?.(event.pointerId)
}

function moveBrush(event: PointerEvent) {
  if (brush.value) brush.value = { ...brush.value, to: svgX(event) }
}

function endBrush() {
  const drawn = brush.value
  brush.value = null
  if (!drawn) return
  if (Math.abs(drawn.to - drawn.from) < 6) {
    focus.value = null
    return
  }
  const [a, b] = [drawn.from, drawn.to].sort((p, q) => p - q) as [number, number]
  period.value = [map.value.timeAt(a), map.value.timeAt(b)]
}

function pick(id: M['id']) {
  focus.value = focus.value === id ? null : id
}

function toggleKind(kind: string) {
  kinds.value = kinds.value.includes(kind) ? kinds.value.filter((k) => k !== kind) : [...kinds.value, kind]
}

const short = (text: string, n = 30) => (text.length > n ? `${text.slice(0, n - 1)}…` : text)
const named = (kind: string) => kind.charAt(0).toUpperCase() + kind.slice(1)
const day = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString(props.locale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : ''

const card = computed(() => {
  const p = focused.value
  if (!p) return null
  const flip = p.x > frame.value.width * 0.6
  return {
    style: {
      ...areaStyle(palette.value.get(p.moment.kind)),
      left: `${(p.x / frame.value.width) * 100}%`,
      top: `${(p.y / frame.value.height) * 100}%`,
      transform: `translate(${flip ? 'calc(-100% - 14px)' : '14px'}, -50%)`,
    },
  }
})
</script>

<template>
  <div class="ds-arc-timeline">
    <div ref="box" class="ds-arc-timeline__plot">
      <svg
        ref="svg"
        :viewBox="`0 0 ${frame.width} ${frame.height}`"
        class="ds-arc-timeline__svg"
        role="img"
        :aria-label="label"
        @pointermove="moveBrush"
        @pointerup="endBrush"
      >
        <rect
          :x="frame.left"
          :y="0"
          :width="frame.width - frame.left - frame.right"
          :height="frame.height - frame.bottom"
          fill="transparent"
          class="ds-arc-timeline__brush-area"
          @pointerdown="startBrush"
        />
        <template v-for="(range, i) in [period, shade]" :key="`band-${i}`">
          <rect
            v-if="band(range)"
            :x="band(range)!.x"
            :y="frame.top - 16"
            :width="band(range)!.width"
            :height="frame.height - frame.bottom - frame.top + 16"
            class="ds-arc-timeline__band"
            :class="{ 'ds-arc-timeline__band--soft': i === 1 }"
          />
        </template>
        <rect
          v-if="brush"
          :x="Math.min(brush.from, brush.to)"
          :y="frame.top - 16"
          :width="Math.abs(brush.to - brush.from)"
          :height="frame.height - frame.bottom - frame.top + 16"
          class="ds-arc-timeline__band ds-arc-timeline__band--brush"
        />
        <g class="ds-arc-timeline__axis">
          <text
            v-for="m in MOODS"
            :key="m.label"
            :x="12"
            :y="map.bandY(m.valence)"
            dominant-baseline="central"
            :fill="tone(m.valence)"
          >{{ m.label }}</text>
          <text v-for="t in ticks" :key="t.at" :x="t.x" :y="frame.height - 12" text-anchor="middle">{{ t.label }}</text>
          <line
            v-for="t in ticks"
            :key="`grid-${t.at}`"
            :x1="t.x"
            :x2="t.x"
            :y1="frame.top - 8"
            :y2="frame.height - frame.bottom"
            class="ds-arc-timeline__grid"
          />
          <line
            :x1="frame.left - 8"
            :x2="frame.width - frame.right"
            :y1="map.baseline"
            :y2="map.baseline"
            class="ds-arc-timeline__baseline"
          />
        </g>
        <g v-if="focused" class="ds-arc-timeline__arcs">
          <path v-for="l in links" :key="`arc-${l.to.moment.id}`" :d="arcPath(focused, l.to)" />
        </g>

        <g
          v-for="p in map.placed"
          :key="p.moment.id"
          class="ds-arc-timeline__moment"
          :class="{ 'is-dim': !lit.has(p.moment.id), 'is-focus': p.moment.id === focus }"
          :data-moment="p.moment.id"
          @click.stop="pick(p.moment.id)"
        >
          <line v-if="p.until !== null" :x1="p.x" :x2="p.until" :y1="p.y" :y2="p.y" :stroke="ink(p.moment.kind)" class="ds-arc-timeline__held" />
          <line :x1="p.x" :x2="p.x" :y1="map.baseline" :y2="p.y" :stroke="ink(p.moment.kind)" class="ds-arc-timeline__stem" />
          <circle :cx="p.x" :cy="p.y" :r="p.r + 6" fill="transparent" />
          <circle
            :cx="p.x"
            :cy="p.y"
            :r="p.r"
            :fill="p.until !== null ? 'transparent' : ink(p.moment.kind)"
            :stroke="ink(p.moment.kind)"
            class="ds-arc-timeline__dot"
          >
            <title>{{ p.moment.label }}</title>
          </circle>
          <text
            v-if="labels.has(p.moment.id)"
            :x="labels.get(p.moment.id)!.x"
            :y="labels.get(p.moment.id)!.y"
            text-anchor="middle"
            class="ds-arc-timeline__label"
          >{{ short(p.moment.label) }}</text>
        </g>
      </svg>

      <article v-if="focused && card" class="ds-arc-timeline__card" :style="card.style" role="dialog" :aria-label="focused.moment.label">
        <header class="ds-arc-timeline__card-head">
          <span class="ds-arc-timeline__card-icon">
            <DsIcon v-if="focused.moment.icon" :name="focused.moment.icon as `solar:${string}`" />
          </span>
          <span class="ds-arc-timeline__card-kind">{{ named(focused.moment.kind) }}</span>
          <span class="ds-arc-timeline__card-day">{{ day(focused.moment.at) }}</span>
        </header>
        <p class="ds-arc-timeline__card-title">{{ focused.moment.label }}</p>
        <p v-if="focused.moment.detail" class="ds-arc-timeline__card-detail">{{ focused.moment.detail }}</p>
        <footer class="ds-arc-timeline__card-foot">
          <span v-if="focused.moment.actors?.length" class="ds-arc-timeline__actors">
            <DsAvatar v-for="a in focused.moment.actors.slice(0, 4)" :key="a.id" :name="a.name" :src="a.avatar" size="sm" />
          </span>
          <span class="ds-arc-timeline__linked">{{ links.length }} linked</span>
        </footer>
      </article>
    </div>

    <div class="ds-arc-timeline__legend" role="group" aria-label="Kinds">
      <button
        v-for="t in tally"
        :key="t.kind"
        type="button"
        class="ds-arc-timeline__kind"
        :class="{ 'is-off': kinds.length && !kinds.includes(t.kind) }"
        :aria-pressed="kinds.includes(t.kind)"
        @click="toggleKind(t.kind)"
      >
        <span class="ds-arc-timeline__swatch" :style="{ background: ink(t.kind) }" />
        {{ named(t.kind) }}
        <span class="ds-arc-timeline__count">{{ t.count }}</span>
      </button>
      <span class="ds-arc-timeline__hint">
        <slot name="hint">Size is weight; hollow stopped holding; drag to pick a period.</slot>
        <template v-if="map.undated">{{ ` ${map.undated} not yet dated.` }}</template>
      </span>
    </div>
  </div>
</template>
