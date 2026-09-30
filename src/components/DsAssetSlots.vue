<script setup lang="ts">
import DsIcon from './DsIcon.vue'

export interface AssetSlot {
  id: string
  label: string
  hint?: string
  /** The file shown in the slot; empty when nothing is there yet. */
  src?: string | null
  /** What the asset is seen on: a light ground, a dark one, or a checkerboard when it could be either. */
  ground?: 'light' | 'dark' | 'check'
  /** False when a filled slot can only be removed, not uploaded over. */
  replaceable?: boolean
}

withDefaults(defineProps<{ slots: AssetSlot[]; editable?: boolean; accept?: string; label?: string }>(), {
  editable: false,
  accept: 'image/svg+xml,image/png,image/jpeg,image/webp',
  label: 'Brand assets',
})
const emit = defineEmits<{ upload: [id: string, file: File]; remove: [id: string] }>()

function picked(id: string, event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) emit('upload', id, file)
  input.value = ''
}
</script>

<template>
  <ul class="ds-assets" :aria-label="label">
    <li v-for="slot of slots" :key="slot.id" class="ds-assets__one">
      <div class="ds-assets__ground" :class="`ds-assets__ground--${slot.ground ?? 'check'}`">
        <img v-if="slot.src" :src="slot.src" :alt="slot.label" />
        <span v-else class="ds-assets__empty"><DsIcon name="solar:gallery-add-linear" /> Nothing yet</span>
      </div>
      <div class="ds-assets__meta">
        <strong>{{ slot.label }}</strong>
        <span v-if="slot.hint">{{ slot.hint }}</span>
      </div>
      <div v-if="editable" class="ds-assets__acts">
        <label v-if="!slot.src || slot.replaceable !== false" class="ds-assets__act">
          <input type="file" :accept="accept" @change="picked(slot.id, $event)" />
          <DsIcon :name="slot.src ? 'solar:refresh-linear' : 'solar:upload-linear'" />
          {{ slot.src ? 'Replace' : 'Upload' }}
        </label>
        <button v-if="slot.src" type="button" class="ds-assets__act" @click="emit('remove', slot.id)">
          <DsIcon name="solar:trash-bin-minimalistic-linear" /> Remove
        </button>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.ds-assets {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(13rem, 100%), 1fr));
  gap: var(--ds-space-4);
  margin: 0;
  padding: 0;
  list-style: none;
}

.ds-assets__one {
  display: grid;
  gap: var(--ds-space-2);
  align-content: start;
  min-width: 0;
}

.ds-assets__ground {
  display: grid;
  grid-template: minmax(0, 1fr) / minmax(0, 1fr);
  place-items: center;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  padding: var(--ds-space-4);
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-radius-card);
}

.ds-assets__ground--light {
  background: var(--ds-ground-light);
}

.ds-assets__ground--dark {
  background: var(--ds-ground-dark);
}

.ds-assets__ground--check {
  background-color: var(--ds-ground-light);
  background-image: conic-gradient(var(--ds-color-neutral-200) 25%, transparent 0 50%, var(--ds-color-neutral-200) 0 75%, transparent 0);
  background-size: 16px 16px;
}

.ds-assets__ground img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.ds-assets__empty {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-space-1);
  padding: 0.25rem 0.625rem;
  border-radius: var(--ds-radius-full);
  background: rgba(15, 23, 42, 0.06);
  color: var(--ds-color-neutral-600);
  font-size: var(--ds-text-xs);
}

.ds-assets__ground--dark .ds-assets__empty {
  background: rgba(255, 255, 255, 0.08);
  color: var(--ds-color-neutral-300);
}

.ds-assets__meta {
  display: grid;
  gap: 0.125rem;
  font-size: var(--ds-text-sm);
}

.ds-assets__meta strong {
  color: var(--ds-text-primary);
  font-weight: var(--ds-font-weight-semibold);
}

.ds-assets__meta span {
  color: var(--ds-text-secondary);
  font-size: var(--ds-text-xs);
}

.ds-assets__acts {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ds-space-2);
}

.ds-assets__act {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--ds-space-1);
  padding: 0.25rem 0.625rem;
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-radius-control);
  background: var(--ds-bg-surface);
  color: var(--ds-text-primary);
  font: inherit;
  font-size: var(--ds-text-xs);
  cursor: pointer;
}

.ds-assets__act:hover {
  background: var(--ds-bg-hover);
}

.ds-assets__act:focus-within,
.ds-assets__act:focus-visible {
  outline: 2px solid var(--ds-border-focus);
  outline-offset: 2px;
}

.ds-assets__act input[type='file'] {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}
</style>
