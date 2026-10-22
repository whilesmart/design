<script setup lang="ts">
import DsIcon from './DsIcon.vue'

export interface ChatHistoryItem {
  id: string | number
  title: string
  meta?: string
}

withDefaults(defineProps<{
  items: ChatHistoryItem[]
  active?: string | number | null
  loading?: boolean
  label?: string
  newLabel?: string
  emptyText?: string
  removable?: boolean
}>(), {
  active: null,
  loading: false,
  label: 'Recent chats',
  newLabel: 'New chat',
  emptyText: 'Nothing asked here yet.',
  removable: true,
})

const emit = defineEmits<{ open: [id: string | number]; create: []; remove: [id: string | number] }>()
</script>

<template>
  <div class="ds-chat-history">
    <div class="ds-chat-history__top">
      <button type="button" class="ds-chat-history__new" @click="emit('create')">
        <DsIcon name="solar:add-circle-linear" />
        {{ newLabel }}
      </button>
    </div>
    <p class="ds-chat-history__label">{{ label }}</p>
    <div class="ds-chat-history__scroll">
      <div v-if="loading" class="ds-chat-history__loading" aria-busy="true">
        <span v-for="i in 4" :key="i" />
      </div>
      <p v-else-if="!items.length" class="ds-chat-history__empty">{{ emptyText }}</p>
      <ul v-else class="ds-chat-history__list">
        <li v-for="item of items" :key="item.id" class="ds-chat-history__item">
          <button
            type="button"
            class="ds-chat-history__open"
            :class="{ 'is-active': active === item.id }"
            :aria-current="active === item.id ? 'true' : undefined"
            @click="emit('open', item.id)"
          >
            <span class="ds-chat-history__title">{{ item.title }}</span>
            <span v-if="item.meta" class="ds-chat-history__meta">{{ item.meta }}</span>
          </button>
          <button
            v-if="removable"
            type="button"
            class="ds-chat-history__remove"
            :aria-label="`Delete ${item.title}`"
            @click="emit('remove', item.id)"
          >
            <DsIcon name="solar:trash-bin-minimalistic-linear" />
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.ds-chat-history {
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  min-height: 0;
}

.ds-chat-history__top {
  padding: var(--ds-space-3);
}

.ds-chat-history__new {
  display: inline-flex;
  gap: var(--ds-space-2);
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 36px;
  padding: 0 var(--ds-space-4);
  border: 0;
  border-radius: var(--ds-radius-control);
  background: var(--ds-accent-fill);
  color: var(--ds-accent-ink);
  font: inherit;
  font-size: var(--ds-text-sm);
  font-weight: var(--ds-font-weight-medium);
  cursor: pointer;
  transition: background-color 150ms ease;
}

.ds-chat-history__new:hover {
  background: var(--ds-accent-fill-strong);
}

.ds-chat-history__label {
  margin: 0;
  padding: 0 var(--ds-space-4) var(--ds-space-1);
  color: var(--ds-text-muted);
  font-size: 10px;
  font-weight: var(--ds-font-weight-semibold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.ds-chat-history__scroll {
  flex: 1 1 0;
  min-height: 0;
  padding: 0 var(--ds-space-2) var(--ds-space-3);
  overflow-y: auto;
}

.ds-chat-history__list {
  display: grid;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ds-chat-history__item {
  position: relative;
}

.ds-chat-history__open {
  display: grid;
  width: 100%;
  padding: var(--ds-space-2) 40px var(--ds-space-2) var(--ds-space-3);
  border: 0;
  border-radius: var(--ds-radius-control);
  background: transparent;
  color: var(--ds-text-primary);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: background-color 150ms ease;
}

.ds-chat-history__open:hover {
  background: var(--ds-bg-muted);
}

.ds-chat-history__open.is-active {
  background: var(--ds-accent-fill);
  color: var(--ds-accent-ink);
}

.ds-chat-history__title {
  overflow: hidden;
  font-size: var(--ds-text-sm);
  font-weight: var(--ds-font-weight-medium);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ds-chat-history__meta {
  color: var(--ds-text-muted);
  font-size: var(--ds-text-xs);
}

.ds-chat-history__remove {
  position: absolute;
  top: 50%;
  right: 4px;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: var(--ds-radius-control);
  background: transparent;
  color: var(--ds-text-muted);
  font-size: 16px;
  cursor: pointer;
  transform: translateY(-50%);
}

.ds-chat-history__remove:hover {
  background: var(--ds-status-error-bg);
  color: var(--ds-status-error-text);
}

/* A pointer reveals delete on hover; a touch screen has no hover, so there it always shows. */
@media (hover: hover) {
  .ds-chat-history__remove {
    opacity: 0;
  }

  .ds-chat-history__item:hover .ds-chat-history__remove,
  .ds-chat-history__remove:focus-visible {
    opacity: 1;
  }
}

.ds-chat-history__new:focus-visible,
.ds-chat-history__open:focus-visible,
.ds-chat-history__remove:focus-visible {
  outline: 2px solid var(--ds-border-focus);
  outline-offset: -2px;
}

.ds-chat-history__empty {
  margin: 0;
  padding: var(--ds-space-3) var(--ds-space-2);
  color: var(--ds-text-muted);
  font-size: var(--ds-text-sm);
}

.ds-chat-history__loading {
  display: grid;
  gap: 6px;
  padding: 0 var(--ds-space-1);
}

.ds-chat-history__loading span {
  height: 44px;
  border-radius: var(--ds-radius-control);
  background: var(--ds-bg-muted);
}
</style>
