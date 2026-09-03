<script setup lang="ts">
import DsAvatar from './DsAvatar.vue'
import DsButton from './DsButton.vue'
import DsIcon from './DsIcon.vue'

export interface ConversationParticipant {
  id: string
  name: string
  detail?: string
  avatar?: string
  online?: boolean
}

export interface ConversationContextItem {
  ownerType: string
  ownerId: string
  title: string
  detail?: string
  href?: string
  icon?: `solar:${string}` | `material-symbols:${string}`
}

defineProps<{
  context?: ConversationContextItem | null
  participants?: ConversationParticipant[]
}>()

const emit = defineEmits<{ openContext: [context: ConversationContextItem]; addPeople: [] }>()
</script>

<template>
  <aside class="ds-conversation-context">
    <section v-if="context">
      <p class="ds-conversation-context__eyebrow">Linked work</p>
      <button class="ds-conversation-context__object" type="button" :disabled="!context.href" @click="emit('openContext', context)">
        <span><DsIcon :name="context.icon || 'solar:link-circle-bold-duotone'" /></span>
        <span><strong>{{ context.title }}</strong><small>{{ context.detail || context.ownerType }}</small></span>
        <DsIcon name="solar:arrow-right-linear" />
      </button>
    </section>
    <section>
      <div class="ds-conversation-context__section-heading">
        <div><p class="ds-conversation-context__eyebrow">People</p><strong>{{ participants?.length || 0 }} members</strong></div>
        <DsButton variant="ghost" size="sm" icon="solar:add-circle-linear" @click="emit('addPeople')">Add</DsButton>
      </div>
      <div class="ds-conversation-context__people">
        <div v-for="participant in participants" :key="participant.id">
          <span class="ds-conversation-context__avatar"><DsAvatar :src="participant.avatar" :name="participant.name" size="sm" /><i v-if="participant.online" /></span>
          <span><strong>{{ participant.name }}</strong><small>{{ participant.detail }}</small></span>
        </div>
      </div>
    </section>
  </aside>
</template>

<style scoped>
.ds-conversation-context { display: grid; align-content: start; gap: var(--ds-space-6); padding: var(--ds-space-5); background: color-mix(in srgb, var(--ds-bg-surface) 88%, transparent); }
.ds-conversation-context section { display: grid; gap: var(--ds-space-3); }
.ds-conversation-context__eyebrow { margin: 0; color: var(--ds-text-muted); font-size: var(--ds-text-xs); font-weight: var(--ds-font-semibold); letter-spacing: .08em; text-transform: uppercase; }
.ds-conversation-context__object { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: var(--ds-space-3); padding: var(--ds-space-3); border: 1px solid var(--ds-border-base); border-radius: var(--ds-radius-xl); background: var(--ds-bg-elevated); color: var(--ds-text-primary); text-align: left; cursor: pointer; box-shadow: var(--ds-elevation-1); }
.ds-conversation-context__object:disabled { cursor: default; }
.ds-conversation-context__object > span:first-child { display: grid; width: 2.5rem; height: 2.5rem; place-items: center; border-radius: var(--ds-radius-lg); background: var(--ds-chat-context-bg); color: var(--ds-chat-context-ink); font-size: 1.25rem; }
.ds-conversation-context__object > span:nth-child(2), .ds-conversation-context__people > div > span:last-child { display: grid; min-width: 0; }
.ds-conversation-context__object small, .ds-conversation-context__people small { color: var(--ds-text-secondary); }
.ds-conversation-context__section-heading { display: flex; align-items: center; justify-content: space-between; gap: var(--ds-space-3); }
.ds-conversation-context__section-heading > div { display: grid; gap: var(--ds-space-1); }
.ds-conversation-context__people { display: grid; gap: var(--ds-space-3); }
.ds-conversation-context__people > div { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: var(--ds-space-3); }
.ds-conversation-context__avatar { position: relative; }
.ds-conversation-context__avatar i { position: absolute; right: -1px; bottom: -1px; width: .6rem; height: .6rem; border: 2px solid var(--ds-bg-surface); border-radius: var(--ds-radius-full); background: var(--ds-chat-online); }
</style>
