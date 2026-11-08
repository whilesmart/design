import { appUrl, type WhileSmartApp } from './composables/useAppUrls'
import { appIcons } from './assets/app-icons'

export interface EcosystemApp {
  id: WhileSmartApp
  name: string
  icon: string
  description: string
  url?: string
}

export const whileSmartEcosystemApps: EcosystemApp[] = [
  { id: 'mail', name: 'Mail', icon: appIcons.mail, description: 'Use business email on the domain your customers trust.' },
  { id: 'files', name: 'Drive', icon: appIcons.files, description: 'Store, organise, and share files and documents without losing control.' },
  { id: 'calendar', name: 'Calendar', icon: appIcons.calendar, description: 'Plan meetings and time beside the work they belong to.' },
  { id: 'meet', name: 'Meet', icon: appIcons.meet, description: 'Meet, share your screen and keep notes beside the work.' },
  { id: 'chat', name: 'Chat', icon: appIcons.chat, description: 'Keep conversations beside the people and work they belong to.' },
  { id: 'moments', name: 'Moments', icon: appIcons.moments, description: 'Capture and share the experiences worth keeping.' },
  { id: 'mindpad', name: 'Mindpad', icon: appIcons.mindpad, description: 'Capture ideas and collaborate on pads beside your documents.' }
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
