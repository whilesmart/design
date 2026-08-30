<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import DsIcon from './DsIcon.vue'

export interface SearchSuggestion {
  id: string
  label: string
  description?: string
  icon?: `solar:${string}` | `material-symbols:${string}`
  type?: string
  group?: string
  href?: string
  data?: Record<string, unknown>
}

export interface SearchProvider {
  id: string
  search: (query: string) => Promise<SearchSuggestion[]> | SearchSuggestion[]
}

export interface SearchFilterOption {
  value: string
  label: string
}

interface Props {
  modelValue?: string
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  suggestions?: SearchSuggestion[]
  recentSearches?: string[]
  expandable?: boolean
  loading?: boolean
  searchProvider?: (query: string) => Promise<SearchSuggestion[]>
  searchProviders?: SearchProvider[]
  filterValue?: string
  filterOptions?: SearchFilterOption[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Search...',
  size: 'md',
  suggestions: () => [],
  recentSearches: () => [],
  expandable: false,
  loading: false,
  searchProviders: () => [],
  filterValue: '',
  filterOptions: () => []
})

const emit = defineEmits(['update:modelValue', 'update:filterValue', 'search', 'selectItem', 'expand', 'clearRecent', 'clearAllRecent'])

const inputRef = ref<HTMLInputElement>()
const dropdownOpen = ref(false)
const activeIndex = ref(-1)
const expanded = ref(false)
const providerSuggestions = ref<SearchSuggestion[]>([])
const providerLoading = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | undefined
let searchRequest = 0

const hasProvider = computed(() => Boolean(props.searchProvider) || props.searchProviders.length > 0)
const resolvedSuggestions = computed(() => hasProvider.value ? providerSuggestions.value : props.suggestions)
const resolvedLoading = computed(() => props.loading || providerLoading.value)
const resultGroups = computed(() => {
  const groups = new Map<string, Array<{ item: SearchSuggestion; index: number }>>()
  resolvedSuggestions.value.forEach((item, index) => {
    const label = item.group || 'Results'
    groups.set(label, [...(groups.get(label) || []), { item, index }])
  })
  return [...groups.entries()].map(([label, items]) => ({ label, items }))
})

const showDropdown = computed(() => {
  if (!dropdownOpen.value) return false
  return Boolean(props.modelValue) || resolvedSuggestions.value.length > 0 || props.recentSearches.length > 0 || resolvedLoading.value
})

const totalItems = computed(() => {
  return resolvedSuggestions.value.length + (props.modelValue ? 0 : props.recentSearches.length)
})

function handleFocus() {
  if (props.expandable && !expanded.value) handleExpand()
  dropdownOpen.value = true
  activeIndex.value = -1
}

function handleBlur() {
  setTimeout(() => {
    dropdownOpen.value = false
    if (props.expandable) expanded.value = false
  }, 200)
}

function handleInput(e: Event) {
  const value = (e.target as HTMLInputElement).value
  emit('update:modelValue', value)
  dropdownOpen.value = true
  activeIndex.value = -1
}

function handleKeydown(e: KeyboardEvent) {
  if (!showDropdown.value) {
    if (e.key === 'ArrowDown') {
      dropdownOpen.value = true
      e.preventDefault()
    }
    return
  }

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      activeIndex.value = Math.min(activeIndex.value + 1, totalItems.value - 1)
      break
    case 'ArrowUp':
      e.preventDefault()
      activeIndex.value = Math.max(activeIndex.value - 1, -1)
      break
    case 'Enter':
      e.preventDefault()
      if (activeIndex.value >= 0) {
        selectAtIndex(activeIndex.value)
      } else {
        emit('search', props.modelValue)
        dropdownOpen.value = false
      }
      break
    case 'Escape':
      dropdownOpen.value = false
      inputRef.value?.blur()
      break
  }
}

function selectAtIndex(index: number) {
  if (props.modelValue && index < resolvedSuggestions.value.length) {
    emit('selectItem', resolvedSuggestions.value[index])
  } else {
    const recentIndex = props.modelValue ? index : index
    if (!props.modelValue && recentIndex < props.recentSearches.length) {
      emit('update:modelValue', props.recentSearches[recentIndex])
      emit('search', props.recentSearches[recentIndex])
    }
  }
  dropdownOpen.value = false
}

function selectSuggestion(suggestion: SearchSuggestion) {
  emit('selectItem', suggestion)
  dropdownOpen.value = false
}

function selectRecent(query: string) {
  emit('update:modelValue', query)
  emit('search', query)
  dropdownOpen.value = false
}

function handleClear() {
  emit('update:modelValue', '')
  inputRef.value?.focus()
}

