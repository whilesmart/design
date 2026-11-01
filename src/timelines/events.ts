import { packRows, type Period, type TimelineActor } from './moments'

/** Where an event happened: a pull request, a thread, a meeting. */
export interface TimelinePlace {
  label: string
  container?: string
  url?: string
}

/**
 * Something that happened once, drawn as a card or a pin. `touches` names the records it
 * changed or shaped, by id. `parts` counts the smaller events it is made of.
 */
export interface TimelineEvent {
  id: string | number
  title: string
  at: string
  until?: string | null
  kind?: string
  icon?: string
  place?: TimelinePlace
  actors?: TimelineActor[]
  valence?: number | null
  intensity?: number | null
  importance?: number | null
  touches?: (string | number)[]
  parts?: number
  count?: number
}

/** Something an event can touch, gathered into named groups under the events. */
export interface TimelineRecord {
  id: string | number
  kind: string
  label: string
  group?: string
}

export interface StreamSizes {
  card: { width: number; height: number; gap: number }
  pad: number
  axis: number
  /** Width given to one day of the time axis. */
  day: number
  /** Space between the last row of cards and the groups. */
  drop: number
  shelf: { width: number; head: number; line: number; closed: number; more: number }
}

export const streamSizes: StreamSizes = {
  card: { width: 216, height: 76, gap: 10 },
  pad: 16,
  axis: 32,
  day: 64,
  drop: 72,
  shelf: { width: 220, head: 30, line: 36, closed: 6, more: 24 },
}

const DAY = 86_400_000

export interface StreamCard<E extends TimelineEvent> {
  event: E
  left: number
  top: number
}

export interface StreamShelf<R extends TimelineRecord> {
  name: string
  records: R[]
  open: boolean
  listed: number
  height: number
  left: number
  width: number
  center: number
}

export interface StreamThread {
  key: string
  event: TimelineEvent['id']
  shelf: string
  count: number
  d: string
}

export interface StreamOptions<R extends TimelineRecord> {
  groupOf?: (record: R) => string
  open?: string | null
  sizes?: StreamSizes
  /** The stretch of the drawing in view. Shelves spread across it, so they stay under what is shown. */
  view?: { x: number; width: number } | null
}

/**
 * Events along a time axis, packed into rows so no two cards overlap, with the records they
 * touched gathered into shelves underneath and a thread from each card to each shelf it
 * reached. Given the stretch in view, shelves share it evenly, ordered by where the events
 * that reached them sit. Without one, each shelf sits under its events, pushed right only
 * as far as needed to clear the one before it. Shelves no event reached come last.
 */
