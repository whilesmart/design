import { computed } from 'vue'
import { appUrl } from './useAppUrls'
import { appIcons } from '../assets/app-icons'


export interface AppDefinition {
  id: string
  name: string
  url: string
  icon: string
  description?: string
}

export interface AppSwitcherOptions {
  apps?: AppDefinition[]
  additionalApps?: AppDefinition[]
  excludeAppIds?: string[]
  currentAppId?: string
  includeCurrentApp?: boolean
}

function defaultApps(): AppDefinition[] {
  return [
    { id: 'meet', name: 'Meet', url: appUrl('meet'), icon: appIcons.meet, description: 'Video meetings and shared notes' },
    { id: 'mail', name: 'Mail', url: appUrl('mail'), icon: appIcons.mail, description: 'Email management' },
    { id: 'files', name: 'Drive', url: appUrl('files'), icon: appIcons.files, description: 'File storage and sharing' },
    { id: 'docs', name: 'Docs', url: `${appUrl('files')}/docs`, icon: appIcons.docs, description: 'Documents and spreadsheets' },
    { id: 'slides', name: 'Slides', url: `${appUrl('files')}/slides`, icon: appIcons.slides, description: 'Presentations and slide decks' },
    { id: 'calendar', name: 'Calendar', url: appUrl('calendar'), icon: appIcons.calendar, description: 'Events and scheduling' },
    { id: 'chat', name: 'Chat', url: appUrl('chat'), icon: appIcons.chat, description: 'Workplace conversations' },
    { id: 'moments', name: 'Moments', url: appUrl('moments'), icon: appIcons.moments, description: 'Capture and share memories' },
    { id: 'accounts', name: 'Account', url: appUrl('accounts'), icon: appIcons.accounts, description: 'Manage your account' },
    { id: 'mindpad', name: 'Mindpad', url: appUrl('mindpad'), icon: appIcons.mindpad, description: 'Notes and collaborative pads' },
    { id: 'console', name: 'Console', url: appUrl('console'), icon: appIcons.console, description: 'Organization management' }
  ]
}

// Added apps join before these, so the suite's own tools stay at the end of the launcher.
const trailingAppIds = ['mindpad', 'console']

export function resolveAppSwitcherApps(options: AppSwitcherOptions = {}): AppDefinition[] {
  const merged = [...(options.apps || defaultApps())]
  for (const app of options.additionalApps || []) {
    const existingIndex = merged.findIndex(item => item.id === app.id)
    if (existingIndex >= 0) merged[existingIndex] = app
    else merged.push(app)
  }

  const excluded = new Set(options.excludeAppIds || [])
  if (!options.includeCurrentApp && options.currentAppId) excluded.add(options.currentAppId)
  const rank = (app: AppDefinition) => trailingAppIds.indexOf(app.id)
  return merged
    .filter(app => !excluded.has(app.id))
    .sort((a, b) => rank(a) - rank(b))
}

export function useAppSwitcher(options: AppDefinition[] | AppSwitcherOptions = {}) {
  const normalizedOptions = Array.isArray(options) ? { apps: options } : options
  const apps = computed(() => resolveAppSwitcherApps(normalizedOptions))

  const getAppUrl = (appId: string): string | undefined => {
    const app = apps.value.find(a => a.id === appId)
    return app?.url
  }

  const navigateToApp = (appId: string, path?: string) => {
    const baseUrl = getAppUrl(appId)
    if (baseUrl) {
      const url = path ? `${baseUrl}${path}` : baseUrl
      window.location.href = url
    }
  }

  const getLoginUrl = (redirectUrl?: string): string => {
    const accountsUrl = getAppUrl('accounts') || appUrl('accounts')
    if (redirectUrl) {
      return `${accountsUrl}/login?redirect=${encodeURIComponent(redirectUrl)}`
    }
    return `${accountsUrl}/login`
  }

  const getCurrentAppId = (): string | undefined => {
    const currentOrigin = window.location.origin
    for (const app of apps.value) {
      try {
        const appOrigin = new URL(app.url).origin
        if (currentOrigin === appOrigin) {
          return app.id
        }
      } catch {
        continue
      }
    }
    return undefined
  }

  return {
    apps,
    getAppUrl,
    navigateToApp,
    getLoginUrl,
    getCurrentAppId
  }
}
