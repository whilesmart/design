<script setup lang="ts">
import { ref } from 'vue'
import DsIcon from './DsIcon.vue'

export interface Rule {
  type: 'do' | 'dont'
  text: string
}

const props = withDefaults(defineProps<{ modelValue: Rule[]; editable?: boolean }>(), { editable: false })
const emit = defineEmits<{ 'update:modelValue': [value: Rule[]] }>()
const drafts = ref<Record<Rule['type'], string>>({ do: '', dont: '' })

const COLUMNS = [
  { type: 'do', title: 'Do', icon: 'solar:check-circle-linear', empty: 'Nothing required yet' },
  { type: 'dont', title: "Don't", icon: 'solar:close-circle-linear', empty: 'Nothing ruled out yet' },
] as const

function add(type: Rule['type']): void {
  const text = drafts.value[type].trim()
  if (!text) return
  emit('update:modelValue', [...props.modelValue, { type, text }])
  drafts.value[type] = ''
}

function remove(rule: Rule): void {
  emit('update:modelValue', props.modelValue.filter((r) => r !== rule))
}
</script>

<template>
  <div class="ds-rules">
    <section v-for="column of COLUMNS" :key="column.type" class="ds-rules__column" :class="`ds-rules__column--${column.type}`">
      <h4 class="ds-rules__title"><DsIcon :name="column.icon" /> {{ column.title }}</h4>
      <ul class="ds-rules__list">
        <li v-for="(rule, i) of modelValue.filter((r) => r.type === column.type)" :key="i" class="ds-rules__rule">
          <span>{{ rule.text }}</span>
          <button v-if="editable" type="button" class="ds-rules__remove" :aria-label="`Remove: ${rule.text}`" @click="remove(rule)">
            <DsIcon name="solar:close-circle-linear" />
          </button>
        </li>
        <li v-if="!modelValue.some((r) => r.type === column.type)" class="ds-rules__none">{{ column.empty }}</li>
      </ul>
      <form v-if="editable" class="ds-rules__add" @submit.prevent="add(column.type)">
        <input v-model="drafts[column.type]" :placeholder="column.type === 'do' ? 'Add something to always do' : 'Add something to never do'" :aria-label="`Add a ${column.title} rule`" />
        <button type="submit" :aria-label="`Add the ${column.title} rule`" :disabled="!drafts[column.type].trim()"><DsIcon name="solar:add-circle-linear" /></button>
      </form>
    </section>
  </div>
</template>

<style scoped>
.ds-rules {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: var(--ds-space-4);
}

.ds-rules__column {
  display: grid;
  align-content: start;
  gap: var(--ds-space-2);
  padding: var(--ds-space-4);
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-radius-card);
  background: var(--ds-bg-surface);
}

.ds-rules__title {
  display: flex;
  align-items: center;
  gap: var(--ds-space-1);
  margin: 0;
  font-size: var(--ds-text-sm);
  font-weight: var(--ds-font-weight-semibold);
}

.ds-rules__column--do .ds-rules__title {
  color: var(--ds-status-success-text);
}

.ds-rules__column--dont .ds-rules__title {
  color: var(--ds-status-error-text);
}

.ds-rules__list {
  display: grid;
  gap: var(--ds-space-1);
  margin: 0;
  padding: 0;
  list-style: none;
}

.ds-rules__rule {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--ds-space-2);
  color: var(--ds-text-primary);
  font-size: var(--ds-text-sm);
}

.ds-rules__none {
  color: var(--ds-text-muted);
  font-size: var(--ds-text-sm);
}

.ds-rules__remove,
.ds-rules__add button {
  display: grid;
  flex: none;
  place-items: center;
  padding: 0.125rem;
  border: 0;
  border-radius: var(--ds-radius-full);
  background: none;
  color: var(--ds-text-muted);
  font-size: 1rem;
  cursor: pointer;
}

.ds-rules__add {
  display: flex;
  gap: var(--ds-space-2);
}

.ds-rules__add input {
  flex: 1;
  min-width: 0;
  padding: 0.375rem 0.5rem;
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-radius-control);
  background: var(--ds-bg-base);
  color: var(--ds-text-primary);
  font: inherit;
  font-size: var(--ds-text-sm);
}

.ds-rules__add input:focus-visible,
.ds-rules__remove:focus-visible,
.ds-rules__add button:focus-visible {
  outline: 2px solid var(--ds-border-focus);
  outline-offset: 1px;
}

.ds-rules__add button:disabled {
  cursor: default;
  opacity: 0.4;
}
</style>
