import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import DsSearchInput from './DsSearchInput.vue'

describe('the search box on a server', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('renders where navigator has no platform', async () => {
    vi.stubGlobal('navigator', {})
    const html = await renderToString(createSSRApp({ render: () => h(DsSearchInput, { modelValue: '' }) }))
    expect(html).toContain('Ctrl+K')
  })
})
