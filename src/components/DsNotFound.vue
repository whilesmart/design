<script setup lang="ts">
import DsIcon from './DsIcon.vue'

withDefaults(defineProps<{
  title?: string
  description?: string
  icon?: string
  showHomeLink?: boolean
  homeLinkText?: string
  homeLinkUrl?: string
}>(), {
  title: 'Page not found',
  description: 'The page you\'re looking for doesn\'t exist or has been moved.',
  icon: 'solar:magnifer-line-duotone',
  showHomeLink: true,
  homeLinkText: 'Go home',
  homeLinkUrl: '/'
})
</script>

<template>
  <div class="ds-not-found">
    <div class="ds-not-found__content">
      <DsIcon :name="icon as `solar:${string}`" class="ds-not-found__icon" />
      <h1 class="ds-not-found__title">{{ title }}</h1>
      <p class="ds-not-found__description">{{ description }}</p>
      <slot>
        <a
          v-if="showHomeLink"
          :href="homeLinkUrl"
          class="ds-not-found__link"
        >
          {{ homeLinkText }}
        </a>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.ds-not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: var(--ds-space-8, 32px);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}

.ds-not-found__content {
  text-align: center;
  max-width: 420px;
}

.ds-not-found__icon {
  font-size: 48px;
  margin-bottom: var(--ds-space-4, 16px);
}

.ds-not-found__title {
  font-size: 24px;
  font-weight: 700;
  color: var(--ds-text-primary, #1a1a2e);
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.ds-not-found__description {
  font-size: 15px;
  color: var(--ds-text-secondary, #6b7280);
  margin: 0 0 24px 0;
  line-height: 1.6;
}

.ds-not-found__link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: var(--ds-color-primary, #2d398e);
  color: white;
  border-radius: var(--ds-radius-md, 8px);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: opacity 0.15s;
}

.ds-not-found__link:hover {
  opacity: 0.9;
}
</style>
