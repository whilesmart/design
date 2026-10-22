import type { AreaColor } from './areas'

export type CalendarTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

export interface CalendarEvent {
  id: string | number
  title: string
  /** An instant (ISO string or Date), or a `YYYY-MM-DD` date for an all-day event. */
  start: string | Date
  /** Exclusive end. Omitted, the event occupies the moment it starts. */
  end?: string | Date
  allDay?: boolean
  tone?: CalendarTone
  area?: AreaColor
}

export interface CalendarDay<E extends CalendarEvent = CalendarEvent> {
  key: string
  date: Date
  day: number
  inMonth: boolean
  today: boolean
  events: E[]
}

const pad = (n: number) => String(n).padStart(2, '0')

/** The viewer's local calendar date, which is what a day cell shows. */
export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`
}

function parseMonth(month: string): { year: number; index: number } {
  const [year, index] = month.split('-').map(Number)
  return { year: year!, index: index! - 1 }
}

export function shiftMonth(month: string, by: number): string {
  const { year, index } = parseMonth(month)
  return monthKey(new Date(year, index + by, 1))
}

// A bare date is midnight local time; `new Date('2026-10-01')` would read it as UTC.
function toDate(value: string | Date): Date {
  if (value instanceof Date) return value
  const bare = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  return bare ? new Date(Number(bare[1]), Number(bare[2]) - 1, Number(bare[3])) : new Date(value)
}

/** The six weeks a month view shows: from the start of the first week to the start of the day after the last. */
export function monthRange(month: string, weekStartsOn: 0 | 1 = 0): { from: Date; to: Date } {
  const { year, index } = parseMonth(month)
  const first = new Date(year, index, 1)
  const lead = (first.getDay() - weekStartsOn + 7) % 7
  return { from: new Date(year, index, 1 - lead), to: new Date(year, index, 1 - lead + 42) }
}

export function monthGrid<E extends CalendarEvent>(
  month: string,
  events: E[] = [],
  options: { weekStartsOn?: 0 | 1; today?: Date } = {},
): CalendarDay<E>[] {
  const { index } = parseMonth(month)
  const { from } = monthRange(month, options.weekStartsOn ?? 0)
  const todayKey = dateKey(options.today ?? new Date())
  const placed = events
    .map((event) => {
      const start = toDate(event.start)
      const end = event.end ? toDate(event.end) : start
      return { event, start: start.getTime(), end: end.getTime() }
    })
    .sort((a, b) => a.start - b.start)

  return Array.from({ length: 42 }, (_, offset) => {
    const date = new Date(from.getFullYear(), from.getMonth(), from.getDate() + offset)
    const dayStart = date.getTime()
    const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).getTime()
    return {
      key: dateKey(date),
      date,
      day: date.getDate(),
      inMonth: date.getMonth() === index,
      today: dateKey(date) === todayKey,
      events: placed
        .filter(({ start, end }) => (end > start ? start < dayEnd && end > dayStart : start >= dayStart && start < dayEnd))
        .map(({ event }) => event),
    }
  })
}

export function weekdayLabels(weekStartsOn: 0 | 1 = 0, locale?: string, width: 'short' | 'narrow' = 'short') {
  const sunday = new Date(2023, 0, 1)
  return Array.from({ length: 7 }, (_, i) =>
    new Date(2023, 0, sunday.getDate() + ((i + weekStartsOn) % 7)).toLocaleDateString(locale, { weekday: width }),
  )
}
