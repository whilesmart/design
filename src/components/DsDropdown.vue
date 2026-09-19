<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import DsField from './DsField.vue'
import DsIcon from './DsIcon.vue'

export interface DropdownOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  modelValue: string
  options: DropdownOption[]
  label?: string
  placeholder?: string
  id?: string
  error?: string
  disabled?: boolean
  /** Renders the label inside the control instead of above it, so it lines up with a button. */
  inline?: boolean
}>(), {
  label: '',
  placeholder: 'Select',
  id: undefined,
  error: '',
  disabled: false,
  inline: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const open = ref(false)
const activeIndex = ref(-1)
const root = ref<HTMLElement | null>(null)
const list = ref<HTMLElement | null>(null)

const selected = computed(() => props.options.find((option) => option.value === props.modelValue))
const selectedLabel = computed(() => selected.value?.label ?? props.placeholder)
const selectable = computed(() => props.options.filter((option) => !option.disabled))
// Unique per instance: a shared literal put the same DOM id on every dropdown on a page,
// and aria-controls then resolved to whichever listbox rendered first.
const uid = useId()
const controlId = computed(() => props.id ?? uid)
const listId = computed(() => `${controlId.value}-list`)
const describedBy = computed(() => (props.error ? `${controlId.value}-error` : undefined))
// Keyed by position, not by value: an option value is an arbitrary string, and one holding
// whitespace makes an id that aria-activedescendant cannot resolve.
const optionId = (index: number) => `${controlId.value}-option-${index}`
const activeId = computed(() =>
  open.value && selectable.value[activeIndex.value] ? optionId(activeIndex.value) : undefined,
)

function choose(option: DropdownOption) {
  if (option.disabled) return
  emit('update:modelValue', option.value)
  open.value = false
}

function toggle() {
  if (props.disabled) return
  open.value = !open.value
}

function move(step: number) {
  if (!selectable.value.length) return
  if (!open.value) {
    open.value = true
    return
  }
  const next = activeIndex.value + step
  activeIndex.value = (next + selectable.value.length) % selectable.value.length
}

function onKey(event: KeyboardEvent) {
  if (props.disabled) return
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      move(1)
      break
    case 'ArrowUp':
      event.preventDefault()
      move(-1)
      break
    case 'Home':
      if (open.value) { event.preventDefault(); activeIndex.value = 0 }
      break
    case 'End':
      if (open.value) { event.preventDefault(); activeIndex.value = selectable.value.length - 1 }
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      if (open.value && selectable.value[activeIndex.value]) choose(selectable.value[activeIndex.value])
      else open.value = true
      break
    case 'Escape':
      open.value = false
      break
    case 'Tab':
      open.value = false
      break
  }
}

watch(open, async (value) => {
  if (!value) return
  activeIndex.value = Math.max(selectable.value.findIndex((option) => option.value === props.modelValue), 0)
  await nextTick()
  list.value?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
})

watch(activeIndex, async () => {
  if (!open.value) return
  await nextTick()
  list.value?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
})

function onDocumentClick(event: MouseEvent) {
  if (!root.value?.contains(event.target as Node)) open.value = false
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))
</script>

