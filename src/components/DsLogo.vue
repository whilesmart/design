<script setup lang="ts">
import { computed, useSlots } from 'vue'

const props = withDefaults(defineProps<{
  /** The product name. Drawn when there is no mark, and used as the accessible name otherwise. */
  name: string
  /** The full lockup: mark and wordmark together. */
  src?: string
  /** The mark on its own, for a rail or bar too narrow for the lockup. */
  markSrc?: string
  variant?: 'full' | 'mark'
  href?: string
  showName?: boolean
  size?: 'sm' | 'md'
}>(), { src: '', markSrc: '', variant: 'full', href: '', showName: false, size: 'md' })

const slots = useSlots()
// Falls through to whichever asset the host shipped, so asking for a mark that does not
// exist draws the lockup rather than nothing.
const asset = computed(() =>
  props.variant === 'mark' ? props.markSrc || props.src : props.src || props.markSrc,
)
const hasMark = computed(() => Boolean(slots.logo || asset.value))
// With no mark to show, the name carries the brand on its own.
const drawName = computed(() => props.showName || !hasMark.value)
</script>

<template>
  <component
    :is="href ? 'a' : 'div'"
    :href="href || undefined"
    class="ds-logo"
    :class="`ds-logo--${size}`"
    :aria-label="drawName ? undefined : name"
    :role="!href && !drawName ? 'img' : undefined"
  >
    <span v-if="hasMark" class="ds-logo__mark">
      <slot name="logo">
        <img :src="asset" alt="" />
      </slot>
    </span>
    <span v-if="drawName" class="ds-logo__name">{{ name }}</span>
    <slot name="tag" />
  </component>
</template>

<style scoped>
.ds-logo {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: var(--ds-space-2);
  color: var(--ds-text-primary);
  text-decoration: none;
}

.ds-logo__mark {
  display: flex;
  height: 2rem;
  flex: none;
  align-items: center;
}

.ds-logo--sm .ds-logo__mark {
  height: 1.5rem;
}

/*
 * A host logo arrives as its own component or image with its own sizing rules, so the
 * height is forced here: the rail gives it one line and nothing more.
 */
.ds-logo__mark :deep(img),
.ds-logo__mark :deep(svg) {
  display: block !important;
  width: auto !important;
  max-width: 9rem;
  height: 100% !important;
  margin: 0 !important;
}

.ds-logo__name {
  overflow: hidden;
  font-size: var(--ds-text-base);
  font-weight: var(--ds-font-semibold);
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
