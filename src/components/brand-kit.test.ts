import { describe, expect, it } from 'vitest'
import { createSSRApp, h, type Component } from 'vue'
import { renderToString } from 'vue/server-renderer'
import DsAssetSlots from './DsAssetSlots.vue'
import DsColourPalette from './DsColourPalette.vue'
import DsFontSpecimen from './DsFontSpecimen.vue'
import DsRuleList from './DsRuleList.vue'

const render = (component: Component, props: Record<string, unknown>) =>
  renderToString(createSSRApp({ render: () => h(component, props) }))

const COLOURS = [
  { hex: '#E30D18', label: 'Primary' },
  { hex: '#AE0A12', label: '' },
]

describe('a brand palette', () => {
  it('names every colour and gives its hex to copy', async () => {
    const html = await render(DsColourPalette, { modelValue: COLOURS })
    expect(html).toContain('Primary')
    expect(html).toContain('Unnamed')
    expect(html).toContain('aria-label="Copy #E30D18"')
    expect(html).not.toContain('type="color"')
  })

  it('offers a picker per colour and a way to add one when it can be edited', async () => {
    const html = await render(DsColourPalette, { modelValue: COLOURS, editable: true })
    expect((html.match(/type="color"/g) ?? []).length).toBe(2)
    expect(html).toContain('aria-label="Add a colour"')
  })
})

describe('brand asset slots', () => {
  const slots = [
    { id: 'logo', label: 'Logo', hint: 'On light grounds', src: '/logo.svg', ground: 'light' },
    { id: 'logo_white', label: 'Logo on dark', ground: 'dark' },
  ]

  it('shows each asset on the ground it is meant for, and says which are missing', async () => {
    const html = await render(DsAssetSlots, { slots })
    expect(html).toContain('src="/logo.svg"')
    expect(html).toContain('ds-assets__ground--light')
    expect(html).toContain('ds-assets__ground--dark')
    expect(html).toContain('Nothing yet')
    expect(html).not.toContain('type="file"')
  })

  it('lets an editor upload into an empty slot and replace or remove a filled one', async () => {
    const html = await render(DsAssetSlots, { slots, editable: true })
    expect((html.match(/type="file"/g) ?? []).length).toBe(2)
    expect(html).toContain('Replace')
    expect(html).toContain('Upload')
    expect((html.match(/Remove/g) ?? []).length).toBe(1)
  })

  it('offers only removal for a filled slot that cannot be uploaded over', async () => {
    const html = await render(DsAssetSlots, { slots: [{ id: 'pose', label: 'Pose', src: '/p.svg', replaceable: false }], editable: true })
    expect(html).not.toContain('type="file"')
    expect(html).toContain('Remove')
  })
})

describe('a font specimen', () => {
  it('sets the sample in the font it names', async () => {
    const html = await render(DsFontSpecimen, { family: 'Ubuntu', role: 'Headings' })
    expect(html).toContain('Headings')
    expect(html).toContain("font-family:&#39;Ubuntu&#39;")
  })
})

describe('brand rules', () => {
  it('keeps what to do apart from what not to do, and says when a side is empty', async () => {
    const html = await render(DsRuleList, { modelValue: [{ type: 'do', text: 'Keep the ant on its red tile' }] })
    expect(html).toContain('Keep the ant on its red tile')
    expect(html).toContain('Nothing ruled out yet')
    expect(html).not.toContain('<form')
  })
})
