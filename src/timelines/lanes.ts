import type { TimelineFrame, TimelineMoment } from './moments'

export interface Lane {
  id: string
  label: string
  count: number
}

export interface LanePlaced<M extends TimelineMoment> {
  moment: M
  lane: string
  x: number
  y: number
  end: number | null
}

const DAY = 86_400_000

/** Lanes in the order given, then the busiest first. Only dated moments count, so a lane is never drawn empty unless asked for. */
export function laneOrder<M extends TimelineMoment>(moments: M[], laneOf: (m: M) => string, given: string[] = []) {
  const counted = new Map<string, number>()
  for (const m of moments) {
    if (!m.at || Number.isNaN(Date.parse(m.at))) continue
    counted.set(laneOf(m), (counted.get(laneOf(m)) ?? 0) + 1)
  }
  const rest = [...counted.keys()]
    .filter((id) => !given.includes(id))
    .sort((a, b) => counted.get(b)! - counted.get(a)! || a.localeCompare(b))
  return [...given, ...rest].map((id) => ({ id, label: id, count: counted.get(id) ?? 0 }))
}

/**
 * Time runs left to right and each lane is a row. Moments with a duration (`until`) are
 * drawn as spans; the rest as points. Undated moments are counted and left out.
 */
export function placeInLanes<M extends TimelineMoment>(
  moments: M[],
  lanes: Lane[],
  laneOf: (m: M) => string,
  frame: TimelineFrame,
  window?: [number, number],
) {
  const dated = moments.filter((m) => m.at && !Number.isNaN(Date.parse(m.at)))
  const times = dated.flatMap((m) => [Date.parse(m.at!), ...(m.until ? [Date.parse(m.until)] : [])])
  const first = window?.[0] ?? (times.length ? Math.min(...times) : 0)
  const last = window?.[1] ?? (times.length ? Math.max(...times) : 0)
  const span = Math.max(last - first, DAY)
  const across = frame.width - frame.left - frame.right
  const row = lanes.length ? (frame.height - frame.top - frame.bottom) / lanes.length : 0
  const index = new Map(lanes.map((l, i) => [l.id, i]))

  const x = (time: number) => frame.left + ((time - first) / span) * across
  const placed: LanePlaced<M>[] = dated.flatMap((moment) => {
    const lane = laneOf(moment)
    const at = index.get(lane)
    if (at === undefined) return []
    return [{
      moment,
      lane,
      x: x(Date.parse(moment.at!)),
      y: frame.top + at * row + row / 2,
      end: moment.until ? x(Date.parse(moment.until)) : null,
    }]
  })

  return { placed, undated: moments.length - dated.length, row, first, last, x }
}
