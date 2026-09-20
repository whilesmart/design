import { describe, expect, it } from 'vitest'
import { axisTicks, dateTicks, nearestIndex, peakOf, plotPoints, type PlotBox } from './charts'

const box: PlotBox = { width: 640, height: 220, left: 52, right: 12, top: 16, bottom: 34 }
const series = (values: number[]) =>
  values.map((value, index) => ({ date: `2026-09-${String(index + 1).padStart(2, '0')}`, value }))

describe('plotPoints', () => {
  it('spans the plot from the left edge to the right', () => {
    const points = plotPoints(series([1, 2, 3]), box, 3)
    expect(points[0].x).toBe(52)
    expect(points[2].x).toBe(628)
  })

  it('centres a single point instead of pinning it to the left edge', () => {
    const [point] = plotPoints(series([5]), box, 5)
    expect(point.x).toBe(52 + (640 - 52 - 12) / 2)
  })

  it('puts the peak at the top of the plot and zero on the baseline', () => {
    const points = plotPoints(series([0, 10]), box, 10)
    expect(points[1].y).toBe(box.top)
    expect(points[0].y).toBe(box.top + (220 - 16 - 34))
  })
})

describe('peakOf', () => {
  it('floors an all-zero series at one so the axis still has a scale', () => {
    expect(peakOf(series([0, 0, 0]))).toBe(1)
  })

  it('takes the largest value otherwise', () => {
    expect(peakOf(series([3, 11, 7]))).toBe(11)
  })
})

describe('axisTicks', () => {
  it('runs from zero to the peak', () => {
    const ticks = axisTicks(box, 100)
    expect(ticks.map((tick) => tick.value)).toEqual([0, 25, 50, 75, 100])
    expect(ticks[0].y).toBeGreaterThan(ticks[4].y)
  })
})

describe('dateTicks', () => {
  it('labels at most four dates and always keeps both ends', () => {
    const points = plotPoints(series([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]), box, 10)
    const ticks = dateTicks(points)
    expect(ticks).toHaveLength(4)
    expect(ticks[0].date).toBe('2026-09-01')
    expect(ticks[3].date).toBe('2026-09-10')
  })

  it('returns every point when there are fewer than two', () => {
    const points = plotPoints(series([4]), box, 4)
    expect(dateTicks(points)).toHaveLength(1)
  })
})

describe('nearestIndex', () => {
  it('picks the point closest to the pointer', () => {
    const points = plotPoints(series([1, 2, 3]), box, 3)
    expect(nearestIndex(points, points[1].x + 4)).toBe(1)
    expect(nearestIndex(points, 0)).toBe(0)
    expect(nearestIndex(points, 10_000)).toBe(2)
  })
})
