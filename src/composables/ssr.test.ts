import { describe, expect, it, vi } from 'vitest'
import { appUrl, conversationUrl, currentHostname } from './useAppUrls'
import { resolveAppSwitcherApps } from './useAppSwitcher'

// A server has no window. Reading one while a module loads means the library
// cannot be imported anywhere but a browser, and the application that imports
// it fails before it renders anything.
describe('without a window', () => {
  const withoutOne = <T>(run: () => T): T => {
    const had = Object.getOwnPropertyDescriptor(globalThis, 'window')
    // @ts-expect-error deleting it is the whole point
    delete globalThis.window
    try {
      return run()
    } finally {
      if (had) Object.defineProperty(globalThis, 'window', had)
    }
  }

  it('says where it is running rather than assuming', () => {
    expect(withoutOne(() => currentHostname())).toBe('')
  })

  it('still answers what an application address is', () => {
    expect(withoutOne(() => appUrl('mail'))).toMatch(/^https?:\/\//)
  })

  it('still answers a conversation address', () => {
    expect(withoutOne(() => conversationUrl({ app: 'chat' }))).toMatch(/^https?:\/\//)
  })

  it('still resolves the applications the switcher offers', () => {
    const found = withoutOne(() => resolveAppSwitcherApps())
    expect(found.length).toBeGreaterThan(0)
    expect(found.every((app) => typeof app.url === 'string' && app.url !== '')).toBe(true)
  })
})
