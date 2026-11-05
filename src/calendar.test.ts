import { describe, expect, it } from 'vitest'
import { dateKey, monthGrid, monthRange, shiftMonth, weekdayLabels } from './calendar'

describe('a month view', () => {
  it('always shows six full weeks starting on the chosen weekday', () => {
    const sunday = monthGrid('2026-10')
    expect(sunday).toHaveLength(42)
    expect(sunday[0]!.key).toBe('2026-09-27')
    expect(sunday[0]!.date.getDay()).toBe(0)
    const monday = monthGrid('2026-10', [], { weekStartsOn: 1 })
    expect(monday[0]!.key).toBe('2026-09-28')
    expect(monday.filter((d) => d.inMonth)).toHaveLength(31)
  })

  it('covers the same days it asks the server for', () => {
    const { from, to } = monthRange('2026-10', 1)
    const grid = monthGrid('2026-10', [], { weekStartsOn: 1 })
    expect(dateKey(from)).toBe(grid[0]!.key)
    expect(dateKey(new Date(to.getTime() - 1))).toBe(grid[41]!.key)
  })

  it('marks today', () => {
    const grid = monthGrid('2026-10', [], { today: new Date(2026, 9, 22, 18) })
    expect(grid.filter((d) => d.today).map((d) => d.key)).toEqual(['2026-10-22'])
  })

  it('moves across years', () => {
    expect(shiftMonth('2026-12', 1)).toBe('2027-01')
    expect(shiftMonth('2026-01', -1)).toBe('2025-12')
  })

  it('names weekdays in the chosen order', () => {
    expect(weekdayLabels(1, 'en-US')[0]).toBe('Mon')
    expect(weekdayLabels(0, 'en-US')[6]).toBe('Sat')
  })
})

describe('placing events', () => {
  const day = (grid: ReturnType<typeof monthGrid>, key: string) => grid.find((d) => d.key === key)!.events.map((e) => e.id)

  it('puts a timed event on the local day it starts, in start order', () => {
    const late = new Date(2026, 9, 22, 23, 30)
    const early = new Date(2026, 9, 22, 8)
    const grid = monthGrid('2026-10', [
      { id: 'late', title: 'Late', start: late.toISOString() },
      { id: 'early', title: 'Early', start: early },
    ])
    expect(day(grid, '2026-10-22')).toEqual(['early', 'late'])
    expect(day(grid, '2026-10-23')).toEqual([])
  })

  it('spreads an all-day event over every day before its exclusive end', () => {
    const grid = monthGrid('2026-10', [{ id: 'trip', title: 'Trip', start: '2026-10-30', end: '2026-11-02', allDay: true }])
    expect(day(grid, '2026-10-30')).toEqual(['trip'])
    expect(day(grid, '2026-11-01')).toEqual(['trip'])
    expect(day(grid, '2026-11-02')).toEqual([])
  })

  it('does not spill an event ending at midnight into the next day', () => {
    const grid = monthGrid('2026-10', [
      { id: 'meeting', title: 'Meeting', start: new Date(2026, 9, 5, 23), end: new Date(2026, 9, 6) },
    ])
    expect(day(grid, '2026-10-05')).toEqual(['meeting'])
    expect(day(grid, '2026-10-06')).toEqual([])
  })
})
