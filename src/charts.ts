export interface TrendPoint {
  date: string
  value: number
}

export interface PlotBox {
  width: number
  height: number
  left: number
  right: number
  top: number
  bottom: number
}

export interface PlottedPoint extends TrendPoint {
  index: number
  x: number
  y: number
}

export const plotArea = (box: PlotBox) => ({
  width: box.width - box.left - box.right,
  height: box.height - box.top - box.bottom,
})

/** The largest value a series reaches, floored at 1 so an all-zero series still has an axis. */
export const peakOf = (points: TrendPoint[]) =>
  points.reduce((peak, point) => (point.value > peak ? point.value : peak), 1)

export function plotPoints(points: TrendPoint[], box: PlotBox, peak: number): PlottedPoint[] {
  const plot = plotArea(box)
  return points.map((point, index) => ({
    ...point,
    index,
    // A single point sits in the middle rather than on the left edge, where it would read
    // as the start of a series that is not there.
    x: box.left + (points.length === 1 ? plot.width / 2 : (index * plot.width) / (points.length - 1)),
    y: box.top + plot.height - (point.value / peak) * plot.height,
  }))
}

export function axisTicks(box: PlotBox, peak: number, steps = 4) {
  const plot = plotArea(box)
  return Array.from({ length: steps + 1 }, (_, index) => {
    const value = (peak / steps) * index
    return { value, y: box.top + plot.height - (value / peak) * plot.height }
  })
}

/** At most four date labels: more collide at phone width before they collide here. */
export function dateTicks(points: PlottedPoint[], max = 4): PlottedPoint[] {
  const count = Math.min(max, points.length)
  if (count < 2) return points
  const stride = (points.length - 1) / (count - 1)
  return Array.from({ length: count }, (_, index) => points[Math.round(index * stride)])
}

export function nearestIndex(points: PlottedPoint[], x: number): number {
  let nearest = 0
  for (let index = 1; index < points.length; index += 1) {
    if (Math.abs(points[index].x - x) < Math.abs(points[nearest].x - x)) nearest = index
  }
  return nearest
}
