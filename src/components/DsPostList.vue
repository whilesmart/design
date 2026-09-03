<script setup lang="ts">
import DsAvatar from './DsAvatar.vue'
import DsIcon from './DsIcon.vue'

export type DsIconName = `solar:${string}` | `material-symbols:${string}`

export interface PostAuthor {
  id: string
  name: string
  avatar?: string
}

export interface PostReaction {
  emoji: string
  count: number
  reacted: boolean
}

export interface PostRowView {
  kind: 'day' | 'new-messages' | 'post'
  key: string
  label?: string
  id?: string
  author?: PostAuthor
  content?: string
  time?: string
  edited?: boolean
  system?: boolean
  grouped?: boolean
  mentioned?: boolean
  pinned?: boolean
  saved?: boolean
  reactions?: PostReaction[]
  attachment?: { name: string; detail?: string; icon?: DsIconName }
  threadReplies?: number
  threadParticipants?: PostAuthor[]
  threadLabel?: string
}

withDefaults(defineProps<{
  rows: PostRowView[]
  compact?: boolean
  emptyTitle?: string
  emptyDescription?: string
  showThreadFooter?: boolean
}>(), {
  compact: false,
  emptyTitle: 'No messages yet',
  emptyDescription: 'Write the first message below.',
  showThreadFooter: true
})

const emit = defineEmits<{
  react: [postId: string, emoji: string]
  addReaction: [postId: string]
  openThread: [postId: string]
  togglePin: [postId: string]
  toggleSave: [postId: string]
  openAttachment: [postId: string]
}>()
</script>

<template>
  <div class="ds-post-list" :class="{ 'ds-post-list--compact': compact }" role="log" aria-live="polite">
    <div v-if="!rows.length" class="ds-post-list__empty">
      <span><DsIcon name="solar:chat-round-dots-bold-duotone" /></span>
      <strong>{{ emptyTitle }}</strong>
      <p>{{ emptyDescription }}</p>
    </div>

    <template v-for="row in rows" :key="row.key">
      <div v-if="row.kind === 'day'" class="ds-post-list__divider"><span>{{ row.label }}</span></div>

      <div v-else-if="row.kind === 'new-messages'" class="ds-post-list__new"><span>New messages</span></div>

      <article
        v-else
        class="ds-post"
        :class="{
          'ds-post--grouped': row.grouped,
          'ds-post--mentioned': row.mentioned,
          'ds-post--system': row.system
        }"
      >
        <div class="ds-post__gutter">
          <DsAvatar v-if="!row.grouped && !row.system" :src="row.author?.avatar" :name="row.author?.name || 'Someone'" size="sm" />
          <time v-else-if="!row.system" class="ds-post__hover-time">{{ row.time }}</time>
        </div>

        <div class="ds-post__body">
          <header v-if="!row.grouped && !row.system" class="ds-post__meta">
            <strong>{{ row.author?.name }}</strong>
            <time>{{ row.time }}</time>
            <span v-if="row.edited" class="ds-post__edited">edited</span>
            <span v-if="row.pinned" class="ds-post__flag"><DsIcon name="solar:pin-linear" /> Pinned</span>
            <span v-if="row.saved" class="ds-post__flag"><DsIcon name="solar:bookmark-linear" /> Saved</span>
          </header>

          <p class="ds-post__content">{{ row.content }}</p>

          <button v-if="row.attachment" type="button" class="ds-post__attachment" @click="emit('openAttachment', row.id!)">
            <span><DsIcon :name="row.attachment.icon || 'solar:file-bold-duotone'" /></span>
            <span><strong>{{ row.attachment.name }}</strong><small>{{ row.attachment.detail }}</small></span>
            <DsIcon name="solar:arrow-right-linear" />
          </button>

          <div v-if="row.reactions?.length" class="ds-post__reactions">
            <button
              v-for="reaction in row.reactions"
              :key="reaction.emoji"
              type="button"
              :class="{ 'is-reacted': reaction.reacted }"
              @click="emit('react', row.id!, reaction.emoji)"
            >
              {{ reaction.emoji }} <span>{{ reaction.count }}</span>
            </button>
            <button type="button" class="ds-post__add-reaction" title="Add a reaction" @click="emit('addReaction', row.id!)">
              <DsIcon name="solar:smile-circle-linear" />
            </button>
          </div>

          <button
            v-if="showThreadFooter && row.threadReplies"
            type="button"
            class="ds-post__thread"
            @click="emit('openThread', row.id!)"
          >
            <span class="ds-post__thread-faces">
              <DsAvatar v-for="person in row.threadParticipants" :key="person.id" :src="person.avatar" :name="person.name" size="sm" />
            </span>
            <span>{{ row.threadReplies }} {{ row.threadReplies === 1 ? 'reply' : 'replies' }}</span>
            <small v-if="row.threadLabel">{{ row.threadLabel }}</small>
          </button>
        </div>

        <div v-if="!row.system" class="ds-post__actions">
          <button type="button" title="Add a reaction" @click="emit('addReaction', row.id!)"><DsIcon name="solar:smile-circle-linear" /></button>
          <button v-if="showThreadFooter" type="button" title="Reply in thread" @click="emit('openThread', row.id!)"><DsIcon name="solar:reply-linear" /></button>
          <button type="button" :title="row.saved ? 'Remove from saved' : 'Save this message'" @click="emit('toggleSave', row.id!)"><DsIcon name="solar:bookmark-linear" /></button>
          <button type="button" :title="row.pinned ? 'Unpin from channel' : 'Pin to channel'" @click="emit('togglePin', row.id!)"><DsIcon name="solar:pin-linear" /></button>
        </div>
      </article>
    </template>
  </div>
