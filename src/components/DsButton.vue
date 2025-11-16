<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  fullWidth: false
})

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <button
    class="ds-button"
    :class="[
      `ds-button--${variant}`,
      `ds-button--${size}`,
      { 'ds-button--full-width': fullWidth, 'ds-button--loading': loading }
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="ds-button__spinner"></span>
    <span class="ds-button__content" :class="{ 'ds-button__content--hidden': loading }">
      <slot />
    </span>
  </button>
</template>

<style scoped>
.ds-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--ds-space-2);
  border: 1px solid transparent;
  border-radius: var(--ds-radius-md);
  font-weight: var(--ds-font-medium);
  cursor: pointer;
  transition: all var(--ds-transition-fast);
  position: relative;
}

.ds-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ds-button--sm {
  padding: var(--ds-space-1) var(--ds-space-3);
  font-size: var(--ds-text-sm);
}

.ds-button--md {
  padding: var(--ds-space-2) var(--ds-space-4);
  font-size: var(--ds-text-sm);
}

.ds-button--lg {
  padding: var(--ds-space-3) var(--ds-space-6);
  font-size: var(--ds-text-base);
}

.ds-button--primary {
  background: var(--ds-interactive-primary);
  color: white;
}

.ds-button--primary:hover:not(:disabled) {
  background: var(--ds-interactive-primary-hover);
}

.ds-button--primary:active:not(:disabled) {
  background: var(--ds-interactive-primary-active);
}

.ds-button--secondary {
  background: var(--ds-bg-surface);
  color: var(--ds-text-primary);
  border-color: var(--ds-border-base);
}

.ds-button--secondary:hover:not(:disabled) {
  background: var(--ds-bg-base);
  border-color: var(--ds-border-strong);
}

.ds-button--ghost {
  background: transparent;
  color: var(--ds-text-primary);
}

.ds-button--ghost:hover:not(:disabled) {
  background: var(--ds-bg-surface);
}

.ds-button--danger {
  background: var(--ds-color-error-500);
  color: white;
}

.ds-button--danger:hover:not(:disabled) {
  background: var(--ds-color-error-600);
}

.ds-button--full-width {
  width: 100%;
}

.ds-button__spinner {
  position: absolute;
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: ds-spin 0.6s linear infinite;
}

.ds-button__content--hidden {
  visibility: hidden;
}

@keyframes ds-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
