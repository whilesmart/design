import { areaColors, type AreaColor } from '../areas'

/** Something that can bring a moment back to mind: where it happened, who was there, what it touched. */
export interface TimelineCue {
  kind: string
  id: string
  label: string
}

export interface TimelineActor {
  id: string
  name: string
  avatar?: string
}

/**
 * One thing that happened. `valence` runs from -2 (it hurt) to 2 (it went well), and
 * `intensity` and `importance` from 1 to 5. A moment with no `at` or no `valence` is
 * counted but not drawn.
 */
export interface TimelineMoment {
  id: string | number
  label: string
  kind: string
  at: string | null
  until?: string | null
  valence: number | null
  intensity?: number | null
  importance?: number | null
  cues?: TimelineCue[]
  actors?: TimelineActor[]
  icon?: string
  detail?: string
}

export interface TimelineFrame {
  width: number
  height: number
  left: number
  right: number
  top: number
  bottom: number
}

export type Period = [number, number]

export interface PlacedMoment<M extends TimelineMoment = TimelineMoment> {
  moment: M
  x: number
  y: number
  r: number
  until: number | null
}

const DAY = 86_400_000

function drawable<M extends TimelineMoment>(moment: M) {
  return moment.at != null && moment.valence != null && !Number.isNaN(Date.parse(moment.at))
}

/**
 * A stable offset in [-0.5, 0.5) so moments sharing a day and a valence do not land on one point.
 * Integer arithmetic only: Math.sin differs in its last digits between engines, which breaks hydration.
 */
function spread(id: string | number) {
  const text = String(id)
  let hash = 2166136261
  for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619)
  return ((hash >>> 0) % 1000) / 1000 - 0.5
}

const clampValence = (v: number) => Math.max(-2, Math.min(2, v))

/** What a mark's size reads from: a field, or a function returning 1 to 5. */
export type MomentWeight<M extends TimelineMoment = TimelineMoment> =
  | 'importance'
  | 'intensity'
  | ((moment: M) => number | null | undefined)

export function weightOf<M extends TimelineMoment>(moment: M, by: MomentWeight<M> = 'importance') {
  const raw =
    typeof by === 'function' ? by(moment) : by === 'importance' ? (moment.importance ?? moment.intensity) : moment.intensity
  return Math.max(1, Math.min(5, raw ?? 1))
}

export interface PlaceOptions<M extends TimelineMoment> {
  /** What sizes a mark. Defaults to importance, then intensity. */
  weight?: MomentWeight<M>
  /** Other instants the time axis must reach, such as events drawn on the same chart. */
  alongside?: number[]
  /** Only moments inside this period are placed, and the axis spans exactly it. */
  within?: Period | null
}

/**
 * Time runs left to right, valence from bad at the bottom to good at the top, and a mark
 * is as large as the moment weighed.
 */
export function placeMoments<M extends TimelineMoment>(
  moments: M[],
  frame: TimelineFrame,
  options: PlaceOptions<M> = {},
) {
  const { within = null, alongside = [] } = options
  const dated = moments.filter(
    (m) => drawable(m) && (!within || (Date.parse(m.at!) >= within[0] && Date.parse(m.at!) <= within[1])),
  )
  const times = within ? [...within] : [...dated.map((m) => Date.parse(m.at!)), ...alongside]
  const first = times.length ? Math.min(...times) : 0
  const last = times.length ? Math.max(...times) : 0
  const span = Math.max(last - first, DAY)
  const across = frame.width - frame.left - frame.right
  const band = (frame.height - frame.top - frame.bottom) / 5

  const x = (time: number) => frame.left + ((time - first) / span) * across
  const y = (valence: number) => frame.top + (2 - clampValence(valence)) * band + band / 2

  const placed: PlacedMoment<M>[] = dated.map((moment) => ({
    moment,
    x: x(Date.parse(moment.at!)),
    y: y(moment.valence!) + spread(moment.id) * band * 0.7,
    r: 3 + weightOf(moment, options.weight) * 1.6,
    until: moment.until ? Math.min(x(Date.parse(moment.until)), frame.width - frame.right) : null,
  }))

  return {
    placed,
    undated: moments.filter((m) => !drawable(m)).length,
    baseline: y(0),
    bandY: y,
    first: times.length ? first : null,
    last: times.length ? last : null,
    x,
    timeAt: (px: number) => first + ((px - frame.left) / across) * span,
  }
}

export interface TimeTick {
  at: number
  label: string
}

/** Axis ticks at quarters, months or weeks, whichever gives a readable number between two instants. */
export function timeTicks(first: number, last: number, locale?: string): TimeTick[] {
  const span = last - first
  const step: 'quarter' | 'month' | 'week' = span > 400 * DAY ? 'quarter' : span > 70 * DAY ? 'month' : 'week'
  const ticks: TimeTick[] = []
  const start = new Date(first)

  if (step === 'week') {
    const monday = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + ((8 - start.getUTCDay()) % 7 || 7))
    for (let at = monday; at <= last; at += 7 * DAY) {
      ticks.push({ at, label: new Date(at).toLocaleDateString(locale, { day: 'numeric', month: 'short', timeZone: 'UTC' }) })
    }
    return ticks
  }

  const months = step === 'quarter' ? 3 : 1
  const firstMonth = Math.floor(start.getUTCMonth() / months) * months + months
  let at = Date.UTC(start.getUTCFullYear(), firstMonth, 1)
  while (at <= last) {
    ticks.push({ at, label: new Date(at).toLocaleDateString(locale, { month: 'short', year: 'numeric', timeZone: 'UTC' }) })
    const d = new Date(at)
    at = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, 1)
  }
  return ticks
}

