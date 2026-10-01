<script setup lang="ts">
import DsIcon from './DsIcon.vue'

export interface ChatStep {
  id: string
  label: string
  state: 'pending' | 'active' | 'done' | 'failed'
  detail?: string
}

defineProps<{ steps: ChatStep[]; label?: string }>()
</script>

<template>
  <ol class="ds-chat-progress" :aria-label="label || 'Progress'">
    <li v-for="step of steps" :key="step.id" class="ds-chat-progress__step" :class="`is-${step.state}`">
      <span class="ds-chat-progress__mark" aria-hidden="true">
        <DsIcon v-if="step.state === 'done'" name="solar:check-circle-bold" />
        <DsIcon v-else-if="step.state === 'failed'" name="solar:danger-circle-bold" />
        <span v-else-if="step.state === 'active'" class="ds-chat-progress__spinner" />
        <span v-else class="ds-chat-progress__dot" />
      </span>
      <span class="ds-chat-progress__text">
        <span class="ds-chat-progress__label">{{ step.label }}</span>
        <span v-if="step.detail" class="ds-chat-progress__detail">{{ step.detail }}</span>
      </span>
    </li>
  </ol>
</template>

<style scoped>
.ds-chat-progress {
  display: grid;
  gap: var(--ds-space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.ds-chat-progress__step {
  display: flex;
  gap: var(--ds-space-2);
  align-items: flex-start;
  color: var(--ds-text-muted);
  font-size: var(--ds-text-sm);
}

.ds-chat-progress__step.is-active {
  color: var(--ds-text-primary);
  font-weight: var(--ds-font-weight-medium);
}

.ds-chat-progress__step.is-done .ds-chat-progress__mark {
  color: var(--ds-status-success-text);
}

.ds-chat-progress__step.is-failed {
  color: var(--ds-status-error-text);
}

.ds-chat-progress__mark {
  display: grid;
  flex: none;
  place-items: center;
  width: 18px;
  height: 18px;
  font-size: 16px;
}

.ds-chat-progress__spinner {
  width: 13px;
  height: 13px;
  border: 2px solid var(--ds-area-indigo-fill);
  border-top-color: var(--ds-interactive-primary);
  border-radius: var(--ds-radius-full);
  animation: ds-chat-spin 0.8s linear infinite;
}

.ds-chat-progress__dot {
  width: 7px;
  height: 7px;
  border-radius: var(--ds-radius-full);
  background: var(--ds-border-strong);
}

.ds-chat-progress__text {
  display: grid;
  gap: 2px;
}

.ds-chat-progress__detail {
  color: var(--ds-text-muted);
  font-size: var(--ds-text-xs);
  font-weight: var(--ds-font-weight-normal);
}

@keyframes ds-chat-spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .ds-chat-progress__spinner { animation: none; border-top-color: var(--ds-interactive-primary); }
}
</style>
