import { computed } from 'vue'
import { appUrl } from './useAppUrls'

export interface AppDefinition {
  id: string
  name: string
  url: string
  icon: string
  description?: string
}

const defaultApps: AppDefinition[] = [
  {
    id: 'mail',
    name: 'Mail',
    url: appUrl('mail'),
    icon: '/mail-icon.svg',
    description: 'Email management'
  },
  {
    id: 'console',
    name: 'Console',
    url: appUrl('console'),
    icon: '/whilesmart-icon.svg',
    description: 'Organization management'
  },
  {
    id: 'files',
    name: 'Files',
    url: appUrl('files'),
    icon: '/files-icon.svg',
    description: 'File storage and sharing'
  },
  {
    id: 'calendar',
    name: 'Calendar',
    url: appUrl('calendar'),
    icon: '/calendar-icon.svg',
    description: 'Events and scheduling'
  },
  {
    id: 'chat',
    name: 'Chat',
    url: appUrl('chat'),
    icon: '/chat-icon.svg',
    description: 'Workplace conversations'
  },
  {
    id: 'moments',
    name: 'Moments',
    url: appUrl('moments'),
    icon: '/moments-icon.svg',
    description: 'Capture and share memories'
  },
  {
    id: 'accounts',
    name: 'Account',
    url: appUrl('accounts'),
    icon: '/whilesmart-icon.svg',
    description: 'Manage your account'
  }
]

export function useAppSwitcher(customApps?: AppDefinition[]) {
  const apps = computed(() => customApps || defaultApps)

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
