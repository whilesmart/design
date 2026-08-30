<script setup lang="ts" generic="Row extends Record<string, unknown>">
export interface DataTableColumn {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
  width?: string
}

withDefaults(defineProps<{
  columns: DataTableColumn[]
  rows: Row[]
  rowKey?: string
  loading?: boolean
  emptyText?: string
}>(), {
  rowKey: 'id',
  loading: false,
  emptyText: 'No results'
})

defineEmits<{ rowClick: [row: Row] }>()

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
        <tr v-for="row in rows" v-else :key="String(row[rowKey])" @click="$emit('rowClick', row)">
          <td v-for="column in columns" :key="column.key" :class="column.align">
            <slot :name="`cell-${column.key}`" :row="row" :value="valueAt(row, column.key)">{{ valueAt(row, column.key) }}</slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.ds-table-wrap{width:100%;overflow:auto;border:1px solid var(--ds-border-base);border-radius:var(--ds-radius-lg);background:var(--ds-bg-elevated)}
.ds-table{width:100%;min-width:36rem;border-collapse:collapse;font-size:var(--ds-text-sm)}
thead{background:var(--ds-color-primary-50)}
th{padding:.65rem 1rem;border-bottom:1px solid var(--ds-border-base);color:var(--ds-color-primary-900);font-size:var(--ds-text-xs);font-weight:var(--ds-font-bold);letter-spacing:.06em;text-align:left;text-transform:uppercase;white-space:nowrap}
td{padding:.7rem 1rem;border-bottom:1px solid var(--ds-border-base);color:var(--ds-text-primary);vertical-align:middle}
tbody tr{transition:background var(--ds-transition-fast)}tbody tr:hover{background:var(--ds-color-primary-50)}tbody tr:last-child td{border-bottom:0}
.right{text-align:right}.center{text-align:center}.state-cell{padding:var(--ds-space-8);color:var(--ds-text-secondary);text-align:center}
</style>
