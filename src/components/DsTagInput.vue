<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import DsAvatar from './DsAvatar.vue'
import DsIcon from './DsIcon.vue'
import type { SearchSuggestion } from './DsSearchInput.vue'

export interface TagInputValue {
  id: string
  label: string
  description?: string
  avatar?: string
}

const props = withDefaults(defineProps<{
  modelValue?: TagInputValue[]
  placeholder?: string
  provider: (query: string) => Promise<SearchSuggestion[]>
  createTag?: (value: string) => TagInputValue | null
}>(), { modelValue: () => [], placeholder: '' })

const emit = defineEmits<{ 'update:modelValue': [value: TagInputValue[]] }>()
const query = ref('')
const suggestions = ref<SearchSuggestion[]>([])
const open = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
let request = 0

watch(query, value => {
  clearTimeout(timer)
  const text = value.trim()
  if (!text) { suggestions.value = []; open.value = false; return }
  const current = ++request
  timer = setTimeout(async () => {
    try {
      const results = await props.provider(text)
      if (current === request) { suggestions.value = results; open.value = results.length > 0 }
    } catch { if (current === request) { suggestions.value = []; open.value = false } }
  }, 180)
})

function add(tag: TagInputValue) {
  if (!props.modelValue.some(item => item.id === tag.id)) emit('update:modelValue', [...props.modelValue, tag])
  query.value = ''
  open.value = false
}

function select(item: SearchSuggestion) {
  add({ id: String(item.data?.email || item.id), label: item.label, description: item.description, avatar: item.data?.avatar ? String(item.data.avatar) : undefined })
}

function create() {
  const tag = props.createTag?.(query.value.trim())
  if (tag) add(tag)
}

function remove(id: string) { emit('update:modelValue', props.modelValue.filter(item => item.id !== id)) }
function removeLast() { const last = props.modelValue[props.modelValue.length - 1]; if (last) remove(last.id) }
function closeLater() { window.setTimeout(() => { open.value = false }, 160) }
function handleInput(event: Event) {
  query.value = (event.target as HTMLInputElement).value
  if (/[;,]$/.test(query.value)) create()
}

onUnmounted(() => clearTimeout(timer))
</script>

<template>
  <div class="ds-tag-input" @focusin="open = suggestions.length > 0" @focusout="closeLater">
    <span v-for="tag in modelValue" :key="tag.id" class="tag">
      <DsAvatar :name="tag.label" :src="tag.avatar" size="sm" />
      <span>{{ tag.label }}</span>
      <button type="button" :aria-label="`Remove ${tag.label}`" @click="remove(tag.id)"><DsIcon name="material-symbols:close-rounded" /></button>
    </span>
    <input :value="query" :placeholder="modelValue.length ? '' : placeholder" autocomplete="off" @input="handleInput" @keydown.enter.prevent="suggestions[0] ? select(suggestions[0]) : create()" @keydown.backspace="!query ? removeLast() : undefined" @keydown.escape="open = false" />
    <div v-if="open" class="suggestions">
      <button v-for="item in suggestions" :key="item.id" type="button" @mousedown.prevent @click="select(item)">
        <span v-if="item.icon" class="suggestion-icon"><DsIcon :name="item.icon" /></span>
        <span><strong>{{ item.label }}</strong><small v-if="item.description">{{ item.description }}</small></span>
        <small v-if="item.type">{{ item.type }}</small>
      </button>
    </div>
  </div>
</template>

<style scoped>
.ds-tag-input { position: relative; display: flex; flex-wrap: wrap; align-items: center; gap: var(--ds-space-1); min-width: 0; min-height: 2.25rem; }
.ds-tag-input > input { flex: 1 1 6rem; min-width: 6rem; padding: var(--ds-space-2) 0; border: 0; outline: 0; background: transparent; color: var(--ds-text-primary); font: inherit; }
.tag { display: inline-flex; align-items: center; gap: var(--ds-space-1); padding: 2px var(--ds-space-2) 2px 2px; border: 1px solid var(--ds-border-base); border-radius: var(--ds-radius-full); background: var(--ds-bg-subtle); color: var(--ds-text-primary); font-size: var(--ds-text-xs); }
.tag button { display: grid; padding: 0; border: 0; background: transparent; color: var(--ds-text-secondary); cursor: pointer; }
.suggestions { position: absolute; top: calc(100% + var(--ds-space-1)); left: 0; z-index: var(--ds-z-popover); width: min(28rem, 80vw); overflow: hidden; border: 1px solid var(--ds-border-base); border-radius: var(--ds-radius-lg); background: var(--ds-bg-elevated); box-shadow: var(--ds-shadow-lg); }
.suggestions button { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: var(--ds-space-3); width: 100%; padding: var(--ds-space-2) var(--ds-space-3); border: 0; background: transparent; color: var(--ds-text-primary); text-align: left; cursor: pointer; }.suggestions button:hover { background: var(--ds-bg-hover); }.suggestions button > span:nth-child(2) { display: grid; }.suggestions small { color: var(--ds-text-secondary); }.suggestion-icon { display: grid; place-items: center; width: 2rem; height: 2rem; border-radius: var(--ds-radius-md); background: var(--ds-bg-subtle); }
</style>
