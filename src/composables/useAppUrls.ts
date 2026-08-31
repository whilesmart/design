export type WhileSmartApp =
  | 'accounts'
  | 'calendar'
  | 'console'
  | 'desk'
  | 'files'
  | 'mail'
  | 'mailadmin'
  | 'mindpad'
  | 'moments'
  | 'platform'

const productionUrls: Record<WhileSmartApp, string> = {
  accounts: 'https://accounts.whilesmart.com',
  calendar: 'https://calendar.whilesmart.com',
  console: 'https://console.whilesmart.com',
  desk: 'https://desk.whilesmart.com',
  files: 'https://files.whilesmart.com',
  mail: 'https://mail.whilesmart.com',
  mailadmin: 'https://mailadmin.whilesmart.com',
  mindpad: 'https://mindpad.whilesmart.com',
  moments: 'https://moments.whilesmart.com',
  platform: 'https://platform.whilesmart.com'
}

const localUrls: Record<WhileSmartApp, string> = {
  accounts: 'http://localhost:3000',
  calendar: 'http://localhost:3005',
  console: 'http://localhost:3003',
  desk: 'http://localhost:3001',
  files: 'http://localhost:3004',
  mail: 'http://localhost:3002',
  mailadmin: 'http://localhost:8088',
  mindpad: productionUrls.mindpad,
  moments: 'http://localhost:3006',
  platform: 'http://localhost:3008'
}

const configuredUrls: Partial<Record<WhileSmartApp, string>> = {
  accounts: import.meta.env.VITE_ACCOUNTS_URL,
  calendar: import.meta.env.VITE_CALENDAR_URL,
  console: import.meta.env.VITE_CONSOLE_URL,
  desk: import.meta.env.VITE_DESK_URL,
  files: import.meta.env.VITE_FILES_URL,
  mail: import.meta.env.VITE_MAIL_URL,
  mailadmin: import.meta.env.VITE_MAILADMIN_URL,
  mindpad: import.meta.env.VITE_MINDPAD_URL,
  moments: import.meta.env.VITE_MOMENTS_URL,
  platform: import.meta.env.VITE_PLATFORM_URL
}

export function isLocalHostname(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
}

export function appUrl(app: WhileSmartApp, hostname = window.location.hostname): string {
  const configuredUrl = configuredUrls[app]
  if (configuredUrl) return configuredUrl.replace(/\/$/, '')
  return isLocalHostname(hostname) ? localUrls[app] : productionUrls[app]
}

/* Store listings for the Desk mobile app. While a key is empty the landing
   pages render a plain availability line in place of that store's button. */
export const mobileAppUrls: { ios?: string; android?: string } = {}
