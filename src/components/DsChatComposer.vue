<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import DsIcon from './DsIcon.vue'

export interface ChatFileType {
  key: string
  label: string
  hint?: string
  accept: string
  icon?: `solar:${string}` | `material-symbols:${string}`
}

export interface ChatSend {
  text: string
  files: File[]
  fileType: string | null
}

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  sending?: boolean
  fileTypes?: ChatFileType[]
  sendLabel?: string
  attachLabel?: string
  removeLabel?: string
}>(), {
  modelValue: '',
  placeholder: 'Write a message',
  disabled: false,
  sending: false,
  fileTypes: () => [],
  sendLabel: 'Send',
  attachLabel: 'Attach a file',
  removeLabel: 'Remove',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  send: [payload: ChatSend]
  attach: [files: File[]]
}>()

const box = ref<HTMLTextAreaElement | null>(null)
const picker = ref<HTMLInputElement | null>(null)
const plus = ref<HTMLButtonElement | null>(null)
const files = ref<File[]>([])
const active = ref<ChatFileType | null>(null)
const open = ref(false)
const place = ref<Record<string, string>>({})

const accept = computed(() => active.value?.accept ?? props.fileTypes.map((t) => t.accept).join(','))
const ready = computed(() => !props.disabled && !props.sending && (props.modelValue.trim() !== '' || files.value.length > 0))

function resize(): void {
  const el = box.value
  if (!el) return
  el.style.height = 'auto'
  const max = parseInt(getComputedStyle(el).maxHeight, 10) || Infinity
  el.style.height = `${Math.min(el.scrollHeight, max)}px`
}

function input(event: Event): void {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
  resize()
}

function keydown(event: KeyboardEvent): void {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
    event.preventDefault()
    send()
  }
}

function send(): void {
  if (!ready.value) return
  emit('send', { text: props.modelValue.trim(), files: [...files.value], fileType: active.value?.key ?? null })
  files.value = []
  active.value = null
}

// The menu is fixed to the viewport so the composer's rounded corners cannot clip it.
function toggle(): void {
  if (open.value) {
    open.value = false
    return
  }
  const r = plus.value?.getBoundingClientRect()
  if (r) {
    const width = 300
    place.value = {
      left: `${Math.max(8, Math.min(r.left, window.innerWidth - width - 8))}px`,
      bottom: `${window.innerHeight - r.top + 8}px`,
      width: `${width}px`,
    }
  }
  open.value = true
}

function choose(type: ChatFileType): void {
  active.value = type
  open.value = false
  void nextTick(() => picker.value?.click())
}

function picked(event: Event): void {
  const target = event.target as HTMLInputElement
  const added = Array.from(target.files ?? [])
  if (added.length) {
    files.value = [...files.value, ...added]
    emit('attach', files.value)
  }
  target.value = ''
}

function remove(index: number): void {
  files.value.splice(index, 1)
  if (!files.value.length) active.value = null
  emit('attach', files.value)
}

watch(() => props.modelValue, async (value) => {
  if (value === '') {
    await nextTick()
    resize()
  }
})

defineExpose({ focus: () => box.value?.focus() })
</script>

<template>
  <div class="ds-chat-composer" :class="{ 'is-disabled': disabled }">
    <div v-if="files.length" class="ds-chat-composer__files">
      <span v-for="(file, i) of files" :key="`${file.name}-${i}`" class="ds-chat-composer__file">
        <DsIcon :name="active?.icon ?? 'solar:paperclip-linear'" />
        <span class="ds-chat-composer__file-name">{{ file.name }}</span>
        <span v-if="active" class="ds-chat-composer__file-type">{{ active.label }}</span>
        <button type="button" class="ds-chat-composer__remove" :aria-label="`${removeLabel} ${file.name}`" @click="remove(i)">
          <DsIcon name="solar:close-circle-linear" />
        </button>
      </span>
    </div>

    <form class="ds-chat-composer__row" @submit.prevent="send">
      <button
        v-if="fileTypes.length"
        ref="plus"
        type="button"
        class="ds-chat-composer__round ds-chat-composer__plus"
        :class="{ 'is-open': open }"
        :title="attachLabel"
        :aria-label="attachLabel"
        :aria-expanded="open"
        aria-haspopup="menu"
        :disabled="disabled"
        @click="toggle"
      >
        <DsIcon name="solar:add-circle-linear" />
      </button>
      <input v-if="fileTypes.length" ref="picker" type="file" class="ds-chat-composer__picker" multiple :accept="accept" @change="picked" />

      <textarea
        ref="box"
        class="ds-chat-composer__box"
        rows="1"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :aria-label="placeholder"
        @input="input"
        @keydown="keydown"
      />

      <button type="submit" class="ds-chat-composer__round ds-chat-composer__send" :title="sendLabel" :aria-label="sendLabel" :disabled="!ready">
        <DsIcon name="solar:plain-linear" />
      </button>
    </form>

    <Teleport to="body">
      <div v-if="open" class="ds-chat-composer__backdrop" @click="open = false" />
      <div v-if="open" class="ds-chat-composer__menu" :style="place" role="menu">
        <button v-for="type of fileTypes" :key="type.key" type="button" class="ds-chat-composer__option" role="menuitem" @click="choose(type)">
          <span class="ds-chat-composer__option-icon"><DsIcon :name="type.icon ?? 'solar:paperclip-linear'" /></span>
          <span class="ds-chat-composer__option-text">
            <span class="ds-chat-composer__option-label">{{ type.label }}</span>
            <span v-if="type.hint" class="ds-chat-composer__option-hint">{{ type.hint }}</span>
          </span>
        </button>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.ds-chat-composer {
  display: grid;
  gap: var(--ds-space-2);
  padding: var(--ds-space-2);
  border: 1px solid var(--ds-border-base);
  border-radius: 16px;
  background: var(--ds-bg-surface);
  box-shadow: var(--ds-elevation-2);
}

