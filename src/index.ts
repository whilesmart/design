// Components
import DsButton from './components/DsButton.vue'
import DsInput from './components/DsInput.vue'
import DsCard from './components/DsCard.vue'

// Layouts
import DashboardLayout from './layouts/DashboardLayout.vue'
import PublicLayout from './layouts/PublicLayout.vue'

// Composables
export { useLayoutConfig, type NavbarItem } from './composables/useLayoutConfig'
export { useAppSwitcher, type AppDefinition } from './composables/useAppSwitcher'

// Component exports
export { DsButton, DsInput, DsCard }
export { DashboardLayout, PublicLayout }

// Type re-exports from components
export * from './components/DsButton.vue'
export * from './components/DsInput.vue'
export * from './components/DsCard.vue'
