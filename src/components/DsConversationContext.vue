<script setup lang="ts">
import DsAvatar from './DsAvatar.vue'
import DsButton from './DsButton.vue'
import DsIcon from './DsIcon.vue'
import DsPresenceDot from './DsPresenceDot.vue'
import type { PresenceStatus } from './DsPresenceDot.vue'

export interface ConversationParticipant {
  id: string
  name: string
  detail?: string
  avatar?: string
  status?: PresenceStatus
}

export interface ConversationContextItem {
  ownerType: string
  ownerId: string
  title: string
  detail?: string
  href?: string
  icon?: `solar:${string}` | `material-symbols:${string}`
}

withDefaults(defineProps<{
  context?: ConversationContextItem | null
  participants?: ConversationParticipant[]
  purpose?: string
  pinnedCount?: number
  savedCount?: number
}>(), {
  participants: () => [],
  pinnedCount: 0,
  savedCount: 0
})

const emit = defineEmits<{
  openContext: [context: ConversationContextItem]
  addPeople: []
  openPinned: []
  openSaved: []
}>()
</script>

<template>
  <div class="ds-conversation-context">
    <section v-if="context">
      <p class="ds-conversation-context__eyebrow">Linked work</p>
      <button class="ds-conversation-context__object" type="button" :disabled="!context.href" @click="emit('openContext', context)">
        <span><DsIcon :name="context.icon || 'solar:link-circle-bold-duotone'" /></span>
        <span><strong>{{ context.title }}</strong><small>{{ context.detail || context.ownerType }}</small></span>
        <DsIcon name="solar:arrow-right-linear" />
      </button>
    </section>

    <section>
      <p class="ds-conversation-context__eyebrow">About</p>
      <p v-if="purpose" class="ds-conversation-context__purpose">{{ purpose }}</p>
      <p v-else class="ds-conversation-context__muted">No purpose set. A line here tells people what belongs in this conversation.</p>
    </section>

    <section class="ds-conversation-context__counts">
      <button type="button" @click="emit('openPinned')">
        <span><DsIcon name="solar:pin-linear" /></span>
        <span><strong>{{ pinnedCount }}</strong><small>Pinned</small></span>
      </button>
      <button type="button" @click="emit('openSaved')">
        <span><DsIcon name="solar:bookmark-linear" /></span>
        <span><strong>{{ savedCount }}</strong><small>Saved</small></span>
      </button>
    </section>

    <section>
      <div class="ds-conversation-context__section-heading">
        <div><p class="ds-conversation-context__eyebrow">People</p><strong>{{ participants.length }} {{ participants.length === 1 ? 'member' : 'members' }}</strong></div>
        <DsButton variant="ghost" size="sm" icon="solar:add-circle-linear" @click="emit('addPeople')">Add</DsButton>
      </div>
      <div v-if="participants.length" class="ds-conversation-context__people">
        <div v-for="participant in participants" :key="participant.id">
          <span class="ds-conversation-context__avatar">
            <DsAvatar :src="participant.avatar" :name="participant.name" size="sm" />
            <DsPresenceDot class="ds-conversation-context__presence" :status="participant.status" size="sm" />
          </span>
          <span><strong>{{ participant.name }}</strong><small>{{ participant.detail }}</small></span>
        </div>
      </div>
      <p v-else class="ds-conversation-context__muted">Nobody else is here yet. Add the people who need to see this.</p>
    </section>
  </div>
</template>

<style scoped>
.ds-conversation-context { display: grid; align-content: start; gap: var(--ds-space-6); padding: var(--ds-space-5); overflow-y: auto; background: var(--ds-chat-sidebar-bg); }
.ds-conversation-context section { display: grid; gap: var(--ds-space-3); min-width: 0; }
.ds-conversation-context__eyebrow { margin: 0; color: var(--ds-chat-secondary-ink); font-size: var(--ds-text-xs); font-weight: var(--ds-font-semibold); letter-spacing: .08em; text-transform: uppercase; }
.ds-conversation-context__purpose { margin: 0; color: var(--ds-text-primary); font-size: var(--ds-text-sm); line-height: 1.55; }
.ds-conversation-context__muted { margin: 0; color: var(--ds-chat-secondary-ink); font-size: var(--ds-text-sm); line-height: 1.5; }
.ds-conversation-context__object { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: var(--ds-space-3); padding: var(--ds-space-3); border: 1px solid var(--ds-border-base); border-radius: var(--ds-radius-xl); background: var(--ds-bg-elevated); color: var(--ds-text-primary); font: inherit; text-align: left; cursor: pointer; box-shadow: var(--ds-elevation-1); }
.ds-conversation-context__object:disabled { cursor: default; }
.ds-conversation-context__object > span:first-child { display: grid; width: 2.5rem; height: 2.5rem; place-items: center; border-radius: var(--ds-radius-lg); background: var(--ds-chat-context-bg); color: var(--ds-chat-context-ink); font-size: 1.25rem; }
.ds-conversation-context__object > span:nth-child(2), .ds-conversation-context__people > div > span:last-child { display: grid; min-width: 0; }
.ds-conversation-context__object strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ds-conversation-context__object small, .ds-conversation-context__people small { color: var(--ds-chat-secondary-ink); font-size: var(--ds-text-xs); }
.ds-conversation-context__counts { grid-template-columns: 1fr 1fr; }
.ds-conversation-context__counts button { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: var(--ds-space-2); padding: var(--ds-space-2) var(--ds-space-3); border: 1px solid var(--ds-border-base); border-radius: var(--ds-radius-lg); background: var(--ds-bg-elevated); color: var(--ds-text-primary); font: inherit; text-align: left; cursor: pointer; }
.ds-conversation-context__counts button:hover { background: var(--ds-bg-hover); }
.ds-conversation-context__counts button > span:first-child { display: grid; width: 1.75rem; height: 1.75rem; place-items: center; border-radius: var(--ds-radius-md); background: var(--ds-chat-saved-bg); color: var(--ds-chat-saved-ink); }
.ds-conversation-context__counts button > span:last-child { display: grid; }
.ds-conversation-context__counts small { color: var(--ds-chat-secondary-ink); font-size: var(--ds-text-xs); }
.ds-conversation-context__section-heading { display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-3); }
.ds-conversation-context__section-heading > div { display: grid; gap: var(--ds-space-1); }
.ds-conversation-context__people { display: grid; gap: var(--ds-space-3); }
.ds-conversation-context__people > div { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: var(--ds-space-3); }
.ds-conversation-context__avatar { position: relative; display: grid; }
.ds-conversation-context__presence { position: absolute; right: -2px; bottom: -2px; }
</style>
