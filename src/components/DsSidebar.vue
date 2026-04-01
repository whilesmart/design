<script setup lang="ts">
interface Props {
  width?: string
}

withDefaults(defineProps<Props>(), {
  width: '240px'
})
</script>

<template>
  <aside class="ds-sidebar" :style="{ width, minWidth: width }">
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
.ds-sidebar {
  flex-shrink: 0;
  background: var(--ds-bg-surface, #fff);
  border-right: 1px solid var(--ds-border-color, #e0e0e0);
  display: flex;
  flex-direction: column;
  padding: 1rem;
  overflow-y: auto;
}

.ds-sidebar__action {
  margin-bottom: 1.5rem;
}

.ds-sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.ds-sidebar__footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--ds-border-color, #e0e0e0);
}

@media (max-width: 768px) {
  .ds-sidebar {
    width: 100% !important;
    min-width: unset !important;
    border-right: none;
    border-bottom: 1px solid var(--ds-border-color, #e0e0e0);
    padding: 0.75rem;
  }
}
</style>
