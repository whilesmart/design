<script setup lang="ts">
import { inject, ref, useId } from 'vue'
import { railCollapsedKey } from '../rail'

withDefaults(defineProps<{ label?: string }>(), { label: '' })

const headingId = useId()
const folded = inject(railCollapsedKey, ref(false))
</script>

<template>
  <div
    class="ds-sidebar-group"
    :class="{ 'ds-sidebar-group--folded': folded }"
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

/* A folded rail has no room for a heading, so a rule marks where the group
   starts and the heading still names it for assistive tech. */
.ds-sidebar-group--folded .ds-sidebar-group__label {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.ds-sidebar-group--folded + .ds-sidebar-group--folded {
  padding-top: var(--ds-space-3);
  border-top: 1px solid var(--ds-border-base);
}
</style>
