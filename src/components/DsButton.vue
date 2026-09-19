<script setup lang="ts">
import DsIcon from './DsIcon.vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  icon?: `material-symbols:${string}` | `solar:${string}`
  iconPosition?: 'start' | 'end'
  align?: 'center' | 'start'
  as?: 'button' | 'a'
  href?: string
  type?: 'button' | 'submit' | 'reset'
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  fullWidth: false,
  iconPosition: 'start',
  align: 'center',
  as: 'button',
  type: 'button'
})

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <component
    :is="as"
    class="ds-button"
    :class="[
      `ds-button--${variant}`,
      `ds-button--${size}`,
      `ds-button--${align}`,
      { 'ds-button--full-width': fullWidth, 'ds-button--loading': loading }
    ]"
    :disabled="as === 'button' ? disabled || loading : undefined"
    :aria-disabled="as === 'a' && (disabled || loading) ? 'true' : undefined"
    :href="as === 'a' && !disabled && !loading ? href : undefined"
    :type="as === 'button' ? type : undefined"
    @click="!disabled && !loading && $emit('click', $event)"
  >
    <span v-if="loading" class="ds-button__spinner"></span>
    <span class="ds-button__content" :class="{ 'ds-button__content--hidden': loading }">
      <span v-if="($slots.icon || icon) && iconPosition === 'start'" class="ds-button__icon">
        <slot name="icon"><DsIcon :name="icon!" /></slot>
      </span>
      <span class="ds-button__label"><slot /></span>
      <span v-if="($slots.icon || icon) && iconPosition === 'end'" class="ds-button__icon">
        <slot name="icon"><DsIcon :name="icon!" /></slot>
      </span>
    </span>
  </component>
</template>

<style scoped>
.ds-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--ds-space-2);
  border: 1px solid transparent;
  border-radius: var(--ds-radius-lg);
  font-weight: var(--ds-font-medium);
  cursor: pointer;
  transition: all var(--ds-transition-fast);
  position: relative;
  text-decoration: none;
}

.ds-button[aria-disabled='true'] {
  pointer-events: none;
}

.ds-button:disabled,
.ds-button[aria-disabled='true'] {
  opacity: 0.5;
  cursor: not-allowed;
}

.ds-button--sm {
  min-height: 2rem;
  padding: var(--ds-space-1) var(--ds-space-3);
  font-size: var(--ds-text-sm);
}

.ds-button--md {
  min-height: 2.5rem;
  padding: var(--ds-space-2) var(--ds-space-4);
  font-size: var(--ds-text-sm);
}

.ds-button--lg {
  min-height: 2.75rem;
  padding: var(--ds-space-2) var(--ds-space-5);
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

.ds-button__content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--ds-space-2);
  width: 100%;
  line-height: 1;
}

.ds-button--start .ds-button__content {
  display: grid;
  grid-template-columns: 1.25rem minmax(0, 1fr);
  justify-content: stretch;
  text-align: left;
}

.ds-button--start .ds-button__label { min-width: 0; }

.ds-button__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  font-size: 1.125em;
  width: 1.125em;
  height: 1.125em;
}

.ds-button__icon :deep(svg) { display: block; width: 100%; height: 100%; }

.ds-button__label { line-height: 1.2; }

@keyframes ds-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