<template>
  <DsField
    class="ds-dropdown"
    :class="{ 'ds-dropdown--inline': inline }"
    :label="inline ? '' : label"
    :id="controlId"
    :error="error"
  >
    <div ref="root" class="ds-dropdown__root">
      <button
        :id="controlId"
        class="ds-dropdown__trigger"
        :class="[
          inline ? 'ds-dropdown__trigger--inline' : 'ds-field__control',
          { 'ds-field__control--error': error && !inline, 'is-open': open },
        ]"
        type="button"
        role="combobox"
        :aria-expanded="open"
        :aria-controls="listId"
        :aria-activedescendant="activeId"
        :aria-invalid="error ? true : undefined"
        :aria-describedby="describedBy"
        :aria-label="label || undefined"
        :disabled="disabled"
        @click.stop="toggle"
        @keydown="onKey"
      >
        <span v-if="inline && label" class="ds-dropdown__inline-label">{{ label }}</span>
        <span :class="{ 'ds-dropdown__placeholder': !selected }">{{ selectedLabel }}</span>
        <DsIcon name="solar:alt-arrow-down-linear" class="ds-dropdown__caret" />
      </button>

      <ul v-if="open" :id="listId" ref="list" class="ds-dropdown__list" role="listbox">
        <li
          v-for="(option, index) in selectable"
          :id="optionId(index)"
          :key="option.value"
          class="ds-dropdown__option"
          :class="{ 'is-selected': option.value === modelValue }"
          :data-active="index === activeIndex"
          role="option"
          :aria-selected="option.value === modelValue"
          @click="choose(option)"
          @mousemove="activeIndex = index"
        >
          <span class="ds-dropdown__option-label">{{ option.label }}</span>
          <small v-if="option.description">{{ option.description }}</small>
          <DsIcon v-if="option.value === modelValue" name="solar:check-circle-bold" />
        </li>
      </ul>
    </div>
  </DsField>
</template>

<style scoped>
.ds-dropdown__root {
  position: relative;
}

/* Inline drops the field's column layout so the control sits on the filter row itself. */
.ds-dropdown--inline {
  display: contents;
}

.ds-dropdown__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-space-2);
  min-height: 2.5rem;
  text-align: left;
  cursor: pointer;
}

/*
 * The inline form matches a segmented control rather than a field: same height, same
 * radius, so a filter row lines up without a label pushing one control down.
 */
.ds-dropdown__trigger--inline {
  padding: 0.3125rem 0.75rem;
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-radius-control);
  background: var(--ds-bg-elevated);
  color: var(--ds-text-primary);
  font: inherit;
  font-size: var(--ds-text-sm);
  font-weight: var(--ds-font-medium);
}

.ds-dropdown__trigger--inline:hover {
  background: var(--ds-bg-hover);
}

.ds-dropdown__trigger:focus-visible {
  outline: 2px solid var(--ds-border-focus);
  outline-offset: 2px;
}

.ds-dropdown__trigger:disabled {
  color: var(--ds-text-disabled);
  cursor: not-allowed;
}

.ds-dropdown__inline-label {
  color: var(--ds-text-muted);
  font-weight: var(--ds-font-normal);
}

.ds-dropdown__placeholder {
  color: var(--ds-text-muted);
}

.ds-dropdown__caret {
  flex: none;
  color: var(--ds-text-muted);
  transition: transform var(--ds-transition-fast);
}

.is-open .ds-dropdown__caret {
  transform: rotate(180deg);
}

.ds-dropdown__list {
  display: grid;
  position: absolute;
  top: calc(100% + var(--ds-space-1));
  left: 0;
  min-width: 100%;
  max-height: 16rem;
  margin: 0;
  padding: var(--ds-space-1);
  overflow-y: auto;
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-radius-card);
  background: var(--ds-bg-elevated);
  box-shadow: var(--ds-elevation-3);
  list-style: none;
  z-index: var(--ds-z-dropdown);
}

.ds-dropdown__option {
  display: grid;
  align-items: center;
  gap: 0 var(--ds-space-2);
  grid-template-columns: minmax(0, 1fr) auto;
  padding: var(--ds-space-2) var(--ds-space-3);
  border-radius: var(--ds-radius-md);
  color: var(--ds-text-primary);
  font-size: var(--ds-text-sm);
  white-space: nowrap;
  cursor: pointer;
}

.ds-dropdown__option small {
  grid-column: 1 / -1;
  color: var(--ds-text-muted);
  font-size: var(--ds-text-xs);
}

.ds-dropdown__option[data-active='true'] {
  background: var(--ds-bg-hover);
}

.ds-dropdown__option.is-selected {
  color: var(--ds-interactive-primary);
  font-weight: var(--ds-font-semibold);
}

@media (prefers-reduced-motion: reduce) {
  .ds-dropdown__caret {
    transition: none;
  }
}
</style>
