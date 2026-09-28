<script setup lang="ts">
import DsIcon from './DsIcon.vue'

export interface ChatOption {
  id: string
  label: string
  detail?: string
}

const props = withDefaults(defineProps<{
  question: string
  options: ChatOption[]
  why?: string
  recommended?: string
  answer?: string | null
  busy?: boolean
  layout?: 'pills' | 'cards'
  recommendedLabel?: string
}>(), { why: '', recommended: '', answer: null, busy: false, layout: 'pills', recommendedLabel: 'Recommended' })

const emit = defineEmits<{ select: [id: string] }>()

function choose(id: string): void {
  if (props.answer === null && !props.busy) emit('select', id)
}
</script>

<template>
  <section class="ds-chat-question" :class="`ds-chat-question--${layout}`" :aria-label="question">
    <p class="ds-chat-question__prompt">{{ question }}</p>
    <p v-if="why" class="ds-chat-question__why">{{ why }}</p>

    <!-- One tap answers: the option goes straight back into the conversation. -->
    <div class="ds-chat-question__options">
      <button
        v-for="option of options"
        :key="option.id"
        type="button"
        class="ds-chat-question__option"
        :class="{
          'is-recommended': option.id === recommended,
          'is-chosen': option.id === answer,
          'is-passed': answer !== null && option.id !== answer,
        }"
        :disabled="answer !== null || busy"
        :aria-pressed="option.id === answer"
        @click="choose(option.id)"
      >
        <span class="ds-chat-question__label">
          <DsIcon v-if="option.id === answer" name="solar:check-circle-bold" />
          {{ option.label }}
          <span v-if="option.id === recommended && answer === null" class="ds-chat-question__badge">{{ recommendedLabel }}</span>
        </span>
        <span v-if="layout === 'cards' && option.detail" class="ds-chat-question__detail">{{ option.detail }}</span>
      </button>
    </div>

    <div v-if="$slots.default" class="ds-chat-question__extra"><slot /></div>
  </section>
</template>

<style scoped>
.ds-chat-question {
  display: grid;
  gap: var(--ds-space-3);
}

.ds-chat-question--cards {
  padding: var(--ds-space-5);
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-radius-card);
  background: var(--ds-bg-surface);
  box-shadow: var(--ds-elevation-2);
}

.ds-chat-question__prompt {
  margin: 0;
  color: var(--ds-text-primary);
  font-weight: var(--ds-font-weight-semibold);
}

.ds-chat-question--cards .ds-chat-question__prompt {
  font-size: var(--ds-text-lg);
}

.ds-chat-question__why {
  margin: calc(var(--ds-space-2) * -1) 0 0;
  color: var(--ds-text-secondary);
  font-size: var(--ds-text-sm);
}

.ds-chat-question__options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ds-space-2);
}

.ds-chat-question--cards .ds-chat-question__options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.ds-chat-question__option {
  display: grid;
  gap: var(--ds-space-1);
  padding: var(--ds-space-2) var(--ds-space-4);
  border: 1px solid var(--ds-border-strong);
  border-radius: var(--ds-radius-full);
  background: var(--ds-bg-surface);
  color: var(--ds-area-indigo-ink);
  font: inherit;
  font-size: var(--ds-text-sm);
  font-weight: var(--ds-font-weight-medium);
  text-align: left;
  cursor: pointer;
  transition: background var(--ds-transition-fast), border-color var(--ds-transition-fast), transform var(--ds-transition-fast);
}

.ds-chat-question--cards .ds-chat-question__option {
  align-content: start;
  padding: var(--ds-space-4);
  border-radius: var(--ds-radius-control);
  color: var(--ds-text-primary);
  font-size: var(--ds-text-base);
}

.ds-chat-question__option:hover:not(:disabled) {
  border-color: var(--ds-interactive-primary);
  background: var(--ds-area-indigo-fill);
  transform: translateY(-1px);
}

.ds-chat-question__option:focus-visible {
  outline: 2px solid var(--ds-border-focus);
  outline-offset: 2px;
}

.ds-chat-question__option.is-recommended {
  border-color: var(--ds-interactive-primary);
}

.ds-chat-question__option.is-chosen {
  border-color: var(--ds-interactive-primary);
  background: var(--ds-area-indigo-fill);
  color: var(--ds-area-indigo-ink);
}

.ds-chat-question__option.is-passed {
  opacity: 0.5;
}

.ds-chat-question__option:disabled {
  cursor: default;
}

.ds-chat-question__label {
  display: inline-flex;
  flex-wrap: wrap;
  gap: var(--ds-space-2);
  align-items: center;
}

.ds-chat-question__badge {
  padding: 1px var(--ds-space-2);
  border-radius: var(--ds-radius-full);
  background: var(--ds-area-indigo-fill);
  color: var(--ds-area-indigo-ink);
  font-size: var(--ds-text-xs);
  font-weight: var(--ds-font-weight-semibold);
}

.ds-chat-question__detail {
  color: var(--ds-text-secondary);
  font-size: var(--ds-text-sm);
  font-weight: var(--ds-font-weight-normal);
  line-height: var(--ds-leading-snug);
}

.ds-chat-question__extra {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ds-space-2);
}

@media (prefers-reduced-motion: reduce) {
  .ds-chat-question__option { transition: none; }
  .ds-chat-question__option:hover:not(:disabled) { transform: none; }
}
</style>
