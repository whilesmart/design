<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'primary' | 'ghost'
  active?: boolean
  title?: string
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'default',
  active: false,
  title: '',
  disabled: false
})

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <button
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
    <slot />
  </button>
</template>

<style scoped>
.ds-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid var(--ds-border-color, #e0e0e0);
  border-radius: 0.375rem;
  cursor: pointer;
  color: var(--ds-text-secondary, #666);
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
  background: var(--ds-bg-hover, #f5f5f5);
}

.ds-icon-btn--default.ds-icon-btn--active {
  background: var(--ds-color-primary-50, rgba(45, 57, 142, 0.08));
  color: var(--ds-color-primary, #2d398e);
  border-color: var(--ds-color-primary, #2d398e);
}

.ds-icon-btn--primary {
  background: var(--ds-color-primary, #2d398e);
  color: white;
  border-color: var(--ds-color-primary, #2d398e);
}

.ds-icon-btn--primary:hover:not(:disabled) {
  background: var(--ds-color-primary-700, #1e2a6e);
}

.ds-icon-btn--ghost {
  border-color: transparent;
}

.ds-icon-btn--ghost:hover:not(:disabled) {
  background: var(--ds-bg-hover, #f5f5f5);
}
</style>
