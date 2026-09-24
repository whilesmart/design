import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import DsPageHero from './DsPageHero.vue'

const render = (props: Record<string, unknown>, slots = {}) =>
  renderToString(createSSRApp({ render: () => h(DsPageHero, props, slots) }))

// A row is drawn only for what the hero was given.
describe('the top of a page', () => {
  it('is the title alone when that is all there is', async () => {
    const html = await render({ title: 'Overview' })
    expect(html).toContain('Overview')
    expect(html).not.toContain('ds-page-hero__headline')
    expect(html).not.toContain('ds-page-hero__context')
    expect(html).not.toContain('ds-page-hero__act')
  })

  it('carries the urgent thing and its context on the same surface', async () => {
    const html = await render({
      title: 'Overview',
      headline: '4 things nobody has answered',
      context: 'Last run 18 min ago',
    })
    expect(html).toContain('4 things nobody has answered')
    expect(html).toContain('Last run 18 min ago')
    expect(html.match(/ds-page-hero"/g)).toHaveLength(1)
  })

  it('makes room for an action only when one is passed', async () => {
    expect(await render({ title: 'Overview' })).not.toContain('ds-page-hero__act')
    expect(await render({ title: 'Overview' }, { default: () => 'Go' })).toContain('ds-page-hero__act')
  })

  it('leaves the mark out rather than drawing an empty one', async () => {
    expect(await render({ title: 'Overview' })).not.toContain('ds-page-hero__mark')
  })
})
