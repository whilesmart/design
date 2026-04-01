<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

export interface SearchSuggestion {
  id: string
  label: string
  description?: string
  icon?: string
  type?: string
}

interface Props {
  modelValue?: string
  placeholder?: string
  size?: 'sm' | 'md'
  suggestions?: SearchSuggestion[]
  recentSearches?: string[]
  expandable?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Search...',
  size: 'md',
  suggestions: () => [],
  recentSearches: () => [],
  expandable: false,
  loading: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'search', value: string): void
  (e: 'selectItem', suggestion: SearchSuggestion): void
  (e: 'expand'): void
  (e: 'clearRecent', query: string): void
  (e: 'clearAllRecent'): void
}>()

const inputRef = ref<HTMLInputElement>()
const dropdownOpen = ref(false)
const activeIndex = ref(-1)
const expanded = ref(false)

const showDropdown = computed(() => {
  if (!dropdownOpen.value) return false
  return props.suggestions.length > 0 || props.recentSearches.length > 0 || props.loading
})

const totalItems = computed(() => {
  return props.suggestions.length + (props.modelValue ? 0 : props.recentSearches.length)
})

function handleFocus() {
  dropdownOpen.value = true
  activeIndex.value = -1
}

function handleBlur() {
  setTimeout(() => {
    dropdownOpen.value = false
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
  if (props.modelValue && index < props.suggestions.length) {
    emit('selectItem', props.suggestions[index])
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

function handleOverlayClick() {
  handleCollapse()
}

function handleEscapeGlobal(e: KeyboardEvent) {
  if (e.key === 'Escape' && expanded.value) {
    handleCollapse()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscapeGlobal)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeGlobal)
})

const shortcutHint = computed(() => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  return isMac ? '⌘K' : 'Ctrl+K'
})
</script>

<template>
  <div class="ds-search-wrapper" :class="{ 'ds-search-wrapper--expanded': expanded }">
    <div v-if="expanded" class="ds-search-overlay" @click="handleOverlayClick"></div>

    <div
      class="ds-search"
      :class="[
        `ds-search--${size}`,
        { 'ds-search--open': showDropdown, 'ds-search--expanded': expanded }
      ]"
    >
      <div class="ds-search__bar">
        <svg class="ds-search__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
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
        <span v-if="loading" class="ds-search__spinner"></span>
        <button
          v-else-if="modelValue"
          class="ds-search__clear"
          @mousedown.prevent
          @click="handleClear"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <button
          v-if="expandable && !expanded"
          class="ds-search__expand"
          title="Expand search"
          @mousedown.prevent
          @click="handleExpand"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
          </svg>
        </button>
        <kbd v-if="!modelValue && !expanded" class="ds-search__kbd">{{ shortcutHint }}</kbd>
      </div>

      <div v-if="showDropdown" class="ds-search__dropdown">
        <div v-if="loading" class="ds-search__loading">
          <span class="ds-search__spinner"></span>
          <span>Searching...</span>
        </div>

        <template v-else>
          <div v-if="modelValue && suggestions.length > 0" class="ds-search__section">
            <div class="ds-search__section-header">Suggestions</div>
            <button
              v-for="(item, i) in suggestions"
              :key="item.id"
              class="ds-search__item"
              :class="{ 'ds-search__item--active': activeIndex === i }"
              @mousedown.prevent
              @click="selectSuggestion(item)"
              @mouseenter="activeIndex = i"
            >
              <span v-if="item.type" class="ds-search__item-type">{{ item.type }}</span>
              <div class="ds-search__item-content">
                <span class="ds-search__item-label">{{ item.label }}</span>
                <span v-if="item.description" class="ds-search__item-desc">{{ item.description }}</span>
              </div>
              <svg class="ds-search__item-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <div v-if="!modelValue && recentSearches.length > 0" class="ds-search__section">
            <div class="ds-search__section-header">
              Recent
              <button class="ds-search__section-action" @mousedown.prevent @click="emit('clearAllRecent')">Clear all</button>
            </div>
            <button
              v-for="(query, i) in recentSearches"
              :key="query"
              class="ds-search__item"
              :class="{ 'ds-search__item--active': activeIndex === i }"
              @mousedown.prevent
              @click="selectRecent(query)"
              @mouseenter="activeIndex = i"
            >
              <svg class="ds-search__item-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              <span class="ds-search__item-label">{{ query }}</span>
              <button
                class="ds-search__item-remove"
                title="Remove"
                @mousedown.prevent
                @click.stop="emit('clearRecent', query)"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </button>
          </div>

          <div v-if="modelValue && suggestions.length === 0 && !loading" class="ds-search__empty">
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
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
}

.ds-search-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: -1;
}

.ds-search {
  position: relative;
  width: 100%;
}

.ds-search--expanded {
  max-width: 640px;
  width: 100%;
}

.ds-search__bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid var(--ds-border-base, #e5e7eb);
  border-radius: var(--ds-radius-md, 0.375rem);
  background: var(--ds-bg-elevated, #fff);
  transition: all 0.15s ease;
}

.ds-search--expanded .ds-search__bar {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.ds-search__bar:focus-within {
  border-color: var(--ds-border-focus, #2d398e);
  box-shadow: 0 0 0 3px rgba(45, 57, 142, 0.1);
}

.ds-search--expanded .ds-search__bar:focus-within {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 3px rgba(45, 57, 142, 0.1);
}

.ds-search--open .ds-search__bar {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
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

.ds-search--expanded .ds-search__bar {
  padding: 0.625rem 1rem;
}

.ds-search--expanded .ds-search__input {
  font-size: 1rem;
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
  top: 100%;
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
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  max-height: 480px;
}

.ds-search__section {
  padding: 0.25rem 0;
}

.ds-search__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.375rem 0.75rem;
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
  padding: 0.5rem 0.75rem;
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
