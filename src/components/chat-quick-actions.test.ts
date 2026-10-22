import { describe, expect, it } from 'vitest'
import { createApp, createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import DsChatMessage from './DsChatMessage.vue'
import DsChatQuickActions from './DsChatQuickActions.vue'
import DsChatThread from './DsChatThread.vue'

const actions = [
  { key: 'plan', label: 'Plan posts', detail: 'A week of posts.', group: 'Create' },
  { key: 'draft', label: 'Repurpose a post', group: 'Create' },
  { key: 'find', label: 'Find by meaning', group: 'Understand' },
]

function mount(props: Record<string, unknown>) {
  const picked: string[] = []
  const root = document.createElement('div')
  createApp({ render: () => h(DsChatQuickActions, { actions, ...props, onSelect: (key: string) => picked.push(key) }) }).mount(root)
  return { root, picked, buttons: [...root.querySelectorAll('button')] }
}

describe('quick actions in a chat', () => {
  it('groups cards under their headings', () => {
    const { root } = mount({})
    expect([...root.querySelectorAll('h3')].map((h) => h.textContent)).toEqual(['Create', 'Understand'])
    expect(root.textContent).toContain('A week of posts.')
  })

  it('sends the key of the action picked', () => {
    const { buttons, picked } = mount({ layout: 'pills' })
    buttons[1]!.click()
    expect(picked).toEqual(['draft'])
  })

  it('marks the action in use', () => {
    const { buttons } = mount({ active: 'find' })
    expect(buttons.map((b) => b.getAttribute('aria-pressed'))).toEqual([null, null, 'true'])
  })

  it('does nothing while disabled', () => {
    const { buttons, picked } = mount({ disabled: true })
    buttons[0]!.click()
    expect(picked).toEqual([])
  })
})

describe('a message with actions', () => {
  const render = (state: string) =>
    renderToString(createSSRApp({ render: () => h(DsChatMessage, { from: 'assistant', state }, { default: () => 'Draft', actions: () => 'Save as draft' }) }))

  it('offers them once the answer is ready', async () => {
    expect(await render('ready')).toContain('Save as draft')
  })

  it('holds them back while the answer is pending or failed', async () => {
    expect(await render('pending')).not.toContain('Save as draft')
    expect(await render('failed')).not.toContain('Save as draft')
  })
})

describe('a chat thread', () => {
  it('is announced as a log', async () => {
    const html = await renderToString(createSSRApp({ render: () => h(DsChatThread, { label: 'Assistant' }, { default: () => 'Hello' }) }))
    expect(html).toContain('role="log"')
    expect(html).toContain('aria-label="Assistant"')
  })
})
