<script setup lang="ts">
import DsConsoleShell from '../components/DsConsoleShell.vue'

// For a product outside the account's app switcher: it brings its own brand
// and its own bar. DashboardLayout is the other choice.
withDefaults(
  defineProps<{
    frame?: 'flush' | 'boxed'
    width?: 'contained' | 'full'
    railWidth?: string
    navLabel?: string
    menuLabel?: string
    collapsible?: boolean
    collapsedWidth?: string
    collapseLabel?: string
    expandLabel?: string
  }>(),
  { frame: 'flush', width: 'contained', railWidth: '16rem', navLabel: 'Sections', menuLabel: 'Sections', collapsible: false, collapsedWidth: '4.25rem', collapseLabel: 'Collapse sidebar', expandLabel: 'Expand sidebar' },
)

const collapsed = defineModel<boolean>('collapsed', { default: false })
</script>

<template>
  <DsConsoleShell
    :frame="frame"
    :width="width"
    :rail-width="railWidth"
    :nav-label="navLabel"
    :menu-label="menuLabel"
    :collapsible="collapsible"
    :collapsed-width="collapsedWidth"
    :collapse-label="collapseLabel"
    :expand-label="expandLabel"
    v-model:collapsed="collapsed"
  >
    <template #brand="{ collapsed: folded }"><slot name="brand" :collapsed="folded" /></template>
    <template v-if="$slots['bar-start']" #bar-start><slot name="bar-start" /></template>
    <template v-if="$slots['bar-search']" #bar-search><slot name="bar-search" /></template>
    <template v-if="$slots.bar" #bar><slot name="bar" /></template>
    <template v-if="$slots.create" #create="{ collapsed: folded }"><slot name="create" :collapsed="folded" /></template>
    <template #nav><slot name="nav" /></template>
    <template v-if="$slots['rail-footer']" #rail-footer="{ collapsed: folded }">
      <slot name="rail-footer" :collapsed="folded" />
    </template>

    <slot />
  </DsConsoleShell>
</template>
