<script setup lang="ts">
import DsButton from './DsButton.vue'
import DsChip from './DsChip.vue'
import DsIcon from './DsIcon.vue'

export interface ChatAgent {
  id: string
  name: string
  description: string
  icon?: `solar:${string}`
  enabled: boolean
  tools: string[]
  mention: string
  toolPolicy: 'ask' | 'auto'
}

defineProps<{ agent: ChatAgent }>()
const emit = defineEmits<{ configure: [agent: ChatAgent]; toggle: [agent: ChatAgent] }>()
</script>

<template>
  <article class="ds-agent-card">
    <span class="ds-agent-card__icon"><DsIcon :name="agent.icon || 'solar:stars-bold-duotone'" /></span>
    <div><span class="ds-agent-card__title"><strong>{{ agent.name }}</strong><DsChip :variant="agent.enabled ? 'success' : 'default'" size="sm">{{ agent.enabled ? 'Active' : 'Off' }}</DsChip></span><p>{{ agent.description }}</p><small>{{ agent.mention }} · {{ agent.tools.length }} tools</small></div>
    <div><DsButton variant="ghost" size="sm" @click="emit('toggle', agent)">{{ agent.enabled ? 'Disable' : 'Enable' }}</DsButton><DsButton variant="secondary" size="sm" icon="solar:settings-linear" @click="emit('configure', agent)">Configure</DsButton></div>
  </article>
</template>

<style scoped>
.ds-agent-card { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: var(--ds-space-4); padding: var(--ds-space-4); border: 1px solid var(--ds-border-base); border-radius: var(--ds-radius-xl); background: var(--ds-bg-elevated); box-shadow: var(--ds-elevation-1); }
.ds-agent-card__icon { display: grid; width: 2.75rem; height: 2.75rem; place-items: center; border-radius: var(--ds-radius-lg); background: var(--ds-chat-context-bg); color: var(--ds-chat-context-ink); font-size: 1.4rem; }
.ds-agent-card__title, .ds-agent-card > div:last-child { display: flex; align-items: center; gap: var(--ds-space-2); }.ds-agent-card p { margin: var(--ds-space-1) 0; color: var(--ds-text-secondary); font-size: var(--ds-text-sm); }.ds-agent-card small { color: var(--ds-text-muted); }
@media (max-width: 650px) { .ds-agent-card { grid-template-columns: auto 1fr; }.ds-agent-card > div:last-child { grid-column: 1 / -1; }.ds-agent-card > div:last-child > * { flex: 1; } }
</style>
