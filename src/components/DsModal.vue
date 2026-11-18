<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, useId, watch } from 'vue'
import DsIcon from './DsIcon.vue'
import { modalStack } from './modal-stack'

interface Props {
  modelValue: boolean
  title: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'content' | 'screen'
  closeOnBackdrop?: boolean
  variant?: 'default' | 'viewer'
  busy?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  size: 'md',
  closeOnBackdrop: true,
  variant: 'default',
  busy: false
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const panel = ref<HTMLElement | null>(null)
const body = ref<HTMLElement | null>(null)
const titleID = useId()
const descriptionID = useId()
const layer = Symbol(titleID)
const topmost = computed(() => modalStack[modalStack.length - 1] === layer)
const field = 'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [contenteditable="true"]'
let previousFocus: HTMLElement | null = null
const scrolls = ref(false)
let observer: ResizeObserver | null = null
let mutations: MutationObserver | null = null

function measure() {
  const element = body.value
  if (!element) return
  const box = element.getBoundingClientRect()
  const bottom = Math.max(box.top, ...[...element.children].map(child => child.getBoundingClientRect().bottom))
  const padding = parseFloat(getComputedStyle(element).paddingBottom) || 0
  scrolls.value = bottom + padding - box.top > element.clientHeight + 1
}

function watchBody() {
  observer?.disconnect()
  mutations?.disconnect()
  if (!body.value || typeof ResizeObserver === 'undefined') return
  observer = new ResizeObserver(measure)
  observer.observe(body.value)
  for (const child of body.value.children) observer.observe(child)
  mutations = new MutationObserver(() => { watchBody(); measure() })
  mutations.observe(body.value, { childList: true })
  measure()
}

const close = () => { if (!props.busy) emit('update:modelValue', false) }

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && topmost.value) close()
}

const release = () => {
  const index = modalStack.indexOf(layer)
  if (index < 0) return
  modalStack.splice(index, 1)
  observer?.disconnect()
  mutations?.disconnect()
  document.removeEventListener('keydown', handleKeydown)
  if (!modalStack.length) document.body.style.overflow = ''
}

watch(() => props.modelValue, async open => {
  if (open) {
    previousFocus = document.activeElement as HTMLElement
    modalStack.push(layer)
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeydown)
    await nextTick()
    watchBody()
    // The dialog itself takes focus when there is no field, so Enter never confirms a destructive action by accident.
    const target = panel.value?.querySelector<HTMLElement>('[autofocus]') ?? body.value?.querySelector<HTMLElement>(field) ?? panel.value
    target?.focus()
    return
  }

  release()
  previousFocus?.focus()
}, { immediate: true })

onUnmounted(release)
</script>

<template>
  <Teleport to="body">
    <Transition name="ds-modal">
      <div
        v-if="modelValue"
        class="ds-modal"
        :class="[`ds-modal--${variant}`, { 'ds-modal--covered': !topmost }]"
        role="presentation"
        @mousedown.self="closeOnBackdrop && topmost && close()"
      >
        <section
          ref="panel"
          class="ds-modal__panel"
          :class="`ds-modal__panel--${size}`"
          role="dialog"
          tabindex="-1"
          aria-modal="true"
          :aria-labelledby="titleID"
          :aria-describedby="description ? descriptionID : undefined"
        >
          <header class="ds-modal__header">
            <div class="ds-modal__heading">
              <h2 :id="titleID" class="ds-modal__title">{{ title }}</h2>
              <p v-if="description" :id="descriptionID" class="ds-modal__description">{{ description }}</p>
            </div>
            <div v-if="$slots['header-actions']" class="ds-modal__header-actions">
              <slot name="header-actions" />
            </div>
            <button type="button" class="ds-modal__close" aria-label="Close" :disabled="busy" @click="close">
              <DsIcon name="material-symbols:close-rounded" />
            </button>
          </header>
          <div v-if="$slots.default" ref="body" class="ds-modal__body" :class="{ 'ds-modal__body--scrolls': scrolls }"><slot /></div>
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

.ds-modal--covered { background: transparent; backdrop-filter: none; }

.ds-modal--viewer {
  padding: 0;
  background: var(--ds-viewer-backdrop);
  backdrop-filter: blur(var(--ds-viewer-backdrop-blur)) saturate(0.72);
}

