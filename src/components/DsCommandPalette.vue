<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import DsIcon from './DsIcon.vue'

export interface CommandPaletteItem {
  id: string
  label: string
  detail?: string
  icon?: `solar:${string}` | `material-symbols:${string}`
  group?: string
}

const props = withDefaults(defineProps<{
  open: boolean
  modelValue?: string
  items: CommandPaletteItem[]
  placeholder?: string
  emptyTitle?: string
  emptyDescription?: string
  hint?: string
}>(), {
  modelValue: '',
  placeholder: 'Jump to a conversation',
  emptyTitle: 'Nothing matches',
  emptyDescription: 'Try a shorter search, or part of a person’s name.',
  hint: '↑↓ to move · Enter to open · Esc to close'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  select: [item: CommandPaletteItem]
  close: []
}>()

const activeIndex = ref(0)
const field = ref<HTMLInputElement>()

const groups = computed(() => {
  const buckets = new Map<string, CommandPaletteItem[]>()
  for (const item of props.items) {
    const key = item.group || ''
    buckets.set(key, [...(buckets.get(key) || []), item])
  }
  return [...buckets.entries()].map(([label, items]) => ({ label, items }))
})

watch(() => props.items, () => { activeIndex.value = 0 })
watch(() => props.open, async isOpen => {
  if (!isOpen) return
  activeIndex.value = 0
  await nextTick()
  field.value?.focus()
})

function move(step: number): void {
  if (!props.items.length) return
  activeIndex.value = (activeIndex.value + step + props.items.length) % props.items.length
}

function choose(item?: CommandPaletteItem): void {
  const target = item ?? props.items[activeIndex.value]
  if (target) emit('select', target)
}
</script>

<template>
  <div v-if="open" class="ds-palette" role="dialog" aria-modal="true" aria-label="Quick switcher" @click.self="emit('close')">
    <div class="ds-palette__panel">
      <div class="ds-palette__field">
        <DsIcon name="solar:magnifer-line-duotone" />
        <input
          ref="field"
          type="text"
          :value="modelValue"
          :placeholder="placeholder"
          @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
          @keydown.down.prevent="move(1)"
          @keydown.up.prevent="move(-1)"
          @keydown.enter.prevent="choose()"
          @keydown.esc.prevent="emit('close')"
        >
      </div>

      <div v-if="items.length" class="ds-palette__results">
        <section v-for="group in groups" :key="group.label">
          <h2 v-if="group.label">{{ group.label }}</h2>
          <button
            v-for="item in group.items"
            :key="item.id"
            type="button"
            :class="{ 'is-active': items.indexOf(item) === activeIndex }"
            @mouseenter="activeIndex = items.indexOf(item)"
            @click="choose(item)"
          >
            <DsIcon v-if="item.icon" :name="item.icon" />
            <span>{{ item.label }}</span>
            <small v-if="item.detail">{{ item.detail }}</small>
          </button>
        </section>
      </div>

      <div v-else class="ds-palette__empty">
        <strong>{{ emptyTitle }}</strong>
        <p>{{ emptyDescription }}</p>
      </div>

      <footer class="ds-palette__hint">{{ hint }}</footer>
    </div>
  </div>
</template>

<style scoped>
.ds-palette { position: fixed; inset: 0; z-index: var(--ds-z-modal); display: grid; align-items: start; justify-items: center; padding: 12vh var(--ds-space-4) var(--ds-space-4); background: var(--ds-bg-overlay); }
.ds-palette__panel { display: grid; grid-template-rows: auto minmax(0, 1fr) auto; width: min(34rem, 100%); max-height: 60vh; border: 1px solid var(--ds-border-base); border-radius: var(--ds-radius-2xl); background: var(--ds-bg-elevated); box-shadow: var(--ds-elevation-5); overflow: hidden; }
.ds-palette__field { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: var(--ds-space-3); padding: var(--ds-space-4); border-bottom: 1px solid var(--ds-border-base); color: var(--ds-text-muted); font-size: 1.125rem; }
.ds-palette__field input { border: 0; background: transparent; color: var(--ds-text-primary); font: inherit; font-size: var(--ds-text-base); outline: none; }
.ds-palette__results { display: grid; align-content: start; gap: var(--ds-space-2); padding: var(--ds-space-2); overflow-y: auto; }
.ds-palette__results section { display: grid; gap: 1px; }
.ds-palette__results h2 { margin: 0; padding: var(--ds-space-2) var(--ds-space-3) var(--ds-space-1); color: var(--ds-text-muted); font-size: var(--ds-text-xs); font-weight: var(--ds-font-semibold); letter-spacing: 0.06em; text-transform: uppercase; }
.ds-palette__results button { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: var(--ds-space-3); padding: var(--ds-space-2) var(--ds-space-3); border: 0; border-radius: var(--ds-radius-md); background: transparent; color: var(--ds-text-primary); font: inherit; font-size: var(--ds-text-sm); text-align: left; cursor: pointer; }
.ds-palette__results button.is-active { background: var(--ds-chat-active-bg); color: var(--ds-chat-active-ink); }
.ds-palette__results button > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ds-palette__results small { color: var(--ds-text-muted); font-size: var(--ds-text-xs); }
.ds-palette__empty { display: grid; gap: var(--ds-space-1); padding: var(--ds-space-8) var(--ds-space-5); color: var(--ds-text-secondary); text-align: center; }
.ds-palette__empty p { max-width: 22rem; margin: 0 auto; font-size: var(--ds-text-sm); }
.ds-palette__hint { padding: var(--ds-space-2) var(--ds-space-4); border-top: 1px solid var(--ds-border-base); background: var(--ds-bg-surface); color: var(--ds-text-muted); font-size: var(--ds-text-xs); }
@media (max-width: 700px) {
  .ds-palette { padding: 0; }
  .ds-palette__panel { width: 100%; max-height: 100vh; height: 100vh; border: 0; border-radius: 0; }
}
</style>
