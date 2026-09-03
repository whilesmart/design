import { describe, expect, it } from 'vitest'
import { buildSheetRows, sheetKey, type SheetPost } from './useConversationSheet'

const NOW = new Date('2026-09-03T12:00:00')

function post(overrides: Partial<SheetPost> & Pick<SheetPost, 'id' | 'createdAt'>): SheetPost {
  return { authorName: 'You', content: 'hello', ...overrides }
}

describe('sheetKey', () => {
  it('keeps threads for different objects apart', () => {
    expect(sheetKey({ ownerType: 'file', ownerId: '42' })).toBe('file:42')
    expect(sheetKey({ ownerType: 'file', ownerId: '42' })).not.toBe(sheetKey({ ownerType: 'email', ownerId: '42' }))
  })
})

describe('buildSheetRows', () => {
  it('returns nothing for an empty thread so the sheet shows its empty state', () => {
    expect(buildSheetRows([], NOW)).toEqual([])
  })

  it('opens the thread with a day divider', () => {
    const rows = buildSheetRows([post({ id: 'a', createdAt: '2026-09-03T10:00:00' })], NOW)
    expect(rows[0]).toMatchObject({ kind: 'day', label: 'Today' })
    expect(rows[1]).toMatchObject({ kind: 'post', id: 'a', content: 'hello' })
  })

  it('names yesterday and falls back to a date further back', () => {
    expect(buildSheetRows([post({ id: 'a', createdAt: '2026-09-02T10:00:00' })], NOW)[0]).toMatchObject({ label: 'Yesterday' })
    expect(buildSheetRows([post({ id: 'a', createdAt: '2026-08-20T10:00:00' })], NOW)[0]).toMatchObject({ label: 'Aug 20' })
  })

  it('emits one divider per day, not per post', () => {
    const rows = buildSheetRows([
      post({ id: 'a', createdAt: '2026-09-02T10:00:00' }),
      post({ id: 'b', createdAt: '2026-09-02T18:00:00' }),
      post({ id: 'c', createdAt: '2026-09-03T09:00:00' })
    ], NOW)
    expect(rows.filter(row => row.kind === 'day')).toHaveLength(2)
  })

  it('groups the same author inside five minutes and breaks on a new author', () => {
    const rows = buildSheetRows([
      post({ id: 'a', createdAt: '2026-09-03T10:00:00' }),
      post({ id: 'b', createdAt: '2026-09-03T10:03:00' }),
      post({ id: 'c', createdAt: '2026-09-03T10:04:00', authorName: 'Amina' })
    ], NOW)
    expect(rows.filter(row => row.kind === 'post').map(row => row.grouped)).toEqual([false, true, false])
  })

  it('does not group past the five minute window', () => {
    const rows = buildSheetRows([
      post({ id: 'a', createdAt: '2026-09-03T10:00:00' }),
      post({ id: 'b', createdAt: '2026-09-03T10:06:00' })
    ], NOW)
    expect(rows.filter(row => row.kind === 'post').map(row => row.grouped)).toEqual([false, false])
  })

  it('never groups the first post of a new day onto the last of the previous one', () => {
    const rows = buildSheetRows([
      post({ id: 'a', createdAt: '2026-09-02T23:59:00' }),
      post({ id: 'b', createdAt: '2026-09-03T00:01:00' })
    ], NOW)
    expect(rows.filter(row => row.kind === 'post').map(row => row.grouped)).toEqual([false, false])
  })

  it('renders a 24 hour timestamp', () => {
    const rows = buildSheetRows([post({ id: 'a', createdAt: '2026-09-03T14:05:00' })], NOW)
    expect(rows[1]).toMatchObject({ time: '14:05' })
  })
})
