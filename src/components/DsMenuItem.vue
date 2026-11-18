<script setup lang="ts">
import { computed } from 'vue'
import DsIcon from './DsIcon.vue'
import type { DsIconName } from './DsPostList.vue'

const props = withDefaults(defineProps<{
  icon?: DsIconName
  description?: string
  href?: string
  target?: string
  rel?: string
  download?: string | boolean
  tone?: 'default' | 'danger'
  type?: 'action' | 'radio' | 'checkbox'
  checked?: boolean
  disabled?: boolean
}>(), { description: '', tone: 'default', type: 'action', checked: false, disabled: false })

defineEmits<{ select: [] }>()

const role = computed(() => ({ action: 'menuitem', radio: 'menuitemradio', checkbox: 'menuitemcheckbox' })[props.type])
const ariaChecked = computed(() => props.type === 'action' ? undefined : props.checked)
</script>

<template>
  <component
    :is="href && !disabled ? 'a' : 'button'"
    class="ds-menu-item"
    :class="[`ds-menu-item--${tone}`, { 'ds-menu-item--described': description }]"
    :role="role"
    :aria-checked="ariaChecked"
    tabindex="-1"
    :type="href && !disabled ? undefined : 'button'"
    :href="href && !disabled ? href : undefined"
    :target="href && !disabled ? target : undefined"
    :rel="href && !disabled ? rel : undefined"
    :download="href && !disabled ? download : undefined"
    :disabled="href && !disabled ? undefined : disabled"
    @click="$emit('select')"
  >
    <span v-if="$slots.icon" class="ds-menu-item__media"><slot name="icon" /></span>
    <DsIcon v-else-if="icon" :name="icon" class="ds-menu-item__icon" />
    <span class="ds-menu-item__text">
      <span class="ds-menu-item__label"><slot /></span>
      <span v-if="description" class="ds-menu-item__description">{{ description }}</span>
    </span>
    <span v-if="$slots.end" class="ds-menu-item__end"><slot name="end" /></span>
    <DsIcon v-if="type !== 'action' && checked" name="solar:check-read-linear" class="ds-menu-item__check" />
  </component>
</template>

<style scoped>
.ds-menu-item {
  display: flex;
  align-items: center;
  gap: var(--ds-space-3);
  width: 100%;
  min-height: 2.25rem;
  padding: var(--ds-space-2) var(--ds-space-3);
  border: 0;
  border-radius: var(--ds-radius-md);
  background: none;
  color: var(--ds-text-primary);
  font: inherit;
  font-size: var(--ds-text-sm);
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}
.ds-menu-item--described { align-items: flex-start; }
.ds-menu-item:hover, .ds-menu-item:focus-visible { background: var(--ds-bg-hover); outline: none; }
.ds-menu-item:focus-visible { box-shadow: inset 0 0 0 2px var(--ds-focus-ring); }
.ds-menu-item:disabled { color: var(--ds-text-muted); cursor: not-allowed; }
.ds-menu-item:disabled:hover { background: none; }
.ds-menu-item--danger { color: var(--ds-status-error-text); }
.ds-menu-item__icon { flex: none; color: var(--ds-text-secondary); font-size: 1.125rem; }
.ds-menu-item--described .ds-menu-item__icon { margin-top: 0.125rem; }
.ds-menu-item--danger .ds-menu-item__icon { color: inherit; }
.ds-menu-item__media { display: inline-flex; flex: none; }
.ds-menu-item__text { display: grid; flex: 1; min-width: 0; gap: 0.125rem; }
.ds-menu-item__label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ds-menu-item__description { color: var(--ds-text-secondary); font-size: var(--ds-text-xs); line-height: 1.4; white-space: normal; }
.ds-menu-item__end { flex: none; color: var(--ds-text-secondary); font-size: var(--ds-text-xs); }
.ds-menu-item__check { flex: none; color: var(--ds-text-primary); }
</style>
