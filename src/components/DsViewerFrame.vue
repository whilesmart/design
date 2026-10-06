<script setup lang="ts">
import DsIcon from './DsIcon.vue'

withDefaults(defineProps<{
  name: string
  kind?: string
  loading?: boolean
  error?: string
  downloadSource?: string
  hasPrevious?: boolean
  hasNext?: boolean
  showNavigation?: boolean
}>(), { kind: 'unsupported', showNavigation: true })
const emit = defineEmits<{ previous: []; next: [] }>()
let touchStartX = 0
function startSwipe(event: TouchEvent) { touchStartX = event.changedTouches[0]?.clientX || 0 }
function endSwipe(event: TouchEvent, previous: boolean, next: boolean) {
  const distance = (event.changedTouches[0]?.clientX || 0) - touchStartX
  if (distance > 56 && previous) emit('previous')
  if (distance < -56 && next) emit('next')
}
</script>

<template>
  <section class="file-viewer" :class="`file-viewer--${kind}`" :aria-label="`Preview ${name}`" @touchstart.passive="startSwipe" @touchend.passive="endSwipe($event, showNavigation && !!hasPrevious, showNavigation && !!hasNext)">
    <button v-if="showNavigation && hasPrevious" type="button" class="file-viewer__nav file-viewer__nav--previous" aria-label="Previous file" @click="$emit('previous')"><DsIcon name="material-symbols:chevron-left-rounded" /></button>
    <div v-if="loading" class="file-viewer__state" role="status">Opening {{ name }}…</div>
    <div v-else-if="error" class="file-viewer__state file-viewer__state--error" role="alert">
      <span class="file-viewer__state-icon"><DsIcon :name="kind === 'image' ? 'solar:gallery-remove-bold-duotone' : 'solar:file-corrupted-bold-duotone'" /></span>
      <h2>Preview unavailable</h2><p>{{ error }}</p>
      <a v-if="downloadSource" :href="downloadSource" download>Try downloading</a>
    </div>
    <slot v-else />
    <button v-if="showNavigation && hasNext" type="button" class="file-viewer__nav file-viewer__nav--next" aria-label="Next file" @click="$emit('next')"><DsIcon name="material-symbols:chevron-right-rounded" /></button>
  </section>
</template>

<style scoped>

.file-viewer {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  margin-inline: auto;
	min-height: 32rem;
  overflow: hidden;
  border: 1px solid var(--ds-border-strong);
  border-radius: var(--ds-radius-md);
  background: var(--ds-bg-base);
  box-shadow: var(--ds-elevation-2);
}

.file-viewer--image { width: fit-content; min-width: 0; min-height: 0; max-width: 100%; background: transparent; box-shadow: none; }
.file-viewer--pdf, .file-viewer--text { min-height: calc(100vh - 8.5rem); border: 0; border-radius: 0; background: transparent; box-shadow: none; }
.file-viewer--document { min-height: calc(100vh - 8.5rem); border: 0; background: transparent; box-shadow: none; }
.file-viewer--spreadsheet { width: 100%; height: 100%; min-height: calc(100vh - 8.5rem); border-radius: var(--ds-radius-none); box-shadow: none; }

.file-viewer__nav {
  position: absolute;
  top: 50%;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0;
  transform: translateY(-50%);
  border: 1px solid var(--ds-border-strong);
  border-radius: var(--ds-radius-lg);
  background: var(--ds-bg-elevated);
  color: var(--ds-text-primary);
  box-shadow: var(--ds-elevation-3);
  cursor: pointer;
  font-size: 1.5rem;
}

.file-viewer__nav:hover { background: var(--ds-bg-surface); }
.file-viewer__nav--previous { left: var(--ds-space-4); }
.file-viewer__nav--next { right: var(--ds-space-4); }

.file-viewer__state { max-width: 28rem; padding: var(--ds-space-8); color: var(--ds-text-secondary); text-align: center; }
.file-viewer__state--error { display: grid; justify-items: center; gap: var(--ds-space-2); color: var(--ds-text-secondary); }
.file-viewer__state-icon { display: grid; width: 4rem; height: 4rem; place-items: center; border-radius: var(--ds-radius-xl); background: var(--ds-status-error-bg); color: var(--ds-status-error-text); font-size: 2rem; }
.file-viewer__state h2 { margin: var(--ds-space-2) 0 0; color: var(--ds-text-primary); font-size: var(--ds-text-xl); }
.file-viewer__state p { margin: 0; }
.file-viewer__state a { margin-top: var(--ds-space-2); padding: var(--ds-space-2) var(--ds-space-4); border: 1px solid var(--ds-border-base); border-radius: var(--ds-radius-md); color: var(--ds-text-primary); text-decoration: none; }
@media (max-width: 640px) { .file-viewer--pdf, .file-viewer--text, .file-viewer--document { min-height: calc(100vh - 9rem); }.file-viewer__nav { top: auto; bottom: var(--ds-space-4); transform: none; } }

.file-viewer__nav:focus-visible { outline: 2px solid var(--ds-interactive-primary); outline-offset: 2px; }
</style>
