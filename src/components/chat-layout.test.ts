import { describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import DsChatCanvas from './DsChatCanvas.vue'
import DsChatCanvasCard from './DsChatCanvasCard.vue'
import DsChatHistory from './DsChatHistory.vue'
import DsChatLayout from './DsChatLayout.vue'

function render(component: unknown, props: Record<string, unknown> = {}, slots: Record<string, () => unknown> = {}) {
  const root = document.createElement('div')
  createApp({ render: () => h(component as never, props, slots) }).mount(root)
  return root
}

const items = [
  { id: 1, title: 'Launch week plan', meta: 'Oct 20' },
  { id: 2, title: 'Thread from the talk' },
]

describe('chat history', () => {
  it('opens, starts and deletes conversations', () => {
    const events: string[] = []
    const root = render(DsChatHistory, {
      items,
      onOpen: (id: number) => events.push(`open ${id}`),
      onCreate: () => events.push('create'),
      onRemove: (id: number) => events.push(`remove ${id}`),
    })
    const buttons = [...root.querySelectorAll('button')]
    buttons.find((b) => b.textContent?.includes('New chat'))!.click()
    buttons.find((b) => b.textContent?.includes('Thread from the talk'))!.click()
    buttons.find((b) => b.getAttribute('aria-label') === 'Delete Launch week plan')!.click()
    expect(events).toEqual(['create', 'open 2', 'remove 1'])
  })

  it('marks the open conversation', () => {
    const root = render(DsChatHistory, { items, active: 2 })
    expect([...root.querySelectorAll('[aria-current="true"]')].map((b) => b.textContent)).toEqual(['Thread from the talk'])
  })

  it('says when there is nothing yet, and shows loading instead of it', () => {
    expect(render(DsChatHistory, { items: [], emptyText: 'No chats yet.' }).textContent).toContain('No chats yet.')
    const loading = render(DsChatHistory, { items: [], loading: true })
    expect(loading.querySelector('[aria-busy="true"]')).not.toBeNull()
    expect(loading.textContent).not.toContain('Nothing asked here yet.')
  })

  it('leaves out delete when conversations cannot be removed', () => {
    expect(render(DsChatHistory, { items, removable: false }).querySelector('[aria-label^="Delete"]')).toBeNull()
  })
})

describe('chat layout', () => {
  const slots = {
    history: () => h('p', 'history'),
    header: () => h('p', 'header'),
    default: () => h('p', 'thread'),
    footer: () => h('p', 'composer'),
    canvas: () => h('p', 'document'),
  }

  it('places history, header, thread and footer', () => {
    const root = render(DsChatLayout, {}, slots)
    expect(root.querySelector('aside')?.textContent).toBe('history')
    expect(root.querySelector('header')?.textContent).toBe('header')
    expect(root.querySelector('footer')?.textContent).toBe('composer')
  })

  it('shows the document only while it is open', () => {
    expect(render(DsChatLayout, {}, slots).textContent).not.toContain('document')
    const open = render(DsChatLayout, { canvasOpen: true }, slots)
    expect(open.textContent).toContain('document')
    expect(open.querySelector('.ds-chat-layout--canvas')).not.toBeNull()
  })
})

describe('chat canvas', () => {
  it('opens from its card and closes from its panel', () => {
    const events: string[] = []
    render(DsChatCanvasCard, { title: 'Week plan', detail: '5 posts', onOpen: () => events.push('open') })
      .querySelector('button')!.click()
    const panel = render(DsChatCanvas, { title: 'Week plan', onClose: () => events.push('close') }, { default: () => 'body' })
    panel.querySelector<HTMLButtonElement>('[aria-label="Close"]')!.click()
    expect(events).toEqual(['open', 'close'])
    expect(panel.querySelector('h2')?.textContent).toBe('Week plan')
  })
})
