<script setup lang="ts">
import DsIcon from './DsIcon.vue'

withDefaults(defineProps<{
  from: 'assistant' | 'user'
  state?: 'ready' | 'pending' | 'failed'
  avatar?: string
  avatarAlt?: string
  meta?: string
  bare?: boolean
}>(), { state: 'ready', avatar: '', avatarAlt: '', meta: '', bare: false })
</script>

<template>
  <div class="ds-chat-message" :class="[`ds-chat-message--${from}`, `ds-chat-message--${state}`]">
    <span class="ds-chat-message__avatar" aria-hidden="true">
      <img v-if="avatar" :src="avatar" :alt="avatarAlt" />
      <DsIcon v-else :name="from === 'assistant' ? 'solar:stars-linear' : 'solar:user-linear'" />
    </span>
    <div class="ds-chat-message__column">
      <!-- A card (a question, a result) is its own surface, so it goes in without a bubble around it. -->
      <div :class="bare ? 'ds-chat-message__bare' : 'ds-chat-message__bubble'" :role="state === 'failed' ? 'alert' : undefined">
        <span v-if="state === 'pending'" class="ds-chat-message__dots" aria-label="Working"><i /><i /><i /></span>
        <slot v-else />
      </div>
      <span v-if="meta" class="ds-chat-message__meta">{{ meta }}</span>
    </div>
  </div>
</template>

<style scoped>
.ds-chat-message {
  display: flex;
  gap: var(--ds-space-3);
  align-items: flex-start;
}

.ds-chat-message--user {
  flex-direction: row-reverse;
}

.ds-chat-message__avatar {
  display: grid;
  flex: none;
  place-items: center;
  width: 32px;
  height: 32px;
  overflow: hidden;
  border-radius: var(--ds-radius-full);
  background: var(--ds-bg-muted);
  color: var(--ds-text-secondary);
}

.ds-chat-message__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ds-chat-message--user .ds-chat-message__avatar {
  background: var(--ds-area-indigo-fill);
  color: var(--ds-area-indigo-ink);
}

.ds-chat-message__column {
  display: grid;
  gap: var(--ds-space-1);
  min-width: 0;
  max-width: var(--ds-chat-bubble-max, min(82%, 720px));
}

.ds-chat-message--user .ds-chat-message__column {
  justify-items: end;
}

.ds-chat-message__bare {
  min-width: min(100%, 520px);
}

.ds-chat-message__bubble {
  padding: var(--ds-space-3) var(--ds-space-4);
  border: 1px solid var(--ds-border-base);
  border-radius: 18px;
  border-top-left-radius: 6px;
  background: var(--ds-bg-surface);
  box-shadow: var(--ds-elevation-1);
  color: var(--ds-text-primary);
  line-height: var(--ds-leading-relaxed);
  overflow-wrap: anywhere;
}

.ds-chat-message--user .ds-chat-message__bubble {
  border-color: transparent;
  border-top-left-radius: 18px;
  border-top-right-radius: 6px;
  background: var(--ds-area-indigo-fill);
  box-shadow: none;
}

.ds-chat-message--failed .ds-chat-message__bubble {
  border-color: var(--ds-status-error-text);
  background: var(--ds-status-error-bg);
  color: var(--ds-status-error-text);
}

.ds-chat-message__meta {
  padding: 0 var(--ds-space-1);
  color: var(--ds-text-muted);
  font-size: var(--ds-text-xs);
}

.ds-chat-message__dots {
  display: inline-flex;
  gap: 4px;
  padding: 6px 0;
}

.ds-chat-message__dots i {
  width: 7px;
  height: 7px;
  border-radius: var(--ds-radius-full);
  background: var(--ds-text-muted);
  animation: ds-chat-dot 1.2s ease-in-out infinite;
}

.ds-chat-message__dots i:nth-child(2) {
  animation-delay: 0.15s;
}

.ds-chat-message__dots i:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes ds-chat-dot {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.45; }
  30% { transform: translateY(-4px); opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .ds-chat-message__dots i { animation: none; opacity: 0.7; }
}
</style>
