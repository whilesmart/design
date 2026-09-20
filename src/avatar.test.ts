import { describe, expect, it } from 'vitest'
import { generatedAvatar } from './avatar'

describe('generatedAvatar', () => {
  it('returns an inline image, never a request to another host', () => {
    const uri = generatedAvatar('Nfebe Fon')
    expect(uri.startsWith('data:image/svg+xml')).toBe(true)
    expect(uri).not.toMatch(/https?:\/\//)
  })

  it('draws the same face for the same person', () => {
    expect(generatedAvatar('Ada Lovelace')).toBe(generatedAvatar('Ada Lovelace'))
  })

  it('draws different faces for different people', () => {
    expect(generatedAvatar('Ada Lovelace')).not.toBe(generatedAvatar('Alan Turing'))
  })

  it('falls back to a placeholder seed rather than throwing on a missing name', () => {
    for (const missing of [undefined, null, '', '   ']) {
      expect(generatedAvatar(missing)).toBe(generatedAvatar('User'))
    }
  })
})
