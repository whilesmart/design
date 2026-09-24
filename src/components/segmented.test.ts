import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import DsSegmented from './DsSegmented.vue'

const PERIODS = [
  { key: 'all', label: 'All time' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
]

const render = (props: Record<string, unknown>) =>
  renderToString(createSSRApp({ render: () => h(DsSegmented, props) }))

// Exactly one holds at a time, and that has to be readable without seeing it.
describe('a closed set of alternatives', () => {
  it('says which one holds', async () => {
    const html = await render({ modelValue: 'week', options: PERIODS })
    expect(html).toContain('aria-checked="true"')
    expect((html.match(/aria-checked="true"/g) ?? []).length).toBe(1)
  })

  it('says it is a choice between them, not a set of buttons', async () => {
    const html = await render({ modelValue: 'all', options: PERIODS, label: 'Period' })
    expect(html).toContain('role="radiogroup"')
    expect(html).toContain('aria-label="Period"')
    expect((html.match(/role="radio"/g) ?? []).length).toBe(3)
  })

  it('offers every alternative it was given', async () => {
    const html = await render({ modelValue: 'all', options: PERIODS })
    for (const period of PERIODS) expect(html).toContain(period.label)
  })
})
