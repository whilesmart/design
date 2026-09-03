import { beforeAll, describe, expect, it } from 'vitest'
import type { AppDefinition } from './useAppSwitcher'

let resolveAppSwitcherApps: typeof import('./useAppSwitcher').resolveAppSwitcherApps

beforeAll(async () => {
  Object.defineProperty(globalThis, 'window', {
    value: { location: { hostname: 'localhost', origin: 'http://localhost:3007' } },
    configurable: true
  })
  ;({ resolveAppSwitcherApps } = await import('./useAppSwitcher'))
})

const customApp: AppDefinition = {
  id: 'crm',
  name: 'CRM',
  url: 'https://crm.example.com',
  icon: 'solar:users-group-rounded-bold-duotone'
}

describe('resolveAppSwitcherApps', () => {
  it('hides the current app by default', () => {
    const apps = resolveAppSwitcherApps({ currentAppId: 'files' })

    expect(apps.some(app => app.id === 'files')).toBe(false)
    expect(apps.some(app => app.id === 'mail')).toBe(true)
  })

  it('can retain the current app', () => {
    const apps = resolveAppSwitcherApps({ currentAppId: 'files', includeCurrentApp: true })

    expect(apps.some(app => app.id === 'files')).toBe(true)
  })

  it('adds custom apps and excludes unwanted apps', () => {
    const apps = resolveAppSwitcherApps({
      additionalApps: [customApp],
      excludeAppIds: ['moments']
    })

    expect(apps.find(app => app.id === 'crm')).toEqual(customApp)
    expect(apps.some(app => app.id === 'moments')).toBe(false)
  })

  it('allows a custom app to replace a default app', () => {
    const replacement = { ...customApp, id: 'mail', name: 'Company Mail' }
    const apps = resolveAppSwitcherApps({ additionalApps: [replacement] })

    expect(apps.find(app => app.id === 'mail')).toEqual(replacement)
    expect(apps.filter(app => app.id === 'mail')).toHaveLength(1)
  })
})
