<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import DsIcon from './DsIcon.vue'
import DsMenu from './DsMenu.vue'
import { railCollapsedKey } from '../rail'
import { activeOf, initialsOf, nameOf, type WorkspaceOption } from './workspaceMenu'

const props = withDefaults(
  defineProps<{
    options: WorkspaceOption[]
    active?: string | number | null
    heading?: string
    placeholder?: string
    icon?: `solar:${string}` | `material-symbols:${string}`
    // Bar: an inline name beside other bar controls. Rail: a full-width card
    // with the workspace's initials and kind, which folds to the initials.
    placement?: 'bar' | 'rail'
  }>(),
  {
    active: null,
    heading: 'Workspaces',
    placeholder: 'Workspace',
    icon: 'solar:buildings-2-linear',
    placement: 'bar',
  },
)

const folded = inject(railCollapsedKey, ref(false))
const current = computed(() => activeOf(props.options, props.active))
const label = computed(() => current.value?.name || props.placeholder)

const emit = defineEmits<{ choose: [WorkspaceOption] }>()
</script>

<template>
  <DsMenu align="start" class="ds-workspace" :class="{ 'ds-workspace--rail': placement === 'rail', 'ds-workspace--folded': placement === 'rail' && folded }">
    <template #trigger>
      <button v-if="placement === 'rail'" type="button" class="ds-workspace__card" :title="label" :aria-label="folded ? label : undefined">
        <span class="ds-workspace__tile" aria-hidden="true">{{ initialsOf(label) || '?' }}</span>
        <span class="ds-workspace__said">
          <span class="ds-workspace__name">{{ label }}</span>
          <span v-if="current?.kind" class="ds-workspace__card-kind">{{ current.kind }}</span>
        </span>
        <DsIcon name="solar:alt-arrow-down-linear" class="ds-workspace__arrow" />
      </button>
      <button v-else type="button" class="ds-workspace__trigger" :title="nameOf(options, active) || placeholder">
        <DsIcon :name="icon" class="ds-workspace__glyph" />
        <span class="ds-workspace__name">{{ nameOf(options, active) || placeholder }}</span>
        <DsIcon name="solar:alt-arrow-down-linear" class="ds-workspace__arrow" />
      </button>
    </template>

    <p v-if="heading" class="ds-workspace__heading">{{ heading }}</p>

    <button
      v-for="one of options"
      :key="one.id"
      type="button"
      class="ds-workspace__row"
      @click="emit('choose', one)"
    >
      <DsIcon :name="icon" class="ds-workspace__glyph" />
      <span class="ds-workspace__row-name">{{ one.name }}</span>
      <span v-if="one.kind" class="ds-workspace__kind">{{ one.kind }}</span>
      <DsIcon
        v-if="one.id === active"
        name="solar:check-circle-bold"
        class="ds-workspace__on"
      />
    </button>

    <slot />
  </DsMenu>
</template>

<style scoped>
.ds-workspace__trigger {
  display: inline-flex;
  max-width: 14rem;
  align-items: center;
  gap: var(--ds-space-2);
  border: 0;
  border-radius: var(--ds-radius-control);
  padding: var(--ds-space-2) var(--ds-space-3);
  background: transparent;
  color: var(--ds-text-primary);
  font: inherit;
  font-size: var(--ds-text-sm);
  font-weight: 500;
  cursor: pointer;
}

.ds-workspace__trigger:hover {
  background: var(--ds-bg-hover);
}

.ds-workspace__glyph,
.ds-workspace__arrow {
  flex: none;
  color: var(--ds-text-muted);
}

.ds-workspace__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ds-workspace__heading {
  margin: 0;
  padding: var(--ds-space-2) var(--ds-space-3) var(--ds-space-1);
  color: var(--ds-text-muted);
  font-size: var(--ds-text-xs);
  font-weight: 500;
  letter-spacing: var(--ds-tracking-wide);
  text-transform: uppercase;
}

.ds-workspace__row {
  display: flex;
  width: 100%;
  align-items: center;
  gap: var(--ds-space-2);
  padding: var(--ds-space-2) var(--ds-space-3);
  border: 0;
  border-radius: var(--ds-radius-md);
  background: none;
  color: var(--ds-text-primary);
  font-family: inherit;
  font-size: var(--ds-text-sm);
  text-align: left;
  cursor: pointer;
}

.ds-workspace__row:hover {
  background: var(--ds-bg-hover);
}

.ds-workspace__row-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ds-workspace__kind {
  flex: none;
  color: var(--ds-text-muted);
  font-size: var(--ds-text-xs);
}

.ds-workspace__on {
  flex: none;
  color: var(--ds-interactive-primary);
}

.ds-workspace--rail {
  display: flex;
  width: 100%;
}

.ds-workspace--rail :deep(.ds-menu__trigger) {
  flex: 1;
  min-width: 0;
}

.ds-workspace__card {
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: center;
  gap: var(--ds-space-2);
  padding: var(--ds-space-2);
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-radius-control);
  background: var(--ds-bg-elevated);
  color: var(--ds-text-primary);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.ds-workspace__card:hover {
  border-color: var(--ds-border-strong);
}

.ds-workspace__card:focus-visible {
  outline: 2px solid var(--ds-border-focus);
  outline-offset: 2px;
}

.ds-workspace__tile {
  display: grid;
  flex: none;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border-radius: var(--ds-radius-control);
  background: var(--ds-interactive-primary);
  color: var(--ds-text-inverse);
  font-size: var(--ds-text-xs);
  font-weight: 600;
}

.ds-workspace__said {
  display: grid;
  flex: 1;
  min-width: 0;
}

.ds-workspace__said .ds-workspace__name {
  font-size: var(--ds-text-sm);
  font-weight: 600;
}

.ds-workspace__card-kind {
  overflow: hidden;
  color: var(--ds-text-muted);
  font-size: var(--ds-text-xs);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ds-workspace--folded .ds-workspace__card {
  justify-content: center;
  padding: var(--ds-space-1);
  border-color: transparent;
  background: none;
}

.ds-workspace--folded .ds-workspace__said,
.ds-workspace--folded .ds-workspace__arrow {
  display: none;
}
</style>
