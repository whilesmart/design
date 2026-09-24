import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import DsAccountMenu from './DsAccountMenu.vue'
import { nameOf } from './workspaceMenu'

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
