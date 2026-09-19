<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { areaStyle, type AreaColor } from '../areas'

export interface TabOption {
  key: string
  label: string
}

const props = withDefaults(defineProps<{
  modelValue: string
  options: TabOption[]
  area?: AreaColor
  label?: string
  /** 'soft' fills the active tab with the area; 'solid' is a segmented control in the brand. */
  variant?: 'soft' | 'solid'
  /** A tablist switches views; a group filters the view you are already on. */
  role?: 'tablist' | 'group'
}>(), { area: 'indigo', label: 'Views', variant: 'soft', role: 'tablist' })

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const style = computed(() => areaStyle(props.area))

const tabs = ref<HTMLButtonElement[]>([])

// A tablist owns its arrow keys and holds one tab stop. A group is a set of buttons and
// keeps the browser's own tabbing, so the roving index applies to the tablist only.
const roving = computed(() => props.role === 'tablist')

// Falls back to the first tab: if modelValue matches nothing, every tab would take -1 and
// the tablist would have no tab stop for a keyboard to reach.
const focusIndex = computed(() => {
  const found = props.options.findIndex((option) => option.key === props.modelValue)
  return found === -1 ? 0 : found
})

function select(key: string, index: number) {
  emit('update:modelValue', key)
  if (roving.value) nextTick(() => tabs.value[index]?.focus())
}

function onKey(event: KeyboardEvent, index: number) {
  if (!roving.value) return
  const last = props.options.length - 1
  const next = {
    ArrowRight: index === last ? 0 : index + 1,
    ArrowLeft: index === 0 ? last : index - 1,
    Home: 0,
    End: last,
  }[event.key]
  if (next === undefined) return
  event.preventDefault()
  select(props.options[next].key, next)
}
</script>

<template>
  <div
    class="ds-tabs"
    :class="`ds-tabs--${variant}`"
    :role="role"
    :aria-label="label"
    :style="style"
  >
    <button
      v-for="(option, index) in options"
      :key="option.key"
      ref="tabs"
      class="ds-tabs__tab"
      :class="{ 'is-active': option.key === modelValue }"
      type="button"
      :role="roving ? 'tab' : undefined"
      :tabindex="roving && index !== focusIndex ? -1 : undefined"
      :aria-selected="roving ? option.key === modelValue : undefined"
      :aria-pressed="role === 'group' ? option.key === modelValue : undefined"
      @click="select(option.key, index)"
      @keydown="onKey($event, index)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.ds-tabs {
  display: flex;
  gap: var(--ds-space-1);
  overflow-x: auto;
  scrollbar-width: none;
}

.ds-tabs::-webkit-scrollbar {
  display: none;
}

.ds-tabs--soft {
  padding-bottom: var(--ds-space-1);
}

.ds-tabs--solid {
  flex: none;
  align-self: flex-start;
  padding: 0.1875rem;
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-radius-control);
  background: var(--ds-bg-elevated);
}

.ds-tabs__tab {
  flex: none;
  border: 0;
  border-radius: var(--ds-radius-control);
  background: none;
  color: var(--ds-text-secondary);
  font-family: inherit;
  font-size: var(--ds-text-sm);
  font-weight: var(--ds-font-medium);
  white-space: nowrap;
  cursor: pointer;
  transition: background var(--ds-transition-fast), color var(--ds-transition-fast);
}

.ds-tabs--soft .ds-tabs__tab {
  padding: var(--ds-space-2) var(--ds-space-4);
}

.ds-tabs--solid .ds-tabs__tab {
  padding: 0.3125rem 0.875rem;
}

.ds-tabs__tab:hover {
  color: var(--ds-text-primary);
}

.ds-tabs--soft .ds-tabs__tab:hover {
  background: var(--ds-bg-hover);
}

.ds-tabs--soft .ds-tabs__tab.is-active {
  background: var(--ds-area-fill);
  color: var(--ds-area-ink);
  font-weight: var(--ds-font-semibold);
}

.ds-tabs--solid .ds-tabs__tab.is-active {
  background: var(--ds-interactive-primary);
  color: var(--ds-text-inverse);
}

.ds-tabs__tab:focus-visible {
  outline: 2px solid var(--ds-border-focus);
  outline-offset: 2px;
}

@media (max-width: 640px) {
  .ds-tabs--solid {
    width: 100%;
  }

  .ds-tabs--solid .ds-tabs__tab {
    flex: 1;
  }
}
</style>
