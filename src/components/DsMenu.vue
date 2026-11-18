<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, useId, watch } from 'vue'
import DsButton from './DsButton.vue'
import DsIcon from './DsIcon.vue'
import DsIconButton from './DsIconButton.vue'
import type { DsIconName } from './DsPostList.vue'
import { modalStack } from './modal-stack'

const props = withDefaults(defineProps<{
  label?: string
  text?: string
  icon?: DsIconName
  align?: 'start' | 'end'
  columns?: number
  disabled?: boolean
  loading?: boolean
}>(), { label: '', text: '', icon: 'solar:menu-dots-bold' as DsIconName, align: 'end', columns: 1, disabled: false, loading: false })

const emit = defineEmits<{ open: []; close: [] }>()
const open = ref(false)
const root = ref<HTMLElement | null>(null)
const list = ref<HTMLElement | null>(null)
const anchor = ref<HTMLElement | null>(null)
const id = useId()
const position = ref<Record<string, string>>({})
const triggerAttrs = computed(() => ({ 'aria-haspopup': 'menu' as const, 'aria-expanded': open.value, 'aria-controls': open.value ? id : undefined }))

const items = () => [...(list.value?.querySelectorAll<HTMLElement>('[role^="menuitem"]:not(:disabled):not([aria-disabled="true"])') ?? [])]
const trigger = () => root.value?.querySelector<HTMLElement>('button, [role="button"], [aria-haspopup]')
const inside = (target: EventTarget | null) => target instanceof Node && Boolean(root.value?.contains(target) || list.value?.contains(target))

function place() {
  const rect = (anchor.value ?? root.value)?.getBoundingClientRect()
  if (!rect) return
  const below = window.innerHeight - rect.bottom
  const height = list.value?.getBoundingClientRect().height ?? 0
  const next: Record<string, string> = {}
  if (height > below - 8 && rect.top > below) next.bottom = `${window.innerHeight - rect.top + 4}px`
  else next.top = `${rect.bottom + 4}px`
  if (props.align === 'end') next.right = `${Math.max(8, window.innerWidth - rect.right)}px`
  else next.left = `${Math.max(8, rect.left)}px`
  position.value = next
}

async function show(at?: HTMLElement) {
  if (props.disabled) return
  anchor.value = at ?? null
  open.value = true
  place()
  await nextTick()
  place()
  items()[0]?.focus()
  emit('open')
}

function close(restore = false) {
  if (!open.value) return
  open.value = false
  emit('close')
  if (restore) (anchor.value ?? trigger())?.focus()
}

const toggle = () => open.value ? close() : show()
// Capture phase: callers may stop the click on their trigger so it does not reach the surface behind it.
const onTrigger = (event: MouseEvent) => { if (!(event.target as HTMLElement).closest(':disabled, [aria-disabled="true"]')) toggle() }

function onKey(event: KeyboardEvent) {
  const entries = items()
  const index = entries.indexOf(document.activeElement as HTMLElement)
  const row = props.columns
  const target = {
    ArrowDown: index + row,
    ArrowUp: index - row,
    ArrowRight: row > 1 ? index + 1 : undefined,
    ArrowLeft: row > 1 ? index - 1 : undefined,
    Home: 0,
    End: entries.length - 1,
  }[event.key]
  if (target !== undefined) { event.preventDefault(); entries[(target + entries.length) % entries.length]?.focus() }
  if (event.key === 'Escape') { event.stopPropagation(); close(true) }
  if (event.key === 'Tab') close()
}

function onClick(event: MouseEvent) {
  const item = (event.target as HTMLElement).closest('[role^="menuitem"], button, a[href]')
  if (!item || item.getAttribute('role') === 'menuitemcheckbox' || item.matches(':disabled, [aria-disabled="true"]')) return
  close(true)
  // The list is teleported to the body, so containers around the menu hear a choice only through this event.
  root.value?.dispatchEvent(new CustomEvent('ds-menu-choose', { bubbles: true }))
}

const outside = (event: Event) => { if (!inside(event.target)) close() }
const dismiss = (event: Event) => { if (!list.value?.contains(event.target as Node)) close() }
watch(open, value => {
  const method = value ? 'addEventListener' : 'removeEventListener'
  document[method]('pointerdown', outside, true)
  window[method]('resize', dismiss)
  window[method]('scroll', dismiss, true)
})
watch(() => modalStack.length, (count, previous) => { if (count > previous) close() })
onUnmounted(() => { open.value = false })

defineExpose({ show, close, toggle })
</script>

<template>
  <div ref="root" class="ds-menu">
    <span class="ds-menu__trigger" @click.capture="onTrigger">
      <slot name="trigger" :open="open" :attrs="triggerAttrs">
        <DsButton v-if="text" variant="secondary" size="sm" :disabled="disabled" :loading="loading" v-bind="triggerAttrs">
          {{ text }}<DsIcon name="solar:alt-arrow-down-linear" class="ds-menu__chevron" />
        </DsButton>
        <DsIconButton v-else variant="ghost" size="sm" :icon="icon" :aria-label="label" :title="label" :disabled="disabled" v-bind="triggerAttrs" />
      </slot>
    </span>
    <Teleport to="body">
      <div
        v-if="open"
        :id="id"
        ref="list"
        class="ds-menu__list"
        :class="{ 'ds-menu__list--grid': columns > 1 }"
        role="menu"
        :aria-label="label || undefined"
        :style="{ ...position, '--menu-columns': columns }"
        @keydown="onKey"
        @click="onClick"
      >
        <slot />
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.ds-menu { display: inline-flex; }
.ds-menu__trigger { display: contents; }
.ds-menu__chevron { margin-left: var(--ds-space-1); font-size: 0.875em; }
.ds-menu__list {
  position: fixed;
  z-index: var(--ds-z-popover);
  display: grid;
  min-width: 12rem;
  max-width: min(22rem, calc(100vw - var(--ds-space-4)));
  max-height: min(28rem, 70vh);
  overflow: auto;
  padding: var(--ds-space-1);
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-radius-lg);
  background: var(--ds-bg-elevated);
  color: var(--ds-text-primary);
  box-shadow: var(--ds-elevation-3);
}
.ds-menu__list--grid { grid-template-columns: repeat(var(--menu-columns), minmax(0, 1fr)); min-width: 0; }
</style>
