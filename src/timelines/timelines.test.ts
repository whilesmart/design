import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import DsArcTimeline from './DsArcTimeline.vue'
import DsLaneTimeline from './DsLaneTimeline.vue'
import { laneOrder, placeInLanes } from './lanes'
import {
  chapters,
  inLens,
  typeColors,
  linksFrom,
  placeLabels,
  placeMoments,
  tallyTypes,
  timeTicks,
  type TimelineMoment,
} from './moments'
import fixture from './fixtures/moments.json'

const moments = fixture as TimelineMoment[]
const FRAME = { width: 1000, height: 420, left: 64, right: 24, top: 36, bottom: 36 }
const DAY = 86_400_000

describe('placing moments', () => {
  const { placed, undated } = placeMoments(moments, FRAME)

  it('runs time left to right inside the frame', () => {
    const byTime = [...placed].sort((a, b) => Date.parse(a.moment.at!) - Date.parse(b.moment.at!))
    expect(byTime.map((p) => p.x)).toEqual([...byTime.map((p) => p.x)].sort((a, b) => a - b))
    expect(Math.min(...placed.map((p) => p.x))).toBeGreaterThanOrEqual(FRAME.left)
    expect(Math.max(...placed.map((p) => p.x))).toBeLessThanOrEqual(FRAME.width - FRAME.right)
  })

  it('puts what went well above what hurt', () => {
    const good = placed.filter((p) => p.moment.valence! > 0).map((p) => p.y)
    const bad = placed.filter((p) => p.moment.valence! < 0).map((p) => p.y)
    expect(Math.max(...good)).toBeLessThan(Math.min(...bad))
  })

  it('draws a more intense moment larger', () => {
    const quiet = placed.find((p) => p.moment.intensity === 1)!
    const loud = placed.find((p) => p.moment.intensity === 5)!
    expect(loud.r).toBeGreaterThan(quiet.r)
  })

  it('counts what has no date or valence instead of inventing a place for it', () => {
    expect(placed.some((p) => p.moment.at === null)).toBe(false)
    expect(undated).toBe(1)
  })

  it('marks how long a moment held when it stopped holding', () => {
    const ended = placed.find((p) => p.moment.until)!
    expect(ended.until!).toBeGreaterThan(ended.x)
  })

  it('accepts string ids', () => {
    const named = moments.slice(0, 5).map((m) => ({ ...m, id: `m-${m.id}` }))
    expect(placeMoments(named, FRAME).placed).toHaveLength(5)
  })

  it('draws nothing and does not throw when nothing is dated', () => {
    const result = placeMoments([{ id: 1, label: 'x', type: 'note', at: null, valence: null }], FRAME)
    expect(result.placed).toEqual([])
    expect(result.first).toBeNull()
  })
})

describe('time ticks', () => {
  const at = Date.UTC(2026, 0, 10)

  it('steps by week over a few weeks', () => {
    const ticks = timeTicks(at, at + 30 * DAY, 'en-GB')
    expect(ticks.length).toBeGreaterThanOrEqual(4)
    expect(new Date(ticks[0]!.at).getUTCDay()).toBe(1)
  })

  it('steps by month over half a year and by quarter over two years', () => {
    expect(timeTicks(at, at + 180 * DAY).every((t) => new Date(t.at).getUTCDate() === 1)).toBe(true)
    const quarters = timeTicks(at, at + 730 * DAY)
    expect(quarters.every((t) => new Date(t.at).getUTCMonth() % 3 === 0)).toBe(true)
  })
})

describe('reading the moments', () => {
  it('groups chapters by quarter, newest first, with how each went', () => {
    const told = chapters(moments)
    expect(told.map((c) => c.start)).toEqual([...told.map((c) => c.start)].sort((a, b) => b - a))
    for (const c of told) expect(c.good + c.neutral + c.bad).toBe(c.moments.length)
  })

  it('counts types, most first', () => {
    const counts = tallyTypes(moments).map((t) => t.count)
    expect(counts).toEqual([...counts].sort((a, b) => b - a))
  })

  it('keeps colours that were asked for and gives every other type one', () => {
    const colors = typeColors(moments, { incident: 'rose' })
    expect(colors.get('incident')).toBe('rose')
    expect(new Set(tallyTypes(moments).map((t) => t.type)).size).toBe(colors.size)
  })

  it('links only on the cue types asked for', () => {
    const { placed } = placeMoments(moments, FRAME)
    const from = placed[0]!.moment
    const byArea = linksFrom(from, placed, ['area'])
    expect(byArea.length).toBeGreaterThan(0)
    expect(byArea.every((l) => l.cue.type === 'area')).toBe(true)
    expect(linksFrom(from, placed, null).length).toBeGreaterThanOrEqual(byArea.length)
    expect(linksFrom(from, placed, ['nothing'])).toEqual([])
  })

  it('narrows by type and by period', () => {
    const one = moments.find((m) => m.at)!
    const t = Date.parse(one.at!)
    expect(inLens(one, { types: [], period: null })).toBe(true)
    expect(inLens(one, { types: [one.type], period: [t, t + 1] })).toBe(true)
    expect(inLens(one, { types: ['nothing'], period: null })).toBe(false)
    expect(inLens(one, { types: [], period: [t + 1, t + 2] })).toBe(false)
  })

  it('keeps labels from overlapping and drops them all when too many are shown', () => {
    const { placed } = placeMoments(moments, FRAME)
    const few = placeLabels(placed.slice(0, 10), FRAME)
    const spots = [...few.values()]
    for (const a of spots)
      for (const b of spots) if (a !== b) expect(Math.abs(a.y - b.y) >= 12 || Math.abs(a.x - b.x) >= 190).toBe(true)
    expect(placeLabels(placed, FRAME).size).toBe(0)
  })
})

