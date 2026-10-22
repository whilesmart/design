<script setup lang="ts">
import DsIcon from './DsIcon.vue'

withDefaults(defineProps<{ title: string; closeLabel?: string }>(), { closeLabel: 'Close' })

const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <section class="ds-chat-canvas" :aria-label="title">
    <header class="ds-chat-canvas__header">
      <h2 class="ds-chat-canvas__title">{{ title }}</h2>
      <slot name="actions" />
      <button type="button" class="ds-chat-canvas__close" :aria-label="closeLabel" :title="closeLabel" @click="emit('close')">
        <DsIcon name="solar:close-circle-linear" />
      </button>
    </header>
    <div class="ds-chat-canvas__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.ds-chat-canvas {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  height: 100%;
}

.ds-chat-canvas__header {
  display: flex;
  flex: none;
  gap: var(--ds-space-2);
  align-items: center;
  min-height: 48px;
  padding: var(--ds-space-2) var(--ds-space-3) var(--ds-space-2) var(--ds-space-4);
  border-bottom: 1px solid var(--ds-border-base);
}

.ds-chat-canvas__title {
  flex: 1;
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: var(--ds-text-primary);
  font-size: var(--ds-text-sm);
  font-weight: var(--ds-font-weight-semibold);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ds-chat-canvas__close {
  display: grid;
  flex: none;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: var(--ds-radius-control);
  background: transparent;
  color: var(--ds-text-secondary);
  font-size: 18px;
  cursor: pointer;
}

.ds-chat-canvas__close:hover {
  background: var(--ds-bg-muted);
  color: var(--ds-text-primary);
}

.ds-chat-canvas__close:focus-visible {
  outline: 2px solid var(--ds-border-focus);
  outline-offset: 2px;
}

.ds-chat-canvas__body {
  flex: 1 1 0;
  min-height: 0;
  padding: var(--ds-space-4);
  overflow-y: auto;
}
</style>
