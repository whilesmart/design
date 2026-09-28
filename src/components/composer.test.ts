import { describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import DsChatComposer, { type ChatSend } from './DsChatComposer.vue'

function mountComposer(props: Record<string, unknown> = {}, start = '') {
  const sent: ChatSend[] = []
  const text = ref(start)
  const root = document.createElement('div')
  document.body.appendChild(root)
  createApp({
    render: () =>
      h(DsChatComposer, {
        ...props,
        modelValue: text.value,
        'onUpdate:modelValue': (v: string) => (text.value = v),
        onSend: (p: ChatSend) => sent.push(p),
      }),
  }).mount(root)
  const box = () => root.querySelector('textarea')!
  const press = async (key: string, shiftKey = false) => {
    box().dispatchEvent(new KeyboardEvent('keydown', { key, shiftKey, bubbles: true, cancelable: true }))
    await nextTick()
  }
  return { root, sent, text, press }
}

describe('a chat composer', () => {
  it('sends on Enter with the trimmed text', async () => {
    const c = mountComposer({}, '  acme.com  ')
    await c.press('Enter')
    expect(c.sent).toEqual([{ text: 'acme.com', files: [], fileType: null }])
  })

  it('keeps Shift+Enter for a new line', async () => {
    const c = mountComposer({}, 'first line')
    await c.press('Enter', true)
    expect(c.sent).toEqual([])
  })

  it('sends nothing when there is nothing to send or it is busy', async () => {
    const empty = mountComposer({}, '   ')
    await empty.press('Enter')
    expect(empty.sent).toEqual([])
    const busy = mountComposer({ sending: true }, 'hello')
    await busy.press('Enter')
    expect(busy.sent).toEqual([])
    expect(busy.root.querySelector<HTMLButtonElement>('button[type=submit]')!.disabled).toBe(true)
  })

  it('offers attaching only when it is told what can be attached', async () => {
    expect(mountComposer().root.querySelector('[aria-haspopup=menu]')).toBeNull()
    const c = mountComposer({ fileTypes: [{ key: 'logo', label: 'Logo', accept: 'image/*' }] })
    const plus = c.root.querySelector<HTMLButtonElement>('[aria-haspopup=menu]')!
    plus.click()
    await nextTick()
    expect(document.body.textContent).toContain('Logo')
  })
})
