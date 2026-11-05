import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import DsCalendar from './DsCalendar.vue'

const render = (props: Record<string, unknown>, slots: Record<string, () => unknown> = {}) =>
  renderToString(createSSRApp({ render: () => h(DsCalendar, props, slots) }))

describe('a month calendar', () => {
  it('draws the whole month even with nothing in it', async () => {
    const html = await render({ month: '2026-10' })
    expect(html).toContain('October 2026')
    expect((html.match(/role="gridcell"/g) ?? []).length).toBe(42)
  })

  it('tells the viewer the month is empty only when asked to', async () => {
    const withSlot = await render({ month: '2026-10' }, { empty: () => 'Nothing scheduled' })
    expect(withSlot).toContain('Nothing scheduled')
    const filled = await render(
      { month: '2026-10', events: [{ id: 1, title: 'Launch', start: '2026-10-22' }] },
      { empty: () => 'Nothing scheduled' },
    )
    expect(filled).not.toContain('Nothing scheduled')
  })

  it('shows a set number of items per day and counts the rest', async () => {
    const events = Array.from({ length: 5 }, (_, i) => ({ id: i, title: `Post ${i}`, start: '2026-10-22' }))
    const html = await render({ month: '2026-10', events, maxEvents: 2 })
    expect(html).toContain('Post 1')
    expect(html).not.toContain('Post 2<')
    expect(html).toContain('+3 more')
    expect(html).toMatch(/aria-label="[^"]*October 22, 5 items"/)
  })

  it('tints an item by its status', async () => {
    const html = await render({ month: '2026-10', events: [{ id: 1, title: 'Failed', start: '2026-10-22', tone: 'danger' }] })
    expect(html).toContain('ds-calendar__event--danger')
  })

  it('keeps one day in the tab order', async () => {
    const html = await render({ month: '2026-10' })
    expect((html.match(/tabindex="0"/g) ?? []).length).toBe(1)
  })
})
