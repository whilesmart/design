<script setup lang="ts">
import DsAvatar from './DsAvatar.vue'
import DsIcon from './DsIcon.vue'

export interface ConversationMessage {
  id: string
  authorId: string
  authorName: string
  authorAvatar?: string
  content: string
  timestamp: string
  own?: boolean
  reactions?: Array<{ emoji: string; count: number; reacted?: boolean }>
  attachment?: { name: string; detail?: string; icon?: `solar:${string}` | `material-symbols:${string}` }
}

defineProps<{
  messages: ConversationMessage[]
  emptyTitle?: string
}>()

const emit = defineEmits<{
  react: [messageId: string, emoji: string]
  openAttachment: [messageId: string]
}>()
</script>

<template>
  <div class="ds-message-thread" role="log" aria-live="polite">
    <div v-if="!messages.length" class="ds-message-thread__empty">
      <DsIcon name="solar:chat-round-dots-bold-duotone" />
      <strong>{{ emptyTitle || 'Start the conversation' }}</strong>
      <span>Write the first message below.</span>
    </div>
    <article v-for="message in messages" :key="message.id" class="ds-message" :class="{ 'ds-message--own': message.own }">
      <DsAvatar :src="message.authorAvatar" :name="message.authorName" size="sm" />
      <div class="ds-message__body">
        <header><strong>{{ message.authorName }}</strong><time>{{ message.timestamp }}</time></header>
        <p>{{ message.content }}</p>
        <button v-if="message.attachment" type="button" class="ds-message__attachment" @click="emit('openAttachment', message.id)">
          <span><DsIcon :name="message.attachment.icon || 'solar:file-bold-duotone'" /></span>
          <span><strong>{{ message.attachment.name }}</strong><small>{{ message.attachment.detail }}</small></span>
          <DsIcon name="solar:arrow-right-linear" />
        </button>
        <div v-if="message.reactions?.length" class="ds-message__reactions">
          <button v-for="reaction in message.reactions" :key="reaction.emoji" type="button" :class="{ active: reaction.reacted }" @click="emit('react', message.id, reaction.emoji)">
            {{ reaction.emoji }} <span>{{ reaction.count }}</span>
          </button>
        </div>
      </div>
    </article>
  </div>
</template>

<style scoped>
.ds-message-thread { display: grid; align-content: start; gap: var(--ds-space-5); min-height: 0; padding: var(--ds-space-6); overflow-y: auto; }
.ds-message { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: var(--ds-space-3); max-width: min(44rem, 88%); }
.ds-message--own { justify-self: end; grid-template-columns: minmax(0, 1fr) auto; }
.ds-message--own > :first-child { grid-column: 2; grid-row: 1; }
.ds-message--own .ds-message__body { grid-column: 1; grid-row: 1; background: var(--ds-chat-own-message); }
.ds-message__body { display: grid; gap: var(--ds-space-2); padding: var(--ds-space-3) var(--ds-space-4); border: 1px solid var(--ds-border-base); border-radius: var(--ds-radius-xl); background: var(--ds-bg-elevated); box-shadow: var(--ds-elevation-1); }
.ds-message__body header { display: flex; align-items: baseline; gap: var(--ds-space-2); }
.ds-message__body header strong { font-size: var(--ds-text-sm); }
.ds-message__body time { color: var(--ds-text-muted); font-size: var(--ds-text-xs); }
.ds-message__body p { margin: 0; color: var(--ds-text-primary); font-size: var(--ds-text-sm); line-height: 1.5; white-space: pre-wrap; }
.ds-message__attachment { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: var(--ds-space-3); min-width: min(22rem, 100%); padding: var(--ds-space-2); border: 1px solid var(--ds-border-base); border-radius: var(--ds-radius-lg); background: color-mix(in srgb, var(--ds-bg-elevated) 78%, transparent); color: var(--ds-text-primary); text-align: left; cursor: pointer; }
.ds-message__attachment > span:first-child { display: grid; width: 2rem; height: 2rem; place-items: center; border-radius: var(--ds-radius-md); background: var(--ds-file-document-bg); color: var(--ds-file-document-ink); }
.ds-message__attachment > span:nth-child(2) { display: grid; }
.ds-message__attachment small { color: var(--ds-text-secondary); }
.ds-message__reactions { display: flex; flex-wrap: wrap; gap: var(--ds-space-1); }
.ds-message__reactions button { padding: 2px var(--ds-space-2); border: 1px solid var(--ds-border-base); border-radius: var(--ds-radius-full); background: var(--ds-bg-surface); color: var(--ds-text-primary); cursor: pointer; }
.ds-message__reactions button.active { border-color: var(--ds-interactive-primary); background: var(--ds-chat-group-bg); }
.ds-message-thread__empty { align-self: center; display: grid; justify-items: center; gap: var(--ds-space-2); color: var(--ds-text-secondary); text-align: center; }
.ds-message-thread__empty > :first-child { font-size: 2.5rem; color: var(--ds-chat-group-ink); }
@media (max-width: 700px) { .ds-message-thread { padding: var(--ds-space-4); }.ds-message { max-width: 96%; } }
</style>
