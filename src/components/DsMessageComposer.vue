<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import DsIcon from './DsIcon.vue'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  sending?: boolean
  formatting?: boolean
  compact?: boolean
}>(), {
  modelValue: '',
  placeholder: 'Write a message',
  disabled: false,
  sending: false,
  formatting: true,
  compact: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  send: [value: string]
  attach: []
  mention: []
  emoji: []
}>()

const input = ref<HTMLTextAreaElement | null>(null)

// A textarea only reports the height its content needs after it has been reset, so shrink then measure.
function resize(): void {
  const field = input.value
  if (!field) return
  field.style.height = 'auto'
  field.style.height = `${field.scrollHeight}px`
}

watch(() => props.modelValue, () => void nextTick(resize))

function update(value: string): void {
  emit('update:modelValue', value)
}

function send(): void {
  const value = props.modelValue.trim()
  if (!value || props.disabled || props.sending) return
  emit('send', value)
  void nextTick(() => {
    resize()
    input.value?.focus()
  })
}

function keydown(event: KeyboardEvent): void {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    send()
  }
}

function wrap(before: string, after = before): void {
  const field = input.value
  if (!field) return
  const start = field.selectionStart ?? 0
  const end = field.selectionEnd ?? start
  const value = props.modelValue
  update(`${value.slice(0, start)}${before}${value.slice(start, end)}${after}${value.slice(end)}`)
  void nextTick(() => {
    field.focus()
    field.setSelectionRange(start + before.length, end + before.length)
  })
}

function prefixLine(marker: string): void {
  const field = input.value
  if (!field) return
  const start = field.selectionStart ?? 0
  const value = props.modelValue
  const lineStart = value.lastIndexOf('\n', Math.max(0, start - 1)) + 1
  update(`${value.slice(0, lineStart)}${marker}${value.slice(lineStart)}`)
  void nextTick(() => {
    field.focus()
    field.setSelectionRange(start + marker.length, start + marker.length)
  })
}

defineExpose({ focus: () => input.value?.focus(), resize })
</script>

<template>
  <div class="ds-message-composer" :class="{ 'ds-message-composer--disabled': disabled, 'ds-message-composer--compact': compact }">
    <div v-if="formatting" class="ds-message-composer__formatting">
      <button type="button" title="Bold" :disabled="disabled" @click="wrap('**')"><DsIcon name="solar:text-bold-square-linear" /></button>
      <button type="button" title="Italic" :disabled="disabled" @click="wrap('_')"><DsIcon name="solar:text-italic-linear" /></button>
      <button type="button" title="Code" :disabled="disabled" @click="wrap('`')"><DsIcon name="solar:code-square-linear" /></button>
      <button type="button" title="Link" :disabled="disabled" @click="wrap('[', '](url)')"><DsIcon name="solar:link-round-linear" /></button>
      <button type="button" title="Bulleted list" :disabled="disabled" @click="prefixLine('- ')"><DsIcon name="solar:list-linear" /></button>
    </div>

    <slot name="suggestions" />

    <textarea
      ref="input"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      rows="1"
      @input="update(($event.target as HTMLTextAreaElement).value)"
      @keydown="keydown"
    />

    <div class="ds-message-composer__actions">
      <div>
        <button type="button" title="Attach a file" :disabled="disabled" @click="emit('attach')"><DsIcon name="solar:paperclip-linear" /></button>
        <button type="button" title="Mention someone" :disabled="disabled" @click="emit('mention')"><DsIcon name="solar:mention-circle-linear" /></button>
        <button type="button" title="Add an emoji" :disabled="disabled" @click="emit('emoji')"><DsIcon name="solar:smile-circle-linear" /></button>
      </div>
      <button type="button" class="ds-message-composer__send" title="Send message" :disabled="disabled || sending || !modelValue.trim()" @click="send">
        <DsIcon name="solar:plain-linear" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.ds-message-composer { position: relative; display: grid; gap: var(--ds-space-2); padding: var(--ds-space-2) var(--ds-space-3) var(--ds-space-2); border: 1px solid var(--ds-border-strong); border-radius: var(--ds-radius-xl); background: var(--ds-bg-elevated); box-shadow: var(--ds-elevation-2); }
.ds-message-composer:focus-within { border-color: var(--ds-border-focus); box-shadow: 0 0 0 2px color-mix(in srgb, var(--ds-border-focus) 18%, transparent), var(--ds-elevation-2); }
.ds-message-composer__formatting { display: flex; align-items: center; gap: 2px; padding-bottom: var(--ds-space-1); border-bottom: 1px solid var(--ds-border-base); }
.ds-message-composer textarea { width: 100%; min-height: 2.25rem; max-height: 12rem; resize: none; overflow-y: auto; border: 0; outline: 0; background: transparent; color: var(--ds-text-primary); font: inherit; font-size: var(--ds-text-sm); line-height: 1.5; }
.ds-message-composer__actions, .ds-message-composer__actions > div { display: flex; align-items: center; gap: var(--ds-space-1); }
.ds-message-composer__actions { justify-content: space-between; }
.ds-message-composer button { display: grid; width: 1.75rem; height: 1.75rem; place-items: center; border: 0; border-radius: var(--ds-radius-md); background: transparent; color: var(--ds-text-secondary); cursor: pointer; }
.ds-message-composer button:hover:not(:disabled) { background: var(--ds-bg-hover); color: var(--ds-interactive-primary); }
.ds-message-composer .ds-message-composer__send { width: 2rem; height: 2rem; background: var(--ds-interactive-primary); color: var(--ds-text-inverse); }
.ds-message-composer .ds-message-composer__send:hover:not(:disabled) { background: var(--ds-interactive-primary-hover); color: var(--ds-text-inverse); }
.ds-message-composer button:disabled { opacity: 0.45; cursor: default; }
.ds-message-composer--compact { padding: var(--ds-space-2); }
.ds-message-composer--compact .ds-message-composer__formatting { display: none; }

@media (max-width: 700px) {
  .ds-message-composer__formatting { display: none; }
}
</style>
