import { appUrl, type WhileSmartApp } from './composables/useAppUrls'

export interface EcosystemApp {
  id: WhileSmartApp
  name: string
  icon?: string
  iconName?: `solar:${string}` | `material-symbols:${string}`
  description: string
  url?: string
}

export const whileSmartEcosystemApps: EcosystemApp[] = [
  { id: 'mail', name: 'Mail', icon: '/mail-icon.svg', description: 'Use business email on the domain your customers trust.' },
  { id: 'files', name: 'Files', icon: '/files-icon.svg', description: 'Organise, review, and share documents without losing control.' },
  { id: 'calendar', name: 'Calendar', icon: '/calendar-icon.svg', description: 'Plan meetings and time beside the work they belong to.' },
  { id: 'chat', name: 'Chat', iconName: 'solar:chat-round-dots-bold-duotone', description: 'Keep conversations beside the people and work they belong to.' },
  { id: 'moments', name: 'Moments', icon: '/moments-icon.svg', description: 'Capture and share the experiences worth keeping.' }
]

export function resolveEcosystemApps(
  apps: EcosystemApp[],
  currentApp?: WhileSmartApp,
  resolveUrl: (app: WhileSmartApp) => string = appUrl
): Array<EcosystemApp & { url: string }> {
  return apps
    .filter((app) => app.id !== currentApp)
    .map((app) => ({ ...app, url: app.url || resolveUrl(app.id) }))
}
