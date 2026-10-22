<script setup lang="ts">
withDefaults(defineProps<{
  historyLabel?: string
  canvasOpen?: boolean
}>(), { historyLabel: 'Conversations', canvasOpen: false })
</script>

<template>
  <div class="ds-chat-layout" :class="{ 'ds-chat-layout--canvas': canvasOpen && $slots.canvas }">
    <aside v-if="$slots.history" class="ds-chat-layout__history" :aria-label="historyLabel">
      <slot name="history" />
    </aside>
    <section class="ds-chat-layout__main">
      <header v-if="$slots.header" class="ds-chat-layout__header">
        <slot name="header" />
      </header>
      <div class="ds-chat-layout__body">
        <slot />
      </div>
      <footer v-if="$slots.footer" class="ds-chat-layout__footer">
        <slot name="footer" />
      </footer>
    </section>
    <div v-if="canvasOpen && $slots.canvas" class="ds-chat-layout__canvas">
      <slot name="canvas" />
    </div>
  </div>
</template>

<style scoped>
.ds-chat-layout {
  position: relative;
  display: flex;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-brand-radius-card, var(--ds-radius-lg));
  background: var(--ds-bg-surface);
  box-shadow: var(--ds-elevation-1);
  container-type: inline-size;
}

.ds-chat-layout__history {
  display: none;
  flex: none;
  flex-direction: column;
  width: var(--ds-chat-history-width, 15rem);
  min-height: 0;
  border-right: 1px solid var(--ds-border-base);
  background: var(--ds-bg-muted);
}

.ds-chat-layout__main {
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.ds-chat-layout__header {
  display: flex;
  flex: none;
  gap: var(--ds-space-2);
  align-items: center;
  min-height: 48px;
  padding: var(--ds-space-2) var(--ds-space-4);
  border-bottom: 1px solid var(--ds-border-base);
}

.ds-chat-layout__body {
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  min-height: 0;
}

.ds-chat-layout__body > :deep(*) {
  flex: 1 1 0;
  min-height: 0;
}

.ds-chat-layout__footer {
  display: grid;
  flex: none;
  gap: var(--ds-space-2);
  padding: var(--ds-space-3);
  border-top: 1px solid var(--ds-border-base);
  background: var(--ds-bg-muted);
}

.ds-chat-layout__canvas {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  min-width: 0;
  min-height: 0;
  background: var(--ds-bg-surface);
}

.ds-chat-layout__canvas > :deep(*) {
  flex: 1 1 0;
}

@container (min-width: 900px) {
  .ds-chat-layout__history {
    display: flex;
  }
}

/* With a document open there is room for the conversation and the document, so the history steps aside. */
@container (min-width: 760px) {
  .ds-chat-layout--canvas .ds-chat-layout__history {
    display: none;
  }

  .ds-chat-layout--canvas .ds-chat-layout__main {
    flex: none;
    width: 42%;
  }

  .ds-chat-layout__canvas {
    position: static;
    flex: 1 1 0;
    border-left: 1px solid var(--ds-border-base);
  }
}
</style>
