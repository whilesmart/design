<script setup lang="ts">
import { computed } from 'vue'
import { areaStyle, type AreaColor } from '../areas'
import DsIcon from './DsIcon.vue'

export interface ChatQuickAction {
  key: string
  label: string
  detail?: string
  icon?: `solar:${string}` | `material-symbols:${string}`
  area?: AreaColor
  group?: string
}

const props = withDefaults(defineProps<{
  actions: ChatQuickAction[]
  layout?: 'cards' | 'pills'
  label?: string
  disabled?: boolean
  active?: string | null
}>(), { layout: 'cards', label: 'Quick actions', disabled: false, active: null })

const emit = defineEmits<{ select: [key: string] }>()

const groups = computed(() => {
  const byName = new Map<string, ChatQuickAction[]>()
  for (const action of props.actions) {
    const name = action.group ?? ''
    byName.set(name, [...(byName.get(name) ?? []), action])
  }
  return [...byName].map(([name, actions]) => ({ name, actions }))
})
</script>

<template>
  <div class="ds-chat-quick-actions" :class="`ds-chat-quick-actions--${layout}`" role="group" :aria-label="label">
    <template v-if="layout === 'pills'">
      <button
        v-for="action of actions"
        :key="action.key"
        type="button"
        class="ds-chat-quick-actions__pill"
        :class="{ 'is-active': active === action.key }"
        :style="areaStyle(action.area)"
        :disabled="disabled"
        :aria-pressed="active === action.key ? true : undefined"
        :title="action.detail || undefined"
        @click="emit('select', action.key)"
      >
        <DsIcon v-if="action.icon" :name="action.icon" />
        <span class="ds-chat-quick-actions__pill-label">{{ action.label }}</span>
      </button>
    </template>
    <template v-else>
      <section v-for="group of groups" :key="group.name" class="ds-chat-quick-actions__group">
        <h3 v-if="group.name" class="ds-chat-quick-actions__heading">{{ group.name }}</h3>
        <div class="ds-chat-quick-actions__grid">
          <button
            v-for="action of group.actions"
            :key="action.key"
            type="button"
            class="ds-chat-quick-actions__card"
            :class="{ 'is-active': active === action.key }"
            :style="areaStyle(action.area)"
            :disabled="disabled"
            :aria-pressed="active === action.key ? true : undefined"
            @click="emit('select', action.key)"
          >
            <span v-if="action.icon" class="ds-chat-quick-actions__tile" aria-hidden="true">
              <DsIcon :name="action.icon" />
            </span>
            <span class="ds-chat-quick-actions__text">
              <span class="ds-chat-quick-actions__label">{{ action.label }}</span>
              <span v-if="action.detail" class="ds-chat-quick-actions__detail">{{ action.detail }}</span>
            </span>
          </button>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.ds-chat-quick-actions {
  --ds-area-fill: var(--ds-accent-fill);
  --ds-area-ink: var(--ds-accent-ink);
  --ds-area-solid: var(--ds-interactive-primary);
  container-type: inline-size;
}

.ds-chat-quick-actions--pills {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ds-space-2);
}

.ds-chat-quick-actions__pill {
  display: inline-flex;
  gap: var(--ds-space-2);
  align-items: center;
  max-width: 100%;
  padding: var(--ds-space-2) var(--ds-space-3);
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-radius-full);
  background: var(--ds-bg-surface);
  color: var(--ds-text-secondary);
  font: inherit;
  font-size: var(--ds-text-sm);
  cursor: pointer;
  transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease;
}

.ds-chat-quick-actions__pill .ds-icon {
  color: var(--ds-area-ink);
}

.ds-chat-quick-actions__pill-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ds-chat-quick-actions__pill:hover:not(:disabled),
.ds-chat-quick-actions__pill.is-active {
  border-color: var(--ds-area-solid);
  background: var(--ds-area-fill);
  color: var(--ds-area-ink);
}

.ds-chat-quick-actions--cards {
  display: grid;
  gap: var(--ds-space-5);
}

.ds-chat-quick-actions__group {
  display: grid;
  gap: var(--ds-space-2);
}

.ds-chat-quick-actions__heading {
  margin: 0;
  padding: 0 var(--ds-space-1);
  color: var(--ds-text-muted);
  font-size: var(--ds-text-xs);
  font-weight: var(--ds-font-weight-semibold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.ds-chat-quick-actions__grid {
  display: grid;
  gap: var(--ds-space-2);
  grid-template-columns: minmax(0, 1fr);
}

@container (min-width: 480px) {
  .ds-chat-quick-actions__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@container (min-width: 760px) {
  .ds-chat-quick-actions__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.ds-chat-quick-actions__card {
  display: flex;
  gap: var(--ds-space-3);
  align-items: flex-start;
  min-width: 0;
  padding: var(--ds-space-3);
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-brand-radius-card, var(--ds-radius-lg));
  background: var(--ds-bg-surface);
  box-shadow: var(--ds-elevation-1);
  color: var(--ds-text-primary);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease;
}

.ds-chat-quick-actions__card:hover:not(:disabled) {
  border-color: var(--ds-area-solid);
  box-shadow: var(--ds-elevation-2);
  transform: translateY(-1px);
}

.ds-chat-quick-actions__card.is-active {
  border-color: var(--ds-area-solid);
  background: var(--ds-area-fill);
}

.ds-chat-quick-actions__tile {
  display: grid;
  flex: none;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: var(--ds-radius-md);
  background: var(--ds-area-fill);
  color: var(--ds-area-ink);
  font-size: 20px;
}

.ds-chat-quick-actions__card.is-active .ds-chat-quick-actions__tile {
  background: var(--ds-area-solid);
  color: var(--ds-on-interactive-primary);
}

.ds-chat-quick-actions__text {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.ds-chat-quick-actions__label {
  font-size: var(--ds-text-sm);
  font-weight: var(--ds-font-weight-semibold);
}

.ds-chat-quick-actions__detail {
  color: var(--ds-text-secondary);
  font-size: var(--ds-text-xs);
  line-height: var(--ds-leading-snug);
}

.ds-chat-quick-actions__pill:focus-visible,
.ds-chat-quick-actions__card:focus-visible {
  outline: 2px solid var(--ds-border-focus);
  outline-offset: 2px;
}

.ds-chat-quick-actions__pill:disabled,
.ds-chat-quick-actions__card:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

@media (prefers-reduced-motion: reduce) {
  .ds-chat-quick-actions__pill,
  .ds-chat-quick-actions__card { transition: none; }
  .ds-chat-quick-actions__card:hover:not(:disabled) { transform: none; }
}
</style>