</template>

<style scoped>
.ds-post-list { display: grid; align-content: start; min-height: 0; padding-block: var(--ds-space-4); overflow-y: auto; background: var(--ds-chat-post-bg); }

.ds-post-list__divider,
.ds-post-list__new { display: grid; align-items: center; margin-block: var(--ds-space-4); padding-inline: var(--ds-space-5); }
.ds-post-list__divider > span,
.ds-post-list__new > span { position: relative; justify-self: center; padding-inline: var(--ds-space-3); background: var(--ds-chat-post-bg); color: var(--ds-chat-secondary-ink); font-size: var(--ds-text-xs); font-weight: var(--ds-font-semibold); }
.ds-post-list__divider { border-bottom: 1px solid var(--ds-chat-day-rule); height: 0; }
.ds-post-list__divider > span { transform: translateY(-50%); }
.ds-post-list__new { position: sticky; top: 0; z-index: 1; border-bottom: 1px solid var(--ds-chat-new-rule); height: 0; }
.ds-post-list__new > span { justify-self: end; transform: translateY(-50%); color: var(--ds-chat-new-ink); }

.ds-post { position: relative; display: grid; grid-template-columns: var(--ds-chat-post-gutter) minmax(0, 1fr); margin-top: var(--ds-space-2); padding: var(--ds-space-2) var(--ds-space-5); }
.ds-post--grouped { margin-top: 0; padding-block: var(--ds-space-1); }
.ds-post:hover { background: var(--ds-chat-post-hover); }
.ds-post--mentioned { background: var(--ds-chat-mention-highlight); box-shadow: inset 3px 0 0 var(--ds-chat-mention-rule); }
.ds-post--mentioned, .ds-post--mentioned .ds-post__content, .ds-post--mentioned .ds-post__meta strong { color: var(--ds-chat-mention-body-ink); }
.ds-post--mentioned .ds-post__meta time { color: var(--ds-chat-mention-body-ink); opacity: .75; }
.ds-post--system { color: var(--ds-chat-secondary-ink); font-style: italic; }

.ds-post__gutter { display: grid; place-items: start center; padding-top: 2px; }
.ds-post__gutter :deep(.ds-avatar) { width: 2.25rem; height: 2.25rem; border-radius: var(--ds-radius-md); }
.ds-post__hover-time { color: var(--ds-chat-timestamp-ink); font-size: var(--ds-text-xs); opacity: 0; }
.ds-post:hover .ds-post__hover-time { opacity: 1; }

.ds-post__body { display: grid; gap: var(--ds-space-1); min-width: 0; }
.ds-post__meta { display: flex; align-items: baseline; flex-wrap: wrap; gap: var(--ds-space-2); }
.ds-post__meta strong { font-size: var(--ds-text-sm); }
.ds-post__meta time, .ds-post__edited { color: var(--ds-chat-timestamp-ink); font-size: var(--ds-text-xs); }
.ds-post__flag { display: inline-flex; align-items: center; gap: 2px; padding: 0 var(--ds-space-1); border-radius: var(--ds-radius-sm); background: var(--ds-chat-saved-bg); color: var(--ds-chat-saved-ink); font-size: var(--ds-text-xs); font-weight: var(--ds-font-semibold); }
.ds-post__content { margin: 0; color: var(--ds-text-primary); font-size: var(--ds-text-sm); line-height: 1.55; white-space: pre-wrap; overflow-wrap: anywhere; }

