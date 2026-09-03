<script setup lang="ts">
import { computed, ref } from 'vue'

interface EmojiGroup {
  label: string
  emojis: string[]
}

const GROUPS: EmojiGroup[] = [
  { label: 'Reactions', emojis: ['👍', '👎', '✅', '❌', '👀', '🙌', '🙏', '💯', '🔥', '🎉', '⚡', '🚀'] },
  { label: 'Faces', emojis: ['🙂', '😄', '😅', '😂', '🤔', '😍', '😮', '😢', '😴', '🤝', '🫡', '🤯'] },
  { label: 'Work', emojis: ['📌', '📎', '🗓️', '📊', '📝', '🐛', '🔧', '🧪', '📦', '🔍', '💡', '⏰'] }
]

withDefaults(defineProps<{ recent?: string[] }>(), { recent: () => [] })

const emit = defineEmits<{ select: [emoji: string]; close: [] }>()

const query = ref('')

const groups = computed<EmojiGroup[]>(() => {
  const needle = query.value.trim().toLowerCase()
  if (!needle) return GROUPS
  return GROUPS.map(group => ({
    label: group.label,
    emojis: group.label.toLowerCase().includes(needle) ? group.emojis : []
  })).filter(group => group.emojis.length)
})
</script>

<template>
  <div class="ds-emoji-picker" role="dialog" aria-label="Pick an emoji">
    <input v-model="query" type="text" placeholder="Search groups" aria-label="Search emoji groups">

    <section v-if="recent.length && !query.trim()">
      <h2>Recent</h2>
      <div class="ds-emoji-picker__grid">
        <button v-for="emoji in recent" :key="`recent-${emoji}`" type="button" @click="emit('select', emoji)">{{ emoji }}</button>
      </div>
    </section>

    <section v-for="group in groups" :key="group.label">
      <h2>{{ group.label }}</h2>
      <div class="ds-emoji-picker__grid">
        <button v-for="emoji in group.emojis" :key="emoji" type="button" @click="emit('select', emoji)">{{ emoji }}</button>
      </div>
    </section>

    <p v-if="!groups.length" class="ds-emoji-picker__empty">No group by that name. Clear the search to see them all.</p>
  </div>
</template>

<style scoped>
.ds-emoji-picker { display: grid; align-content: start; gap: var(--ds-space-3); width: min(18rem, 100%); max-height: 20rem; padding: var(--ds-space-3); border: 1px solid var(--ds-border-base); border-radius: var(--ds-radius-xl); background: var(--ds-bg-elevated); box-shadow: var(--ds-elevation-3); overflow-y: auto; }
.ds-emoji-picker > input { width: 100%; padding: var(--ds-space-2); border: 1px solid var(--ds-border-base); border-radius: var(--ds-radius-md); background: var(--ds-bg-surface); color: var(--ds-text-primary); font: inherit; font-size: var(--ds-text-sm); }
.ds-emoji-picker section { display: grid; gap: var(--ds-space-1); }
.ds-emoji-picker h2 { margin: 0; color: var(--ds-text-muted); font-size: var(--ds-text-xs); font-weight: var(--ds-font-semibold); letter-spacing: 0.06em; text-transform: uppercase; }
.ds-emoji-picker__grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 2px; }
.ds-emoji-picker__grid button { display: grid; height: 2rem; place-items: center; border: 0; border-radius: var(--ds-radius-md); background: transparent; font-size: 1.125rem; cursor: pointer; }
.ds-emoji-picker__grid button:hover { background: var(--ds-bg-hover); }
.ds-emoji-picker__empty { margin: 0; color: var(--ds-text-secondary); font-size: var(--ds-text-sm); }
</style>
