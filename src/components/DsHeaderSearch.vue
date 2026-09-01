<script setup lang="ts">
import { computed } from 'vue'
import DsSearchInput, { type SearchFilterOption, type SearchProvider, type SearchSuggestion } from './DsSearchInput.vue'
import { appUrl } from '../composables/useAppUrls'

interface Props {
  modelValue?: string
  placeholder?: string
  searchProvider?: (query: string) => Promise<SearchSuggestion[]>
  searchProviders?: SearchProvider[]
  recentSearches?: string[]
  filterValue?: string
  filterOptions?: SearchFilterOption[]
  includeDestinations?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Search',
  searchProviders: () => [],
  recentSearches: () => [],
  filterValue: '',
  filterOptions: () => [],
  includeDestinations: true
})

const destinations: SearchSuggestion[] = [
  { id: 'app:desk', label: 'Desk', description: 'WhileSmart home', type: 'App', group: 'Apps and settings', icon: 'solar:widget-4-bold-duotone', href: appUrl('desk') },
  { id: 'app:mail', label: 'Mail', description: 'Read and send email', type: 'App', group: 'Apps and settings', icon: 'solar:letter-bold-duotone', href: appUrl('mail') },
  { id: 'app:files', label: 'Files', description: 'Store and share files', type: 'App', group: 'Apps and settings', icon: 'solar:folder-with-files-bold-duotone', href: appUrl('files') },
  { id: 'app:calendar', label: 'Calendar', description: 'Events and scheduling', type: 'App', group: 'Apps and settings', icon: 'solar:calendar-bold-duotone', href: appUrl('calendar') },
  { id: 'app:console', label: 'Console', description: 'Organization management', type: 'App', group: 'Apps and settings', icon: 'solar:settings-bold-duotone', href: appUrl('console') },
  { id: 'setting:account', label: 'Account settings', description: 'Profile and account details', type: 'Setting', group: 'Apps and settings', icon: 'material-symbols:manage-accounts-rounded', href: `${appUrl('accounts')}/profile` }
]

const destinationProvider: SearchProvider = {
  id: 'default-destinations',
  search(query) {
    const value = query.toLowerCase()
    return destinations.filter(item => `${item.label} ${item.description} ${item.type}`.toLowerCase().includes(value))
  }
}

const resolvedProviders = computed<SearchProvider[]>(() => {
  const providers = [...props.searchProviders]
  if (props.searchProvider) providers.unshift({ id: 'app-content', search: props.searchProvider })
  if (props.includeDestinations) providers.push(destinationProvider)
  return providers
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:filterValue': [value: string]
  search: [query: string]
  selectItem: [item: SearchSuggestion]
  clearRecent: [query: string]
  clearAllRecent: []
}>()

function selectItem(item: SearchSuggestion) {
  if (item.href) {
    window.location.href = item.href
    return
  }
  emit('selectItem', item)
}
</script>

<template>
  <DsSearchInput
    class="ds-header-search"
    :model-value="modelValue"
    :placeholder="placeholder"
    size="lg"
    expandable
    :search-providers="resolvedProviders"
    :recent-searches="recentSearches"
    :filter-value="filterValue"
    :filter-options="filterOptions"
    @update:model-value="$emit('update:modelValue', $event)"
    @update:filter-value="$emit('update:filterValue', $event)"
    @search="$emit('search', $event)"
    @select-item="selectItem"
    @clear-recent="$emit('clearRecent', $event)"
    @clear-all-recent="$emit('clearAllRecent')"
  />
</template>

<style scoped>
.ds-header-search { width: 100%; min-width: 0; }
</style>