export interface Chapter<M extends TimelineMoment> {
  start: number
  end: number
  moments: M[]
  good: number
  neutral: number
  bad: number
  weightiest: M
}

/** Each quarter that holds drawable moments, newest first, with how it went. */
export function chapters<M extends TimelineMoment>(moments: M[]): Chapter<M>[] {
  const byQuarter = new Map<number, M[]>()
  for (const moment of moments.filter(drawable)) {
    const at = new Date(moment.at!)
    const start = Date.UTC(at.getUTCFullYear(), Math.floor(at.getUTCMonth() / 3) * 3, 1)
    byQuarter.set(start, [...(byQuarter.get(start) ?? []), moment])
  }
  return [...byQuarter.entries()]
    .sort(([a], [b]) => b - a)
    .map(([start, inside]) => {
      const begun = new Date(start)
      const sign = (s: number) => inside.filter((m) => Math.sign(m.valence!) === s).length
      return {
        start,
        end: Date.UTC(begun.getUTCFullYear(), begun.getUTCMonth() + 3, 1),
        moments: inside,
        good: sign(1),
        neutral: sign(0),
        bad: sign(-1),
        weightiest: [...inside].sort((a, b) => weightOf(b) - weightOf(a))[0]!,
      }
    })
}

/** How many moments each kind holds, most first. */
export function tallyKinds(moments: { kind: string }[]) {
  const counted = new Map<string, number>()
  for (const m of moments) counted.set(m.kind, (counted.get(m.kind) ?? 0) + 1)
  return [...counted.entries()]
    .map(([kind, count]) => ({ kind, count }))
    .sort((a, b) => b.count - a.count || a.kind.localeCompare(b.kind))
}

/** Gives each kind an area colour: the ones asked for first, then the palette in order of first appearance. */
export function kindColors(moments: { kind: string }[], given: Record<string, AreaColor> = {}) {
  const colors = new Map<string, AreaColor>(Object.entries(given))
  let next = 0
  for (const { kind } of moments) {
    if (colors.has(kind)) continue
    colors.set(kind, areaColors[next % areaColors.length]!)
    next++
  }
  return colors
}

export interface MomentLink<M extends TimelineMoment> {
  to: PlacedMoment<M>
  cue: TimelineCue
}

/**
 * The moments that share a cue with `from`, limited to the cue kinds worth a line.
 * A cue every moment carries joins everything and so says nothing; leave such kinds out.
 */
export function linksFrom<M extends TimelineMoment>(
  from: M,
  placed: PlacedMoment<M>[],
  kinds: string[] | null,
): MomentLink<M>[] {
  const counts = (c: TimelineCue) => !kinds || kinds.includes(c.kind)
  const mine = new Map((from.cues ?? []).filter(counts).map((c) => [`${c.kind}:${c.id}`, c]))
  if (!mine.size) return []
  return placed.flatMap((p) => {
    if (p.moment.id === from.id) return []
    const shared = (p.moment.cues ?? []).find((c) => counts(c) && mine.has(`${c.kind}:${c.id}`))
    return shared ? [{ to: p, cue: shared }] : []
  })
}

export interface TimelineLens {
  kinds: string[]
  period: Period | null
}

export function inLens(moment: TimelineMoment, lens: TimelineLens) {
  if (lens.kinds.length && !lens.kinds.includes(moment.kind)) return false
  if (lens.period) {
    const at = moment.at ? Date.parse(moment.at) : Number.NaN
    if (!(at >= lens.period[0] && at < lens.period[1])) return false
  }
  return true
}

/** A curve that rises above both ends, so arcs read as links and not as a line chart. */
export function arcPath(a: { x: number; y: number }, b: { x: number; y: number }, lift = 50) {
  return `M${a.x} ${a.y} Q${(a.x + b.x) / 2} ${Math.min(a.y, b.y) - lift} ${b.x} ${b.y}`
}

/**
 * Label positions that do not collide: each label tries up to three rows above its mark and
 * is dropped when all are taken. Past `most` labels none are drawn.
 */
export function placeLabels<M extends TimelineMoment>(
  shown: PlacedMoment<M>[],
  frame: TimelineFrame,
  width = 190,
  most = 18,
) {
  const labels = new Map<M['id'], { x: number; y: number }>()
  if (shown.length > most) return labels
  const taken: { x: number; y: number }[] = []
  for (const p of [...shown].sort((a, b) => a.x - b.x)) {
    const x = Math.min(Math.max(p.x, frame.left + width / 2), frame.width - frame.right - width / 2)
    const y = [0, 1, 2]
      .map((row) => p.y - p.r - 6 - row * 13)
      .find((y) => !taken.some((t) => Math.abs(t.y - y) < 12 && Math.abs(t.x - x) < width))
    if (y === undefined) continue
    taken.push({ x, y })
    labels.set(p.moment.id, { x, y })
  }
  return labels
}

/** A row for each box laid along a line, so no two in one row overlap. The leftmost box is placed first. */
export function packRows(lefts: number[], width: number, gap = 8) {
  const ends: number[] = []
  const rows = new Array<number>(lefts.length)
  const order = lefts.map((x, i) => ({ x, i })).sort((a, b) => a.x - b.x)
  for (const { x, i } of order) {
    let row = ends.findIndex((end) => end + gap <= x)
    if (row === -1) row = ends.length
    ends[row] = x + width
    rows[i] = row
  }
  return rows
}
