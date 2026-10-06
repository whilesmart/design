<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(defineProps<{ html: string; name: string; autoHeight?: boolean; allowLinks?: boolean; variant?: 'document' | 'markdown' }>(), { autoHeight: true, allowLinks: false, variant: 'document' })
const height = ref('30rem')
watch(() => props.html, () => { height.value = '30rem' })
function resize(event: Event) {
  if (!props.autoHeight) return
  const frame = event.currentTarget as HTMLIFrameElement
  const content = frame.contentDocument
  const sync = () => {
    if (content && frame.contentDocument === content) height.value = `${Math.max(content.documentElement.scrollHeight, content.body.scrollHeight)}px`
  }
  content?.querySelectorAll('img').forEach(image => {
    image.addEventListener('load', sync, { once: true })
    image.addEventListener('error', sync, { once: true })
  })
  sync()
  requestAnimationFrame(sync)
}
</script>

<template>
  <iframe class="preview-frame" :class="`preview-frame--${variant}`" :srcdoc="html" :title="`Preview ${name}`" :sandbox="allowLinks ? 'allow-same-origin allow-popups allow-popups-to-escape-sandbox' : 'allow-same-origin'" scrolling="no" :style="autoHeight ? { height } : undefined" @load="resize" />
</template>

<style scoped>
.preview-frame { display: block; width: 100%; min-height: 30rem; border: 0; background: var(--ds-bg-elevated); }
.preview-frame--markdown { width: min(210mm, 100%); align-self: start; }
</style>
