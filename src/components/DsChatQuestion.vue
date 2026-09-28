<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import DsButton from './DsButton.vue'
import DsIcon from './DsIcon.vue'
import DsTextarea from './DsTextarea.vue'

export interface ChatOption {
  id: string
  label: string
  detail?: string
}

const props = withDefaults(defineProps<{
  question: string
  options: ChatOption[]
  why?: string
  recommended?: string | string[]
  answer?: string | string[] | null
  busy?: boolean
  layout?: 'pills' | 'cards'
  multiple?: boolean
  confirm?: boolean
  min?: number
  max?: number
  confirmLabel?: string
  recommendedLabel?: string
  columns?: number
  /** When set, the person may answer in their own words; this labels the box. */
  writeIn?: string
  writeInLabel?: string
}>(), {
  why: '',
  recommended: '',
  answer: null,
  busy: false,
  layout: 'cards',
  multiple: false,
  confirm: true,
  min: 1,
  max: undefined,
  confirmLabel: 'Use this',
  recommendedLabel: 'Recommended',
  columns: 1,
  writeIn: '',
  writeInLabel: 'Send',
})

const emit = defineEmits<{ select: [id: string]; selectMany: [ids: string[]]; write: [text: string] }>()

const words = ref('')

function write(): void {
  const text = words.value.trim()
  if (!text || locked.value || props.busy) return
  emit('write', text)
}

const list = (value: string | string[] | null | undefined) => (Array.isArray(value) ? value : value ? [value] : [])
const recommendedIds = computed(() => list(props.recommended))
const answered = computed(() => list(props.answer))
const locked = computed(() => answered.value.length > 0)

// The recommendation starts selected, so confirming it is one tap.
const picked = ref<string[]>(recommendedIds.value.slice(0, props.multiple ? undefined : 1))
watch(() => props.recommended, () => {
  if (!locked.value) picked.value = recommendedIds.value.slice(0, props.multiple ? undefined : 1)
})

const chosen = (id: string) => (locked.value ? answered.value : picked.value).includes(id)
const full = computed(() => props.max !== undefined && picked.value.length >= props.max)
const ready = computed(() => picked.value.length >= props.min && (props.max === undefined || picked.value.length <= props.max))

function toggle(id: string): void {
  if (locked.value || props.busy) return
  if (!props.multiple) {
    picked.value = [id]
    if (!props.confirm) emit('select', id)
    return
  }
  picked.value = picked.value.includes(id) ? picked.value.filter((p) => p !== id) : full.value ? picked.value : [...picked.value, id]
}

function send(): void {
  if (!ready.value || locked.value || props.busy) return
  if (props.multiple) emit('selectMany', [...picked.value])
  else emit('select', picked.value[0]!)
}
</script>