function handleExpand() {
  expanded.value = true
  emit('expand')
  nextTick(() => inputRef.value?.focus())
}

function handleCollapse() {
  expanded.value = false
  dropdownOpen.value = false
}

function handleEscapeGlobal(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    inputRef.value?.focus()
    return
  }
  if (e.key === 'Escape' && expanded.value) {
    handleCollapse()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscapeGlobal)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeGlobal)
  clearTimeout(searchTimer)
})

watch(() => [props.modelValue, props.filterValue] as const, ([query]) => {
  if (!hasProvider.value) return
  clearTimeout(searchTimer)
  const value = query.trim()
  if (!value) {
    providerSuggestions.value = []
    providerLoading.value = false
    return
  }
  const request = ++searchRequest
  searchTimer = setTimeout(async () => {
    providerLoading.value = true
    try {
      const results = props.searchProviders.length
        ? (await Promise.allSettled(props.searchProviders.map(provider => provider.search(value))))
            .flatMap(result => result.status === 'fulfilled' ? result.value : [])
        : await props.searchProvider!(value)
      if (request === searchRequest) providerSuggestions.value = results
    } catch {
      if (request === searchRequest) providerSuggestions.value = []
    } finally {
      if (request === searchRequest) providerLoading.value = false
    }
  }, 220)
})

const shortcutHint = computed(() => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  return isMac ? '⌘K' : 'Ctrl+K'
})
</script>

<template>
  <div class="ds-search-wrapper" :class="{ 'ds-search-wrapper--expanded': expanded }">
    <div
      class="ds-search"
      :class="[
        `ds-search--${size}`,
        { 'ds-search--open': showDropdown, 'ds-search--expanded': expanded }
      ]"
    >
      <div class="ds-search__bar">
        <DsIcon name="solar:magnifer-line-duotone" class="ds-search__icon" />
        <input
          ref="inputRef"
          type="text"
          class="ds-search__input"
          :value="modelValue"
          :placeholder="placeholder"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown="handleKeydown"
        />
        <label v-if="filterOptions.length > 1" class="ds-search__filter">
          <span class="ds-search__filter-label">Search scope</span>
          <select
            :value="filterValue"
            aria-label="Search scope"
            @change="emit('update:filterValue', ($event.target as HTMLSelectElement).value)"
          >
            <option v-for="option in filterOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
          <DsIcon name="material-symbols:keyboard-arrow-down-rounded" />
        </label>
        <span v-if="resolvedLoading" class="ds-search__spinner"></span>
        <button
          v-else-if="modelValue"
          class="ds-search__clear"
          @mousedown.prevent
          @click="handleClear"
        >
          <DsIcon name="material-symbols:close-rounded" />
        </button>
        <kbd v-if="!modelValue && !expanded" class="ds-search__kbd">{{ shortcutHint }}</kbd>
      </div>

      <div v-if="showDropdown" class="ds-search__dropdown">
        <div class="ds-search__results-header">
          <span>{{ modelValue ? `Results for “${modelValue}”` : 'Recent searches' }}</span>
          <small v-if="modelValue && !resolvedLoading">{{ resolvedSuggestions.length }} found</small>
        </div>
        <div v-if="resolvedLoading" class="ds-search__loading">
          <span class="ds-search__spinner"></span>
          <span>Searching...</span>
        </div>

        <template v-else>
          <template v-if="modelValue && resolvedSuggestions.length > 0">
            <div v-for="group in resultGroups" :key="group.label" class="ds-search__section">
              <div class="ds-search__section-header"><span>{{ group.label }}</span><span>{{ group.items.length }}</span></div>
              <button
                v-for="entry in group.items"
                :key="entry.item.id"
                class="ds-search__item"
                :class="{ 'ds-search__item--active': activeIndex === entry.index }"
                @mousedown.prevent
                @click="selectSuggestion(entry.item)"
                @mouseenter="activeIndex = entry.index"
              >
                <span v-if="entry.item.icon" class="ds-search__item-icon-tile"><DsIcon :name="entry.item.icon" /></span>
                <div class="ds-search__item-content">
                  <span class="ds-search__item-label">{{ entry.item.label }}</span>
                  <span v-if="entry.item.description" class="ds-search__item-desc">{{ entry.item.description }}</span>
                </div>
                <span v-if="entry.item.type" class="ds-search__item-type">{{ entry.item.type }}</span>
                <DsIcon name="material-symbols:arrow-forward-rounded" class="ds-search__item-arrow" />
              </button>
            </div>
          </template>

          <div v-if="!modelValue && recentSearches.length > 0" class="ds-search__section">
            <div class="ds-search__section-header">
              Recent
              <button class="ds-search__section-action" @mousedown.prevent @click="emit('clearAllRecent')">Clear all</button>
            </div>
            <div
              v-for="(query, i) in recentSearches"
              :key="query"
              class="ds-search__item"
              :class="{ 'ds-search__item--active': activeIndex === i }"
              role="button"
              tabindex="0"
              @mousedown.prevent
              @click="selectRecent(query)"
              @keydown.enter="selectRecent(query)"
              @mouseenter="activeIndex = i"
            >
              <DsIcon name="material-symbols:history-rounded" class="ds-search__item-icon" />
              <span class="ds-search__item-label">{{ query }}</span>
              <button
                class="ds-search__item-remove"
                title="Remove"
                @mousedown.prevent
                @click.stop="emit('clearRecent', query)"
              >
                <DsIcon name="material-symbols:close-rounded" />
              </button>
            </div>
          </div>

          <div v-if="modelValue && resolvedSuggestions.length === 0 && !resolvedLoading" class="ds-search__empty">
            No results for "{{ modelValue }}"
          </div>
        </template>

        <div class="ds-search__footer">
          <span class="ds-search__hint">
            <kbd>↑↓</kbd> navigate
            <kbd>↵</kbd> select
            <kbd>esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ds-search-wrapper {
  position: relative;
}

