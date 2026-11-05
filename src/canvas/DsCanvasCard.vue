<script setup lang="ts">
/**
 * A fixed size, because the layout places cards on a grid and a card that grew with its
 * text would overlap the one under it. Text that does not fit is cut to its first lines.
 */
export interface CanvasCardProps {
  title: string
  subtitle?: string
  selected?: boolean
  muted?: boolean
}

withDefaults(defineProps<CanvasCardProps>(), { subtitle: '', selected: false, muted: false })
</script>

<template>
  <div class="ds-canvas-card" :class="{ 'is-selected': selected, 'is-muted': muted }">
    <div class="ds-canvas-card__body">
      <div v-if="$slots.badges" class="ds-canvas-card__badges"><slot name="badges" /></div>
      <p class="ds-canvas-card__title" :title="title">{{ title }}</p>
      <p v-if="subtitle" class="ds-canvas-card__subtitle" :title="subtitle">{{ subtitle }}</p>
      <slot />
    </div>
    <div v-if="$slots.footer" class="ds-canvas-card__footer"><slot name="footer" /></div>
  </div>
</template>
