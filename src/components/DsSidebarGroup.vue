<script setup lang="ts">
import { useId } from 'vue'

withDefaults(defineProps<{ label?: string }>(), { label: '' })

const headingId = useId()
</script>

<template>
  <div
    class="ds-sidebar-group"
    role="group"
    :aria-labelledby="label ? headingId : undefined"
  >
    <span v-if="label" :id="headingId" class="ds-sidebar-group__label">{{ label }}</span>
    <slot />
  </div>
</template>

<style scoped>
.ds-sidebar-group {
  display: grid;
  gap: var(--ds-space-1);
}

.ds-sidebar-group + .ds-sidebar-group {
  margin-top: var(--ds-space-3);
}

.ds-sidebar-group__label {
  padding: 0 var(--ds-space-2) var(--ds-space-1);
  color: var(--ds-text-secondary);
  font-size: var(--ds-text-xs);
  font-weight: var(--ds-font-semibold);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
</style>
