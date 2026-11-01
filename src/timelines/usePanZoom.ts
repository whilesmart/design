import { nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'

export interface PanZoomArea {
  x: number
  y: number
  width: number
  height: number
}

export interface PanZoomOptions {
  min?: number
  max?: number
  /** Controls inside the surface that a press should click, not drag. */
  ignore?: string
  /** The part of the content kept in view until someone pans or zooms. Defaults to all of it. */
  opening?: () => PanZoomArea | null
}

/**
 * Pans a scrolling box by dragging and zooms it around the pointer with the wheel. Until
 * someone pans or zooms, the opening area stays fitted to the box as either one resizes.
 */
export function usePanZoom(content: Ref<{ width: number; height: number }>, options: PanZoomOptions = {}) {
  const min = options.min ?? 0.05
  const max = options.max ?? 2
  const ignore = options.ignore ?? 'button, a, input, textarea, select'

  const box = ref<HTMLElement | null>(null)
  const size = ref({ width: 1000, height: 640 })
  const zoom = ref(1)
  const following = ref(true)
  const grabbing = ref(false)
  const view = ref<PanZoomArea>({ x: 0, y: 0, width: content.value.width, height: content.value.height })

  let frame = 0
  function measure() {
    const el = box.value
    if (!el) return
    view.value = {
      x: el.scrollLeft / zoom.value,
      y: el.scrollTop / zoom.value,
      width: el.clientWidth / zoom.value,
      height: el.clientHeight / zoom.value,
    }
  }
  function onScroll() {
    if (frame || typeof requestAnimationFrame === 'undefined') return measure()
    frame = requestAnimationFrame(() => {
      frame = 0
      measure()
    })
  }

  const clamp = (value: number) => Math.min(max, Math.max(min, value))
  const whole = () => ({ x: 0, y: 0, width: content.value.width, height: content.value.height })
  const fitted = (area: PanZoomArea) =>
    clamp(Math.min(size.value.width / area.width, size.value.height / area.height, 1))

  function settle(area: PanZoomArea) {
    zoom.value = fitted(area)
    const z = zoom.value
    nextTick(() => {
      box.value?.scrollTo({ left: area.x * z, top: area.y * z })
      measure()
    })
  }

  let watcher: ResizeObserver | null = null
  onMounted(() => {
    if (!box.value || typeof ResizeObserver === 'undefined') return
    watcher = new ResizeObserver(([entry]) => {
      const { width, height } = entry!.contentRect
      if (width > 0 && height > 0) size.value = { width, height }
    })
    watcher.observe(box.value)
  })
  onBeforeUnmount(() => {
    watcher?.disconnect()
    if (frame && typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(frame)
  })

  watch(
    [() => content.value.width, () => content.value.height, () => size.value.width, () => size.value.height],
    () => {
      if (following.value) settle(options.opening?.() ?? whole())
    },
    { immediate: true },
  )

  /** Shows all of the content. */
  function fit() {
    following.value = false
    settle(whole())
  }

  /** Goes back to the opening view and follows it again. */
  function restore() {
    following.value = true
    settle(options.opening?.() ?? whole())
  }

  function zoomBy(factor: number, at?: { x: number; y: number }) {
    const el = box.value
    const before = zoom.value
    const after = clamp(before * factor)
    if (!el || after === before) return
    following.value = false
    const ax = at?.x ?? el.clientWidth / 2
    const ay = at?.y ?? el.clientHeight / 2
    const left = ((el.scrollLeft + ax) / before) * after - ax
    const top = ((el.scrollTop + ay) / before) * after - ay
    zoom.value = after
    nextTick(() => {
      el.scrollTo({ left, top })
      measure()
    })
  }

  /** Zooms until an area of the content fills the box, and centres it. */
  async function show(area: PanZoomArea, margin = 0.92) {
    following.value = false
    zoom.value = clamp(Math.min(size.value.width / area.width, size.value.height / area.height) * margin)
    await nextTick()
    const z = zoom.value
    box.value?.scrollTo({
      left: area.x * z - (size.value.width - area.width * z) / 2,
      top: area.y * z - (size.value.height - area.height * z) / 2,
    })
    measure()
  }

  function onWheel(event: WheelEvent) {
    if (!box.value) return
    event.preventDefault()
    const rect = box.value.getBoundingClientRect()
    zoomBy(Math.exp(-event.deltaY * (event.ctrlKey ? 0.01 : 0.0015)), {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    })
  }

  let grab: { x: number; y: number; left: number; top: number; id: number } | null = null

  function onPointerDown(event: PointerEvent) {
    const el = box.value
    if (!el || event.button !== 0 || (event.target as Element | null)?.closest?.(ignore)) return
    grab = { x: event.clientX, y: event.clientY, left: el.scrollLeft, top: el.scrollTop, id: event.pointerId }
    grabbing.value = true
    el.setPointerCapture?.(event.pointerId)
  }

  function onPointerMove(event: PointerEvent) {
    if (!grab || !box.value) return
    following.value = false
    box.value.scrollTo({ left: grab.left - (event.clientX - grab.x), top: grab.top - (event.clientY - grab.y) })
  }

  function onPointerUp() {
    if (grab) box.value?.releasePointerCapture?.(grab.id)
    grab = null
    grabbing.value = false
  }

  const handlers = {
    scroll: onScroll,
    wheel: onWheel,
    pointerdown: onPointerDown,
    pointermove: onPointerMove,
    pointerup: onPointerUp,
    pointercancel: onPointerUp,
  }

  onMounted(() => {
    if (following.value) settle(options.opening?.() ?? whole())
  })

  return { box, size, zoom, view, following, grabbing, fit, restore, zoomBy, show, handlers }
}
