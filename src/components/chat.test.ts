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
  it('answers in one tap with the option picked', async () => {
    const question = mountQuestion({ question: 'Which story?', options })
    question.buttons[1]!.click()
    await nextTick()
    expect(question.picked).toEqual(['b'])
  })

  it('cannot be answered twice', async () => {
    const question = mountQuestion({ question: 'Which story?', options, answer: 'a' })
    question.buttons[1]!.click()
    await nextTick()
    expect(question.picked).toEqual([])
    expect(question.buttons.every((b) => b.disabled)).toBe(true)
  })

  it('marks the recommendation until someone answers', async () => {
    expect(await render(DsChatQuestion, { question: 'Q', options, recommended: 'a' })).toContain('Recommended')
    expect(await render(DsChatQuestion, { question: 'Q', options, recommended: 'a', answer: 'b' })).not.toContain('Recommended')
  })

  it('shows option details only as cards', async () => {
    expect(await render(DsChatQuestion, { question: 'Q', options })).not.toContain('One tap, two charges.')
    expect(await render(DsChatQuestion, { question: 'Q', options, layout: 'cards' })).toContain('One tap, two charges.')
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
