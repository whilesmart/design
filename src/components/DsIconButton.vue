<script setup lang="ts">
import DsIcon from './DsIcon.vue'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'primary' | 'ghost'
  active?: boolean
  title?: string
  disabled?: boolean
  icon?: `material-symbols:${string}` | `solar:${string}`
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'default',
  active: false,
  title: '',
  disabled: false,
  icon: undefined
})

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <button
    type="button"
    class="ds-icon-btn"
    :class="[
      `ds-icon-btn--${size}`,
      `ds-icon-btn--${variant}`,
      { 'ds-icon-btn--active': active }
    ]"
    :title="title"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot><DsIcon v-if="icon" :name="icon" /></slot>
  </button>
</template>

<style scoped>
.ds-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid var(--ds-border-base);
  border-radius: 0.375rem;
  cursor: pointer;
  color: var(--ds-text-secondary);
  font-size: 1.125rem;
  line-height: 1;
  transition: all 0.15s ease;
}

.ds-icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ds-icon-btn--sm {
  padding: 0.25rem;
}

.ds-icon-btn--md {
  padding: 0.375rem;
}

.ds-icon-btn--lg {
  padding: 0.5rem;
}

.ds-icon-btn--default:hover:not(:disabled) {
  background: var(--ds-bg-hover);
}

.ds-icon-btn--default.ds-icon-btn--active {
  background: var(--ds-color-primary-50);
  color: var(--ds-interactive-primary);
  border-color: var(--ds-interactive-primary);
}

.ds-icon-btn--primary {
  background: var(--ds-interactive-primary);
  color: var(--ds-text-inverse);
  border-color: var(--ds-interactive-primary);
}

.ds-icon-btn--primary:hover:not(:disabled) {
  background: var(--ds-interactive-primary-hover);
}

.ds-icon-btn--ghost {
  border-color: transparent;
}

.ds-icon-btn--ghost:hover:not(:disabled) {
  background: var(--ds-bg-hover);
}
</style>
