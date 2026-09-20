import { Avatar, Style } from '@dicebear/core'
import definition from '@dicebear/styles/critters.json' with { type: 'json' }

const style = new Style(definition)
const drawn = new Map<string, string>()

/**
 * Draws a person's avatar in process, seeded by their name so the same person always gets
 * the same face. The hosted endpoint takes the seed in the URL, which would put a real
 * name in a third party's logs on every render. Swapping the style is the import above.
 */
export function generatedAvatar(name: string | null | undefined): string {
  const seed = (name ?? '').trim() || 'User'
  let uri = drawn.get(seed)
  if (!uri) {
    uri = new Avatar(style, { seed }).toDataUri()
    drawn.set(seed, uri)
  }
  return uri
}
