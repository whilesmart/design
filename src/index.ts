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
import DsHeaderSearch from './components/DsHeaderSearch.vue'
import DsAutocompleteInput from './components/DsAutocompleteInput.vue'
import DsTagInput from './components/DsTagInput.vue'
import DsNotFound from './components/DsNotFound.vue'
import DsIcon from './components/DsIcon.vue'
import DsModal from './components/DsModal.vue'
import DsAvatar from './components/DsAvatar.vue'
import DsDataTable from './components/DsDataTable.vue'
import DsProductLanding from './components/DsProductLanding.vue'
import DsWorkspaceBackdrop from './components/DsWorkspaceBackdrop.vue'
import DsCreateButton from './components/DsCreateButton.vue'
import DsEcosystemStrip from './components/DsEcosystemStrip.vue'
import DsMessageComposer from './components/DsMessageComposer.vue'
import DsConversationContext from './components/DsConversationContext.vue'
import DsThreadPanel from './components/DsThreadPanel.vue'
import DsAgentCard from './components/DsAgentCard.vue'
import DsChannelSidebar from './components/DsChannelSidebar.vue'
import DsPostList from './components/DsPostList.vue'
import DsCommandPalette from './components/DsCommandPalette.vue'
import DsEmojiPicker from './components/DsEmojiPicker.vue'
import DsPresenceDot from './components/DsPresenceDot.vue'
import DsConversationSheet from './components/DsConversationSheet.vue'

// Layouts
import DashboardLayout from './layouts/DashboardLayout.vue'
import PublicLayout from './layouts/PublicLayout.vue'

// Composables
export { useLayoutConfig, type NavbarItem } from './composables/useLayoutConfig'
export { useAppSwitcher, resolveAppSwitcherApps, type AppDefinition, type AppSwitcherOptions } from './composables/useAppSwitcher'
export { appUrl, conversationUrl, isLocalHostname, type ConversationLaunchOptions, type WhileSmartApp } from './composables/useAppUrls'
export { resolveEcosystemApps, whileSmartEcosystemApps, type EcosystemApp } from './ecosystem'
export { useConversationSheet, buildSheetRows, sheetKey, type SheetPost } from './composables/useConversationSheet'

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
  DsHeaderSearch,
  DsAutocompleteInput,
  DsTagInput,
  DsNotFound,
  DsIcon,
  DsModal,
  DsAvatar,
  DsDataTable,
  DsProductLanding,
  DsWorkspaceBackdrop,
  DsCreateButton,
  DsEcosystemStrip,
  DsMessageComposer,
  DsConversationContext,
  DsThreadPanel,
  DsAgentCard,
  DsChannelSidebar,
  DsPostList,
  DsCommandPalette,
  DsEmojiPicker,
  DsPresenceDot,
  DsConversationSheet,
}
export { DashboardLayout, PublicLayout }

// Type re-exports from components
export * from './components/DsButton.vue'
export * from './components/DsInput.vue'
export * from './components/DsCard.vue'
export type { SearchFilterOption, SearchProvider, SearchSuggestion } from './components/DsSearchInput.vue'
export type { TagInputValue } from './components/DsTagInput.vue'
export type { DataTableColumn } from './components/DsDataTable.vue'
export type { ProductLandingItem, ProductLandingSpecimen } from './components/DsProductLanding.vue'
export type { WorkspaceBrandingConfig } from './components/DsWorkspaceBackdrop.vue'
export type { ConversationParticipant, ConversationContextItem } from './components/DsConversationContext.vue'
export type { ChatAgent } from './components/DsAgentCard.vue'
export type { ChannelRow, ChannelCategory } from './components/DsChannelSidebar.vue'
export type { PostRowView, PostAuthor, PostReaction } from './components/DsPostList.vue'
export type { CommandPaletteItem } from './components/DsCommandPalette.vue'
export type { PresenceStatus } from './components/DsPresenceDot.vue'
export type { ConversationSheetTarget } from './components/DsConversationSheet.vue'
