<script setup lang="ts">
import DsIcon from './DsIcon.vue'
import { areaStyle, type AreaColor } from '../areas'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    title: string
    headline?: string
    context?: string
    /** Drawn large and faint behind the copy. */
    mark?: `solar:${string}` | `material-symbols:${string}`
    area?: AreaColor
  }>(),
  { headline: '', context: '', mark: undefined, area: 'indigo' },
)

const style = computed(() => areaStyle(props.area))
</script>

<template>
  <section class="ds-page-hero" :style="style">
    <DsIcon v-if="mark" :name="mark" class="ds-page-hero__mark" aria-hidden="true" />

    <div class="ds-page-hero__body">
      <div class="ds-page-hero__copy">
        <p class="ds-page-hero__title">{{ title }}</p>
        <p v-if="headline" class="ds-page-hero__headline">{{ headline }}</p>
        <p v-if="context" class="ds-page-hero__context">{{ context }}</p>
        <slot name="context" />
      </div>

      <div v-if="$slots.default" class="ds-page-hero__act">
        <slot />
      </div>
    </div>
  </section>
</template>

<style scoped>
.ds-page-hero {
  position: relative;
  padding: var(--ds-space-5) var(--ds-space-6);
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-shell-radius);
  background: var(--ds-area-fill, var(--ds-bg-elevated));
  box-shadow: var(--ds-elevation-1);
  overflow: hidden;
}

/* Cropped by the surface's own edge, so it reads as texture rather than as an
   icon placed inside the padding. */
.ds-page-hero__mark {
  position: absolute;
  top: 50%;
  right: -2.5rem;
  color: var(--ds-area-solid, var(--ds-interactive-primary));
  font-size: 15rem;
  opacity: 0.06;
  transform: translateY(-50%) rotate(-8deg);
  pointer-events: none;
}

.ds-page-hero__body {
  display: flex;
  position: relative;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--ds-space-4);
}

.ds-page-hero__copy {
  display: grid;
  min-width: 0;
  gap: var(--ds-space-1);
}

.ds-page-hero__title {
  margin: 0;
  color: var(--ds-area-ink, var(--ds-text-secondary));
  font-size: var(--ds-text-xs);
  font-weight: var(--ds-font-semibold);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.ds-page-hero__headline {
  margin: 0;
  max-width: 48ch;
  color: var(--ds-text-primary);
  font-size: var(--ds-text-2xl);
  font-weight: 600;
  line-height: 1.2;
  text-wrap: balance;
}

.ds-page-hero__context {
  margin: 0;
  max-width: 64ch;
  color: var(--ds-text-secondary);
  font-size: var(--ds-text-sm);
}

.ds-page-hero__act {
  display: flex;
  flex: none;
  align-items: center;
  gap: var(--ds-space-2);
}

@media (min-width: 640px) {
  .ds-page-hero__body {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: var(--ds-space-6);
  }

  .ds-page-hero__mark {
    right: -3rem;
  }
}
</style>
