<script setup lang="ts" generic="Row extends Record<string, unknown>">
import { computed, getCurrentInstance } from 'vue'

export interface DataTableColumn {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
  width?: string
}

const props = withDefaults(defineProps<{
  columns: DataTableColumn[]
  rows: Row[]
  rowKey?: string
  loading?: boolean
  emptyText?: string
  /** Defaults to whether a rowClick listener is attached, so rows never look inert while they act. */
  clickable?: boolean
}>(), {
  rowKey: 'id',
  loading: false,
  emptyText: 'No results',
  clickable: undefined
})

defineEmits<{ rowClick: [row: Row] }>()

// Vue strips listeners for declared emits from $attrs, so the raw vnode props are the
// only place a rowClick binding can be seen from inside.
const instance = getCurrentInstance()
const isClickable = computed(() => props.clickable ?? Boolean(instance?.vnode.props?.onRowClick))

const valueAt = (row: Row, key: string): unknown => key.split('.').reduce<unknown>((value, part) => {
  if (value === null || typeof value !== 'object') return undefined
  return (value as Record<string, unknown>)[part]
}, row)
</script>

<template>
  <div class="ds-table-wrap">
    <table class="ds-table">
      <thead><tr><th v-for="column in columns" :key="column.key" :class="column.align" :style="column.width ? { width: column.width } : undefined">{{ column.label }}</th></tr></thead>
      <tbody>
        <tr v-if="loading"><td :colspan="columns.length" class="state-cell">Loading…</td></tr>
        <tr v-else-if="!rows.length"><td :colspan="columns.length" class="state-cell">{{ emptyText }}</td></tr>
        <tr v-for="row in rows" v-else :key="String(row[rowKey])" :class="{ 'is-clickable': isClickable }" @click="isClickable && $emit('rowClick', row)">
          <td v-for="column in columns" :key="column.key" :class="column.align">
            <slot :name="`cell-${column.key}`" :row="row" :value="valueAt(row, column.key)">{{ valueAt(row, column.key) }}</slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.ds-table-wrap{width:100%;overflow:auto;border:1px solid var(--ds-border-base);border-radius:var(--ds-radius-card);background:var(--ds-bg-elevated)}
.ds-table{width:100%;min-width:36rem;border-collapse:collapse;font-size:var(--ds-text-sm)}
thead{background:var(--ds-color-primary-50)}
th{padding:var(--ds-table-cell-padding);border-bottom:1px solid var(--ds-border-base);color:var(--ds-color-primary-900);font-size:var(--ds-text-xs);font-weight:var(--ds-font-bold);letter-spacing:.06em;text-align:left;text-transform:uppercase;white-space:nowrap}
td{padding:var(--ds-table-cell-padding);border-bottom:1px solid var(--ds-border-base);color:var(--ds-text-primary);vertical-align:middle}
tbody tr{transition:background var(--ds-transition-fast)}tbody tr:hover{background:var(--ds-color-primary-50)}tbody tr.is-clickable{cursor:pointer}tbody tr:last-child td{border-bottom:0}
.right{text-align:right}.center{text-align:center}.state-cell{padding:var(--ds-space-8);color:var(--ds-text-secondary);text-align:center}
</style>
