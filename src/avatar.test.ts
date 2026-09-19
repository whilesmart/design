import { describe, expect, it } from 'vitest'
import { initialsAvatar } from './avatar'

describe('initialsAvatar', () => {
  it('returns an inline image, never a request to another host', () => {
    const uri = initialsAvatar('Nfebe Fon')
    expect(uri.startsWith('data:image/svg+xml')).toBe(true)
    expect(uri).not.toMatch(/https?:\/\//)
  })

  it('draws the same avatar for the same person', () => {
    expect(initialsAvatar('Ada Lovelace')).toBe(initialsAvatar('Ada Lovelace'))
  })

  it('draws different avatars for different people', () => {
    expect(initialsAvatar('Ada Lovelace')).not.toBe(initialsAvatar('Alan Turing'))
  })

  it('falls back to a placeholder seed rather than drawing nothing', () => {
    expect(initialsAvatar('   ')).toBe(initialsAvatar('User'))
  })
})
