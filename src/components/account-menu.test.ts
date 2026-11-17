import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import DsAccountMenu from './DsAccountMenu.vue'
import { initialsOf, nameOf } from './workspaceMenu'
import DsWorkspaceMenu from './DsWorkspaceMenu.vue'
import ConsoleLayout from '../layouts/ConsoleLayout.vue'

const render = (props: Record<string, unknown>) =>
  renderToString(createSSRApp({ render: () => h(DsAccountMenu, props) }))

// The panel renders only while open, so these assert the closed state and the
// rule deciding what the trigger says.
describe('the account menu', () => {
  it('shows the name beside the avatar only when asked', async () => {
    expect(await render({ name: 'Ada Bekoe' })).not.toContain('ds-account__said')
    expect(await render({ name: 'Ada Bekoe', showName: true })).toContain('Ada Bekoe')
  })

  it('labels the trigger, since an avatar alone says nothing to a screen reader', async () => {
    expect(await render({ name: 'Ada Bekoe' })).toContain('aria-label="Account"')
    expect(await render({ name: 'Ada Bekoe', label: 'You' })).toContain('aria-label="You"')
  })
})

describe('what the workspace trigger says', () => {
  const options = [
    { id: 1, name: 'fenn', kind: 'personal' },
    { id: 2, name: 'SourceAnt', kind: 'team' },
  ]

  it('is the name of the one in use', () => {
    expect(nameOf(options, 2)).toBe('SourceAnt')
  })

  it('is nothing when none is chosen, so the caller shows its placeholder', () => {
    expect(nameOf(options, null)).toBe('')
    expect(nameOf(options, undefined)).toBe('')
  })

  it('is nothing when the chosen one is gone, rather than the first one', () => {
    expect(nameOf(options, 99)).toBe('')
    expect(nameOf([], 1)).toBe('')
  })
})

describe('a workspace menu in the rail', () => {
  const options = [
    { id: 1, name: 'Meridian Market', kind: 'Business workspace' },
    { id: 2, name: 'SourceAnt' },
  ]
  const rail = (props: Record<string, unknown>) =>
    renderToString(createSSRApp({ render: () => h(DsWorkspaceMenu, { options, ...props }) }))

  it('takes the first letters of up to two words', () => {
    expect(initialsOf('Meridian Market Ltd')).toBe('MM')
    expect(initialsOf('sourceant')).toBe('S')
    expect(initialsOf('  ')).toBe('')
    expect(initialsOf(null)).toBe('')
  })

  it('shows the initials, the name and the kind of the active workspace', async () => {
    const html = await rail({ active: 1, placement: 'rail' })
    expect(html).toContain('ds-workspace__card')
    expect(html).toContain('>MM<')
    expect(html).toContain('Meridian Market')
    expect(html).toContain('Business workspace')
  })

  it('stays an inline name in the bar unless placed in the rail', async () => {
    const html = await rail({ active: 2 })
    expect(html).toContain('ds-workspace__trigger')
    expect(html).not.toContain('ds-workspace__card')
  })

  it('folds to its initials with the rail, keeping the name as its label', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(ConsoleLayout, { collapsible: true, collapsed: true }, {
            'bar-start': () => h(DsWorkspaceMenu, { options, active: 1 }),
            create: () => h(DsWorkspaceMenu, { options, active: 1, placement: 'rail' }),
            nav: () => 'Home',
          }),
      }),
    )
    expect(html).toContain('ds-workspace--folded')
    expect(html).toContain('aria-label="Meridian Market"')
    expect(html.match(/ds-workspace--folded/g)).toHaveLength(1)
  })
})
