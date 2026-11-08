<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import DsIcon from './DsIcon.vue'

export interface WorkspaceOwner { owner_type: string; owner_id: string; name: string }

const props = defineProps<{ owners: WorkspaceOwner[]; active: string }>()
const emit = defineEmits<{ choose: [key: string] }>()
const open = ref(false)
const root = ref<HTMLElement | null>(null)

const ownerKey = (owner: WorkspaceOwner) => `${owner.owner_type}:${owner.owner_id}`
const ownerName = (owner: WorkspaceOwner) => owner.owner_type === 'user' ? 'Personal' : owner.name
const ownerDetail = (owner: WorkspaceOwner) => owner.owner_type === 'user' ? 'Only you' : 'Shared with your organisation'
const ownerIcon = (owner: WorkspaceOwner) => owner.owner_type === 'user' ? 'solar:user-bold-duotone' as const : 'solar:buildings-2-bold-duotone' as const
const current = computed(() => props.owners.find(owner => ownerKey(owner) === props.active))

function choose(owner: WorkspaceOwner) {
  open.value = false
  if (ownerKey(owner) !== props.active) emit('choose', ownerKey(owner))
}

function onPointer(event: PointerEvent) {
  if (open.value && root.value && !root.value.contains(event.target as Node)) open.value = false
}

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('pointerdown', onPointer)
  document.addEventListener('keydown', onKey)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', onPointer)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div v-if="current" ref="root" class="workspace-switcher">
    <div v-if="open" class="workspace-switcher__menu" role="menu" aria-label="Switch workspace">
      <button
        v-for="owner in owners"
        :key="ownerKey(owner)"
        type="button"
        role="menuitemradio"
        class="workspace-switcher__option"
        :class="{ 'workspace-switcher__option--current': active === ownerKey(owner) }"
        :aria-checked="active === ownerKey(owner)"
        @click="choose(owner)"
      >
        <span class="workspace-switcher__tile" :class="`workspace-switcher__tile--${owner.owner_type}`"><DsIcon :name="ownerIcon(owner)" /></span>
        <span class="workspace-switcher__text">
          <strong>{{ ownerName(owner) }}</strong>
          <small>{{ ownerDetail(owner) }}</small>
        </span>
        <DsIcon v-if="active === ownerKey(owner)" class="workspace-switcher__check" name="solar:check-circle-bold" />
      </button>
    </div>

    <button
      type="button"
      class="workspace-switcher__trigger"
      :aria-expanded="open"
      aria-haspopup="menu"
      :aria-label="`Workspace: ${ownerName(current)}`"
      @click="open = !open"
    >
      <span class="workspace-switcher__tile" :class="`workspace-switcher__tile--${current.owner_type}`"><DsIcon :name="ownerIcon(current)" /></span>
      <span class="workspace-switcher__text">
        <small>Workspace</small>
        <strong>{{ ownerName(current) }}</strong>
      </span>
      <DsIcon class="workspace-switcher__chevron" name="solar:alt-arrow-up-linear" />
    </button>
  </div>
</template>

<style scoped>
.workspace-switcher {
  position: relative;
}

.workspace-switcher__trigger,
.workspace-switcher__option {
  display: flex;
  align-items: center;
  gap: var(--ds-space-3);
  width: 100%;
  padding: var(--ds-space-2);
  border: 1px solid transparent;
  border-radius: var(--ds-radius-control);
  background: none;
  color: var(--ds-text-primary);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: background var(--ds-transition-fast), border-color var(--ds-transition-fast);
}

.workspace-switcher__trigger {
  border-color: var(--ds-border-base);
  background: var(--ds-bg-elevated);
}

.workspace-switcher__trigger:hover,
.workspace-switcher__trigger[aria-expanded="true"] {
  border-color: var(--ds-border-strong);
}

.workspace-switcher__trigger:focus-visible,
.workspace-switcher__option:focus-visible {
  outline: 2px solid var(--ds-border-focus);
  outline-offset: 2px;
}

.workspace-switcher__tile {
  display: grid;
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border-radius: var(--ds-radius-control);
  font-size: 1.125rem;
}

.workspace-switcher__tile--user {
  background: var(--ds-area-indigo-fill);
  color: var(--ds-area-indigo-ink);
}

.workspace-switcher__tile--team {
  background: var(--ds-area-teal-fill);
  color: var(--ds-area-teal-ink);
}

.workspace-switcher__text {
  display: grid;
  flex: 1;
  min-width: 0;
}

.workspace-switcher__text strong,
.workspace-switcher__text small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workspace-switcher__text strong {
  font-size: var(--ds-text-sm);
  font-weight: var(--ds-font-weight-semibold);
}

.workspace-switcher__text small {
  font-size: var(--ds-text-xs);
  color: var(--ds-text-secondary);
}

.workspace-switcher__chevron {
  color: var(--ds-text-secondary);
  transition: transform var(--ds-transition-fast);
}

.workspace-switcher__trigger[aria-expanded="false"] .workspace-switcher__chevron {
  transform: rotate(180deg);
}

.workspace-switcher__menu {
  position: absolute;
  right: 0;
  bottom: calc(100% + var(--ds-space-2));
  left: 0;
  z-index: var(--ds-z-dropdown);
  display: grid;
  gap: var(--ds-space-1);
  padding: var(--ds-space-2);
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-radius-card);
  background: var(--ds-bg-elevated);
  box-shadow: var(--ds-shadow-xl);
}

.workspace-switcher__option:hover {
  background: var(--ds-bg-hover);
}

.workspace-switcher__option--current {
  background: var(--ds-bg-surface);
}

.workspace-switcher__check {
  color: var(--ds-area-indigo-ink);
}
</style>
