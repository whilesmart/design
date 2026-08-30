<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import DsIcon from './DsIcon.vue'
import type { SearchSuggestion } from './DsSearchInput.vue'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  provider: (query: string) => Promise<SearchSuggestion[]>
}>(), { modelValue: '', placeholder: '' })

const emit = defineEmits<{
  'update:modelValue': [value: string]
  select: [item: SearchSuggestion]
  submit: []
}>()

const suggestions = ref<SearchSuggestion[]>([])
const open = ref(false)
const loading = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined
let request = 0

watch(() => props.modelValue, value => {
  clearTimeout(timer)
  const query = value.trim()
  if (!query) { suggestions.value = []; open.value = false; return }
  const current = ++request
  timer = setTimeout(async () => {
    loading.value = true
    try {
      const results = await props.provider(query)
      if (current === request) { suggestions.value = results; open.value = results.length > 0 }
    } catch {
      if (current === request) { suggestions.value = []; open.value = false }
    } finally { if (current === request) loading.value = false }
  }, 180)
})

function select(item: SearchSuggestion) { emit('select', item); open.value = false }
function submit() { if (suggestions.value[0]) select(suggestions.value[0]); else emit('submit') }
onUnmounted(() => clearTimeout(timer))
</script>

<template>
  <div class="ds-autocomplete">
    <input :value="modelValue" :placeholder="placeholder" autocomplete="off" @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)" @focus="open = suggestions.length > 0" @keydown.enter.prevent="submit" @keydown.escape="open = false" />
    <span v-if="loading" class="loading-dot"></span>
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
.ds-autocomplete { position: relative; min-width: 0; }
.ds-autocomplete > input { width: 100%; padding: var(--ds-space-2) 0; border: 0; outline: 0; background: transparent; color: var(--ds-text-primary); font: inherit; }
.suggestions { position: absolute; top: calc(100% + var(--ds-space-1)); left: 0; z-index: var(--ds-z-popover); width: min(28rem, 80vw); overflow: hidden; border: 1px solid var(--ds-border-base); border-radius: var(--ds-radius-lg); background: var(--ds-bg-elevated); box-shadow: var(--ds-shadow-lg); }
.suggestions button { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: var(--ds-space-3); width: 100%; padding: var(--ds-space-2) var(--ds-space-3); border: 0; background: transparent; color: var(--ds-text-primary); text-align: left; cursor: pointer; }
.suggestions button:hover { background: var(--ds-bg-hover); }.suggestions button > span:nth-child(2) { display: grid; min-width: 0; }.suggestions small { color: var(--ds-text-secondary); }.suggestion-icon { display: grid; place-items: center; width: 2rem; height: 2rem; border-radius: var(--ds-radius-md); background: var(--ds-bg-subtle); }
.loading-dot { position: absolute; top: 50%; right: 0; width: .45rem; height: .45rem; border-radius: var(--ds-radius-full); background: var(--ds-color-primary-500); transform: translateY(-50%); }
</style>
