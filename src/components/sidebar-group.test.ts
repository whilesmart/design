import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import DsSidebarGroup from './DsSidebarGroup.vue'

const render = (props: Record<string, unknown>) =>
  renderToString(
    createSSRApp({ render: () => h(DsSidebarGroup, props, { default: () => h('a', 'Orders') }) }),
  )

describe('a group of destinations', () => {
  it('is named by its heading', async () => {
    const html = await render({ label: 'Sell' })
    const id = html.match(/aria-labelledby="([^"]+)"/)?.[1]
    expect(id).toBeTruthy()
    expect(html).toContain(`id="${id}"`)
    expect(html).toContain('Sell')
    expect(html).toContain('Orders')
  })

  it('draws no heading and claims no name without a label', async () => {
    const html = await render({})
    expect(html).not.toContain('ds-sidebar-group__label')
    expect(html).not.toContain('aria-labelledby')
    expect(html).toContain('Orders')
  })
})
