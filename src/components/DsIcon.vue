<script setup lang="ts">
import { Icon } from '@iconify/vue'

defineProps<{
  name: `solar:${string}`
  label?: string
}>()
</script>

<template>
  <Icon
    :icon="name"
    :aria-hidden="label ? undefined : true"
    :aria-label="label"
    class="ds-icon"
  />
</template>

<style scoped>
.ds-icon {
  display: inline-block;
  flex: none;
  width: 1em;
  height: 1em;
  color: currentColor;
}
</style>
