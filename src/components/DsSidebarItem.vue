<script setup lang="ts">
interface Props {
  active?: boolean
  badge?: string | number
}

withDefaults(defineProps<Props>(), {
  active: false,
  badge: undefined
})

defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    class="ds-sidebar-item"
    :class="{ 'ds-sidebar-item--active': active }"
    @click="$emit('click')"
  >
    <span v-if="$slots.icon" class="ds-sidebar-item__icon">
      <slot name="icon" />
    </span>
    <span class="ds-sidebar-item__label"><slot /></span>
    <span v-if="badge !== undefined" class="ds-sidebar-item__badge">{{ badge }}</span>
  </button>
</template>

<style scoped>
.ds-sidebar-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 1rem;
  background: none;
  border: none;
  border-radius: var(--ds-radius-xl);
  font-size: 0.875rem;
  color: var(--ds-text-primary, #1a1a1a);
  cursor: pointer;
  transition: background-color 0.15s ease;
  text-align: left;
  width: 100%;
  font-family: inherit;
}

.ds-sidebar-item:hover {
  background: var(--ds-bg-hover, #f5f5f5);
}

.ds-sidebar-item--active {
  background: var(--ds-color-primary-100);
  color: var(--ds-color-primary-900);
  font-weight: 600;
}

.ds-sidebar-item__icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.ds-sidebar-item__label {
  flex: 1;
}

.ds-sidebar-item__badge {
  background: var(--ds-color-primary, #2d398e);
  color: white;
  font-size: 0.6875rem;
  font-weight: 700;
  padding: 0.125rem 0.5rem;
  border-radius: 1rem;
  min-width: 1.5rem;
  text-align: center;
}
</style>
