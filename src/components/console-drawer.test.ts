import { describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import ConsoleLayout from '../layouts/ConsoleLayout.vue'
import DsWorkspaceMenu from './DsWorkspaceMenu.vue'

const options = [
  { id: 1, name: 'Meridian Market' },
  { id: 2, name: 'Northwind' },
]

function mount() {
  const root = document.createElement('div')
  document.body.appendChild(root)
  createApp({
    render: () =>
      h(ConsoleLayout, {}, {
        create: () => h(DsWorkspaceMenu, { options, active: 1, placement: 'rail' }),
        nav: () => 'Home',
      }),
  }).mount(root)
  return root
}

describe('the drawer on a phone', () => {
  it('stays open while the workspace menu inside it opens, and closes once one is chosen', async () => {
    const root = mount()
    root.querySelector<HTMLButtonElement>('.ds-console__menu')!.click()
    await nextTick()
    const rail = root.querySelector('.ds-console__rail')!
    expect(rail.classList.contains('is-open')).toBe(true)

    root.querySelector<HTMLButtonElement>('.ds-workspace__card')!.click()
    await nextTick()
    expect(rail.classList.contains('is-open')).toBe(true)
    expect(document.querySelector('.ds-menu__list')).not.toBeNull()

    document.querySelectorAll<HTMLButtonElement>('.ds-workspace__row')[1]!.click()
    await nextTick()
    expect(rail.classList.contains('is-open')).toBe(false)
  })
})
