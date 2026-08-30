<script setup lang="ts">
interface Props {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  padding: 'md',
  shadow: 'sm'
})
</script>

<template>
  <div
    class="ds-card"
    :class="[`ds-card--padding-${padding}`, `ds-card--shadow-${shadow}`]"
  >
    <slot />
  </div>
</template>

<style scoped>
.ds-card {
  background: var(--ds-bg-elevated);
  border-radius: var(--ds-radius-lg);
  border: 1px solid var(--ds-border-base);
}

.ds-card--padding-none {
  padding: 0;
}

.ds-card--padding-sm {
  padding: var(--ds-space-3);
}

.ds-card--padding-md {
  padding: var(--ds-space-6);
}

.ds-card--padding-lg {
  padding: var(--ds-space-8);
}

.ds-card--shadow-none {
  box-shadow: none;
}

.ds-card--shadow-sm {
  box-shadow: var(--ds-elevation-1);
}

.ds-card--shadow-md {
  box-shadow: var(--ds-elevation-2);
}

.ds-card--shadow-lg {
  box-shadow: var(--ds-elevation-3);
}
</style>
