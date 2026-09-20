<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  name: string
  size?: 'sm' | 'md' | 'lg'
}>(), { size: 'md' })

const initials = computed(() =>
  (props.name.trim() || '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => [...part][0])
    .join('')
    .toUpperCase(),
)
</script>

<template>
  <span class="ds-initials" :class="`ds-initials--${size}`" :title="name">{{ initials }}</span>
</template>

<style scoped>
.ds-initials {
  display: grid;
  flex: none;
  place-items: center;
  border-radius: var(--ds-radius-full);
  background: var(--ds-color-primary-50);
  color: var(--ds-interactive-primary);
  font-weight: var(--ds-font-bold);
  letter-spacing: 0.02em;
}

/* Sized to the avatar scale so the two marks can sit in one row without jumping. */
.ds-initials--sm {
  width: 1.5rem;
  height: 1.5rem;
  font-size: 0.625rem;
}

.ds-initials--md {
  width: 2rem;
  height: 2rem;
  font-size: var(--ds-text-xs);
}

.ds-initials--lg {
  width: 4rem;
  height: 4rem;
  font-size: var(--ds-text-xl);
}
</style>
