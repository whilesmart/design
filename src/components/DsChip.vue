<script setup lang="ts">
import DsIcon from './DsIcon.vue'

interface Props {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md'
  active?: boolean
  closable?: boolean
  clickable?: boolean
  icon?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  active: false,
  closable: false,
  clickable: false,
  icon: false
})

defineEmits<{
  click: [event: MouseEvent]
  close: []
}>()
</script>

<template>
  <component
    :is="clickable ? 'button' : 'span'"
    class="ds-chip"
    :class="[
      `ds-chip--${variant}`,
      `ds-chip--${size}`,
      { 'ds-chip--active': active, 'ds-chip--clickable': clickable }
    ]"
    @click="clickable ? $emit('click', $event) : undefined"
  >
    <span v-if="icon" class="ds-chip__icon">
      <slot name="icon" />
    </span>
    <span class="ds-chip__label"><slot /></span>
    <button v-if="closable" class="ds-chip__close" @click.stop="$emit('close')">
      <DsIcon name="solar:close-circle-linear" />
    </button>
  </component>
</template>

<style scoped>
.ds-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  border-radius: 1rem;
  font-weight: 500;
  border: 1px solid transparent;
  transition: all 0.15s ease;
  white-space: nowrap;
  font-family: inherit;
}

.ds-chip--sm {
  padding: 0.125rem 0.5rem;
  font-size: 0.6875rem;
}

.ds-chip--md {
  padding: 0.25rem 0.75rem;
  font-size: 0.8125rem;
}

.ds-chip--clickable {
  cursor: pointer;
  background: none;
}

.ds-chip--default {
  background: var(--ds-bg-muted, #f3f4f6);
  color: var(--ds-text-secondary, #6b7280);
  border-color: var(--ds-border-base, #e5e7eb);
}

.ds-chip--default.ds-chip--active,
.ds-chip--default.ds-chip--clickable:hover {
  background: var(--ds-color-primary-50, rgba(45, 57, 142, 0.08));
  color: var(--ds-color-primary, #2d398e);
  border-color: var(--ds-color-primary, #2d398e);
}

.ds-chip--primary {
  background: var(--ds-color-primary-50, rgba(45, 57, 142, 0.08));
  color: var(--ds-color-primary, #2d398e);
  border-color: var(--ds-color-primary, #2d398e);
}

.ds-chip--success {
  background: rgba(16, 185, 129, 0.08);
  color: #059669;
  border-color: #059669;
}

.ds-chip--warning {
  background: rgba(245, 158, 11, 0.08);
  color: #d97706;
  border-color: #d97706;
}

.ds-chip--danger {
  background: rgba(239, 68, 68, 0.08);
  color: #dc2626;
  border-color: #dc2626;
}

.ds-chip__icon {
  display: flex;
  align-items: center;
}

.ds-chip__close {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: inherit;
  opacity: 0.6;
  margin-left: 0.125rem;
}

.ds-chip__close:hover {
  opacity: 1;
}
</style>
