<script setup lang="ts">
import DsIcon from './DsIcon.vue'

withDefaults(defineProps<{
  title: string
  detail?: string
  icon?: `solar:${string}` | `material-symbols:${string}`
  open?: boolean
}>(), { detail: '', icon: 'solar:document-text-linear', open: false })

const emit = defineEmits<{ open: [] }>()
</script>

<template>
  <button
    type="button"
    class="ds-chat-canvas-card"
    :class="{ 'is-open': open }"
    :aria-pressed="open ? true : undefined"
    @click="emit('open')"
  >
    <span class="ds-chat-canvas-card__tile" aria-hidden="true"><DsIcon :name="icon" /></span>
    <span class="ds-chat-canvas-card__text">
      <span class="ds-chat-canvas-card__title">{{ title }}</span>
      <span v-if="detail" class="ds-chat-canvas-card__detail">{{ detail }}</span>
    </span>
    <DsIcon class="ds-chat-canvas-card__go" name="solar:arrow-right-up-linear" />
  </button>
</template>

<style scoped>
.ds-chat-canvas-card {
  display: flex;
  gap: var(--ds-space-3);
  align-items: center;
  width: 100%;
  min-width: 0;
  padding: var(--ds-space-2) var(--ds-space-3);
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-radius-control);
  background: var(--ds-bg-muted);
  color: var(--ds-text-primary);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 150ms ease, background-color 150ms ease;
}

.ds-chat-canvas-card:hover,
.ds-chat-canvas-card.is-open {
  border-color: var(--ds-interactive-primary);
  background: var(--ds-accent-fill);
}

.ds-chat-canvas-card:focus-visible {
  outline: 2px solid var(--ds-border-focus);
  outline-offset: 2px;
}

.ds-chat-canvas-card__tile {
  display: grid;
  flex: none;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-radius-control);
  background: var(--ds-bg-surface);
  color: var(--ds-accent-ink);
  font-size: 18px;
}

.ds-chat-canvas-card__text {
  display: grid;
  flex: 1;
  min-width: 0;
}

.ds-chat-canvas-card__title,
.ds-chat-canvas-card__detail {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ds-chat-canvas-card__title {
  font-size: var(--ds-text-sm);
  font-weight: var(--ds-font-weight-medium);
}

.ds-chat-canvas-card__detail {
  color: var(--ds-text-muted);
  font-size: var(--ds-text-xs);
}

.ds-chat-canvas-card__go {
  flex: none;
  color: var(--ds-text-muted);
}
</style>
