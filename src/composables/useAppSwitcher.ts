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

const defaultApps: AppDefinition[] = [
  {
    id: 'mail',
    name: 'Mail',
    url: appUrl('mail'),
    icon: appIcons.mail,
    description: 'Email management'
  },
  {
    id: 'console',
    name: 'Console',
    url: appUrl('console'),
    icon: appIcons.console,
    description: 'Organization management'
  },
  {
    id: 'files',
    name: 'Files',
    url: appUrl('files'),
    icon: appIcons.files,
    description: 'File storage and sharing'
  },
  {
    id: 'calendar',
    name: 'Calendar',
    url: appUrl('calendar'),
    icon: appIcons.calendar,
    description: 'Events and scheduling'
  },
  {
    id: 'chat',
    name: 'Chat',
    url: appUrl('chat'),
    icon: appIcons.chat,
    description: 'Workplace conversations'
  },
  {
    id: 'moments',
    name: 'Moments',
    url: appUrl('moments'),
    icon: appIcons.moments,
    description: 'Capture and share memories'
  },
  {
    id: 'accounts',
    name: 'Account',
    url: appUrl('accounts'),
    icon: appIcons.accounts,
    description: 'Manage your account'
  }
]

export function resolveAppSwitcherApps(options: AppSwitcherOptions = {}): AppDefinition[] {
  const merged = [...(options.apps || defaultApps)]
  for (const app of options.additionalApps || []) {
    const existingIndex = merged.findIndex(item => item.id === app.id)
    if (existingIndex >= 0) merged[existingIndex] = app
    else merged.push(app)
  }

  const excluded = new Set(options.excludeAppIds || [])
  if (!options.includeCurrentApp && options.currentAppId) excluded.add(options.currentAppId)
  return merged.filter(app => !excluded.has(app.id))
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
