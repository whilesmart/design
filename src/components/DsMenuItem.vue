<script setup lang="ts">
import DsIcon from './DsIcon.vue'

withDefaults(defineProps<{
  icon?: `solar:${string}` | `material-symbols:${string}`
  tone?: 'default' | 'danger'
  disabled?: boolean
}>(), { icon: undefined, tone: 'default', disabled: false })

defineEmits<{ click: [] }>()
</script>

<template>
  <button
    class="ds-menu-item"
    :class="`ds-menu-item--${tone}`"
    type="button"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <DsIcon v-if="icon" :name="icon" />
    <span><slot /></span>
  </button>
</template>

<style scoped>
.ds-menu-item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: var(--ds-space-2);
  padding: var(--ds-space-2) var(--ds-space-3);
  border: 0;
  border-radius: var(--ds-radius-md);
  background: none;
  color: var(--ds-text-primary);
  font-family: inherit;
  font-size: var(--ds-text-sm);
  text-align: left;
  cursor: pointer;
}

.ds-menu-item:hover:not(:disabled) {
  background: var(--ds-bg-hover);
}

.ds-menu-item:disabled {
  color: var(--ds-text-disabled);
  cursor: not-allowed;
}

.ds-menu-item--danger {
  color: var(--ds-status-error-text);
}

.ds-menu-item--danger:hover:not(:disabled) {
  background: var(--ds-status-error-bg);
}
</style>
