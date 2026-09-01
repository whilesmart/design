<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from 'vue'
import DsIcon from './DsIcon.vue'

interface Props {
  modelValue: boolean
  title: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'content' | 'screen'
  closeOnBackdrop?: boolean
  icon?: `solar:${string}`
  variant?: 'default' | 'viewer'
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  size: 'md',
  closeOnBackdrop: true,
  variant: 'default'
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const panel = ref<HTMLElement | null>(null)
let previousFocus: HTMLElement | null = null

const close = () => emit('update:modelValue', false)

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') close()
}

watch(() => props.modelValue, async open => {
  if (open) {
    previousFocus = document.activeElement as HTMLElement
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeydown)
    await nextTick()
    panel.value?.querySelector<HTMLElement>('[autofocus], input, button, select, textarea')?.focus()
    return
  }

  document.body.style.overflow = ''
  document.removeEventListener('keydown', handleKeydown)
  previousFocus?.focus()
})

onUnmounted(() => {
  document.body.style.overflow = ''
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="ds-modal">
      <div
        v-if="modelValue"
        class="ds-modal"
        :class="`ds-modal--${variant}`"
        role="presentation"
        @mousedown.self="closeOnBackdrop && close()"
      >
        <section
          ref="panel"
          class="ds-modal__panel"
          :class="`ds-modal__panel--${size}`"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ds-modal-title"
          :aria-describedby="description ? 'ds-modal-description' : undefined"
        >
          <header class="ds-modal__header">
            <div v-if="icon || $slots.icon" class="ds-modal__icon">
              <slot name="icon"><DsIcon :name="icon!" /></slot>
            </div>
            <div class="ds-modal__heading">
              <h2 id="ds-modal-title" class="ds-modal__title">{{ title }}</h2>
              <p v-if="description" id="ds-modal-description" class="ds-modal__description">{{ description }}</p>
            </div>
            <div v-if="$slots['header-actions']" class="ds-modal__header-actions">
              <slot name="header-actions" />
            </div>
            <button type="button" class="ds-modal__close" aria-label="Close" @click="close">
              <DsIcon name="material-symbols:close-rounded" />
            </button>
          </header>
          <div class="ds-modal__body"><slot /></div>
          <footer v-if="$slots.footer" class="ds-modal__footer"><slot name="footer" /></footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.ds-modal {
  position: fixed;
  inset: 0;
  z-index: var(--ds-z-modal);
  display: grid;
  place-items: center;
  padding: var(--ds-space-4);
  background: var(--ds-bg-overlay);
}

.ds-modal--viewer {
  padding: 0;
  background: var(--ds-viewer-backdrop);
  backdrop-filter: blur(var(--ds-viewer-backdrop-blur)) saturate(0.72);
}

.ds-modal--viewer .ds-modal__panel {
  width: 100vw;
  height: 100vh;
  max-height: none;
  overflow: hidden;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.ds-modal--viewer .ds-modal__header {
  position: absolute;
  inset: 0 0 auto;
  z-index: var(--ds-z-sticky);
  align-items: center;
  min-height: var(--ds-viewer-toolbar-height);
  gap: var(--ds-space-2);
  padding: 0 var(--ds-space-3);
  background: var(--ds-viewer-toolbar-bg);
  border-bottom: 1px solid var(--ds-viewer-toolbar-border);
  backdrop-filter: blur(16px);
}

.ds-modal--viewer .ds-modal__body {
  height: 100%;
  padding: calc(var(--ds-viewer-toolbar-height) + var(--ds-space-2)) var(--ds-space-5) var(--ds-space-5);
  overflow: auto;
}

.ds-modal--viewer .ds-modal__title { font-size: var(--ds-text-base); }
.ds-modal--viewer .ds-modal__description { display: none; }
.ds-modal--viewer .ds-modal__header-actions { gap: var(--ds-space-1); }
.ds-modal--viewer .ds-modal__close { padding: var(--ds-space-1); }

.ds-modal__panel {
  width: 100%;
  max-height: calc(100vh - var(--ds-space-8));
  overflow: auto;
  position: relative;
  border: 1px solid var(--ds-border-strong);
  border-radius: var(--ds-radius-xl);
  background: var(--ds-bg-elevated);
  color: var(--ds-text-primary);
  box-shadow: var(--ds-elevation-5);
}

.ds-modal__panel--sm { max-width: 24rem; }
.ds-modal__panel--md { max-width: 30rem; }
.ds-modal__panel--lg { max-width: 42rem; }
.ds-modal__panel--xl { max-width: 72rem; }
.ds-modal__panel--content { width: fit-content; max-width: calc(100vw - var(--ds-space-8)); }
.ds-modal__panel--screen { width: calc(100vw - var(--ds-space-8)); height: calc(100vh - var(--ds-space-8)); max-width: none; }
.ds-modal__panel--screen .ds-modal__body { height: calc(100% - 5.5rem); }

.ds-modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--ds-space-4);
  padding: var(--ds-space-6) var(--ds-space-6) var(--ds-space-4);
}

.ds-modal__heading { flex: 1; }
.ds-modal__header-actions { display: flex; align-items: center; gap: var(--ds-space-2); }

.ds-modal__icon {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  flex: 0 0 auto;
  border-radius: var(--ds-radius-lg);
  background: var(--ds-color-primary-50);
  color: var(--ds-color-primary-800);
  font-size: 1.35rem;
}

.ds-modal__title { margin: 0; font-size: var(--ds-text-xl); }
.ds-modal__description { margin: var(--ds-space-1) 0 0; color: var(--ds-text-secondary); font-size: var(--ds-text-sm); }
.ds-modal__body { padding: 0 var(--ds-space-6) var(--ds-space-6); }
.ds-modal__footer { display: flex; justify-content: flex-end; gap: var(--ds-space-2); padding: var(--ds-space-4) var(--ds-space-6); border-top: 1px solid var(--ds-border-base); }

.ds-modal__close {
  display: inline-flex;
  padding: var(--ds-space-2);
  border: 0;
  border-radius: var(--ds-radius-md);
  background: transparent;
  color: var(--ds-text-secondary);
  cursor: pointer;
}

.ds-modal__close:hover { background: var(--ds-bg-surface); color: var(--ds-text-primary); }
.ds-modal-enter-active, .ds-modal-leave-active { transition: opacity var(--ds-transition-fast); }
.ds-modal-enter-from, .ds-modal-leave-to { opacity: 0; }
</style>
