<script setup lang="ts">
withDefaults(defineProps<{
  /** The accessible name of the product. Always set; showName decides if it is drawn. */
  name: string
  src?: string
  href?: string
  showName?: boolean
  size?: 'sm' | 'md'
}>(), { src: '', href: '', showName: false, size: 'md' })
</script>

<template>
  <component
    :is="href ? 'a' : 'div'"
    :href="href || undefined"
    class="ds-brand-mark"
    :class="`ds-brand-mark--${size}`"
    :role="!href && !showName ? 'img' : undefined"
    :aria-label="showName ? undefined : name"
  >
    <span class="ds-brand-mark__art">
      <slot name="logo">
        <img v-if="src" :src="src" :alt="name" />
        <span v-else class="ds-brand-mark__initial" aria-hidden="true">{{ [...(name || '?')][0] }}</span>
      </slot>
    </span>
    <span v-if="showName" class="ds-brand-mark__name">{{ name }}</span>
    <slot name="tag" />
  </component>
</template>

<style scoped>
.ds-brand-mark {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: var(--ds-space-2);
  color: var(--ds-text-primary);
  text-decoration: none;
}

.ds-brand-mark__art {
  display: flex;
  height: 2rem;
  flex: none;
  align-items: center;
}

.ds-brand-mark--sm .ds-brand-mark__art {
  height: 1.5rem;
}

/*
 * A host logo arrives as its own component or image with its own sizing rules, so the
 * height is forced here: the rail gives it one line and nothing more.
 */
.ds-brand-mark__art :deep(img),
.ds-brand-mark__art :deep(svg) {
  display: block !important;
  width: auto !important;
  max-width: 9rem;
  height: 100% !important;
  margin: 0 !important;
}

.ds-brand-mark__initial {
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border-radius: var(--ds-radius-lg);
  background: var(--ds-color-primary);
  color: var(--ds-text-inverse);
  font-weight: var(--ds-font-bold);
}

.ds-brand-mark__name {
  overflow: hidden;
  font-size: var(--ds-text-base);
  font-weight: var(--ds-font-semibold);
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
