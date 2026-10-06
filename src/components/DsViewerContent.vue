<script setup lang="ts">
import DsIcon from './DsIcon.vue'
import DsPreviewFrame from './DsPreviewFrame.vue'

defineProps<{ name: string; kind: string; source?: string; text?: string; html?: string; downloadSource?: string }>()
</script>

<template>
  <img v-if="kind === 'image'" class="file-viewer__image" :src="source" :alt="name" />
  <iframe v-else-if="kind === 'pdf'" class="file-viewer__frame" :src="source" :title="name" />
  <pre v-else-if="kind === 'text'" class="file-viewer__text">{{ text }}</pre>
  <audio v-else-if="kind === 'audio'" class="file-viewer__media" :src="source" controls />
  <video v-else-if="kind === 'video'" class="file-viewer__video" :src="source" controls />
  <DsPreviewFrame v-else-if="html" class="file-viewer__office-frame" :class="{ 'file-viewer__office-frame--spreadsheet': kind === 'spreadsheet' }" :html="html" :name="name" :auto-height="kind !== 'spreadsheet'" />
  <div v-else-if="kind === 'document'" class="file-viewer__document" :class="{ 'file-viewer__document--markdown': text !== undefined }">
    <pre v-if="text !== undefined" class="file-viewer__markdown">{{ text }}</pre>
    <template v-else><DsIcon name="solar:document-text-bold-duotone" /><h2>{{ name }}</h2><p>A preview is not available for this document format.</p><a v-if="downloadSource" :href="downloadSource" download>Download document</a></template>
  </div>
  <div v-else class="file-viewer__state">Preview is not available for this file type.</div>
</template>

<style scoped>
.file-viewer__frame { width: min(210mm, calc(100% - 2 * var(--ds-space-6))); height: calc(100vh - 6rem); min-height: 297mm; border: 1px solid var(--ds-border-base); background: var(--ds-bg-elevated); box-shadow: var(--ds-elevation-3); }
.file-viewer__office-frame { width: min(210mm, calc(100% - 2 * var(--ds-space-6))); min-height: 297mm; overflow: hidden; border: 1px solid var(--ds-border-base); background: var(--ds-bg-elevated); box-shadow: var(--ds-elevation-3); }
.file-viewer__office-frame--spreadsheet { width: 100%; height: 100%; min-height: calc(100vh - 8.5rem); border: 0; box-shadow: none; }
.file-viewer__video { width: 100%; height: min(72vh, 54rem); border: 0; }
.file-viewer__image { display: block; max-width: 100%; max-height: 72vh; object-fit: contain; }
.file-viewer__media { width: min(90%, 40rem); }
.file-viewer__text { box-sizing: border-box; width: min(210mm, calc(100% - 2 * var(--ds-space-6))); min-height: 297mm; margin: 0 auto; padding: clamp(2rem, 7vw, 5rem); overflow: visible; border: 1px solid var(--ds-border-base); background: var(--ds-bg-elevated); color: var(--ds-text-primary); box-shadow: var(--ds-elevation-3); font-family: var(--ds-font-mono); line-height: 1.7; white-space: pre-wrap; }
.file-viewer__document { display: grid; justify-items: center; align-content: center; width: min(46rem, calc(100% - 2 * var(--ds-space-6))); aspect-ratio: 1 / 1.414; min-height: 58rem; margin: 0 auto; padding: clamp(3rem, 8vw, 6rem); border: 1px solid var(--ds-border-base); background: var(--ds-bg-elevated); color: var(--ds-text-primary); box-shadow: var(--ds-elevation-5); text-align: center; }.file-viewer__document > .ds-icon { width: 4rem; height: 4rem; color: var(--ds-interactive-primary); }.file-viewer__document h2 { max-width: 28rem; margin: var(--ds-space-5) 0 var(--ds-space-2); overflow-wrap: anywhere; }.file-viewer__document p { max-width: 28rem; margin: 0 0 var(--ds-space-5); color: var(--ds-text-secondary); }.file-viewer__document a { padding: var(--ds-space-2) var(--ds-space-4); border-radius: var(--ds-radius-md); background: var(--ds-interactive-primary); color: var(--ds-text-inverse); text-decoration: none; }
.file-viewer__document--markdown { justify-items: stretch; align-content: start; text-align: left; }
.file-viewer__markdown { width: 100%; margin: 0; overflow: visible; color: var(--ds-text-primary); font-family: var(--ds-font-mono); font-size: var(--ds-text-sm); line-height: 1.75; white-space: pre-wrap; overflow-wrap: anywhere; }
@media (max-width: 640px) { .file-viewer__text { width: 100%; min-height: calc(100vh - 9rem); margin: 0; border: 0; padding: var(--ds-space-5); }.file-viewer__document { width: 100%; min-height: 42rem; padding: var(--ds-space-6); }}
</style>
