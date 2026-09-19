<script setup lang="ts">
import DsButton from './DsButton.vue'
import DsStatePanel from './DsStatePanel.vue'
import type { SpotArtName } from './DsSpotArt.vue'

withDefaults(defineProps<{
  title?: string
  description?: string
  /** Draws this glyph instead of the illustration. */
  icon?: `solar:${string}` | `material-symbols:${string}`
  art?: SpotArtName
  showHomeLink?: boolean
  homeLinkText?: string
  homeLinkUrl?: string
}>(), {
  title: 'Page not found',
  description: 'The page you are looking for does not exist or has been moved.',
  icon: undefined,
  art: 'search',
  showHomeLink: true,
  homeLinkText: 'Go home',
  homeLinkUrl: '/'
})
</script>

<template>
  <div class="ds-not-found">
    <DsStatePanel
      class="ds-not-found__panel"
      :icon="icon"
      :art="art"
      :title="title"
      :description="description"
    >
      <slot>
        <DsButton v-if="showHomeLink" as="a" :href="homeLinkUrl" variant="primary">
          {{ homeLinkText }}
        </DsButton>
      </slot>
    </DsStatePanel>
  </div>
</template>

<style scoped>
.ds-not-found {
  display: grid;
  min-height: 60vh;
  place-items: center;
  padding: var(--ds-space-8);
}

.ds-not-found__panel {
  max-width: 32rem;
}
</style>
