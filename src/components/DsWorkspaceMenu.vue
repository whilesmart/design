<script setup lang="ts">
import DsIcon from './DsIcon.vue'
import DsMenu from './DsMenu.vue'
import { nameOf, type WorkspaceOption } from './workspaceMenu'

withDefaults(
  defineProps<{
    options: WorkspaceOption[]
    active?: string | number | null
    heading?: string
    placeholder?: string
    icon?: `solar:${string}` | `material-symbols:${string}`
  }>(),
  {
    active: null,
    heading: 'Workspaces',
    placeholder: 'Workspace',
    icon: 'solar:buildings-2-linear',
  },
)

const emit = defineEmits<{ choose: [WorkspaceOption] }>()
</script>

<template>
  <DsMenu align="start" class="ds-workspace">
    <template #trigger>
      <button type="button" class="ds-workspace__trigger" :title="nameOf(options, active) || placeholder">
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
</style>