describe('the arc timeline', () => {
  const render = (props: Record<string, unknown>) =>
    renderToString(createSSRApp({ render: () => h(DsArcTimeline, props) }))

  it('renders every dated moment on the server and says how many are undated', async () => {
    const html = await render({ moments })
    expect((html.match(/data-moment=/g) ?? []).length).toBe(60)
    expect(html.replace(/<!--[^>]*-->/g, '')).toContain('period. 1 not yet dated.')
  })

  it('opens a card with the actors and arcs to linked moments when one is focused', async () => {
    const focused = moments.find((m) => m.actors?.length && m.at)!
    const html = await render({ moments, focus: focused.id, linkOn: ['area'] })
    expect(html).toContain('ds-arc-timeline__card')
    expect(html).toContain(`alt="${focused.actors![0]!.name}"`)
    expect(html).toMatch(/<path d="M[\d.]+ [\d.]+ Q/)
  })

  it('dims what falls outside the chosen types', async () => {
    const html = await render({ moments, types: ['incident'] })
    const dim = (html.match(/is-dim/g) ?? []).length
    const incidents = moments.filter((m) => m.type === 'incident' && m.at).length
    expect(dim).toBe(60 - incidents)
  })
})

describe('the lane timeline', () => {
  const byArea = (m: TimelineMoment) => m.cues?.find((c) => c.type === 'area')?.id ?? 'none'
  const FRAME_L = { width: 1000, height: 300, left: 148, right: 20, top: 16, bottom: 40 }

  it('orders lanes as given, then busiest first', () => {
    const order = laneOrder(moments, byArea, ['api/'])
    expect(order[0]!.id).toBe('api/')
    const rest = order.slice(1).map((l) => l.count)
    expect(rest).toEqual([...rest].sort((a, b) => b - a))
  })

  it('puts every dated moment in its own lane row and keeps time running left to right', () => {
    const lanes = laneOrder(moments, byArea)
    const { placed, undated } = placeInLanes(moments, lanes, byArea, FRAME_L)
    expect(placed).toHaveLength(60)
    expect(undated).toBe(1)
    const rowOf = new Map(lanes.map((l, i) => [l.id, i]))
    for (const p of placed) expect(Math.floor((p.y - FRAME_L.top) / ((FRAME_L.height - 56) / lanes.length))).toBe(rowOf.get(p.lane))
    const sorted = [...placed].sort((a, b) => Date.parse(a.moment.at!) - Date.parse(b.moment.at!))
    expect(sorted.map((p) => p.x)).toEqual([...sorted.map((p) => p.x)].sort((a, b) => a - b))
  })

  it('draws a moment with a duration as a span', () => {
    const lanes = laneOrder(moments, byArea)
    const span = placeInLanes(moments, lanes, byArea, FRAME_L).placed.find((p) => p.moment.until)!
    expect(span.end!).toBeGreaterThan(span.x)
  })

  it('renders one row per lane and one mark per dated moment', async () => {
    const html = await renderToString(
      createSSRApp({ render: () => h(DsLaneTimeline, { moments, laneOf: byArea, lanes: [{ id: 'api/', label: 'Public API' }] }) }),
    )
    expect((html.match(/data-moment=/g) ?? []).length).toBe(60)
    expect(html).toContain('Public API')
    expect((html.match(/ds-lane-timeline__row/g) ?? []).length).toBe(laneOrder(moments, byArea).length)
  })
})

describe('placing the same moments twice', () => {
  it('lands every moment on the same spot without trigonometry, so server and browser agree', () => {
    const a = placeMoments(moments, FRAME).placed.map((p) => p.y)
    const b = placeMoments(moments, FRAME).placed.map((p) => p.y)
    expect(a).toEqual(b)
    expect(a.every((y) => Number.isFinite(y))).toBe(true)
  })
})

describe('drawing marks with a slot', () => {
  const byArea = (m: TimelineMoment) => m.cues?.find((c) => c.type === 'area')?.id ?? 'none'
  const mark = (p: { moment: { id: string | number }; x: number; y: number }) =>
    h('rect', { class: 'custom-mark', 'data-for': p.moment.id, x: p.x, y: p.y })

  it('lets the arc timeline draw each moment as the page wants and can leave out the card', async () => {
    const focused = moments.find((m) => m.at && m.valence != null)!
    const html = await renderToString(
      createSSRApp({ render: () => h(DsArcTimeline, { moments, focus: focused.id, showCard: false }, { mark }) }),
    )
    expect((html.match(/custom-mark/g) ?? []).length).toBe(60)
    expect(html).not.toContain('ds-arc-timeline__dot')
    expect(html).not.toContain('ds-arc-timeline__card')
  })

  it('lets the lane timeline draw each point moment as the page wants', async () => {
    const html = await renderToString(createSSRApp({ render: () => h(DsLaneTimeline, { moments, laneOf: byArea }, { mark }) }))
    expect((html.match(/custom-mark/g) ?? []).length).toBe((html.match(/data-moment=/g) ?? []).length - (html.match(/ds-lane-timeline__span/g) ?? []).length)
    expect(html).not.toContain('ds-lane-timeline__dot')
  })
})
