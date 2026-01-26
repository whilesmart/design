import { ref, readonly, type Component, markRaw } from 'vue'

export interface NavbarItem {
  id: string
  component: Component
  position?: 'left' | 'center' | 'right'
  order?: number
}

const appName = ref<string>('Account')
const appHomeLink = ref<string>('/')
const showFooter = ref(true)
const fullWidth = ref(false)
const navbarItems = ref<NavbarItem[]>([])

export function useLayoutConfig() {
  const setAppName = (name: string) => {
    appName.value = name
  }

  const setAppHomeLink = (link: string) => {
    appHomeLink.value = link
  }

  const setShowFooter = (show: boolean) => {
    showFooter.value = show
  }

  const setFullWidth = (full: boolean) => {
    fullWidth.value = full
  }

  const addNavbarItem = (item: NavbarItem) => {
    const existing = navbarItems.value.findIndex(i => i.id === item.id)
    if (existing >= 0) {
      navbarItems.value[existing] = { ...item, component: markRaw(item.component) }
    } else {
      navbarItems.value.push({ ...item, component: markRaw(item.component) })
    }
  }

  const removeNavbarItem = (id: string) => {
    navbarItems.value = navbarItems.value.filter(item => item.id !== id)
  }

  const clearNavbarItems = () => {
    navbarItems.value = []
  }

  const resetLayout = () => {
    appName.value = 'Account'
    appHomeLink.value = '/'
    showFooter.value = true
    fullWidth.value = false
    navbarItems.value = []
  }

  return {
    appName: readonly(appName),
    appHomeLink: readonly(appHomeLink),
    showFooter: readonly(showFooter),
    fullWidth: readonly(fullWidth),
    navbarItems: readonly(navbarItems),
    setAppName,
    setAppHomeLink,
    setShowFooter,
    setFullWidth,
    addNavbarItem,
    removeNavbarItem,
    clearNavbarItems,
    resetLayout
  }
}
