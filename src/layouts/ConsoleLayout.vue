<script setup lang="ts">
import DsConsoleShell from '../components/DsConsoleShell.vue'

// For a product outside the account's app switcher: it brings its own brand
// and its own bar. DashboardLayout is the other choice.
withDefaults(
  defineProps<{
    frame?: 'flush' | 'boxed'
    railWidth?: string
    navLabel?: string
    menuLabel?: string
  }>(),
  { frame: 'flush', railWidth: '16rem', navLabel: 'Sections', menuLabel: 'Sections' },
)
</script>

<template>
  <DsConsoleShell
    :frame="frame"
    :rail-width="railWidth"
    :nav-label="navLabel"
    :menu-label="menuLabel"
  >
    <template #brand><slot name="brand" /></template>
    <template v-if="$slots['bar-start']" #bar-start><slot name="bar-start" /></template>
    <template v-if="$slots.bar" #bar><slot name="bar" /></template>
    <template #nav><slot name="nav" /></template>
    <template v-if="$slots['rail-footer']" #rail-footer>
      <slot name="rail-footer" />
    </template>

    <slot />
  </DsConsoleShell>
</template>
