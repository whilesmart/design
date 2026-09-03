<script setup lang="ts">
import DsAvatar from './DsAvatar.vue'
import DsIcon from './DsIcon.vue'
import DsChip from './DsChip.vue'

export interface ConversationListItem {
  id: string
  title: string
  preview: string
  timestamp: string
  unread?: number
  avatar?: string
  initials?: string
  kind?: 'direct' | 'group' | 'context'
  contextLabel?: string
  muted?: boolean
  pinned?: boolean
}

withDefaults(defineProps<{
  conversations: ConversationListItem[]
  selectedId?: string
  emptyTitle?: string
  emptyDescription?: string
}>(), {
  selectedId: '',
  emptyTitle: 'No conversations yet',
  emptyDescription: 'Start a conversation with a person or from the work you are sharing.'
})

const emit = defineEmits<{ select: [conversation: ConversationListItem] }>()
</script>

<template>
  <div class="ds-conversation-list">
    <button
      v-for="conversation in conversations"
      :key="conversation.id"
      type="button"
      class="ds-conversation-list__item"
      :class="{ 'ds-conversation-list__item--active': conversation.id === selectedId }"
      @click="emit('select', conversation)"
    >
      <span class="ds-conversation-list__avatar" :class="`ds-conversation-list__avatar--${conversation.kind || 'direct'}`">
        <DsAvatar v-if="conversation.kind === 'direct'" :src="conversation.avatar" :name="conversation.title" />
        <DsIcon v-else :name="conversation.kind === 'context' ? 'solar:link-circle-bold-duotone' : 'solar:users-group-rounded-bold-duotone'" />
        <span v-if="conversation.kind === 'direct'" class="ds-conversation-list__presence" />
      </span>
      <span class="ds-conversation-list__content">
        <span class="ds-conversation-list__heading">
          <strong>{{ conversation.title }}</strong>
          <small>{{ conversation.timestamp }}</small>
        </span>
        <span v-if="conversation.contextLabel" class="ds-conversation-list__context">
          <DsIcon name="solar:link-linear" /> {{ conversation.contextLabel }}
        </span>
        <span class="ds-conversation-list__summary">
          <span>{{ conversation.preview }}</span>
          <DsChip v-if="conversation.unread" variant="primary">{{ conversation.unread }}</DsChip>
          <DsIcon v-else-if="conversation.muted" name="solar:bell-off-linear" />
        </span>
      </span>
    </button>

    <div v-if="!conversations.length" class="ds-conversation-list__empty">
      <span><DsIcon name="solar:chat-round-dots-bold-duotone" /></span>
      <strong>{{ emptyTitle }}</strong>
      <p>{{ emptyDescription }}</p>
    </div>
  </div>
</template>

<style scoped>
.ds-conversation-list { display: grid; align-content: start; min-width: 0; }
.ds-conversation-list__item { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: var(--ds-space-3); width: 100%; padding: var(--ds-space-3); border: 0; border-radius: var(--ds-radius-lg); background: transparent; color: var(--ds-text-primary); text-align: left; cursor: pointer; transition: background var(--ds-transition-fast); }
.ds-conversation-list__item:hover { background: var(--ds-bg-hover); }
.ds-conversation-list__item--active { background: var(--ds-chat-group-bg); color: var(--ds-chat-group-ink); }
.ds-conversation-list__avatar { position: relative; display: grid; width: 2.5rem; height: 2.5rem; place-items: center; border-radius: var(--ds-radius-lg); font-size: 1.25rem; }
.ds-conversation-list__avatar--group { background: var(--ds-chat-group-bg); color: var(--ds-chat-group-ink); }
.ds-conversation-list__avatar--context { background: var(--ds-chat-context-bg); color: var(--ds-chat-context-ink); }
.ds-conversation-list__presence { position: absolute; right: -1px; bottom: -1px; width: 0.7rem; height: 0.7rem; border: 2px solid var(--ds-bg-surface); border-radius: var(--ds-radius-full); background: var(--ds-chat-online); }
.ds-conversation-list__content, .ds-conversation-list__heading, .ds-conversation-list__summary { min-width: 0; }
.ds-conversation-list__content { display: grid; gap: 2px; }
.ds-conversation-list__heading, .ds-conversation-list__summary { display: flex; align-items: center; gap: var(--ds-space-2); }
.ds-conversation-list__heading strong, .ds-conversation-list__summary span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ds-conversation-list__heading strong { flex: 1; font-size: var(--ds-text-sm); }
.ds-conversation-list__heading small, .ds-conversation-list__summary, .ds-conversation-list__context { color: var(--ds-text-secondary); font-size: var(--ds-text-xs); }
.ds-conversation-list__context { display: flex; align-items: center; gap: var(--ds-space-1); color: var(--ds-chat-context-ink); }
.ds-conversation-list__summary > span { flex: 1; }
.ds-conversation-list__summary :deep(.ds-chip) { min-width: 1.25rem; justify-content: center; padding-inline: var(--ds-space-1); }
.ds-conversation-list__empty { display: grid; justify-items: center; gap: var(--ds-space-2); padding: var(--ds-space-10) var(--ds-space-5); color: var(--ds-text-secondary); text-align: center; }
.ds-conversation-list__empty > span { display: grid; width: 3rem; height: 3rem; place-items: center; border-radius: var(--ds-radius-xl); background: var(--ds-chat-group-bg); color: var(--ds-chat-group-ink); font-size: 1.6rem; }
.ds-conversation-list__empty p { max-width: 18rem; margin: 0; font-size: var(--ds-text-sm); }
</style>