export function layoutStream<E extends TimelineEvent, R extends TimelineRecord>(
  events: E[],
  records: R[],
  options: StreamOptions<R> = {},
) {
  const sizes = options.sizes ?? streamSizes
  const groupOf = options.groupOf ?? ((r: R) => r.group ?? 'Everywhere')
  const { card, pad, axis, shelf } = sizes

  const times = events.flatMap((e) => [Date.parse(e.at), Date.parse(e.until ?? e.at)]).filter((t) => !Number.isNaN(t))
  const first = times.length ? Math.min(...times) : 0
  const last = times.length ? Math.max(Math.max(...times), first + DAY) : DAY
  const stretch = ((last - first) / DAY) * sizes.day + pad * 2 + card.width

  const groups = new Map<string, R[]>()
  for (const r of records) groups.set(groupOf(r), [...(groups.get(groupOf(r)) ?? []), r])

  const minWidth = Math.max(640, stretch)
  const x = (time: number) => pad + ((time - first) / (last - first)) * (stretch - pad * 2 - card.width)


  const ordered = [...events].filter((e) => !Number.isNaN(Date.parse(e.at))).sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
  const lefts = ordered.map((e) => x(Date.parse(e.at)))
  const rows = packRows(lefts, card.width, card.gap)
  const cards: StreamCard<E>[] = ordered.map((event, i) => ({
    event,
    left: lefts[i]!,
    top: axis + 8 + rows[i]! * (card.height + card.gap),
  }))

  const byId = new Map(records.map((r) => [r.id, r]))
  const touched = (e: E) => (e.touches ?? []).flatMap((id) => byId.get(id) ?? [])

  const cardsBottom = Math.max(axis, ...cards.map((c) => c.top + card.height))
  const shelfTop = cards.length ? cardsBottom + sizes.drop : 12

  const pull = new Map<string, { sum: number; n: number }>()
  for (const c of cards)
    for (const r of touched(c.event)) {
      const at = pull.get(groupOf(r)) ?? { sum: 0, n: 0 }
      pull.set(groupOf(r), { sum: at.sum + c.left + card.width / 2, n: at.n + 1 })
    }
  const aim = (name: string) => {
    const p = pull.get(name)
    return p ? p.sum / p.n : Number.POSITIVE_INFINITY
  }
  const named = [...groups.entries()].sort(
    ([a, x], [b, y]) => aim(a) - aim(b) || y.length - x.length || a.localeCompare(b),
  )
  const view = options.view
  const across = view ? Math.max(view.width - pad * 2, 0) : 0
  const docked = view ? Math.max(Math.min(across / Math.max(named.length, 1), across), Math.min(shelf.width, across)) : 0
  let edge = view ? view.x + pad : pad
  const shelves: StreamShelf<R>[] = named.map(([name, inside]) => {
    const open = options.open === name
    const listed = open ? inside.length : Math.min(shelf.closed, inside.length)
    const height = shelf.head + listed * shelf.line + (inside.length > listed ? shelf.more : 0)
    const w = view ? docked : shelf.width
    const wanted = !view && Number.isFinite(aim(name)) ? aim(name) - w / 2 : edge
    const left = Math.max(edge, wanted)
    edge = left + w + (view ? 0 : card.gap)
    return { name, records: inside, open, listed, height, left, width: w, center: left + w / 2 }
  })
  const shelfAt = new Map(shelves.map((s) => [s.name, s]))

  const threads: StreamThread[] = cards.flatMap((c) => {
    const counts = new Map<string, number>()
    for (const r of touched(c.event)) counts.set(groupOf(r), (counts.get(groupOf(r)) ?? 0) + 1)
    return [...counts.entries()].flatMap(([name, count]) => {
      const to = shelfAt.get(name)
      if (!to) return []
      const from = { x: c.left + card.width / 2, y: c.top + card.height }
      const bend = (shelfTop - from.y) / 2
      return [
        {
          key: `${c.event.id}>${name}`,
          event: c.event.id,
          shelf: name,
          count,
          d: `M${from.x} ${from.y} C${from.x} ${from.y + bend} ${to.center} ${shelfTop - bend} ${to.center} ${shelfTop}`,
        },
      ]
    })
  })

  const height = Math.max(320, shelfTop + Math.max(0, ...shelves.map((s) => s.height)) + pad)
  const width = view ? minWidth : Math.max(minWidth, edge - card.gap + pad)

  return { width, height, x, first, last, cards, cardsBottom, shelfTop, shelves, threads, touched }
}

export interface StreamMonth {
  key: string
  at: number
  left: number
  right: number
}

/** Each calendar month the axis crosses, as the stretch of drawing it covers. */
export function streamMonths(first: number, last: number, x: (time: number) => number, cardWidth: number): StreamMonth[] {
  const out: StreamMonth[] = []
  const start = new Date(first)
  let at = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1)
  while (at < last) {
    const d = new Date(at)
    const next = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1)
    out.push({ key: new Date(at).toISOString(), at, left: x(Math.max(first, at)), right: x(Math.min(last, next)) + cardWidth })
    at = next
  }
  return out
}

/** Events inside a period. */
export function eventsWithin<E extends TimelineEvent>(events: E[], period: Period | null) {
  if (!period) return events
  return events.filter((e) => {
    const at = Date.parse(e.at)
    return at >= period[0] && at < period[1]
  })
}
