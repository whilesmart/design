<script setup lang="ts">
import { ref } from 'vue'
import DsIcon from './DsIcon.vue'

export interface PaletteColour {
  hex: string
  label: string
}

const props = withDefaults(defineProps<{ modelValue: PaletteColour[]; editable?: boolean; label?: string }>(), {
  editable: false,
  label: 'Colour palette',
})
const emit = defineEmits<{ 'update:modelValue': [value: PaletteColour[]] }>()
const copied = ref<number | null>(null)

const HEX = /^#[0-9a-f]{6}$/i

function change(at: number, patch: Partial<PaletteColour>): void {
  if (patch.hex !== undefined && !HEX.test(patch.hex)) return
  emit('update:modelValue', props.modelValue.map((c, i) => (i === at ? { ...c, ...patch, hex: (patch.hex ?? c.hex).toUpperCase() } : c)))
}

function remove(at: number): void {
  emit('update:modelValue', props.modelValue.filter((_, i) => i !== at))
}

function add(): void {
  emit('update:modelValue', [...props.modelValue, { hex: '#808080', label: '' }])
}

async function copy(at: number): Promise<void> {
  try {
    await navigator.clipboard.writeText(props.modelValue[at]!.hex)
    copied.value = at
    setTimeout(() => copied.value === at && (copied.value = null), 1200)
  } catch {
    // A page without clipboard access still shows the hex to copy by hand.
  }
}
</script>

<template>
  <ul class="ds-palette" :aria-label="label">
    <li v-for="(colour, i) of modelValue" :key="i" class="ds-palette__one">
      <label v-if="editable" class="ds-palette__chip" :style="{ background: colour.hex }">
        <input type="color" :value="colour.hex" :aria-label="`Pick colour ${i + 1}`" @input="change(i, { hex: ($event.target as HTMLInputElement).value })" />
      </label>
      <button v-else type="button" class="ds-palette__chip" :style="{ background: colour.hex }" :aria-label="`Copy ${colour.hex}`" @click="copy(i)">
        <span v-if="copied === i" class="ds-palette__copied">Copied</span>
      </button>
      <div class="ds-palette__meta">
        <template v-if="editable">
          <input class="ds-palette__name" :value="colour.label" placeholder="Name" :aria-label="`Name of colour ${i + 1}`" @change="change(i, { label: ($event.target as HTMLInputElement).value })" />
          <input class="ds-palette__hex" :value="colour.hex" :aria-label="`Hex of colour ${i + 1}`" @change="change(i, { hex: ($event.target as HTMLInputElement).value })" />
        </template>
        <template v-else>
          <span class="ds-palette__name">{{ colour.label || 'Unnamed' }}</span>
          <span class="ds-palette__hex">{{ colour.hex }}</span>
        </template>
      </div>
      <button v-if="editable" type="button" class="ds-palette__remove" :aria-label="`Remove ${colour.hex}`" @click="remove(i)">
        <DsIcon name="solar:close-circle-linear" />
      </button>
    </li>
    <li v-if="editable" class="ds-palette__one">
      <button type="button" class="ds-palette__chip ds-palette__add" aria-label="Add a colour" @click="add">
        <DsIcon name="solar:add-circle-linear" />
      </button>
    </li>
  </ul>
</template>

<style scoped>
.ds-palette {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(8.5rem, 1fr));
  gap: var(--ds-space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.ds-palette__one {
  position: relative;
  display: grid;
  gap: var(--ds-space-2);
  min-width: 0;
}

.ds-palette__chip {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  aspect-ratio: 4 / 3;
  padding: 0;
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-radius-card);
  cursor: pointer;
}

.ds-palette__chip:focus-visible,
.ds-palette__chip:focus-within {
  outline: 2px solid var(--ds-border-focus);
  outline-offset: 2px;
}

.ds-palette__chip input[type='color'] {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.ds-palette__add {
  border-style: dashed;
  background: var(--ds-bg-subtle);
  color: var(--ds-text-muted);
  font-size: 1.5rem;
}

.ds-palette__copied {
  padding: 0.125rem 0.5rem;
  border-radius: var(--ds-radius-full);
  background: var(--ds-bg-elevated);
  color: var(--ds-text-primary);
  font-size: var(--ds-text-xs);
}

.ds-palette__meta {
  display: grid;
  gap: 0.125rem;
  min-width: 0;
}

.ds-palette__name,
.ds-palette__hex {
  overflow: hidden;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  color: var(--ds-text-primary);
  font: inherit;
  font-size: var(--ds-text-sm);
  font-weight: var(--ds-font-weight-semibold);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ds-palette__hex {
  color: var(--ds-text-secondary);
  font-family: var(--ds-font-mono);
  font-size: var(--ds-text-xs);
  font-weight: var(--ds-font-weight-normal);
  text-transform: uppercase;
}

input.ds-palette__name,
input.ds-palette__hex {
  border-radius: var(--ds-radius-sm);
}

input.ds-palette__name:focus-visible,
input.ds-palette__hex:focus-visible {
  outline: 2px solid var(--ds-border-focus);
  outline-offset: 1px;
}

.ds-palette__remove {
  position: absolute;
  top: var(--ds-space-1);
  right: var(--ds-space-1);
  display: grid;
  place-items: center;
  padding: 0.125rem;
  border: 0;
  border-radius: var(--ds-radius-full);
  background: var(--ds-bg-elevated);
  color: var(--ds-text-secondary);
  font-size: 1rem;
  cursor: pointer;
  opacity: 0;
  transition: opacity var(--ds-transition-fast);
}

.ds-palette__one:hover .ds-palette__remove,
.ds-palette__remove:focus-visible {
  opacity: 1;
}
</style>
