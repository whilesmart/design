<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import DsIcon from './DsIcon.vue'
import { areaStyle, type AreaColor } from '../areas'

const props = withDefaults(defineProps<{
  active?: boolean
  badge?: string | number
  label?: string
  // Absent, the item renders as it did before: one line.
  description?: string
  icon?: `solar:${string}` | `material-symbols:${string}`
  /** Colours the row with a place in the product instead of the brand primary. */
  area?: AreaColor
  /** Sets the icon in a filled disc, where a hairline outline would disappear. */
  tile?: boolean
  to?: string
  href?: string
}>(), {
  active: false,
  badge: undefined,
  label: '',
  description: undefined,
  icon: undefined,
  area: undefined,
  tile: false,
  to: '',
  href: ''
})

defineEmits<{ click: [] }>()

const tag = computed(() => (props.to ? RouterLink : props.href ? 'a' : 'button'))
const style = computed(() => areaStyle(props.area))
</script>

<template>
  <component
    :is="tag"
    class="ds-sidebar-item"
    :class="{ 'ds-sidebar-item--active': active, 'ds-sidebar-item--area': area, 'ds-sidebar-item--tile': tile }"
    :style="style"
    :to="to || undefined"
    :href="href || undefined"
    :type="tag === 'button' ? 'button' : undefined"
    :aria-current="active ? 'page' : undefined"
    @click="$emit('click')"
  >
    <span v-if="$slots.icon || icon" class="ds-sidebar-item__icon">
      <slot name="icon"><DsIcon v-if="icon" :name="icon" /></slot>
    </span>
    <span class="ds-sidebar-item__said">
      <span class="ds-sidebar-item__label"><slot>{{ label }}</slot></span>
      <span v-if="description" class="ds-sidebar-item__description">{{ description }}</span>
    </span>
    <span v-if="badge !== undefined" class="ds-sidebar-item__badge">{{ badge }}</span>
  </component>
</template>

<style scoped>
.ds-sidebar-item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 1rem;
  border: none;
  border-radius: var(--ds-radius-control);
  background: none;
  color: var(--ds-text-primary);
  font-family: inherit;
  font-size: 0.875rem;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition: background-color var(--ds-transition-fast), color var(--ds-transition-fast);
}

.ds-sidebar-item:hover {
  background: var(--ds-bg-hover);
}

.ds-sidebar-item:focus-visible {
  outline: 2px solid var(--ds-border-focus);
  outline-offset: 2px;
}

.ds-sidebar-item--active {
  background: var(--ds-color-primary-100);
  color: var(--ds-color-primary-900);
  font-weight: 600;
}

.ds-sidebar-item--area {
  padding: 0.5rem;
  color: var(--ds-text-secondary);
  font-weight: var(--ds-font-medium);
}

.ds-sidebar-item--area:hover {
  color: var(--ds-text-primary);
}

.ds-sidebar-item--area.ds-sidebar-item--active {
  background: var(--ds-area-fill);
  color: var(--ds-area-ink);
  font-weight: var(--ds-font-semibold);
}

.ds-sidebar-item__icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
}

.ds-sidebar-item--tile .ds-sidebar-item__icon {
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border-radius: var(--ds-radius-full);
  background: var(--ds-area-fill, var(--ds-color-primary-50));
  color: var(--ds-area-ink, var(--ds-interactive-primary));
  font-size: 1.125rem;
  transition: background var(--ds-transition-fast), color var(--ds-transition-fast);
}

.ds-sidebar-item--tile.ds-sidebar-item--active .ds-sidebar-item__icon {
  background: var(--ds-area-solid, var(--ds-interactive-primary));
  color: var(--ds-area-on-solid, var(--ds-text-inverse));
}

.ds-sidebar-item__said {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 1px;
}

.ds-sidebar-item__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Clamped at two lines: a sentence cut after four words says nothing. */
.ds-sidebar-item__description {
  color: var(--ds-text-muted);
  font-size: var(--ds-text-xs);
  line-height: 1.35;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.ds-sidebar-item--active .ds-sidebar-item__description {
  color: inherit;
  opacity: 0.72;
}

.ds-sidebar-item__badge {
  flex: none;
  min-width: 1.5rem;
  padding: 0.125rem 0.5rem;
  border-radius: 1rem;
  background: var(--ds-area-solid, var(--ds-interactive-primary));
  color: var(--ds-area-on-solid, var(--ds-text-inverse));
  font-size: 0.6875rem;
  font-weight: 700;
  text-align: center;
}
</style>
