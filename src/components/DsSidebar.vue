<script setup lang="ts">
withDefaults(defineProps<{ width?: string }>(), { width: '240px' })
</script>

<template>
  <aside class="ds-sidebar" :style="{ width, minWidth: width }">
    <div v-if="$slots.head" class="ds-sidebar__head">
      <slot name="head" />
    </div>
    <div v-if="$slots.action" class="ds-sidebar__action">
      <slot name="action" />
    </div>
    <nav class="ds-sidebar__nav">
      <slot />
    </nav>
    <div v-if="$slots.footer" class="ds-sidebar__footer">
      <slot name="footer" />
    </div>
  </aside>
</template>

<style scoped>
/* Placement is the caller's: this owns the inside of the rail only. */
.ds-sidebar {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: var(--ds-space-4);
  padding: var(--ds-space-4);
  border-right: 1px solid var(--ds-border-base);
  background: var(--ds-bg-elevated);
  overflow-y: auto;
}

.ds-sidebar__head {
  display: flex;
  min-height: 2.5rem;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-space-2);
  padding: 0 var(--ds-space-2);
}

.ds-sidebar__action {
  display: grid;
  gap: var(--ds-space-2);
}

.ds-sidebar__nav {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--ds-space-1);
}

.ds-sidebar__footer {
  display: grid;
  gap: var(--ds-space-2);
  margin-top: auto;
  padding-top: var(--ds-space-3);
  border-top: 1px solid var(--ds-border-base);
}
</style>
