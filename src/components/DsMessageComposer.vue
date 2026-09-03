<script setup lang="ts">
import { nextTick, ref } from 'vue'
import DsIcon from './DsIcon.vue'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  sending?: boolean
}>(), {
  modelValue: '',
  placeholder: 'Write a message',
  disabled: false,
  sending: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  send: [value: string]
  attach: []
  mention: []
  emoji: []
}>()

const input = ref<HTMLTextAreaElement | null>(null)

function send() {
  const value = props.modelValue.trim()
  if (!value || props.disabled || props.sending) return
  emit('send', value)
  void nextTick(() => input.value?.focus())
}

function keydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    send()
  }
}
</script>

<template>
  <div class="ds-message-composer" :class="{ 'ds-message-composer--disabled': disabled }">
    <textarea
      ref="input"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      rows="1"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
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
.ds-message-composer { display: grid; gap: var(--ds-space-2); padding: var(--ds-space-3); border: 1px solid var(--ds-border-strong); border-radius: var(--ds-radius-xl); background: var(--ds-bg-elevated); box-shadow: var(--ds-elevation-2); }
.ds-message-composer:focus-within { border-color: var(--ds-border-focus); box-shadow: 0 0 0 2px color-mix(in srgb, var(--ds-border-focus) 18%, transparent), var(--ds-elevation-2); }
.ds-message-composer textarea { width: 100%; min-height: 2.5rem; max-height: 9rem; resize: vertical; border: 0; outline: 0; background: transparent; color: var(--ds-text-primary); font: inherit; line-height: 1.45; }
.ds-message-composer__actions, .ds-message-composer__actions > div { display: flex; align-items: center; gap: var(--ds-space-1); }
.ds-message-composer__actions { justify-content: space-between; }
.ds-message-composer button { display: grid; width: 2rem; height: 2rem; place-items: center; border: 0; border-radius: var(--ds-radius-md); background: transparent; color: var(--ds-text-secondary); cursor: pointer; }
.ds-message-composer button:hover:not(:disabled) { background: var(--ds-bg-hover); color: var(--ds-interactive-primary); }
.ds-message-composer .ds-message-composer__send { background: var(--ds-interactive-primary); color: var(--ds-text-inverse); }
.ds-message-composer button:disabled { opacity: 0.45; cursor: default; }
</style>
