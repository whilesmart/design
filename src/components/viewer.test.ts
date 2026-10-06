import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, type App } from 'vue'
import DsViewerFrame from './DsViewerFrame.vue'
import DsPreviewFrame from './DsPreviewFrame.vue'

let app: App | undefined
let container: HTMLElement | undefined
afterEach(() => { app?.unmount(); container?.remove() })
function mount(render: () => ReturnType<typeof h>) {
  container = document.createElement('div')
  document.body.append(container)
  app = createApp({ render })
  app.mount(container)
  return container
}

describe('viewer frame', () => {
  it('emits navigation from the visible controls and renders caller content', async () => {
    const actions: string[] = []
    const surface = mount(() => h(DsViewerFrame, { name: 'Photo', kind: 'image', hasNext: true, onNext: () => actions.push('next') }, () => h('p', 'Caller preview')))
    expect(surface.textContent).toContain('Caller preview')
    expect(surface.querySelector('[aria-label="Previous file"]')).toBeNull()
    surface.querySelector<HTMLButtonElement>('[aria-label="Next file"]')!.click()
    await nextTick()
    expect(actions).toEqual(['next'])
  })
  it('shows a download fallback without exposing preview content on failure', () => {
    const surface = mount(() => h(DsViewerFrame, { name: 'Plan', error: 'Access denied', downloadSource: '/download' }, () => h('p', 'Hidden preview')))
    expect(surface.querySelector('[role="alert"]')?.textContent).toContain('Access denied')
    expect(surface.textContent).not.toContain('Hidden preview')
    expect(surface.querySelector('a')?.getAttribute('href')).toBe('/download')
  })
})

describe('preview frame', () => {
  it('keeps scripts disabled even when link popups are enabled', () => {
    const surface = mount(() => h(DsPreviewFrame, { name: 'Plan', html: '<p>Preview</p>', allowLinks: true }))
    const frame = surface.querySelector('iframe')!
    expect(frame.getAttribute('sandbox')).not.toContain('allow-scripts')
    expect(frame.getAttribute('sandbox')).toContain('allow-popups')
    expect(frame.getAttribute('srcdoc')).toBe('<p>Preview</p>')
  })
})
