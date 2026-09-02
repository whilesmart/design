import { describe, expect, it } from 'vitest'
import { resolveEcosystemApps, whileSmartEcosystemApps } from './ecosystem'

describe('resolveEcosystemApps', () => {
  it('omits the current app and resolves every remaining destination', () => {
    const apps = resolveEcosystemApps(whileSmartEcosystemApps, 'files', (app) => `/${app}`)

    expect(apps.some((app) => app.id === 'files')).toBe(false)
    expect(apps).toHaveLength(whileSmartEcosystemApps.length - 1)
    expect(apps.every((app) => app.url === `/${app.id}`)).toBe(true)
  })

  it('keeps a destination supplied by the host', () => {
    const apps = resolveEcosystemApps([
      { id: 'mail', name: 'Mail', icon: '/mail.svg', description: 'Mail', url: 'https://mail.example.com/' }
    ], 'files', () => '/mail')

    expect(apps[0]?.url).toBe('https://mail.example.com/')
  })
})
