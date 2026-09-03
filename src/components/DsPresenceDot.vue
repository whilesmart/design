<script setup lang="ts">
export type PresenceStatus = 'online' | 'away' | 'dnd' | 'offline'

withDefaults(defineProps<{ status?: PresenceStatus; size?: 'sm' | 'md' }>(), {
  status: 'offline',
  size: 'md'
})

const labels: Record<PresenceStatus, string> = {
  online: 'Online',
  away: 'Away',
  dnd: 'Do not disturb',
  offline: 'Offline'
}
</script>

<template>
  <span
    class="ds-presence"
    :class="[`ds-presence--${status}`, `ds-presence--${size}`]"
    role="img"
    :aria-label="labels[status]"
  />
</template>

<style scoped>
.ds-presence { display: inline-block; width: 0.625rem; height: 0.625rem; border: 2px solid var(--ds-bg-elevated); border-radius: var(--ds-radius-full); background: var(--ds-chat-status-offline); }
.ds-presence--sm { width: 0.5rem; height: 0.5rem; border-width: 1.5px; }
.ds-presence--online { background: var(--ds-chat-online); }
.ds-presence--away { background: var(--ds-chat-status-away); }
.ds-presence--dnd { background: var(--ds-chat-status-dnd); }
.ds-presence--offline { background: var(--ds-chat-status-offline); }
</style>
