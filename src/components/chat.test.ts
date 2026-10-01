import { describe, expect, it } from 'vitest'
import { createApp, createSSRApp, h, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import DsChatActivity from './DsChatActivity.vue'
import DsChatMessage from './DsChatMessage.vue'
import DsChatProgress from './DsChatProgress.vue'
import DsChatQuestion from './DsChatQuestion.vue'

const render = (component: object, props: Record<string, unknown>, slots = {}) =>
  renderToString(createSSRApp({ render: () => h(component, props, slots) }))

function mountQuestion(props: Record<string, unknown>) {
  const picked: string[] = []
  const root = document.createElement('div')
  createApp({ render: () => h(DsChatQuestion, { ...props, onSelect: (id: string) => picked.push(id) }) }).mount(root)
  return { root, picked, buttons: [...root.querySelectorAll('button')] }
}

const options = [
  { id: 'a', label: 'The retry key', detail: 'One tap, two charges.' },
  { id: 'b', label: 'The second guess' },
]

describe('a chat message', () => {
  it('shows who said it and what they said', async () => {
    const html = await render(DsChatMessage, { from: 'user' }, { default: () => 'acme.com' })
    expect(html).toContain('ds-chat-message--user')
    expect(html).toContain('acme.com')
  })

  it('shows it is working instead of its text while pending', async () => {
    const html = await render(DsChatMessage, { from: 'assistant', state: 'pending' }, { default: () => 'final answer' })
    expect(html).toContain('ds-chat-message__dots')
    expect(html).not.toContain('final answer')
  })

  it('announces a failure', async () => {
    expect(await render(DsChatMessage, { from: 'assistant', state: 'failed' }, { default: () => 'x' })).toContain('role="alert"')
  })
})

describe('a question in a chat', () => {
  const pick = (root: HTMLElement, i: number) => root.querySelectorAll<HTMLInputElement>('input')[i]!.click()
  const confirmButton = (root: HTMLElement) => [...root.querySelectorAll('button')].find((b) => b.textContent?.includes('Use this'))

  it('starts on the recommendation and sends it on confirm', async () => {
    const q = mountQuestion({ question: 'Which story?', options, recommended: 'a' })
    confirmButton(q.root)!.click()
    await nextTick()
    expect(q.picked).toEqual(['a'])
  })

  it('sends a different pick only once it is confirmed', async () => {
    const q = mountQuestion({ question: 'Which story?', options, recommended: 'a' })
    pick(q.root, 1)
    await nextTick()
    expect(q.picked).toEqual([])
    confirmButton(q.root)!.click()
    await nextTick()
    expect(q.picked).toEqual(['b'])
  })

  it('answers in one tap when asked not to confirm', async () => {
    const q = mountQuestion({ question: 'Which?', options, confirm: false, layout: 'pills' })
    pick(q.root, 1)
    await nextTick()
    expect(q.picked).toEqual(['b'])
  })

  it('takes several answers and holds to its limits', async () => {
    const many: string[][] = []
    const root = document.createElement('div')
    const three = [...options, { id: 'c', label: 'Third' }]
    createApp({
      render: () => h(DsChatQuestion, { question: 'Which?', options: three, multiple: true, max: 2, onSelectMany: (ids: string[]) => many.push(ids) }),
    }).mount(root)
    pick(root, 0)
    await nextTick()
    pick(root, 2)
    await nextTick()
    expect(root.querySelectorAll<HTMLInputElement>('input')[1]!.disabled).toBe(true)
    confirmButton(root)!.click()
    await nextTick()
    expect(many).toEqual([['a', 'c']])
  })

  it('cannot be answered twice', async () => {
    const q = mountQuestion({ question: 'Which story?', options, answer: 'a' })
    expect(q.root.querySelectorAll('input')[1]!.hasAttribute('disabled')).toBe(true)
    expect(confirmButton(q.root)).toBeUndefined()
  })

  it('marks the recommendation until someone answers', async () => {
    expect(await render(DsChatQuestion, { question: 'Q', options, recommended: 'a' })).toContain('Recommended')
    expect(await render(DsChatQuestion, { question: 'Q', options, recommended: 'a', answer: 'b' })).not.toContain('Recommended')
  })

  it("takes an answer in the person's own words only when asked to", async () => {
    const written: string[] = []
    const root = document.createElement('div')
    createApp({
      render: () => h(DsChatQuestion, { question: 'Use it?', options, writeIn: 'Tell me what to change', onWrite: (t: string) => written.push(t) }),
    }).mount(root)
    const box = root.querySelector('textarea')!
    const send = () => root.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }))

    send()
    box.value = '  Open on the customer.  '
    box.dispatchEvent(new Event('input'))
    await nextTick()
    send()

    expect(written).toEqual(['Open on the customer.'])
    expect(await render(DsChatQuestion, { question: 'Q', options })).not.toContain('textarea')
    expect(await render(DsChatQuestion, { question: 'Q', options, writeIn: 'Why?', answer: 'a' })).not.toContain('textarea')
  })

  it('shows option details only as cards', async () => {
    expect(await render(DsChatQuestion, { question: 'Q', options, layout: 'pills' })).not.toContain('One tap, two charges.')
    expect(await render(DsChatQuestion, { question: 'Q', options })).toContain('One tap, two charges.')
  })
})

describe('progress in a chat', () => {
  it('draws each step in its state', async () => {
    const html = await render(DsChatProgress, {
      steps: [
        { id: '1', label: 'Read your site', state: 'done' },
        { id: '2', label: 'Writing the script', state: 'active', detail: '2 min' },
        { id: '3', label: 'Record', state: 'pending' },
      ],
    })
    expect(html).toContain('is-done')
    expect(html).toContain('ds-chat-progress__spinner')
    expect(html).toContain('2 min')
  })
})

describe('activity in a chat', () => {
  it('shows the newest first and only as many as asked', async () => {
    const items = ['one', 'two', 'three'].map((text, i) => ({ id: String(i), text, state: 'done' as const }))
    const html = await render(DsChatActivity, { items, limit: 2 })
    expect(html.indexOf('three')).toBeLessThan(html.indexOf('two'))
    expect(html).not.toContain('>one<')
  })
})
