// Components
import DsButton from './components/DsButton.vue'
import DsInput from './components/DsInput.vue'
import DsCard from './components/DsCard.vue'
import DsChip from './components/DsChip.vue'
import DsToolbar from './components/DsToolbar.vue'
import DsIconButton from './components/DsIconButton.vue'
import DsSidebar from './components/DsSidebar.vue'
import DsSidebarItem from './components/DsSidebarItem.vue'
import DsSearchInput from './components/DsSearchInput.vue'

// Layouts
import DashboardLayout from './layouts/DashboardLayout.vue'
import PublicLayout from './layouts/PublicLayout.vue'

// Composables
export { useLayoutConfig, type NavbarItem } from './composables/useLayoutConfig'
export { useAppSwitcher, type AppDefinition } from './composables/useAppSwitcher'

// Component exports
export {
  DsButton,
  DsInput,
  DsCard,
  DsChip,
  DsToolbar,
  DsIconButton,
  DsSidebar,
  DsSidebarItem,
  DsSearchInput,
}
export { DashboardLayout, PublicLayout }

// Type re-exports from components
export * from './components/DsButton.vue'
export * from './components/DsInput.vue'
export * from './components/DsCard.vue'
export type { SearchSuggestion } from './components/DsSearchInput.vue'
