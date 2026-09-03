<script setup lang="ts">
import DsAvatar from './DsAvatar.vue'
import DsIcon from './DsIcon.vue'
import DsPresenceDot from './DsPresenceDot.vue'
import type { PresenceStatus } from './DsPresenceDot.vue'

export interface ChannelRow {
  id: string
  displayName: string
  icon: `solar:${string}` | `material-symbols:${string}`
  tone: 'direct' | 'group' | 'context'
  avatar?: string
  status?: PresenceStatus
  unread: number
  mentions: number
  muted?: boolean
  active?: boolean
}

export interface ChannelCategory {
  id: string
  label: string
  collapsed: boolean
  channels: ChannelRow[]
  unread: number
  mentions: number
  emptyLabel?: string
}

defineProps<{ categories: ChannelCategory[] }>()

const emit = defineEmits<{
  select: [channelId: string]
  toggleCategory: [categoryId: string]
}>()
</script>

<template>
  <div class="ds-channel-sidebar">
    <section v-for="category in categories" :key="category.id" class="ds-channel-sidebar__category">
      <button
        type="button"
        class="ds-channel-sidebar__heading"
        :aria-expanded="!category.collapsed"
        @click="emit('toggleCategory', category.id)"
      >
        <DsIcon :name="category.collapsed ? 'solar:alt-arrow-right-linear' : 'solar:alt-arrow-down-linear'" />
        <span>{{ category.label }}</span>
        <span v-if="category.collapsed && category.unread" class="ds-channel-sidebar__badge" :class="{ 'ds-channel-sidebar__badge--quiet': !category.mentions }">
          {{ category.mentions || category.unread }}
        </span>
      </button>

      <template v-if="!category.collapsed">
        <ul v-if="category.channels.length" class="ds-channel-sidebar__list">
          <li v-for="channel in category.channels" :key="channel.id">
            <button
              type="button"
              class="ds-channel-sidebar__row"
              :class="{
                'ds-channel-sidebar__row--active': channel.active,
                'ds-channel-sidebar__row--unread': channel.unread > 0,
                'ds-channel-sidebar__row--muted': channel.muted
              }"
              :aria-current="channel.active ? 'page' : undefined"
              @click="emit('select', channel.id)"
            >
              <span class="ds-channel-sidebar__glyph" :class="`ds-channel-sidebar__glyph--${channel.tone}`">
                <template v-if="channel.tone === 'direct'">
                  <DsAvatar :src="channel.avatar" :name="channel.displayName" size="sm" />
                  <DsPresenceDot class="ds-channel-sidebar__presence" :status="channel.status" size="sm" />
                </template>
                <DsIcon v-else :name="channel.icon" />
              </span>
              <span class="ds-channel-sidebar__name">{{ channel.displayName }}</span>
              <span v-if="channel.mentions" class="ds-channel-sidebar__badge">{{ channel.mentions }}</span>
              <span v-else-if="channel.muted" class="ds-channel-sidebar__mute"><DsIcon name="solar:bell-off-linear" /></span>
            </button>
          </li>
        </ul>
        <p v-else class="ds-channel-sidebar__empty">{{ category.emptyLabel || 'Nothing here yet.' }}</p>
      </template>
    </section>
  </div>
</template>

<style scoped>
.ds-channel-sidebar { display: grid; align-content: start; gap: var(--ds-space-3); min-width: 0; }
.ds-channel-sidebar__category { display: grid; gap: 2px; min-width: 0; }
.ds-channel-sidebar__heading { display: flex; align-items: center; gap: var(--ds-space-1); height: 1.75rem; padding: 0 var(--ds-space-2); border: 0; border-radius: var(--ds-radius-md); background: transparent; color: var(--ds-chat-secondary-ink); font: inherit; font-size: var(--ds-text-xs); font-weight: var(--ds-font-semibold); letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; }
.ds-channel-sidebar__heading:hover { background: var(--ds-bg-hover); color: var(--ds-chat-sidebar-ink-unread); }
.ds-channel-sidebar__heading > :first-child { font-size: 0.75rem; }
.ds-channel-sidebar__heading > span:first-of-type { flex: 1; text-align: left; }
.ds-channel-sidebar__list { display: grid; gap: 1px; margin: 0; padding: 0; list-style: none; }
.ds-channel-sidebar__row { display: flex; align-items: center; gap: var(--ds-space-2); width: 100%; height: 2rem; padding: 0 var(--ds-space-2); border: 0; border-radius: var(--ds-radius-md); background: transparent; color: var(--ds-chat-sidebar-ink); font: inherit; font-size: var(--ds-text-sm); text-align: left; cursor: pointer; transition: background var(--ds-transition-fast); }
.ds-channel-sidebar__row:hover { background: var(--ds-bg-hover); }
.ds-channel-sidebar__row--unread { color: var(--ds-chat-sidebar-ink-unread); font-weight: var(--ds-font-semibold); }
.ds-channel-sidebar__row--muted { opacity: 0.72; }
.ds-channel-sidebar__row--active,
.ds-channel-sidebar__row--active:hover { background: var(--ds-chat-active-bg); color: var(--ds-chat-active-ink); font-weight: var(--ds-font-semibold); opacity: 1; }
.ds-channel-sidebar__glyph { position: relative; display: grid; flex-shrink: 0; width: 1.25rem; height: 1.25rem; place-items: center; font-size: 1rem; }
.ds-channel-sidebar__glyph--group { color: var(--ds-chat-group-ink); }
.ds-channel-sidebar__glyph--context { color: var(--ds-chat-context-ink); }
.ds-channel-sidebar__glyph :deep(.ds-avatar) { width: 1.25rem; height: 1.25rem; }
.ds-channel-sidebar__presence { position: absolute; right: -2px; bottom: -2px; }
.ds-channel-sidebar__name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ds-channel-sidebar__badge { display: grid; min-width: 1.125rem; height: 1.125rem; place-items: center; padding-inline: var(--ds-space-1); border-radius: var(--ds-radius-full); background: var(--ds-chat-mention-bg); color: var(--ds-chat-mention-ink); font-size: var(--ds-text-xs); font-weight: var(--ds-font-bold); }
.ds-channel-sidebar__badge--quiet { background: var(--ds-border-strong); color: var(--ds-text-primary); }
.ds-channel-sidebar__mute { display: grid; place-items: center; color: var(--ds-chat-secondary-ink); font-size: 0.875rem; }
.ds-channel-sidebar__empty { margin: 0; padding: var(--ds-space-1) var(--ds-space-2) var(--ds-space-2); color: var(--ds-chat-secondary-ink); font-size: var(--ds-text-xs); }
</style>
