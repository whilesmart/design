import { computed } from 'vue'

export interface AppDefinition {
  id: string
  name: string
  url: string
  icon: string
  description?: string
}

const defaultApps: AppDefinition[] = [
  {
    id: 'desk',
    name: 'Desk',
    url: import.meta.env.VITE_DESK_URL || 'https://desk.whilesmart.com',
    icon: '/desk-icon.svg',
    description: 'Your WhileSmart hub'
  },
  {
    id: 'mail',
    name: 'Mail',
    url: import.meta.env.VITE_MAIL_URL || 'https://mail.whilesmart.com',
    icon: '/mail-icon.svg',
    description: 'Email management'
  },
  {
    id: 'admin',
    name: 'Admin',
    url: import.meta.env.VITE_ADMIN_URL || 'https://admin.whilesmart.com',
    icon: '/whilesmart-icon.svg',
    description: 'Organization management'
  },
  {
    id: 'files',
    name: 'Files',
    url: import.meta.env.VITE_FILES_URL || 'https://files.whilesmart.com',
    icon: '/files-icon.svg',
    description: 'File storage and sharing'
  },
  {
    id: 'calendar',
    name: 'Calendar',
    url: import.meta.env.VITE_CALENDAR_URL || 'https://calendar.whilesmart.com',
    icon: '/calendar-icon.svg',
    description: 'Events and scheduling'
  },
  {
    id: 'accounts',
    name: 'Account',
    url: import.meta.env.VITE_ACCOUNTS_URL || 'https://accounts.whilesmart.com',
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
    const accountsUrl = getAppUrl('accounts') || 'https://accounts.whilesmart.com'
    if (redirectUrl) {
      return `${accountsUrl}/login?redirect=${encodeURIComponent(redirectUrl)}`
    }
    return `${accountsUrl}/login`
  }

  const getCurrentAppId = (): string | undefined => {
    const hostname = window.location.hostname
    for (const app of apps.value) {
      try {
        const appHostname = new URL(app.url).hostname
        if (hostname === appHostname) {
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
