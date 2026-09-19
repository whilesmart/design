import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import DsNotFound from './DsNotFound.vue'

describe('DsNotFound home link', () => {
  it('renders a real anchor that navigates', async () => {
    const html = await renderToString(createSSRApp({ render: () => h(DsNotFound, { homeLinkUrl: '/start' }) }))
    expect(html).toMatch(/<a[^>]+href="\/start"/)
  })
})
