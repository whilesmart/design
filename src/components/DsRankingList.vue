<script setup lang="ts">
import { computed } from 'vue'
import { areaStyle, type AreaColor } from '../areas'
import { peakOf } from '../charts'

export interface RankingRow {
  label: string
  value: number
}

const props = withDefaults(defineProps<{
  rows: RankingRow[]
  area?: AreaColor
  limit?: number
  format?: (value: number) => string
}>(), { area: 'indigo', limit: 8, format: undefined })

const style = computed(() => areaStyle(props.area))
const shown = computed(() => props.rows.slice(0, props.limit))
const peak = computed(() => peakOf(props.rows.map((row) => ({ date: '', value: row.value }))))
const counts = new Intl.NumberFormat()
const display = (value: number) => (props.format ? props.format(value) : counts.format(value))
</script>

<template>
  <ol class="ds-ranking" :style="style">
    <li v-for="(row, index) in shown" :key="`${row.label}-${index}`" class="ds-ranking__row">
      <span class="ds-ranking__rank">{{ index + 1 }}</span>
      <span class="ds-ranking__label" :title="row.label">{{ row.label }}</span>
      <span class="ds-ranking__track">
        <span class="ds-ranking__fill" :style="{ width: `${Math.max((row.value / peak) * 100, 2)}%` }" />
      </span>
      <span class="ds-ranking__value">{{ display(row.value) }}</span>
    </li>
  </ol>
</template>

<style scoped>
.ds-ranking {
  display: grid;
  gap: var(--ds-space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.ds-ranking__row {
  display: grid;
  align-items: center;
  gap: var(--ds-space-3);
  grid-template-columns: 1.25rem minmax(6rem, 1fr) minmax(3rem, 8rem) auto;
  font-size: var(--ds-text-sm);
}

.ds-ranking__rank {
  color: var(--ds-text-muted);
  font-size: var(--ds-text-xs);
  font-variant-numeric: tabular-nums;
}

.ds-ranking__label {
  overflow: hidden;
  color: var(--ds-text-primary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ds-ranking__track {
  height: 0.5rem;
  border-radius: var(--ds-radius-full);
  background: var(--ds-area-fill);
}

.ds-ranking__fill {
  display: block;
  height: 100%;
  border-radius: var(--ds-radius-full);
  background: var(--ds-area-solid);
}

.ds-ranking__value {
  color: var(--ds-text-primary);
  font-weight: var(--ds-font-semibold);
  font-variant-numeric: tabular-nums;
}

@media (max-width: 560px) {
  .ds-ranking__row {
    grid-template-columns: 1.25rem minmax(0, 1fr) auto;
  }

  .ds-ranking__track {
    display: none;
  }
}
</style>
