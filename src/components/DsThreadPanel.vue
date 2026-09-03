<script setup lang="ts">
import DsIconButton from './DsIconButton.vue'
import DsMessageComposer from './DsMessageComposer.vue'
import DsPostList, { type PostRowView } from './DsPostList.vue'

withDefaults(defineProps<{
  rootRow: PostRowView
  replyRows: PostRowView[]
  modelValue?: string
  following?: boolean
  compact?: boolean
}>(), {
  modelValue: '',
  following: true,
  compact: false
})

const emit = defineEmits<{
  close: []
  send: [value: string]
  'update:modelValue': [value: string]
  toggleFollow: []
  react: [postId: string, emoji: string]
  addReaction: [postId: string]
  toggleSave: [postId: string]
  togglePin: [postId: string]
  openAttachment: [postId: string]
}>()
</script>

<template>
  <div class="ds-thread-panel">
    <header>
      <span><strong>Thread</strong><small>{{ replyRows.length }} {{ replyRows.length === 1 ? 'reply' : 'replies' }}</small></span>
      <span class="ds-thread-panel__controls">
        <DsIconButton
          :icon="following ? 'solar:bell-bing-bold-duotone' : 'solar:bell-off-linear'"
          :title="following ? 'Stop following this thread' : 'Follow this thread'"
          :active="following"
          @click="emit('toggleFollow')"
        />
        <DsIconButton icon="solar:close-circle-linear" title="Close thread" @click="emit('close')" />
      </span>
    </header>

    <DsPostList
      class="ds-thread-panel__root"
      :rows="[rootRow]"
      :compact="compact"
      :show-thread-footer="false"
      @react="(postId, emoji) => emit('react', postId, emoji)"
      @add-reaction="emit('addReaction', $event)"
      @toggle-save="emit('toggleSave', $event)"
      @toggle-pin="emit('togglePin', $event)"
      @open-attachment="emit('openAttachment', $event)"
    />

    <div class="ds-thread-panel__divider">
      <span>{{ replyRows.length ? `${replyRows.length} ${replyRows.length === 1 ? 'reply' : 'replies'}` : 'No replies yet' }}</span>
    </div>

    <DsPostList
      class="ds-thread-panel__replies"
      :rows="replyRows"
      :compact="compact"
      :show-thread-footer="false"
      empty-title="No replies yet"
      empty-description="Reply below to keep this discussion out of the main channel."
      @react="(postId, emoji) => emit('react', postId, emoji)"
      @add-reaction="emit('addReaction', $event)"
      @toggle-save="emit('toggleSave', $event)"
      @toggle-pin="emit('togglePin', $event)"
      @open-attachment="emit('openAttachment', $event)"
    />

    <div class="ds-thread-panel__composer">
      <DsMessageComposer
        :model-value="modelValue"
        placeholder="Reply to thread"
        :formatting="false"
        compact
        @update:model-value="emit('update:modelValue', $event)"
        @send="emit('send', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.ds-thread-panel { display: grid; grid-template-rows: auto auto auto minmax(0, 1fr) auto; min-width: 0; height: 100%; background: var(--ds-chat-sidebar-bg); }
.ds-thread-panel > header { display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-2); min-height: 3.5rem; padding: var(--ds-space-2) var(--ds-space-4); border-bottom: 1px solid var(--ds-border-base); }
.ds-thread-panel > header > span:first-child { display: grid; }
.ds-thread-panel > header strong { font-size: var(--ds-text-sm); }
.ds-thread-panel > header small { color: var(--ds-chat-secondary-ink); font-size: var(--ds-text-xs); }
.ds-thread-panel__controls { display: flex; align-items: center; gap: var(--ds-space-1); }
.ds-thread-panel__root { padding-block: var(--ds-space-2); overflow: visible; }
.ds-thread-panel__divider { display: flex; align-items: center; gap: var(--ds-space-2); padding-inline: var(--ds-space-4); color: var(--ds-chat-secondary-ink); font-size: var(--ds-text-xs); }
.ds-thread-panel__divider::before, .ds-thread-panel__divider::after { content: ''; flex: 1; border-top: 1px solid var(--ds-border-base); }
.ds-thread-panel__replies { padding-block: var(--ds-space-2); }
.ds-thread-panel__composer { padding: var(--ds-space-3); border-top: 1px solid var(--ds-border-base); }
</style>
