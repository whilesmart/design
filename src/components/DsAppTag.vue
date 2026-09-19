<script setup lang="ts">
import { computed } from 'vue'
import DsIcon from './DsIcon.vue'
import { areaStyle, type AreaColor } from '../areas'

const props = withDefaults(defineProps<{
  label: string
  icon?: `solar:${string}` | `material-symbols:${string}`
  area?: AreaColor
}>(), { icon: undefined, area: 'indigo' })

const style = computed(() => areaStyle(props.area))
</script>

<template>
  <span class="ds-app-tag" :style="style">
    <DsIcon v-if="icon" :name="icon" />
    {{ label }}
  </span>
</template>

<style scoped>
.ds-app-tag {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.5rem;
  border-radius: var(--ds-radius-full);
  background: var(--ds-area-fill);
  color: var(--ds-area-ink);
  font-size: var(--ds-text-xs);
  font-weight: var(--ds-font-bold);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
}
</style>
