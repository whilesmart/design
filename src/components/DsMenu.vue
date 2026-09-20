<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

withDefaults(defineProps<{ align?: 'start' | 'end' }>(), { align: 'end' })

const open = ref(false)
const root = ref<HTMLElement | null>(null)

function close(event?: Event) {
  if (event && root.value?.contains(event.target as Node)) return
  open.value = false
}

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('click', close)
  document.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', close)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div ref="root" class="ds-menu">
    <span
      class="ds-menu__trigger"
      aria-haspopup="menu"
      :aria-expanded="open"
      @click.stop="open = !open"
    >
      <!-- The trigger slot takes a focusable control: this wrapper adds no tab stop. -->
      <slot name="trigger" :open="open" />
    </span>
    <div v-if="open" class="ds-menu__panel" :class="`ds-menu__panel--${align}`" @click="open = false">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.ds-menu {
  display: inline-flex;
  position: relative;
}

.ds-menu__panel {
  display: grid;
  position: absolute;
  top: calc(100% + var(--ds-space-1));
  min-width: 12rem;
  padding: var(--ds-space-1);
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-radius-lg);
  background: var(--ds-bg-elevated);
  box-shadow: var(--ds-elevation-3);
  z-index: var(--ds-z-dropdown);
}

.ds-menu__panel--end {
  right: 0;
}

.ds-menu__panel--start {
  left: 0;
}
</style>
