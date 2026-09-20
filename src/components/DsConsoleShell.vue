<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import DsIcon from './DsIcon.vue'
import DsSidebar from './DsSidebar.vue'

withDefaults(defineProps<{
  navLabel?: string
  railWidth?: string
  menuLabel?: string
  railClass?: string
}>(), { navLabel: 'Sections', railWidth: '16rem', menuLabel: 'Sections', railClass: '' })

const open = ref(false)

// The rail is a drawer below the breakpoint, so navigating inside it has to close it;
// a route change does not unmount the shell.
function close() {
  open.value = false
}

function lockScroll(locked: boolean) {
  if (typeof document === 'undefined') return
  document.body.style.overflow = locked ? 'hidden' : ''
}

watch(open, lockScroll)
// Unmounting with the drawer open would otherwise leave the host page unscrollable.
onBeforeUnmount(() => lockScroll(false))
</script>

<template>
  <div class="ds-console" :style="{ '--rail-width': railWidth }">
    <header class="ds-console__bar">
      <button class="ds-console__menu" type="button" :aria-label="menuLabel" @click="open = true">
        <DsIcon name="solar:hamburger-menu-linear" />
      </button>
      <slot name="brand" />
    </header>

    <div v-if="open" class="ds-console__scrim" @click="close" />

    <DsSidebar
      class="ds-console__rail"
      :class="[railClass, { 'is-open': open }]"
      :width="railWidth"
      :aria-label="navLabel"
    >
      <template #head>
        <slot name="brand" />
        <button class="ds-console__close" type="button" aria-label="Close" @click="close">
          <DsIcon name="solar:close-circle-linear" />
        </button>
      </template>

      <div class="ds-console__nav" @click="close">
        <slot name="nav" />
      </div>

      <template #footer>
        <div class="ds-console__foot" @click="close">
          <slot name="rail-footer" />
        </div>
      </template>
    </DsSidebar>

    <main class="ds-console__main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.ds-console {
  display: grid;
  min-height: 100vh;
  grid-template-columns: var(--rail-width) minmax(0, 1fr);
  background: var(--ds-bg-surface);
}

.ds-console__bar {
  display: none;
}

.ds-console__rail {
  position: sticky;
  top: 0;
  height: 100vh;
  align-self: start;
  padding: var(--ds-space-5) var(--ds-space-3);
}

.ds-console__close,
.ds-console__menu {
  display: none;
  padding: var(--ds-space-2);
  border: 0;
  border-radius: var(--ds-radius-md);
  background: none;
  color: var(--ds-text-secondary);
  font-size: 1.25rem;
  cursor: pointer;
}

.ds-console__nav,
.ds-console__foot {
  display: grid;
  gap: var(--ds-space-1);
}

.ds-console__foot {
  gap: var(--ds-space-2);
}

.ds-console__main {
  display: flex;
  width: min(1400px, 100%);
  flex-direction: column;
  gap: var(--ds-space-6);
  margin: 0 auto;
  padding: var(--ds-space-8) var(--ds-space-6);
}

@media (max-width: 900px) {
  .ds-console {
    grid-template-columns: minmax(0, 1fr);
  }

  .ds-console__bar {
    display: flex;
    position: sticky;
    top: 0;
    align-items: center;
    gap: var(--ds-space-2);
    padding: var(--ds-space-2) var(--ds-space-4);
    border-bottom: 1px solid var(--ds-border-base);
    background: color-mix(in srgb, var(--ds-bg-elevated) 86%, transparent);
    backdrop-filter: blur(16px);
    z-index: var(--ds-z-sticky);
  }

  .ds-console__menu,
  .ds-console__close {
    display: grid;
    place-items: center;
  }

  .ds-console__scrim {
    position: fixed;
    inset: 0;
    background: var(--ds-bg-overlay);
    z-index: var(--ds-z-modal-backdrop);
  }

  .ds-console__rail {
    position: fixed;
    top: 0;
    left: 0;
    width: min(20rem, 84vw) !important;
    min-width: 0 !important;
    height: 100dvh;
    box-shadow: var(--ds-elevation-4);
    transform: translateX(-100%);
    transition: transform var(--ds-transition-base);
    z-index: var(--ds-z-modal);
  }

  .ds-console__rail.is-open {
    transform: translateX(0);
  }

  .ds-console__main {
    gap: var(--ds-space-5);
    padding: var(--ds-space-5) var(--ds-space-4);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ds-console__rail {
    transition: none;
  }
}
</style>
