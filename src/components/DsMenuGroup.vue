<script setup lang="ts">
import { useId } from 'vue'

defineProps<{ label: string }>()
const id = useId()
</script>

<template>
  <div class="ds-menu-group" role="group" :aria-labelledby="id">
    <div :id="id" class="ds-menu-group__label">{{ label }}</div>
    <slot />
  </div>
</template>

<style scoped>
.ds-menu-group { display: grid; }
.ds-menu-group + .ds-menu-group { margin-top: var(--ds-space-1); padding-top: var(--ds-space-1); border-top: 1px solid var(--ds-border-base); }
.ds-menu-group__label { padding: var(--ds-space-2) var(--ds-space-3) var(--ds-space-1); color: var(--ds-text-secondary); font-size: var(--ds-text-xs); font-weight: var(--ds-font-semibold); letter-spacing: 0.02em; }
</style>
