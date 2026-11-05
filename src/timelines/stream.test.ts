import { describe, expect, it } from 'vitest'
import { createApp, createSSRApp, h, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import DsArcTimeline from './DsArcTimeline.vue'
import DsStreamTimeline from './DsStreamTimeline.vue'
import { eventsWithin, layoutStream, squeezedScale, streamMonths, streamSizes, threadPath, type TimelineEvent, type TimelineRecord } from './events'
import { packRows, placeMoments, weightOf, type TimelineMoment } from './moments'
import fixture from './fixtures/moments.json'

const moments = fixture as TimelineMoment[]
const FRAME = { width: 1000, height: 420, left: 64, right: 24, top: 36, bottom: 36 }
const DAY = 86_400_000

const areaOf = (m: TimelineMoment) => m.cues?.find((c) => c.type === 'area')?.id ?? 'Everywhere'
const records: TimelineRecord[] = moments.map((m) => ({ id: m.id, type: m.type, label: m.label, group: areaOf(m) }))

const dated = moments.filter((m) => m.at)
const events: TimelineEvent[] = dated.slice(0, 12).map((m, i) => ({
  id: `ev-${i}`,
  title: `Review of ${m.label}`,
  at: m.at!,
  until: i % 3 === 0 ? new Date(Date.parse(m.at!) + 2 * DAY).toISOString() : null,
  icon: 'solar:code-linear',
  place: { label: `#${100 + i}` },
  actors: m.actors,
  valence: i % 2 ? 1 : -1,
  touches: dated.filter((d) => areaOf(d) === areaOf(m)).slice(0, 3).map((d) => d.id),
  parts: i === 0 ? 4 : undefined,
  count: i,
}))

describe('weighing a moment', () => {
  it('reads importance first, then intensity, and keeps it between 1 and 5', () => {
    expect(weightOf({ id: 1, label: '', type: 'k', at: null, valence: 0, importance: 4, intensity: 1 })).toBe(4)
    expect(weightOf({ id: 1, label: '', type: 'k', at: null, valence: 0, intensity: 2 })).toBe(2)
    expect(weightOf({ id: 1, label: '', type: 'k', at: null, valence: 0, importance: 9 })).toBe(5)
    expect(weightOf({ id: 1, label: '', type: 'k', at: null, valence: 0, importance: 4, intensity: 1 }, 'intensity')).toBe(1)
    expect(weightOf({ id: 1, label: '', type: 'k', at: null, valence: 0 }, () => 3)).toBe(3)
  })

  it('draws a more important moment larger', () => {
    const base = { type: 'k', valence: 0, at: '2026-01-01T00:00:00Z' }
    const { placed } = placeMoments(
      [
        { ...base, id: 'small', label: 'a', importance: 1, intensity: 5 },
        { ...base, id: 'big', label: 'b', importance: 5, intensity: 1 },
      ],
      FRAME,
    )
    expect(placed.find((p) => p.moment.id === 'big')!.r).toBeGreaterThan(placed.find((p) => p.moment.id === 'small')!.r)
  })
})

describe('placing moments in a window', () => {
  it('spans exactly the window and leaves out what falls outside it', () => {
    const times = dated.map((m) => Date.parse(m.at!)).sort((a, b) => a - b)
    const within: [number, number] = [times[10]!, times[30]!]
    const map = placeMoments(moments, FRAME, { within })
    expect(map.first).toBe(within[0])
    expect(map.last).toBe(within[1])
    expect(map.placed.every((p) => Date.parse(p.moment.at!) >= within[0] && Date.parse(p.moment.at!) <= within[1])).toBe(true)
    expect(map.placed.length).toBeLessThan(placeMoments(moments, FRAME).placed.length)
  })

  it('stretches the axis to reach instants given alongside', () => {
    const later = Date.parse('2030-01-01T00:00:00Z')
    expect(placeMoments(moments, FRAME, { alongside: [later] }).last).toBe(later)
  })
})

describe('packing boxes into rows', () => {
  it('puts boxes that would overlap on different rows and reuses a row once it is clear', () => {
    expect(packRows([0, 10, 300, 20], 100, 8)).toEqual([0, 1, 0, 2])
  })
})

describe('squeezing quiet time', () => {
  const t0 = Date.parse('2026-01-01T00:00:00Z')
  const times = [t0, t0 + DAY, t0 + 60 * DAY]

  it('keeps calendar spacing for short gaps and cuts long ones down to the days kept', () => {
    const { x, breaks } = squeezedScale(times, 10, 3)
    expect(x(times[1]!) - x(times[0]!)).toBe(10)
    expect(x(times[2]!) - x(times[1]!)).toBe(30)
    expect(breaks).toEqual([{ at: x(times[2]!), days: 56 }])
  })

  it('leaves a cut gap room for a card', () => {
    const { x } = squeezedScale(times, 10, 3, 200)
    expect(x(times[2]!) - x(times[1]!)).toBe(200)
  })

  it('keeps calendar scale when asked', () => {
    const { x, breaks } = squeezedScale(times, 10, null)
    expect(x(times[2]!) - x(times[0]!)).toBe(600)
    expect(breaks).toEqual([])
  })

  it('runs time left to right in between instants', () => {
    const { x } = squeezedScale(times, 10, 3)
    const between = [t0 + 2 * DAY, t0 + 30 * DAY, t0 + 59 * DAY].map(x)
    expect(between).toEqual([...between].sort((a, b) => a - b))
    expect(between.every((v) => v > x(times[1]!) && v < x(times[2]!))).toBe(true)
  })
})

describe('drawing a thread', () => {
  it('runs at right angles by default, or straight, or curved', () => {
    expect(threadPath({ x: 0, y: 0 }, { x: 50, y: 40 })).toBe('M0 0 V20 H50 V40')
    expect(threadPath({ x: 0, y: 0 }, { x: 50, y: 40 }, 'straight')).toBe('M0 0 L50 40')
    expect(threadPath({ x: 0, y: 0 }, { x: 50, y: 40 }, 'curve')).toMatch(/^M0 0 C/)
    expect(threadPath({ x: 0, y: 0 }, { x: 50, y: 40 }, 'step', 30)).toBe('M0 0 V30 H50 V40')
  })
})

describe('laying out a stream', () => {
  const layout = layoutStream(events, records)
  const { card } = streamSizes

  it('places every dated event, earliest leftmost, with no two cards overlapping', () => {
    expect(layout.cards).toHaveLength(events.length)
    const lefts = layout.cards.map((c) => c.left)
    expect(lefts).toEqual([...lefts].sort((a, b) => a - b))
    for (const a of layout.cards)
      for (const b of layout.cards) {
        if (a === b) continue
        const apart = Math.abs(a.left - b.left) >= card.width || Math.abs(a.top - b.top) >= card.height
        expect(apart).toBe(true)
      }
  })

  it('sets shelves side by side without overlap, reached ones first, and draws one thread per event and shelf', () => {
    const reached = new Set(events.flatMap((e) => (e.touches ?? []).map((id) => records.find((r) => r.id === id)!.group)))
    const order = layout.shelves.map((s) => reached.has(s.name))
    expect(order.indexOf(false) === -1 || order.slice(order.indexOf(false)).every((x) => !x)).toBe(true)
    for (let i = 1; i < layout.shelves.length; i++)
      expect(layout.shelves[i]!.left).toBeGreaterThanOrEqual(layout.shelves[i - 1]!.left + layout.shelves[i - 1]!.width)
    expect(Math.max(...layout.shelves.map((s) => s.left + s.width))).toBeLessThanOrEqual(layout.width)
    const pairs = new Set(
      events.flatMap((e) => (e.touches ?? []).map((id) => `${e.id}>${records.find((r) => r.id === id)!.group}`)),
    )
    expect(new Set(layout.threads.map((t) => t.key))).toEqual(pairs)
  })

  it('lists every record of an open shelf and only the first few of a closed one', () => {
    const fullest = [...layout.shelves].sort((a, b) => b.records.length - a.records.length)[0]!
    expect(fullest.listed).toBe(Math.min(streamSizes.shelf.closed, fullest.records.length))
    const opened = layoutStream(events, records, { open: fullest.name }).shelves.find((s) => s.name === fullest.name)!
    expect(opened.listed).toBe(fullest.records.length)
  })

  it('sets a shelf under the events that reached it', () => {
    const one = events[5]!
    const alone = layoutStream([one], records)
    const shelf = alone.shelves.find((s) => s.name === records.find((r) => r.id === one.touches![0])!.group)!
    const cardCenter = alone.cards[0]!.left + streamSizes.card.width / 2
    expect(shelf.left).toBeLessThanOrEqual(cardCenter)
    expect(shelf.left + shelf.width).toBeGreaterThanOrEqual(cardCenter)
  })

  it('groups records with the function given', () => {
    const byKind = layoutStream(events, records, { groupOf: (r) => r.type })
    expect(new Set(byKind.shelves.map((s) => s.name))).toEqual(new Set(records.map((r) => r.type)))
  })

  it('turns each shelf\'s threads on its own level so they do not run on top of each other', () => {
    const level = (d: string) => Number(d.match(/V([\d.]+) H/)![1])
    const byShelf = new Map<string, Set<number>>()
    for (const t of layout.threads) byShelf.set(t.shelf, (byShelf.get(t.shelf) ?? new Set()).add(level(t.d)))
    for (const levels of byShelf.values()) expect(levels.size).toBe(1)
    const all = [...byShelf.values()].map((l) => [...l][0])
    expect(new Set(all).size).toBe(all.length)
    expect(Math.max(...(all as number[]))).toBeLessThan(layout.shelfTop)
  })

  it('names each month the axis crosses', () => {
    const months = streamMonths(layout.first, layout.last, layout.x, card.width)
    expect(months.length).toBeGreaterThan(0)
    expect(months.map((m) => m.left)).toEqual([...months.map((m) => m.left)].sort((a, b) => a - b))
  })

  it('narrows events to a period', () => {
    const at = Date.parse(events[3]!.at)
    expect(eventsWithin(events, [at, at + 1]).map((e) => e.id)).toEqual(
      events.filter((e) => Date.parse(e.at) === at).map((e) => e.id),
    )
  })
})

function mount(component: unknown, props: () => Record<string, unknown>) {
  const root = document.createElement('div')
  document.body.append(root)
  createApp({ render: () => h(component as never, props()) }).mount(root)
  return root
}

describe('the stream timeline', () => {
  it('renders on the server with one card per event and a shelf per group', async () => {
    const html = await renderToString(createSSRApp({ render: () => h(DsStreamTimeline, { events, records, shelves: true }) }))
    expect((html.match(/ds-stream-timeline__card(?=[\s"])/g) ?? []).length).toBe(events.length)
    expect((html.match(/ds-stream-timeline__shelf(?=[\s"])/g) ?? []).length).toBe(new Set(records.map((r) => r.group)).size)
  })

  it('lights what a picked event touched and dims the other cards', async () => {
    const focus = ref<string | number | null>(null)
    const root = mount(DsStreamTimeline, () => ({
      events,
      records,
      listed: 6, shelves: true,
      focus: focus.value,
      'onUpdate:focus': (v: string | number | null) => (focus.value = v),
    }))
    const first = root.querySelector<HTMLButtonElement>('.ds-stream-timeline__card')!
    first.click()
    await nextTick()
    expect(focus.value).toBe(layoutStream(events, records).cards[0]!.event.id)
    expect(root.querySelectorAll('.ds-stream-timeline__card.is-dim').length).toBe(events.length - 1)
    expect(root.querySelectorAll('.ds-stream-timeline__record.is-lit').length).toBeGreaterThan(0)
  })

  it('hides a type from its legend button and asks to open an event made of parts', async () => {
    const opened: TimelineEvent[] = []
    const hidden = ref<string[]>([])
    const root = mount(DsStreamTimeline, () => ({
      events,
      records,
      shelves: true,
      hidden: hidden.value,
      'onUpdate:hidden': (v: string[]) => (hidden.value = v),
      onOpen: (e: TimelineEvent) => opened.push(e),
    }))
    const tally = new Map<string, number>()
    for (const r of records) tally.set(r.type, (tally.get(r.type) ?? 0) + 1)
    const most = [...tally.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]![0]
    root.querySelector<HTMLButtonElement>('.ds-stream-timeline__kind')!.click()
    await nextTick()
    expect(hidden.value).toEqual([most])
    const shelfRecords = root.querySelectorAll('.ds-stream-timeline__shelf-head')
    const total = [...shelfRecords].reduce((n, b) => n + Number(b.querySelector('span:last-child')!.textContent), 0)
    expect(total).toBe(records.length - tally.get(most)!)
    root.querySelector<HTMLButtonElement>('.ds-stream-timeline__parts')!.click()
    expect(opened.map((e) => e.id)).toEqual([events[0]!.id])
  })

  it('draws only the event cards unless shelves are asked for', () => {
    const root = mount(DsStreamTimeline, () => ({ events, records }))
    expect(root.querySelectorAll('.ds-stream-timeline__card').length).toBeGreaterThan(0)
    expect(root.querySelectorAll('.ds-stream-timeline__shelf')).toHaveLength(0)
    expect(root.querySelectorAll('.ds-stream-timeline__thread')).toHaveLength(0)
  })

  it('keeps record lists off the canvas by default and hands the picked shelf to the page', async () => {
    const shelf = ref<string | null>(null)
    const root = mount(DsStreamTimeline, () => ({
      events,
      records,
      shelves: true,
      shelf: shelf.value,
      'onUpdate:shelf': (v: string | null) => (shelf.value = v),
    }))
    expect(root.querySelectorAll('.ds-stream-timeline__record')).toHaveLength(0)
    const head = root.querySelector<HTMLButtonElement>('.ds-stream-timeline__shelf-head')!
    head.click()
    await nextTick()
    expect(shelf.value).toBe(head.getAttribute('title'))
    head.click()
    await nextTick()
    expect(shelf.value).toBeNull()
  })

  it('lets the page draw cards and records', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(DsStreamTimeline, { events, records, listed: 6, shelves: true }, {
            card: (p: { event: TimelineEvent }) => h('div', { class: 'my-card' }, p.event.title),
            record: (p: { record: TimelineRecord }) => h('span', { class: 'my-record' }, p.record.label),
          }),
      }),
    )
    expect((html.match(/my-card/g) ?? []).length).toBe(events.length)
    expect(html).toContain('my-record')
    expect(html).not.toContain('ds-stream-timeline__card ')
  })
})

describe('events on the arc timeline', () => {
  it('draws a pin per event and lights the moments a picked one touched', async () => {
    const picked = ref<string | number | null>(null)
    const root = mount(DsArcTimeline, () => ({
      moments,
      events,
      event: picked.value,
      'onUpdate:event': (v: string | number | null) => (picked.value = v),
    }))
    const pins = root.querySelectorAll<SVGGElement>('.ds-arc-timeline__pin')
    expect(pins).toHaveLength(events.length)
    pins[0]!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()
    expect(picked.value).toBe(events[0]!.id)
    const lit = [...root.querySelectorAll('.ds-arc-timeline__moment:not(.is-dim)')].map((g) => g.getAttribute('data-moment'))
    expect(new Set(lit)).toEqual(new Set(events[0]!.touches!.map(String)))
  })

  it('draws faces instead of dots when asked', async () => {
    const html = await renderToString(createSSRApp({ render: () => h(DsArcTimeline, { moments, marks: 'face' }) }))
    const withActors = moments.filter((m) => m.at && m.valence != null && m.actors?.length).length
    expect((html.match(/ds-arc-timeline__face/g) ?? []).length).toBe(withActors)
  })
})
