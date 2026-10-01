import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createMemoryHistory, createRouter } from 'vue-router'
import DsButton from './DsButton.vue'

async function render(props: Record<string, unknown>) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:any(.*)*', component: { render: () => null } }],
  })
  const app = createSSRApp({ render: () => h(DsButton, props, { default: () => 'Go' }) })
  app.use(router)
  await router.push('/')
  return renderToString(app)
}

describe('a button that goes somewhere in the app', () => {
  it('is a link to the route', async () => {
    const html = await render({ to: '/orders' })
    expect(html).toMatch(/^<a[^>]*href="\/orders"/)
    expect(html).not.toContain('type="button"')
  })

  it('goes nowhere while disabled', async () => {
    const html = await render({ to: '/orders', disabled: true })
    expect(html).not.toContain('href=')
    expect(html).toContain('aria-disabled="true"')
  })

  it('is still a native button when it has no destination', async () => {
    const html = await render({ type: 'submit', loading: true })
    expect(html).toMatch(/^<button[^>]*type="submit"/)
    expect(html).toContain('disabled')
  })

  it('still links out as an anchor', async () => {
    const html = await render({ as: 'a', href: 'https://example.com' })
    expect(html).toContain('href="https://example.com"')
  })
})
