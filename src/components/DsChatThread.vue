<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

withDefaults(defineProps<{ label?: string }>(), { label: 'Conversation' })

const scroller = ref<HTMLElement | null>(null)
const content = ref<HTMLElement | null>(null)
const pinned = ref(true)
let observer: ResizeObserver | null = null

function scrollToEnd(behavior: ScrollBehavior = 'auto'): void {
  const el = scroller.value
  if (el) el.scrollTo({ top: el.scrollHeight, behavior })
  pinned.value = true
}

// Someone reading an earlier turn stays where they are; only a reader at the end follows new text.
function track(): void {
  const el = scroller.value
  if (el) pinned.value = el.scrollHeight - el.scrollTop - el.clientHeight < 48
}

onMounted(() => {
  scrollToEnd()
  if (typeof ResizeObserver === 'undefined' || !content.value) return
  observer = new ResizeObserver(() => {
    if (pinned.value) scrollToEnd()
  })
  observer.observe(content.value)
})

onBeforeUnmount(() => observer?.disconnect())

defineExpose({ scrollToEnd })
</script>

<template>
  <div ref="scroller" class="ds-chat-thread" role="log" aria-live="polite" :aria-label="label" tabindex="0" @scroll.passive="track">
    <div ref="content" class="ds-chat-thread__content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.ds-chat-thread {
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.ds-chat-thread:focus-visible {
  outline: 2px solid var(--ds-border-focus);
  outline-offset: -2px;
}

.ds-chat-thread__content {
  display: grid;
  gap: var(--ds-chat-thread-gap, var(--ds-space-5));
  padding: var(--ds-chat-thread-padding, var(--ds-space-4));
}
</style>
