<script setup lang="ts">
import { computed } from 'vue'
import DsIcon from './DsIcon.vue'
import { areaStyle, type AreaColor } from '../areas'

const props = withDefaults(defineProps<{
  label: string
  value: string
  icon?: `solar:${string}` | `material-symbols:${string}`
  area?: AreaColor
  caption?: string
}>(), { icon: undefined, area: 'indigo', caption: '' })

const style = computed(() => areaStyle(props.area))
</script>

<template>
  <div class="ds-stat-tile" :class="{ 'ds-stat-tile--with-icon': icon }" :style="style">
    <span v-if="icon" class="ds-stat-tile__icon"><DsIcon :name="icon" /></span>
    <strong class="ds-stat-tile__value">{{ value }}</strong>
    <span class="ds-stat-tile__label">{{ label }}</span>
    <span v-if="caption" class="ds-stat-tile__caption">{{ caption }}</span>
  </div>
</template>

<style scoped>
/* The icon sits beside the figure so a row of tiles costs one line of height, not two. */
.ds-stat-tile {
  display: grid;
  align-items: center;
  gap: 0 var(--ds-space-3);
  grid-template-areas:
    'value'
    'label'
    'caption';
  padding: var(--ds-space-4);
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-radius-card);
  background: var(--ds-bg-elevated);
  box-shadow: var(--ds-elevation-1);
}

.ds-stat-tile--with-icon {
  grid-template-areas:
    'icon value'
    'icon label'
    'icon caption';
  grid-template-columns: auto minmax(0, 1fr);
}

.ds-stat-tile__icon {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  grid-area: icon;
  border-radius: var(--ds-radius-full);
  background: var(--ds-area-fill);
  color: var(--ds-area-ink);
  font-size: 1.375rem;
}

.ds-stat-tile__value {
  grid-area: value;
  align-self: end;
  color: var(--ds-text-primary);
  font-size: var(--ds-text-2xl);
  font-weight: var(--ds-font-semibold);
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}

.ds-stat-tile__label {
  grid-area: label;
  align-self: start;
  overflow: hidden;
  color: var(--ds-text-secondary);
  font-size: var(--ds-text-sm);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ds-stat-tile__caption {
  grid-area: caption;
  color: var(--ds-text-muted);
  font-size: var(--ds-text-xs);
}
</style>