<template>
  <section class="ds-chat-question" :class="`ds-chat-question--${layout}`" :aria-label="question">
    <p class="ds-chat-question__prompt">{{ question }}</p>
    <p v-if="why" class="ds-chat-question__why">{{ why }}</p>
    <p v-if="multiple && !locked" class="ds-chat-question__hint">
      Pick {{ max === undefined ? `at least ${min}` : min === max ? max : `${min} to ${max}` }}.
    </p>

    <div
      class="ds-chat-question__options"
      :role="multiple ? 'group' : 'radiogroup'"
      :aria-label="question"
      :style="layout === 'cards' ? { '--columns': String(columns) } : undefined"
    >
      <label
        v-for="option of options"
        :key="option.id"
        class="ds-chat-question__option"
        :class="{
          'is-recommended': recommendedIds.includes(option.id),
          'is-chosen': chosen(option.id),
          'is-passed': locked && !chosen(option.id),
          'is-locked': locked || busy,
        }"
      >
        <input
          class="ds-chat-question__input"
          :type="multiple ? 'checkbox' : 'radio'"
          :name="question"
          :value="option.id"
          :checked="chosen(option.id)"
          :disabled="locked || busy || (multiple && full && !chosen(option.id))"
          @click="toggle(option.id)"
        />
        <span class="ds-chat-question__text">
          <span class="ds-chat-question__label">
            <DsIcon v-if="locked && chosen(option.id)" name="solar:check-circle-bold" />
            {{ option.label }}
            <span v-if="recommendedIds.includes(option.id) && !locked" class="ds-chat-question__badge">{{ recommendedLabel }}</span>
          </span>
          <span v-if="layout === 'cards' && option.detail" class="ds-chat-question__detail">{{ option.detail }}</span>
        </span>
      </label>
    </div>

    <form v-if="writeIn && !locked" class="ds-chat-question__write" @submit.prevent="write">
      <DsTextarea v-model="words" :label="writeIn" :rows="3" :disabled="busy" />
      <DsButton type="submit" variant="secondary" icon="solar:plain-linear" :disabled="!words.trim() || busy">
        {{ writeInLabel }}
      </DsButton>
    </form>

    <div v-if="!locked && (confirm || multiple || $slots.default)" class="ds-chat-question__acts">
      <DsButton
        v-if="confirm || multiple"
        variant="primary"
        icon="solar:check-circle-linear"
        :disabled="!ready"
        :loading="busy"
        @click="send"
      >
        {{ confirmLabel }}
      </DsButton>
      <slot />
    </div>
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

.ds-chat-question__write {
  display: grid;
  gap: var(--ds-space-2);
  justify-items: start;
}

.ds-chat-question__write > :first-child {
  justify-self: stretch;
}

.ds-chat-question--cards .ds-chat-question__prompt {
  font-size: var(--ds-text-lg);
}

.ds-chat-question__why,
.ds-chat-question__hint {
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
  grid-template-columns: repeat(var(--columns, 1), minmax(0, 1fr));
}

.ds-chat-question__option {
  display: flex;
  gap: var(--ds-space-3);
  align-items: flex-start;
  padding: var(--ds-space-2) var(--ds-space-4);
  border: 1px solid var(--ds-border-strong);
  border-radius: var(--ds-radius-full);
  background: var(--ds-bg-surface);
  color: var(--ds-text-primary);
  font-size: var(--ds-text-sm);
  cursor: pointer;
  transition: background var(--ds-transition-fast), border-color var(--ds-transition-fast);
}

.ds-chat-question--cards .ds-chat-question__option {
  padding: var(--ds-space-3) var(--ds-space-4);
  border-radius: var(--ds-radius-control);
  font-size: var(--ds-text-base);
}

.ds-chat-question__option:hover:not(.is-locked) {
  background: var(--ds-bg-hover);
}

.ds-chat-question__option.is-chosen {
  border-color: var(--ds-interactive-primary);
  background: var(--ds-area-indigo-fill);
}

.ds-chat-question__option.is-passed {
  opacity: 0.5;
}

.ds-chat-question__option.is-locked {
  cursor: default;
}

.ds-chat-question__input {
  flex: none;
  margin-top: 4px;
  accent-color: var(--ds-interactive-primary);
}

.ds-chat-question--pills .ds-chat-question__input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.ds-chat-question__option:focus-within {
  outline: 2px solid var(--ds-border-focus);
  outline-offset: 2px;
}

.ds-chat-question__text {
  display: grid;
  gap: var(--ds-space-1);
}

.ds-chat-question__label {
  display: inline-flex;
  flex-wrap: wrap;
  gap: var(--ds-space-2);
  align-items: center;
  font-weight: var(--ds-font-weight-medium);
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
  line-height: var(--ds-leading-snug);
}

.ds-chat-question__acts {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ds-space-2);
}

@media (max-width: 640px) {
  .ds-chat-question--cards {
    padding: var(--ds-space-4);
  }

  .ds-chat-question--cards .ds-chat-question__options {
    grid-template-columns: minmax(0, 1fr);
  }

  .ds-chat-question__acts > :first-child {
    flex: 1 1 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ds-chat-question__option { transition: none; }
}
</style>
