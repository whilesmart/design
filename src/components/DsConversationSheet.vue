<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import DsIcon from './DsIcon.vue'
import DsIconButton from './DsIconButton.vue'
import DsMessageComposer from './DsMessageComposer.vue'
import DsPostList, { type PostRowView } from './DsPostList.vue'

export interface ConversationSheetTarget {
  ownerType: string
  ownerId: string
  ownerName: string
  ownerHref?: string
  participants?: string[]
  icon?: `solar:${string}` | `material-symbols:${string}`
  detail?: string
}

const props = withDefaults(defineProps<{
  open: boolean
  target?: ConversationSheetTarget | null
  rows?: PostRowView[]
  modelValue?: string
  sending?: boolean
}>(), {
  target: null,
  rows: () => [],
  modelValue: '',
  sending: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:open': [value: boolean]
  send: [value: string]
  openFull: []
}>()

const composer = ref<InstanceType<typeof DsMessageComposer> | null>(null)
const list = ref<HTMLElement | null>(null)

async function scrollToLatest(): Promise<void> {
  await nextTick()
  const scroller = list.value?.querySelector('.ds-post-list')
  if (scroller) scroller.scrollTop = scroller.scrollHeight
}

watch(() => props.open, async isOpen => {
  if (!isOpen) return
  await scrollToLatest()
  composer.value?.focus()
})

watch(() => props.rows.length, () => void scrollToLatest())

function close(): void {
  emit('update:open', false)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open && target" class="ds-sheet" role="dialog" :aria-label="`Discuss ${target.ownerName}`" @keydown.esc="close">
      <div class="ds-sheet__scrim" @click="close" />

      <section class="ds-sheet__panel">
        <header class="ds-sheet__header">
          <span class="ds-sheet__mark"><DsIcon :name="target.icon || 'solar:link-circle-bold-duotone'" /></span>
          <span class="ds-sheet__title">
            <strong>{{ target.ownerName }}</strong>
            <small>{{ target.detail || `Conversation about this ${target.ownerType}` }}</small>
          </span>
          <span class="ds-sheet__actions">
            <DsIconButton icon="solar:arrow-right-up-linear" title="Open the full conversation in Chat" @click="emit('openFull')" />
            <DsIconButton icon="solar:close-circle-linear" title="Close" @click="close" />
          </span>
        </header>

        <ul v-if="target.participants?.length" class="ds-sheet__people">
          <li v-for="participant in target.participants" :key="participant">
            <DsIcon name="solar:user-rounded-bold-duotone" /> {{ participant }}
          </li>
        </ul>

        <div ref="list" class="ds-sheet__thread">
          <DsPostList
            :rows="rows"
            :show-thread-footer="false"
            :empty-title="`Talk about ${target.ownerName}`"
            empty-description="Write below and it stays here, attached to this work. Open the full conversation when you want the whole room."
          />
        </div>

        <div class="ds-sheet__composer">
          <DsMessageComposer
            ref="composer"
            :model-value="modelValue"
            :sending="sending"
            :formatting="false"
            compact
            placeholder="Write a message"
            @update:model-value="emit('update:modelValue', $event)"
            @send="emit('send', $event)"
          />
        </div>

      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.ds-sheet { position: fixed; inset: 0; z-index: var(--ds-z-modal); display: grid; align-items: end; justify-items: end; pointer-events: none; }
/* On a wide screen this panel sits beside work the reader is still using, so the scrim only catches
   the dismissing click. It dims the page only where the sheet covers most of it. */
.ds-sheet__scrim { position: absolute; inset: 0; pointer-events: auto; }
.ds-sheet__panel { position: relative; pointer-events: auto; display: grid; grid-template-rows: auto auto minmax(0, 1fr) auto; width: min(30rem, calc(100% - var(--ds-space-8))); height: min(42rem, calc(100vh - var(--ds-space-8))); margin: var(--ds-space-4); border: 1px solid var(--ds-border-base); border-radius: var(--ds-radius-2xl); background: var(--ds-bg-elevated); box-shadow: var(--ds-elevation-5); overflow: hidden; animation: ds-sheet-rise var(--ds-transition-base); }

@keyframes ds-sheet-rise { from { transform: translateY(1rem); opacity: 0; } to { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .ds-sheet__panel { animation: none; } }

.ds-sheet__header { grid-row: 1; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: var(--ds-space-3); padding: var(--ds-space-4); border-bottom: 1px solid var(--ds-border-base); }
.ds-sheet__mark { display: grid; width: 2.25rem; height: 2.25rem; place-items: center; border-radius: var(--ds-radius-md); background: var(--ds-chat-context-bg); color: var(--ds-chat-context-ink); font-size: 1.125rem; }
.ds-sheet__title { display: grid; min-width: 0; }
.ds-sheet__title strong { font-size: var(--ds-text-sm); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ds-sheet__actions { display: flex; align-items: center; gap: 2px; }
.ds-sheet__title small { color: var(--ds-chat-secondary-ink); font-size: var(--ds-text-xs); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.ds-sheet__people { grid-row: 2; display: flex; flex-wrap: wrap; gap: var(--ds-space-2); margin: 0; padding: var(--ds-space-3) var(--ds-space-4); border-bottom: 1px solid var(--ds-border-base); list-style: none; }
.ds-sheet__people li { display: inline-flex; align-items: center; gap: var(--ds-space-1); padding: 2px var(--ds-space-2); border-radius: var(--ds-radius-full); background: var(--ds-chat-group-bg); color: var(--ds-chat-group-ink); font-size: var(--ds-text-xs); }

.ds-sheet__thread { grid-row: 3; display: grid; min-height: 0; }
.ds-sheet__thread :deep(.ds-post-list) { padding-block: var(--ds-space-3); }
.ds-sheet__thread :deep(.ds-post) { padding-inline: var(--ds-space-4); }
.ds-sheet__thread :deep(.ds-post__actions) { display: none; }
.ds-sheet__thread :deep(.ds-post-list__empty) { padding: var(--ds-space-8) var(--ds-space-5); }
.ds-sheet__thread :deep(.ds-post-list:has(.ds-post-list__empty)) { align-content: center; }

/* The composer is the floor of the sheet, so it loses the card treatment it carries in the chat app:
   a bordered box inset from three edges reads as floating rather than anchored. */
.ds-sheet__composer { grid-row: 4; padding: 0; border-top: 1px solid var(--ds-border-base); background: var(--ds-bg-elevated); }
.ds-sheet__composer :deep(.ds-message-composer),
.ds-sheet__composer :deep(.ds-message-composer:focus-within) { border: 0; border-radius: 0; box-shadow: none; padding: var(--ds-space-2) var(--ds-space-4) var(--ds-space-3); background: transparent; }

@media (max-width: 700px) {
  .ds-sheet { justify-items: stretch; }
  .ds-sheet__scrim { background: var(--ds-bg-overlay); }
  .ds-sheet__panel { width: auto; height: 88vh; margin: 0; border-width: 1px 0 0; border-radius: var(--ds-radius-2xl) var(--ds-radius-2xl) 0 0; padding-bottom: env(safe-area-inset-bottom); }
}
</style>
