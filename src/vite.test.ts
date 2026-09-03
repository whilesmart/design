import { describe, expect, it } from 'vitest'
import { localizeSetCookie, whilesmartAppLoader } from './vite'
import { conversationUrl } from './composables/useAppUrls'

describe('localizeSetCookie', () => {
  it('creates a host cookie usable across local app ports', () => {
    expect(localizeSetCookie('refresh_token=value; Path=/; Domain=.whilesmart.com; Secure; HttpOnly; SameSite=None'))
      .toBe('refresh_token=value; Path=/; HttpOnly; SameSite=Lax')
  })
})

describe('whilesmartAppLoader', () => {
  const site = {
    name: 'WhileSmart Files',
    canonical: 'https://files.example.com/',
    title: 'WhileSmart Files',
    description: 'Business file storage.',
    heading: 'Keep company files together.',
    summary: 'Store and share work.',
    sections: [{ title: 'Find files', description: 'Search one company workspace.' }],
    links: [{ label: 'WhileSmart Mail', url: 'https://mail.example.com/' }]
  }

  it('places public content in the raw document', () => {
    const plugin = whilesmartAppLoader({ site })
    const transform = plugin.transformIndexHtml as (html: string) => string
    const html = transform('<html><head></head><body><div id="app"></div></body></html>')

    expect(html).toContain('<h1>Keep company files together.</h1>')
    expect(html).toContain('application/ld+json')
    expect(html).toContain('https://mail.example.com/')
  })

  it('emits public crawler assets', () => {
    const plugin = whilesmartAppLoader({ site })
    const assets = new Map<string, string>()
    const emitFile = ({ fileName, source }: { fileName: string; source: string }) => assets.set(fileName, source)

    plugin.generateBundle.call({ emitFile })

    expect(assets.get('robots.txt')).toContain('Allow: /')
    expect(assets.get('sitemap.xml')).toContain(site.canonical)
    expect(assets.get('llms.txt')).toContain('## Find files')
  })

  it('blocks private surfaces without publishing discovery files', () => {
    const plugin = whilesmartAppLoader({ indexing: false })
    const assets = new Map<string, string>()
    const emitFile = ({ fileName, source }: { fileName: string; source: string }) => assets.set(fileName, source)

    plugin.generateBundle.call({ emitFile })

    expect(assets).toEqual(new Map([['robots.txt', 'User-agent: *\nDisallow: /\n']]))
  })
})

describe('conversationUrl', () => {
  it('encodes owner context and each participant', () => {
    const url = new URL(conversationUrl({ ownerType: 'file', ownerId: '42', ownerName: 'Launch brief', ownerHref: 'http://localhost:3004/file/42', participants: ['ada@example.com', 'sam@example.com'] }, 'localhost'))
    expect(url.origin).toBe('http://localhost:3007')
    expect(url.searchParams.get('owner_type')).toBe('file')
    expect(url.searchParams.get('owner_id')).toBe('42')
    expect(url.searchParams.getAll('participant')).toEqual(['ada@example.com', 'sam@example.com'])
  })
})
