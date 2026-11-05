/* Where things sit on a canvas.
 *
 * A canvas is read by where things are, so a card has to be where it was last
 * time. Positions are worked out from the data alone, never from a simulation,
 * and a card the reader moved stays where they put it.
 */

export interface Point {
  x: number
  y: number
}

export interface Lane {
  id: string
  label: string
}

export interface LaneItem {
  id: string
  lane: string
}

export interface PlacedLane extends Lane {
  position: Point
  width: number
  height: number
}

export interface PlacedItem {
  id: string
  lane: string
  position: Point
}

export interface LaneSize {
  card: { width: number; height: number }
  gap: { x: number; y: number }
  /** Room above the first card for the lane's name. */
  header: number
  padding: number
  /** How many cards stand in one column of a lane before it wraps into another. */
  rows: number
  /** How wide a row of lanes grows before the next lane starts a row below. */
  width: number
}

export const LANE_SIZE: LaneSize = {
  card: { width: 280, height: 144 },
  gap: { x: 48, y: 16 },
  header: 40,
  padding: 16,
  rows: 6,
  width: 1800,
}

export function readSavedPositions(key: string): Record<string, Point> {
  try {
    return JSON.parse(localStorage.getItem(key) || '{}')
  } catch {
    return {}
  }
}

export function savePosition(key: string, id: string, point: Point) {
  try {
    const all = readSavedPositions(key)
    all[id] = point
    localStorage.setItem(key, JSON.stringify(all))
  } catch {
    // Storage can be unavailable; positions then last for this visit only.
  }
}

export function forgetPositions(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {
    // Nothing was kept, so there is nothing to forget.
  }
}

/** Lays lanes out side by side, in the order given, starting a new row of lanes
 *  once a row is `size.width` wide. A lane fills downwards and wraps into a
 *  further column once it holds `size.rows` cards. Items naming a lane that was
 *  not passed are left out. */
export function layoutLanes(
  lanes: Lane[],
  items: LaneItem[],
  saved: Record<string, Point> = {},
  size: LaneSize = LANE_SIZE,
): { lanes: PlacedLane[]; items: PlacedItem[] } {
  const members = new Map<string, LaneItem[]>(lanes.map(l => [l.id, []]))
  for (const item of items) members.get(item.lane)?.push(item)

  const placedLanes: PlacedLane[] = []
  const placedItems: PlacedItem[] = []
  let x = 0
  let y = 0
  let rowHeight = 0

  for (const lane of lanes) {
    const inLane = members.get(lane.id)!
    const rows = Math.max(Math.min(inLane.length, size.rows), 1)
    const columns = Math.max(Math.ceil(inLane.length / size.rows), 1)
    const width = columns * size.card.width + (columns - 1) * size.gap.y + size.padding * 2
    const height = size.header + rows * (size.card.height + size.gap.y) - size.gap.y + size.padding
    if (x > 0 && x + width > size.width) {
      x = 0
      y += rowHeight + size.gap.x
      rowHeight = 0
    }
    inLane.forEach((item, index) => {
      const column = Math.floor(index / size.rows)
      const row = index % size.rows
      placedItems.push({
        id: item.id,
        lane: lane.id,
        position: saved[item.id] ?? {
          x: x + size.padding + column * (size.card.width + size.gap.y),
          y: y + size.header + row * (size.card.height + size.gap.y),
        },
      })
    })
    placedLanes.push({ ...lane, position: { x, y }, width, height })
    x += width + size.gap.x
    rowHeight = Math.max(rowHeight, height)
  }

  return { lanes: placedLanes, items: placedItems }
}
