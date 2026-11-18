<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
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
  /** A destination inside the app: renders a router link, so no page reload. */
  to?: string
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
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

const inactive = computed(() => props.disabled || props.loading)
const tag = computed(() => (props.to && !inactive.value ? RouterLink : props.to ? 'a' : props.as))
// One object, so RouterLink never gets an href: even undefined, it replaces the resolved one.
const target = computed(() => {
  if (props.to) return inactive.value ? { 'aria-disabled': 'true' } : { to: props.to }
  if (props.as === 'a') {
    return inactive.value ? { 'aria-disabled': 'true' } : { href: props.href }
  }
  return { disabled: inactive.value, type: props.type }
})
</script>

<template>
  <component
    :is="tag"
    class="ds-button"
    :class="[
      `ds-button--${variant}`,
      `ds-button--${size}`,
      `ds-button--${align}`,
      { 'ds-button--full-width': fullWidth, 'ds-button--loading': loading }
    ]"
    v-bind="target"
    @click="!inactive && $emit('click', $event)"
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
  transition: background-color var(--ds-transition-fast), border-color var(--ds-transition-fast), color var(--ds-transition-fast), box-shadow var(--ds-transition-fast);
  position: relative;
  text-decoration: none;
}

.ds-button:focus-visible {
  outline: 2px solid var(--ds-focus-ring);
  outline-offset: 2px;
}

.ds-button[aria-disabled='true'] {
  pointer-events: none;
}

.ds-button:disabled,
.ds-button[aria-disabled='true'] {
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
  background: var(--ds-action-primary-bg);
  color: var(--ds-action-primary-text);
}

.ds-button--primary:hover:not(:disabled) {
  background: var(--ds-action-primary-hover);
}

.ds-button--primary:active:not(:disabled) {
  background: var(--ds-action-primary-active);
}

.ds-button--secondary {
  background: var(--ds-action-secondary-bg);
  color: var(--ds-action-secondary-text);
  border-color: var(--ds-action-secondary-border);
}

.ds-button--secondary:hover:not(:disabled) {
  background: var(--ds-action-secondary-hover);
}

.ds-button--ghost {
  background: transparent;
  color: var(--ds-action-ghost-text);
}

.ds-button--ghost:hover:not(:disabled) {
  background: var(--ds-action-ghost-hover);
}

.ds-button--danger {
  background: var(--ds-action-danger-bg);
  color: var(--ds-action-danger-text);
}

.ds-button--danger:hover:not(:disabled) {
  background: var(--ds-action-danger-hover);
}

/* Disabled actions read as flat grey rather than a faded colour, so they never look like a weaker primary. */
:is(.ds-button--primary, .ds-button--secondary, .ds-button--danger):is(:disabled, [aria-disabled='true']):not(.ds-button--loading) {
  background: var(--ds-action-disabled-bg);
  border-color: transparent;
  color: var(--ds-action-disabled-text);
}

.ds-button--ghost:is(:disabled, [aria-disabled='true']):not(.ds-button--loading) {
  color: var(--ds-action-disabled-text);
}

.ds-button--loading:disabled {
  cursor: progress;
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