.ds-chat-composer.is-disabled {
  opacity: 0.7;
}

.ds-chat-composer__files {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ds-space-2);
  padding: 0 var(--ds-space-1);
}

.ds-chat-composer__file {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-space-1);
  max-width: 100%;
  padding: 2px var(--ds-space-2);
  border-radius: var(--ds-radius-full);
  background: var(--ds-area-indigo-fill);
  color: var(--ds-area-indigo-ink);
  font-size: var(--ds-text-xs);
}

.ds-chat-composer__file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ds-chat-composer__file-type {
  opacity: 0.8;
}

.ds-chat-composer__remove {
  display: inline-grid;
  place-items: center;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  cursor: pointer;
}

.ds-chat-composer__row {
  display: flex;
  align-items: flex-end;
  gap: var(--ds-space-2);
}

.ds-chat-composer__round {
  display: grid;
  flex: none;
  place-items: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 0;
  border-radius: var(--ds-radius-full);
  font-size: 20px;
  cursor: pointer;
  transition: background var(--ds-transition-fast), transform var(--ds-transition-fast);
}

.ds-chat-composer__plus {
  background: var(--ds-bg-muted);
  color: var(--ds-text-secondary);
}

.ds-chat-composer__plus:hover:not(:disabled) {
  background: var(--ds-bg-hover);
}

.ds-chat-composer__plus.is-open {
  transform: rotate(45deg);
}

.ds-chat-composer__send {
  background: var(--ds-interactive-primary);
  color: var(--ds-text-inverse);
}

.ds-chat-composer__send:hover:not(:disabled) {
  background: var(--ds-interactive-primary-hover);
}

.ds-chat-composer__round:disabled {
  opacity: 0.45;
  cursor: default;
}

.ds-chat-composer__round:focus-visible,
.ds-chat-composer__option:focus-visible {
  outline: 2px solid var(--ds-border-focus);
  outline-offset: 2px;
}

.ds-chat-composer__picker {
  display: none;
}

.ds-chat-composer__box {
  flex: 1;
  min-height: 40px;
  max-height: 200px;
  padding: 9px var(--ds-space-2);
  border: 0;
  background: transparent;
  color: var(--ds-text-primary);
  font: inherit;
  line-height: var(--ds-leading-normal);
  resize: none;
  outline: none;
}

.ds-chat-composer__backdrop {
  position: fixed;
  inset: 0;
  z-index: var(--ds-z-popover);
}

.ds-chat-composer__menu {
  position: fixed;
  z-index: calc(var(--ds-z-popover) + 1);
  display: grid;
  gap: 2px;
  padding: var(--ds-space-2);
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-radius-card);
  background: var(--ds-bg-elevated);
  box-shadow: var(--ds-elevation-3);
}

.ds-chat-composer__option {
  display: flex;
  gap: var(--ds-space-3);
  align-items: center;
  padding: var(--ds-space-2);
  border: 0;
  border-radius: var(--ds-radius-control);
  background: none;
  color: var(--ds-text-primary);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.ds-chat-composer__option:hover {
  background: var(--ds-bg-hover);
}

.ds-chat-composer__option-icon {
  display: grid;
  flex: none;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: var(--ds-radius-control);
  background: var(--ds-area-indigo-fill);
  color: var(--ds-area-indigo-ink);
  font-size: 18px;
}

.ds-chat-composer__option-text {
  display: grid;
}

.ds-chat-composer__option-label {
  font-weight: var(--ds-font-weight-medium);
}

.ds-chat-composer__option-hint {
  color: var(--ds-text-muted);
  font-size: var(--ds-text-xs);
}

@media (prefers-reduced-motion: reduce) {
  .ds-chat-composer__round { transition: none; }
  .ds-chat-composer__plus.is-open { transform: none; }
}
</style>
