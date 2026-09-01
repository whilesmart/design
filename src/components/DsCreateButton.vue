<script setup lang="ts">
import DsIcon from './DsIcon.vue'

withDefaults(defineProps<{
  label?: string
  expanded?: boolean
}>(), {
  label: 'New',
  expanded: false
})

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <button
    class="ds-create-button"
    type="button"
    aria-haspopup="menu"
    :aria-expanded="expanded"
    @click="$emit('click', $event)"
  >
    <span class="ds-create-button__add"><DsIcon name="material-symbols:add-rounded" /></span>
    <span class="ds-create-button__label">{{ label }}</span>
    <span v-if="$slots.icons" class="ds-create-button__icons" aria-hidden="true"><slot name="icons" /></span>
    <DsIcon class="ds-create-button__chevron" name="material-symbols:keyboard-arrow-down-rounded" />
  </button>
</template>

<style scoped>
.ds-create-button {
  display: grid;
  grid-template-columns: 2rem auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--ds-space-2);
  width: 100%;
  min-height: 3rem;
  padding: var(--ds-space-2);
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-radius-xl);
  background: var(--ds-bg-elevated);
  color: var(--ds-text-primary);
  box-shadow: var(--ds-elevation-2);
  cursor: pointer;
  transition: border-color var(--ds-transition-fast), box-shadow var(--ds-transition-fast), transform var(--ds-transition-fast);
}

.ds-create-button:hover {
  border-color: var(--ds-border-strong);
  box-shadow: var(--ds-elevation-3);
  transform: translateY(-1px);
}

.ds-create-button:focus-visible {
  outline: 2px solid var(--ds-border-focus);
  outline-offset: 2px;
}

.ds-create-button__add {
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border: 1px solid var(--ds-create-action-border);
  border-radius: var(--ds-radius-create-action);
  background: var(--ds-create-action-bg);
  color: var(--ds-text-inverse);
  box-shadow: var(--ds-create-action-shadow);
  backdrop-filter: blur(8px) saturate(1.08);
  font-size: 1.25rem;
}

.ds-create-button__label {
  font-weight: var(--ds-font-semibold);
}

.ds-create-button__icons {
  display: flex;
  justify-content: flex-end;
  min-width: 0;
}

.ds-create-button__chevron {
  color: var(--ds-text-secondary);
}
</style>
