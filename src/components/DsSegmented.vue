<script setup lang="ts">
import { computed } from 'vue'
import { areaStyle, type AreaColor } from '../areas'

export interface Segment {
  key: string
  label: string
}

// A closed set of alternatives where exactly one holds at a time.
const props = withDefaults(
  defineProps<{
    modelValue: string
    options: Segment[]
    area?: AreaColor
    label?: string
    size?: 'sm' | 'md'
  }>(),
  { area: undefined, label: 'Choose one', size: 'md' },
)

defineEmits<{ 'update:modelValue': [value: string] }>()

const style = computed(() => areaStyle(props.area))
</script>

<template>
  <div
    class="ds-segmented"
    :class="`ds-segmented--${size}`"
    :style="style"
    role="radiogroup"
    :aria-label="label"
  >
    <button
      v-for="option of options"
      :key="option.key"
      type="button"
      role="radio"
      class="ds-segmented__option"
      :class="{ 'ds-segmented__option--on': option.key === modelValue }"
      :aria-checked="option.key === modelValue"
      @click="$emit('update:modelValue', option.key)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
/* fit-content as well as inline-flex: inline-level children still stretch to
   fill a grid area, and a pill group as wide as the page reads as a bar with
   one button lost at its left end. */
.ds-segmented {
  display: inline-flex;
  width: fit-content;
  gap: 2px;
  padding: 2px;
  border-radius: var(--ds-radius-full);
  background: var(--ds-bg-muted);
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
}

.ds-segmented::-webkit-scrollbar {
  display: none;
}

.ds-segmented__option {
  flex: 0 0 auto;
  border: 0;
  border-radius: var(--ds-radius-full);
  padding: 0.3rem 0.75rem;
  background: transparent;
  color: var(--ds-text-secondary);
  font: inherit;
  font-size: var(--ds-text-sm);
  line-height: 1.3;
  cursor: pointer;
  white-space: nowrap;
}

.ds-segmented--sm .ds-segmented__option {
  padding: 0.2rem 0.6rem;
  font-size: var(--ds-text-xs);
}

.ds-segmented__option:hover:not(.ds-segmented__option--on) {
  color: var(--ds-text-primary);
}

.ds-segmented__option--on {
  background: var(--ds-area-fill, var(--ds-bg-elevated));
  color: var(--ds-area-ink, var(--ds-text-primary));
  box-shadow: var(--ds-elevation-1);
}

.ds-segmented__option:focus-visible {
  outline: 2px solid var(--ds-area-solid, var(--ds-interactive-primary));
  outline-offset: 1px;
}
</style>
