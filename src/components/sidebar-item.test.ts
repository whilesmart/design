import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import DsSidebarItem from './DsSidebarItem.vue'

const render = (props: Record<string, unknown>) =>
  renderToString(createSSRApp({ render: () => h(DsSidebarItem, props) }))

// An item with no description must render as it did before.
describe('a destination', () => {
  it('is one line when nothing says otherwise', async () => {
    const html = await render({ label: 'Transactions' })
    expect(html).toContain('Transactions')
    expect(html).not.toContain('ds-sidebar-item__description')
  })

  it('says what it is for when told', async () => {
    const html = await render({
      label: 'Transactions',
      description: 'All money movements in one place',
    })
    expect(html).toContain('All money movements in one place')
    expect(html).toContain('ds-sidebar-item__label')
  })

  it('still carries a badge beside both', async () => {
    const html = await render({ label: 'Findings', description: 'What drifted', badge: 19 })
    expect(html).toContain('ds-sidebar-item__badge')
    expect(html).toContain('19')
  })
})
