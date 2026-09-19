import { createAvatar } from '@dicebear/core'
import * as initials from '@dicebear/initials'

const drawn = new Map<string, string>()

/**
 * Draws the initials avatar in process. The hosted endpoint takes the seed in the URL,
 * which put a real person's name in a third party's logs on every render.
 */
export function initialsAvatar(name: string): string {
  const seed = name.trim() || 'User'
  let uri = drawn.get(seed)
  if (!uri) {
    uri = createAvatar(initials, { seed, backgroundType: ['gradientLinear'] }).toDataUri()
    drawn.set(seed, uri)
  }
  return uri
}
