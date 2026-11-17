import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import DsConsoleShell from './DsConsoleShell.vue'
import DsSidebarGroup from './DsSidebarGroup.vue'
import DsSidebarItem from './DsSidebarItem.vue'
import ConsoleLayout from '../layouts/ConsoleLayout.vue'

const render = (props: Record<string, unknown> = {}, slots: Record<string, () => unknown> = {}) =>
  renderToString(createSSRApp({ render: () => h(DsConsoleShell, props, slots) }))

// A console with no frame and no bar must render as it did before.
describe('a console', () => {
  it('is flush unless told otherwise', async () => {
    const html = await render({}, { nav: () => 'Home' })
    expect(html).toContain('ds-console--flush')
    expect(html).not.toContain('ds-console--boxed')
  })

  it('centres pages at the contained width unless told to use the whole area', async () => {
    expect(await render({}, { nav: () => 'Home' })).toContain('ds-console--contained')
    const full = await render({ frame: 'boxed', width: 'full' }, { nav: () => 'Home' })
    expect(full).toContain('ds-console--full')
    expect(full).not.toContain('ds-console--contained')
  })

  it('is not barred when nothing fills the bar', async () => {
    const html = await render({}, { nav: () => 'Home' })
    expect(html).not.toContain('ds-console--barred')
  })

  it('is barred once something fills the bar', async () => {
    const html = await render({}, { bar: () => 'Sign out', nav: () => 'Home' })
    expect(html).toContain('ds-console--barred')
    expect(html).toContain('Sign out')
  })

  it('boxes the content rather than the whole console', async () => {
    const html = await render({ frame: 'boxed' }, { nav: () => 'Home', default: () => 'Body' })
    expect(html).toContain('ds-console--boxed')
    // The card sits inside main; the rail and the bar stay outside it.
    expect(html.indexOf('ds-console__rail')).toBeLessThan(html.indexOf('ds-console__page'))
    expect(html).toContain('ds-console__page-inner')
  })

  it('carries the brand in the rail, and in the bar for the drawer', async () => {
    const html = await render({}, { brand: () => 'pagebeam', nav: () => 'Home' })
    expect(html).toContain('ds-console__bar-brand')
    expect(html.match(/pagebeam/g)).toHaveLength(2)
  })
})

describe('what the console is pointed at', () => {
  it('sits at the bar’s own left, and brings the bar with it', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(DsConsoleShell, {}, { 'bar-start': () => 'Acme', nav: () => 'Home' }),
      }),
    )
    expect(html).toContain('ds-console--barred')
    expect(html).toContain('ds-console__bar-start')
    expect(html.indexOf('ds-console__bar-start')).toBeLessThan(html.indexOf('ds-console__bar-rest'))
  })
})

describe('the console rail action', () => {
  it('draws the primary action above the nav only when one is given', async () => {
    const { createSSRApp, h } = await import('vue')
    const { renderToString } = await import('vue/server-renderer')
    const { default: DsConsoleShell } = await import('./DsConsoleShell.vue')
    const html = (slots: Record<string, () => string>) =>
      renderToString(createSSRApp({ render: () => h(DsConsoleShell, {}, slots) }))
    expect(await html({ nav: () => 'Home' })).not.toContain('ds-console__create')
    const withAction = await html({ create: () => 'New film', nav: () => 'Home' })
    expect(withAction.indexOf('New film')).toBeLessThan(withAction.indexOf('Home'))
  })
})

describe('a search on the bar', () => {
  it('sits between what the bar starts with and what it ends with, and marks the console as searched', async () => {
    const html = await render({}, { 'bar-start': () => 'Films', 'bar-search': () => 'Search', bar: () => 'Bell', nav: () => 'Home' })
    expect(html).toContain('ds-console--searched')
    expect(html).toContain('ds-console--barred')
    const at = (name: string) => html.indexOf(name)
    expect(at('ds-console__bar-start')).toBeLessThan(at('ds-console__bar-search'))
    expect(at('ds-console__bar-search')).toBeLessThan(at('ds-console__bar-rest'))
  })

  it('leaves a console without one as it was', async () => {
    const html = await render({}, { bar: () => 'Bell', nav: () => 'Home' })
    expect(html).not.toContain('ds-console--searched')
    expect(html).not.toContain('ds-console__bar-search')
  })
})


describe('a collapsible rail', () => {
  const nav = () => [
    h(DsSidebarGroup, { label: 'Compliance' }, () => [
      h(DsSidebarItem, { label: 'Requests', icon: 'solar:inbox-linear', badge: 3, to: '' }),
    ]),
  ]
  const layout = (props: Record<string, unknown>, slots: Record<string, unknown> = {}) =>
    renderToString(createSSRApp({ render: () => h(ConsoleLayout, props, { nav, ...slots }) }))

  it('offers no fold control unless asked', async () => {
    const html = await layout({})
    expect(html).not.toContain('ds-console__fold')
    expect(html).not.toContain('ds-console--collapsed')
  })

  it('ignores a collapsed value when the rail cannot fold', async () => {
    expect(await layout({ collapsed: true })).not.toContain('ds-console--collapsed')
  })

  it('starts open with a control that says it will collapse the rail', async () => {
    const html = await layout({ collapsible: true })
    expect(html).toMatch(/class="ds-console__fold"[^>]*aria-expanded="true"/)
    expect(html).toContain('aria-label="Collapse sidebar"')
    expect(html).toContain('--rail-width:16rem')
    expect(html).not.toContain('ds-sidebar-item--folded')
  })

  it('folds to its icons, keeping each name for tooltips and assistive tech', async () => {
    const html = await layout({ collapsible: true, collapsed: true, collapsedWidth: '4rem' })
    expect(html).toContain('ds-console--collapsed')
    expect(html).toContain('--rail-width:4rem')
    expect(html).toMatch(/aria-expanded="false"/)
    expect(html).toContain('aria-label="Expand sidebar"')
    expect(html).toContain('ds-sidebar-item--folded')
    expect(html).toContain('title="Requests"')
    expect(html).toContain('>Requests<')
    expect(html).toContain('ds-sidebar-group--folded')
    expect(html).toContain('>Compliance<')
  })

  it('tells the brand, create and footer slots whether the rail is folded', async () => {
    const html = await layout(
      { collapsible: true, collapsed: true },
      {
        brand: ({ collapsed }: { collapsed: boolean }) => (collapsed ? 'mark' : 'wordmark'),
        create: ({ collapsed }: { collapsed: boolean }) => (collapsed ? 'plus' : 'New request'),
        'rail-footer': ({ collapsed }: { collapsed: boolean }) => (collapsed ? 'avatar' : 'Ada Lovelace'),
      },
    )
    expect(html).toContain('mark')
    expect(html).toContain('wordmark')
    expect(html).toContain('plus')
    expect(html).toContain('avatar')
    expect(html).not.toContain('Ada Lovelace')
  })
})
