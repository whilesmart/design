import { afterEach, describe, expect, it } from 'vitest'
import { computed } from 'vue'
import { appUrl, configureAppUrls } from './useAppUrls'
import { resolveAppSwitcherApps } from './useAppSwitcher'

afterEach(() => configureAppUrls({ desk: undefined, files: undefined }))

describe('app addresses set by the installing app', () => {
  it('replace the built-in address for that app only', () => {
    configureAppUrls({ desk: 'https://desk.example.test/' })
    expect(appUrl('desk', 'pages.example.test')).toBe('https://desk.example.test')
    expect(appUrl('mail', 'pages.example.test')).toBe('https://mail.whilesmart.com')
  })

  it('reach a launcher that is already on screen', () => {
    const files = computed(() => resolveAppSwitcherApps().find(app => app.id === 'docs')?.url)
    const before = files.value
    configureAppUrls({ files: 'https://drive.example.test' })
    expect(files.value).not.toBe(before)
    expect(files.value).toBe('https://drive.example.test/docs')
  })

  it('fall back to the built-in address when cleared', () => {
    configureAppUrls({ desk: 'https://desk.example.test' })
    configureAppUrls({ desk: undefined })
    expect(appUrl('desk', 'pages.example.test')).toBe('https://desk.whilesmart.com')
  })
})
