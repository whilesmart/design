<script setup lang="ts">
import { useVueFlow } from '@vue-flow/core'
import DsIcon from '../components/DsIcon.vue'

defineProps<{ resettable?: boolean }>()
const emit = defineEmits<{ reset: [] }>()

const { zoomIn, zoomOut, fitView } = useVueFlow()
</script>

<template>
  <div class="ds-canvas-controls" role="toolbar" aria-label="Canvas">
    <button type="button" title="Zoom in" aria-label="Zoom in" @click="zoomIn()">
      <DsIcon name="solar:add-circle-linear" />
    </button>
    <button type="button" title="Zoom out" aria-label="Zoom out" @click="zoomOut()">
      <DsIcon name="solar:minus-circle-linear" />
    </button>
    <button type="button" title="Fit" aria-label="Fit to screen" @click="fitView({ maxZoom: 1, padding: 0.15 })">
      <DsIcon name="solar:maximize-square-minimalistic-linear" />
    </button>
    <button
      v-if="resettable"
      type="button"
      title="Reset"
      aria-label="Put every card back where it started"
      @click="emit('reset')"
    >
      <DsIcon name="solar:refresh-linear" />
    </button>
  </div>
</template>