.ds-search-wrapper--expanded {
  z-index: var(--ds-z-dropdown);
}

.ds-search {
  position: relative;
  width: 100%;
}

.ds-search--expanded {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(54vw, 49.5rem);
  max-width: calc(100vw - var(--ds-space-8));
  transform: translate(-50%, -50%);
}

.ds-search__bar {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid var(--ds-border-base, #e5e7eb);
  border-radius: var(--ds-radius-md, 0.375rem);
  background: var(--ds-bg-elevated, #fff);
  transition: all 0.15s ease;
}

.ds-search--expanded .ds-search__bar {
  box-shadow: var(--ds-elevation-3);
}

.ds-search__bar:focus-within {
  border-color: var(--ds-border-focus, #2d398e);
  box-shadow: 0 0 0 3px rgba(45, 57, 142, 0.1);
}

.ds-search--expanded .ds-search__bar:focus-within {
  box-shadow: var(--ds-elevation-3);
}

.ds-search--sm .ds-search__bar {
  padding: 0.25rem 0.5rem;
}

.ds-search--sm .ds-search__input {
  font-size: 0.8125rem;
}

.ds-search--md .ds-search__bar {
  padding: 0.375rem 0.75rem;
}

.ds-search--md .ds-search__input {
  font-size: 0.875rem;
}

.ds-search--lg .ds-search__bar {
  height: 2.7rem;
  padding: 0 var(--ds-space-3);
  border-radius: var(--ds-radius-lg);
}

.ds-search--lg .ds-search__input {
  font-size: var(--ds-text-base);
}

.ds-search--expanded .ds-search__bar {
  padding: 0 var(--ds-space-3);
}

.ds-search--open .ds-search__bar {
  border-bottom-color: transparent;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.ds-search__icon {
  color: var(--ds-text-muted, #9ca3af);
  flex-shrink: 0;
}

.ds-search__input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--ds-text-primary, #1a1a1a);
  min-width: 0;
  font-family: inherit;
}

.ds-search__input::placeholder {
  color: var(--ds-text-muted, #9ca3af);
}

.ds-search__filter {
  position: relative;
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  border-left: 1px solid var(--ds-border-base);
  color: var(--ds-text-secondary);
}

.ds-search__filter-label {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

.ds-search__filter select {
  min-width: 6.5rem;
  padding: var(--ds-space-2) var(--ds-space-6) var(--ds-space-2) var(--ds-space-3);
  border: 0;
  outline: 0;
  appearance: none;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: var(--ds-text-sm);
  cursor: pointer;
}

.ds-search__filter > :last-child {
  position: absolute;
  right: var(--ds-space-2);
  pointer-events: none;
}

.ds-search__clear,
.ds-search__expand {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: var(--ds-text-secondary, #666);
  border-radius: var(--ds-radius-sm, 0.25rem);
}

.ds-search__clear:hover,
.ds-search__expand:hover {
  color: var(--ds-text-primary, #1a1a1a);
  background: var(--ds-bg-hover, #f5f5f5);
}

.ds-search__kbd {
  font-size: 0.625rem;
  font-family: inherit;
  color: var(--ds-text-muted, #9ca3af);
  border: 1px solid var(--ds-border-base, #e5e7eb);
  border-radius: var(--ds-radius-sm, 0.25rem);
  padding: 0.0625rem 0.375rem;
  background: var(--ds-bg-base, #f9fafb);
  white-space: nowrap;
}

.ds-search__spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid var(--ds-border-base, #e5e7eb);
  border-top-color: var(--ds-color-primary, #2d398e);
  border-radius: 50%;
  animation: ds-search-spin 0.6s linear infinite;
  flex-shrink: 0;
}

@keyframes ds-search-spin {
  to { transform: rotate(360deg); }
}

.ds-search__dropdown {
  position: absolute;
  top: calc(100% - 1px);
  left: 0;
  right: 0;
  background: var(--ds-bg-elevated, #fff);
  border: 1px solid var(--ds-border-focus, #2d398e);
  border-top: none;
  border-bottom-left-radius: var(--ds-radius-md, 0.375rem);
  border-bottom-right-radius: var(--ds-radius-md, 0.375rem);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-height: 360px;
  overflow-y: auto;
}

.ds-search--expanded .ds-search__dropdown {
  box-shadow: var(--ds-elevation-4);
  max-height: 480px;
}

.ds-search__section {
  padding: 0.25rem 0;
}

.ds-search__results-header {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--ds-space-4);
  border-bottom: 1px solid var(--ds-border-base);
  background: var(--ds-bg-elevated);
  color: var(--ds-text-primary);
  font-size: var(--ds-text-sm);
  font-weight: var(--ds-font-weight-medium);
}

.ds-search__results-header small { color: var(--ds-text-secondary); font-weight: var(--ds-font-weight-normal); }

.ds-search__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--ds-space-3) var(--ds-space-4) var(--ds-space-2);
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--ds-text-secondary, #666);
}

.ds-search__section-action {
  background: none;
  border: none;
  font-size: 0.6875rem;
  color: var(--ds-text-secondary, #666);
  cursor: pointer;
  text-transform: none;
  letter-spacing: normal;
  font-weight: 400;
}

.ds-search__section-action:hover {
  color: var(--ds-color-primary, #2d398e);
}

.ds-search__item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: var(--ds-space-3) var(--ds-space-4);
  background: none;
  border: none;
  font-size: 0.8125rem;
  color: var(--ds-text-primary, #1a1a1a);
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: background 0.1s ease;
}

.ds-search__item:hover,
.ds-search__item--active {
  background: var(--ds-bg-hover, #f5f5f5);
}

.ds-search__item-icon {
  color: var(--ds-text-secondary, #666);
  flex-shrink: 0;
}

.ds-search__item-icon-tile {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  flex: 0 0 auto;
  border-radius: var(--ds-radius-md);
  background: var(--ds-color-primary-50);
  color: var(--ds-color-primary-800);
  font-size: 1.125rem;
}

.ds-search__item-type {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: var(--ds-text-secondary, #666);
  background: var(--ds-bg-muted, #f3f4f6);
  padding: 0.125rem 0.375rem;
  border-radius: var(--ds-radius-sm, 0.25rem);
  flex-shrink: 0;
}

.ds-search__item-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.ds-search__item-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ds-search__item-desc {
  font-size: 0.75rem;
  color: var(--ds-text-secondary, #666);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ds-search__item-arrow {
  color: var(--ds-text-muted, #9ca3af);
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.1s ease;
}

.ds-search__item:hover .ds-search__item-arrow,
.ds-search__item--active .ds-search__item-arrow {
  opacity: 1;
}

.ds-search__item-remove {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: var(--ds-text-muted, #9ca3af);
  border-radius: 50%;
  opacity: 0;
  transition: all 0.1s ease;
}

.ds-search__item:hover .ds-search__item-remove {
  opacity: 1;
}

.ds-search__item-remove:hover {
  color: var(--ds-text-primary, #1a1a1a);
  background: var(--ds-bg-base, #f0f0f0);
}

.ds-search__empty {
  padding: 1.5rem 0.75rem;
  text-align: center;
  font-size: 0.8125rem;
  color: var(--ds-text-secondary, #666);
}

.ds-search__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 0.75rem;
  font-size: 0.8125rem;
  color: var(--ds-text-secondary, #666);
}

.ds-search__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0.375rem 0.75rem;
  border-top: 1px solid var(--ds-border-base, #e5e7eb);
}

.ds-search__hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.625rem;
  color: var(--ds-text-muted, #9ca3af);
}

.ds-search__hint kbd {
  font-family: inherit;
  font-size: 0.625rem;
  border: 1px solid var(--ds-border-base, #e5e7eb);
  border-radius: 0.1875rem;
  padding: 0 0.25rem;
  background: var(--ds-bg-base, #f9fafb);
}
</style>
