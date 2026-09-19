<script setup lang="ts">
import { computed } from 'vue'
import DsButton from './DsButton.vue'
import DsIcon from './DsIcon.vue'
import DsSpotArt, { type SpotArtName } from './DsSpotArt.vue'
import type { AreaColor } from '../areas'

const props = withDefaults(defineProps<{
  state?: 'loading' | 'empty' | 'error'
  title: string
  description?: string
  actionLabel?: string
  art?: SpotArtName
  /** Draws this glyph instead of the illustration. */
  icon?: `solar:${string}` | `material-symbols:${string}`
  area?: AreaColor
}>(), { state: 'empty', description: '', actionLabel: '', art: undefined, icon: undefined, area: undefined })

defineEmits<{ action: [] }>()

const artName = computed<SpotArtName>(() => props.art ?? (props.state === 'error' ? 'error' : 'empty'))

// Paired with the drawing, not with the state: a caller that asks for the error art
// without the error state would otherwise get the triangle in the default colour.
const artAreas: Record<SpotArtName, AreaColor> = {
  error: 'rose',
  success: 'green',
  search: 'cyan',
  measure: 'violet',
  mail: 'amber',
  empty: 'indigo',
}
const artArea = computed<AreaColor>(() => props.area ?? artAreas[artName.value])
</script>

<template>
  <div class="ds-state" :class="`ds-state--${state}`" :role="state === 'error' ? 'alert' : 'status'">
    <span v-if="state === 'loading'" class="ds-state__spinner">
      <DsIcon name="solar:refresh-linear" />
    </span>
    <span v-else-if="icon" class="ds-state__glyph"><DsIcon :name="icon" /></span>
    <DsSpotArt v-else :name="artName" :area="artArea" />
    <strong>{{ title }}</strong>
    <p v-if="description">{{ description }}</p>
    <DsButton v-if="actionLabel" variant="secondary" size="sm" @click="$emit('action')">{{ actionLabel }}</DsButton>
    <slot />
  </div>
</template>

<style scoped>
.ds-state {
  display: grid;
  min-height: 14rem;
  align-content: center;
  justify-items: center;
  gap: var(--ds-space-2);
  padding: var(--ds-space-8);
  border: 1px dashed var(--ds-border-base);
  border-radius: var(--ds-radius-card);
  background: var(--ds-bg-subtle);
  color: var(--ds-text-primary);
  text-align: center;
}

.ds-state__glyph {
  color: var(--ds-text-muted);
  font-size: 3rem;
}

.ds-state__spinner {
  display: grid;
  width: 3rem;
  height: 3rem;
  place-items: center;
  border-radius: var(--ds-radius-full);
  background: var(--ds-color-primary-50);
  color: var(--ds-interactive-primary);
  font-size: 1.5rem;
  animation: ds-state-spin 1s linear infinite;
}

strong {
  margin-top: var(--ds-space-2);
}

p {
  max-width: 42ch;
  margin: 0;
  color: var(--ds-text-secondary);
  font-size: var(--ds-text-sm);
}

@keyframes ds-state-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ds-state__spinner {
    animation: none;
  }
}
</style>
