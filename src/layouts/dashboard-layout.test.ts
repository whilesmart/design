import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import DashboardLayout from './DashboardLayout.vue'

const user = { first_name: 'Ada', last_name: 'Bekoe', email: 'ada@example.test' }
const render = (props: Record<string, unknown>, slots: Record<string, () => unknown> = {}) =>
  renderToString(createSSRApp({ render: () => h(DashboardLayout, props, slots) }))

describe('the Desk shell', () => {
  it('offers support only where there is somewhere to send the reader', async () => {
    expect(await render({ user })).not.toContain('help-btn')
    const html = await render({ user, supportUrl: 'https://help.example.test' })
    expect(html).toContain('href="https://help.example.test"')
  })

  it('shows the app its assistant once someone is signed in, and leaves room for it', async () => {
    const assistant = () => h('div', { class: 'test-assistant' })
    const signedIn = await render({ user }, { assistant })
    expect(signedIn).toContain('test-assistant')
    expect(signedIn).toContain('main-content--assisted')
    expect(await render({ user: null }, { assistant })).not.toContain('test-assistant')
    expect(await render({ user })).not.toContain('main-content--assisted')
  })

  it('opens the launcher from a labelled control', async () => {
    expect(await render({ user })).toContain('aria-label="Whilesmart apps"')
  })
})