.ds-post__attachment { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: var(--ds-space-3); justify-self: start; min-width: min(22rem, 100%); margin-top: var(--ds-space-1); padding: var(--ds-space-2); border: 1px solid var(--ds-border-base); border-radius: var(--ds-radius-lg); background: var(--ds-bg-elevated); color: var(--ds-text-primary); font: inherit; text-align: left; cursor: pointer; }
.ds-post__attachment > span:first-child { display: grid; width: 2rem; height: 2rem; place-items: center; border-radius: var(--ds-radius-md); background: var(--ds-file-document-bg); color: var(--ds-file-document-ink); }
.ds-post__attachment > span:nth-child(2) { display: grid; min-width: 0; }
.ds-post__attachment strong { font-size: var(--ds-text-sm); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ds-post__attachment small { color: var(--ds-chat-secondary-ink); font-size: var(--ds-text-xs); }

.ds-post__reactions { display: flex; flex-wrap: wrap; gap: var(--ds-space-1); margin-top: var(--ds-space-1); }
.ds-post__reactions button { display: inline-flex; align-items: center; gap: 3px; height: 1.375rem; padding-inline: var(--ds-space-2); border: 1px solid var(--ds-border-strong); border-radius: var(--ds-radius-full); background: var(--ds-bg-surface); color: var(--ds-chat-secondary-ink); font: inherit; font-size: var(--ds-text-xs); cursor: pointer; }
.ds-post__reactions button.is-reacted { border-color: var(--ds-interactive-primary); background: var(--ds-chat-active-bg); color: var(--ds-chat-active-ink); font-weight: var(--ds-font-semibold); }
.ds-post__add-reaction { opacity: 0; }
.ds-post:hover .ds-post__add-reaction, .ds-post:focus-within .ds-post__add-reaction { opacity: 1; }

.ds-post__thread { display: inline-flex; align-items: center; gap: var(--ds-space-2); justify-self: start; margin-top: var(--ds-space-1); padding: var(--ds-space-1) var(--ds-space-2); border: 0; border-radius: var(--ds-radius-md); background: transparent; color: var(--ds-interactive-primary); font: inherit; font-size: var(--ds-text-xs); font-weight: var(--ds-font-semibold); cursor: pointer; }
.ds-post__thread:hover { background: var(--ds-bg-hover); }
.ds-post__thread-faces { display: flex; }
.ds-post__thread-faces :deep(.ds-avatar) { width: 1.25rem; height: 1.25rem; border-radius: var(--ds-radius-sm); }
.ds-post__thread-faces :deep(.ds-avatar + .ds-avatar) { margin-left: -0.375rem; }
.ds-post__thread small { color: var(--ds-chat-secondary-ink); font-weight: var(--ds-font-normal); }

.ds-post__actions { position: absolute; top: -0.75rem; right: var(--ds-space-5); display: none; gap: 2px; padding: 2px; border: 1px solid var(--ds-border-base); border-radius: var(--ds-radius-lg); background: var(--ds-bg-elevated); box-shadow: var(--ds-elevation-2); }
.ds-post:hover .ds-post__actions, .ds-post:focus-within .ds-post__actions { display: flex; }
.ds-post__actions button { display: grid; width: 1.75rem; height: 1.75rem; place-items: center; border: 0; border-radius: var(--ds-radius-md); background: transparent; color: var(--ds-chat-secondary-ink); cursor: pointer; }
.ds-post__actions button:hover { background: var(--ds-bg-hover); color: var(--ds-text-primary); }

.ds-post-list--compact .ds-post { grid-template-columns: minmax(0, 1fr); padding-block: 2px; }
.ds-post-list--compact .ds-post__gutter { display: none; }
.ds-post-list--compact .ds-post__meta { display: inline-flex; margin-right: var(--ds-space-2); }
.ds-post-list--compact .ds-post__body { display: block; }
.ds-post-list--compact .ds-post__content { display: inline; }

.ds-post-list__empty { display: grid; justify-items: center; gap: var(--ds-space-2); padding: var(--ds-space-10) var(--ds-space-5); color: var(--ds-chat-secondary-ink); text-align: center; }
.ds-post-list__empty > span { display: grid; width: 3rem; height: 3rem; place-items: center; border-radius: var(--ds-radius-xl); background: var(--ds-chat-group-bg); color: var(--ds-chat-group-ink); font-size: 1.6rem; }
.ds-post-list__empty p { max-width: 20rem; margin: 0; font-size: var(--ds-text-sm); }

@media (max-width: 700px) {
  .ds-post { padding-inline: var(--ds-space-4); }
  .ds-post__actions { right: var(--ds-space-4); }
}
</style>
