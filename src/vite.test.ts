import { describe, expect, it } from 'vitest'
import { localizeSetCookie } from './vite'

describe('localizeSetCookie', () => {
  it('creates a host cookie usable across local app ports', () => {
    expect(localizeSetCookie('refresh_token=value; Path=/; Domain=.whilesmart.com; Secure; HttpOnly; SameSite=None'))
      .toBe('refresh_token=value; Path=/; HttpOnly; SameSite=Lax')
  })
})