.ds-modal--viewer .ds-modal__panel {
  width: 100vw;
  height: 100vh;
  height: 100dvh;
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

.ds-modal--viewer .ds-modal__panel .ds-modal__body {
  box-sizing: border-box;
  height: 100%;
  padding: calc(var(--ds-viewer-toolbar-height) + var(--ds-space-2)) var(--ds-space-5) var(--ds-space-5);
  overflow: auto;
}

.ds-modal--viewer .ds-modal__heading { min-width: 0; }
.ds-modal--viewer .ds-modal__title { overflow: hidden; font-size: var(--ds-text-base); text-overflow: ellipsis; white-space: nowrap; }
.ds-modal--viewer .ds-modal__description { display: none; }
.ds-modal--viewer .ds-modal__header-actions { flex-shrink: 0; gap: var(--ds-space-3); }
.ds-modal--viewer .ds-modal__close { margin: 0; }
@media (max-width: 640px) {
  .ds-modal--viewer .ds-modal__header { gap: var(--ds-space-1); padding: 0 var(--ds-space-1) 0 var(--ds-space-3); }
  .ds-modal--viewer .ds-modal__header-actions { gap: 0; }
  .ds-modal--viewer .ds-modal__close { width: 2.5rem; height: 2.5rem; }
  .ds-modal--viewer .ds-modal__panel .ds-modal__body { padding: calc(var(--ds-viewer-toolbar-height) + var(--ds-space-2)) var(--ds-space-2) var(--ds-space-2); }
}

.ds-modal__panel {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: calc(100vh - var(--ds-space-8));
  max-height: calc(100dvh - var(--ds-space-8));
  position: relative;
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-radius-card);
  background: var(--ds-bg-elevated);
  color: var(--ds-text-primary);
  box-shadow: var(--ds-elevation-5);
}

.ds-modal__panel:focus { outline: none; }
.ds-modal__panel--sm { max-width: 26rem; }
.ds-modal__panel--md { max-width: 32rem; }
.ds-modal__panel--lg { max-width: 42rem; }
.ds-modal__panel--xl { max-width: 72rem; }
.ds-modal__panel--content { width: fit-content; max-width: calc(100vw - var(--ds-space-8)); }
.ds-modal__panel--screen { width: calc(100vw - var(--ds-space-8)); height: calc(100vh - var(--ds-space-8)); max-width: none; }

.ds-modal__header {
  display: flex;
  flex: none;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--ds-space-3);
  padding: var(--ds-space-5) var(--ds-space-5) var(--ds-space-3);
}

.ds-modal__heading { flex: 1; min-width: 0; }
.ds-modal__header-actions { display: flex; align-items: center; gap: var(--ds-space-2); }
.ds-modal__title { margin: 0; color: var(--ds-text-primary); font-size: var(--ds-text-lg); font-weight: var(--ds-font-semibold); line-height: 1.3; text-wrap: balance; }
.ds-modal__description { margin: var(--ds-space-1) 0 0; color: var(--ds-text-secondary); font-size: var(--ds-text-sm); line-height: 1.5; }
.ds-modal__body { flex: 1 1 auto; min-height: 0; padding: var(--ds-space-2) var(--ds-space-5) var(--ds-space-5); }
.ds-modal__body--scrolls { overflow: auto; }
.ds-modal__footer { display: flex; flex: none; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: var(--ds-space-2); padding: var(--ds-space-3) var(--ds-space-5); border-top: 1px solid var(--ds-border-base); border-radius: 0 0 var(--ds-radius-card) var(--ds-radius-card); background: var(--ds-bg-elevated); }
.ds-modal__header + .ds-modal__footer { border-top: 0; padding-top: var(--ds-space-2); }

.ds-modal__close {
  display: inline-grid;
  place-items: center;
  flex: none;
  width: 2rem;
  height: 2rem;
  margin: calc(-1 * var(--ds-space-1)) calc(-1 * var(--ds-space-2)) 0 0;
  padding: 0;
  border: 0;
  border-radius: var(--ds-radius-md);
  background: transparent;
  color: var(--ds-text-secondary);
  font-size: 1.25rem;
  cursor: pointer;
}

.ds-modal__close:disabled { cursor: not-allowed; opacity: 0.4; }
.ds-modal__close:hover:not(:disabled) { background: var(--ds-bg-hover); color: var(--ds-text-primary); }
.ds-modal__close:focus-visible { outline: 2px solid var(--ds-focus-ring); outline-offset: 1px; }
.ds-modal-enter-active, .ds-modal-leave-active { transition: opacity var(--ds-transition-fast); }
.ds-modal-enter-from, .ds-modal-leave-to { opacity: 0; }

@media (max-width: 480px) {
  .ds-modal:not(.ds-modal--viewer) { align-items: end; padding: var(--ds-space-2); }
  .ds-modal__footer > :deep(.ds-button) { flex: 1 1 auto; }
}
</style>
