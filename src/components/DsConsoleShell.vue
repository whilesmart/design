<script setup lang="ts">
import { onBeforeUnmount, ref, useSlots, watch } from 'vue'
import DsIcon from './DsIcon.vue'
import DsSidebar from './DsSidebar.vue'

withDefaults(defineProps<{
  navLabel?: string
  railWidth?: string
  menuLabel?: string
  railClass?: string
  // Flush: rail, bar and content are one surface, and the document scrolls.
  // Boxed: rail and bar are chrome on a ground, and the content is a card on
  // that ground which scrolls by itself.
  frame?: 'flush' | 'boxed'
}>(), {
  navLabel: 'Sections',
  railWidth: '16rem',
  menuLabel: 'Sections',
  railClass: '',
  frame: 'flush',
})

const slots = useSlots()
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
  <div
    class="ds-console"
    :class="[`ds-console--${frame}`, { 'ds-console--barred': !!slots.bar || !!slots['bar-start'] }]"
    :style="{ '--rail-width': railWidth }"
  >
    <header class="ds-console__bar">
      <button class="ds-console__menu" type="button" :aria-label="menuLabel" @click="open = true">
        <DsIcon name="solar:hamburger-menu-linear" />
      </button>

      <!-- The rail is a drawer below the breakpoint, so the bar carries the
           brand until it is opened. -->
      <div class="ds-console__bar-brand"><slot name="brand" /></div>

      <div v-if="slots['bar-start']" class="ds-console__bar-start">
        <slot name="bar-start" />
      </div>

      <div class="ds-console__bar-rest"><slot name="bar" /></div>
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
      <div class="ds-console__page">
        <div class="ds-console__page-inner">
          <slot />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.ds-console {
  display: grid;
  min-height: 100vh;
  grid-template-columns: var(--rail-width) minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr);
  grid-template-areas:
    'rail bar'
    'rail main';
  background: var(--ds-bg-surface);
}

.ds-console__bar {
  display: none;
  grid-area: bar;
}

.ds-console--barred .ds-console__bar {
  display: flex;
  position: sticky;
  top: 0;
  height: var(--ds-console-bar-height);
  align-items: center;
  gap: var(--ds-space-3);
  padding: 0 var(--ds-space-6);
  border-bottom: 1px solid var(--ds-border-base);
  background: color-mix(in srgb, var(--ds-bg-elevated) 86%, transparent);
  backdrop-filter: blur(16px);
  z-index: var(--ds-z-sticky);
}

/* The rail shows the brand above the breakpoint, so the bar does not. */
.ds-console__bar-brand {
  display: none;
}

.ds-console__bar-start {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: var(--ds-space-2);
}

.ds-console__bar-rest {
  display: flex;
  flex: 1;
  min-width: 0;
  align-items: center;
  justify-content: flex-end;
  gap: var(--ds-space-2);
}

.ds-console__rail {
  position: sticky;
  top: 0;
  grid-area: rail;
  height: 100vh;
  align-self: start;
  padding: var(--ds-space-5) var(--ds-space-3);
}

/* The head is the bar's row: same height, same top, so what is in it lines up
   with what is on the bar. */
.ds-console--barred .ds-console__rail {
  padding-top: 0;
}

.ds-console--barred .ds-console__rail :deep(.ds-sidebar__head) {
  height: var(--ds-console-bar-height);
  min-height: var(--ds-console-bar-height);
  margin-bottom: var(--ds-space-2);
}

/* The nav scrolls, not the rail. Setting one axis to auto sets the other to
   auto too, so a scrolling rail clips whatever its head opens. */
.ds-console__rail {
  overflow: visible;
}

.ds-console__rail :deep(.ds-sidebar__nav) {
  min-height: 0;
  overflow-y: auto;
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
  grid-area: main;
  min-width: 0;
}

.ds-console__page-inner {
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-6);
}

.ds-console--flush .ds-console__page {
  width: min(1400px, 100%);
  margin: 0 auto;
  padding: var(--ds-space-8) var(--ds-space-6);
}

/* The card scrolls, so its corners and its bottom edge hold however long the
   page gets. */
.ds-console--boxed {
  height: 100vh;
  min-height: 0;
  overflow: hidden;
  background: var(--ds-bg-muted);
}

.ds-console--boxed .ds-console__rail {
  position: static;
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  align-self: stretch;
  background: var(--ds-bg-muted);
}

.ds-console--boxed.ds-console--barred .ds-console__bar {
  background: var(--ds-bg-muted);
  backdrop-filter: none;
}

.ds-console--boxed .ds-console__main {
  min-height: 0;
  padding: var(--ds-shell-gutter);
  overflow: hidden;
}

.ds-console--boxed .ds-console__page {
  height: 100%;
  min-height: 0;
  padding: var(--ds-space-6);
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-shell-radius);
  background: var(--ds-bg-base);
  overflow-y: auto;
  overflow-x: hidden;
}

.ds-console--boxed .ds-console__page-inner {
  width: min(1400px, 100%);
  margin: 0 auto;
}

@media (max-width: 900px) {
  .ds-console,
  .ds-console--boxed {
    height: auto;
    min-height: 100vh;
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      'bar'
      'main';
    overflow: visible;
  }

  /* The bar is the only way back to the rail here, filled or not. */
  .ds-console__bar,
  .ds-console--barred .ds-console__bar,
  .ds-console--boxed.ds-console--barred .ds-console__bar {
    display: flex;
    position: sticky;
    top: 0;
    height: auto;
    align-items: center;
    gap: var(--ds-space-2);
    padding: var(--ds-space-2) var(--ds-space-4);
    border-bottom: 1px solid var(--ds-border-base);
    background: color-mix(in srgb, var(--ds-bg-elevated) 86%, transparent);
    backdrop-filter: blur(16px);
    z-index: var(--ds-z-sticky);
  }

  .ds-console__bar-brand {
    display: flex;
    min-width: 0;
    align-items: center;
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

  .ds-console__rail,
  .ds-console--boxed .ds-console__rail {
    position: fixed;
    top: 0;
    left: 0;
    width: min(20rem, 84vw) !important;
    min-width: 0 !important;
    height: 100dvh;
    background: var(--ds-bg-elevated);
    box-shadow: var(--ds-elevation-4);
    transform: translateX(-100%);
    transition: transform var(--ds-transition-base);
    z-index: var(--ds-z-modal);
  }

  .ds-console__rail.is-open {
    transform: translateX(0);
  }

  .ds-console--flush .ds-console__page {
    padding: var(--ds-space-5) var(--ds-space-4);
  }

  .ds-console--boxed .ds-console__main {
    padding: 0;
    overflow: visible;
  }

  .ds-console--boxed .ds-console__page {
    height: auto;
    padding: var(--ds-space-5) var(--ds-space-4);
    border: 0;
    border-radius: 0;
    overflow: visible;
  }

  .ds-console__page-inner {
    gap: var(--ds-space-5);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ds-console__rail {
    transition: none;
  }
}
</style>
