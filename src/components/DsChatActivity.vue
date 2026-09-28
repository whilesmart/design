<script setup lang="ts">
import { computed } from 'vue'
import DsIcon from './DsIcon.vue'

export interface ChatActivityItem {
  id: string
  text: string
  state: 'running' | 'done' | 'failed'
  meta?: string
}

const props = withDefaults(defineProps<{ items: ChatActivityItem[]; limit?: number; label?: string }>(), {
  limit: 5,
  label: 'What is happening now',
})

// Newest first, so the line that is moving sits where the eye already is.
const shown = computed(() => [...props.items].reverse().slice(0, props.limit))
</script>

<template>
  <TransitionGroup tag="ul" name="ds-chat-activity" class="ds-chat-activity" :aria-label="label" aria-live="polite">
    <li v-for="(item, i) of shown" :key="item.id" class="ds-chat-activity__item" :class="[`is-${item.state}`, { 'is-older': i > 0 }]">
      <span class="ds-chat-activity__mark" aria-hidden="true">
        <span v-if="item.state === 'running'" class="ds-chat-activity__spinner" />
        <DsIcon v-else-if="item.state === 'done'" name="solar:check-read-linear" />
        <DsIcon v-else name="solar:danger-triangle-linear" />
      </span>
      <span class="ds-chat-activity__text">{{ item.text }}</span>
      <span v-if="item.meta" class="ds-chat-activity__meta">{{ item.meta }}</span>
    </li>
  </TransitionGroup>
</template>

<style scoped>
.ds-chat-activity {
  display: grid;
  gap: var(--ds-space-1);
  margin: 0;
  padding: 0;
  list-style: none;
}

.ds-chat-activity__item {
  display: flex;
  gap: var(--ds-space-2);
  align-items: center;
  min-width: 0;
  color: var(--ds-text-secondary);
  font-size: var(--ds-text-sm);
}

.ds-chat-activity__item.is-older {
  opacity: 0.6;
}

.ds-chat-activity__item.is-done .ds-chat-activity__mark {
  color: var(--ds-status-success-text);
}

.ds-chat-activity__item.is-failed {
  color: var(--ds-status-error-text);
}

.ds-chat-activity__mark {
  display: grid;
  flex: none;
  place-items: center;
  width: 16px;
  height: 16px;
}

.ds-chat-activity__spinner {
  width: 12px;
  height: 12px;
  border: 2px solid var(--ds-area-indigo-fill);
  border-top-color: var(--ds-interactive-primary);
  border-radius: var(--ds-radius-full);
  animation: ds-chat-activity-spin 0.8s linear infinite;
}

.ds-chat-activity__text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ds-chat-activity__meta {
  margin-left: auto;
  flex: none;
  color: var(--ds-text-muted);
  font-family: var(--ds-font-mono);
  font-size: var(--ds-text-xs);
}

.ds-chat-activity-enter-active,
.ds-chat-activity-leave-active,
.ds-chat-activity-move {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.ds-chat-activity-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}

.ds-chat-activity-leave-to {
  opacity: 0;
}

.ds-chat-activity-leave-active {
  position: absolute;
}

@keyframes ds-chat-activity-spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .ds-chat-activity-enter-active,
  .ds-chat-activity-leave-active,
  .ds-chat-activity-move { transition: none; }
  .ds-chat-activity__spinner { animation: none; }
}
</style>
