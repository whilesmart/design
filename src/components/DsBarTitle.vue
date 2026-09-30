<script setup lang="ts">
export type BarTitleTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger'

defineProps<{ title: string; subtitle?: string; tone?: BarTitleTone }>()
</script>

<template>
  <div class="ds-bar-title">
    <h1 class="ds-bar-title__title" :title="title">{{ title }}</h1>
    <p v-if="subtitle || $slots.subtitle" class="ds-bar-title__subtitle">
      <span v-if="tone" class="ds-bar-title__dot" :class="`ds-bar-title__dot--${tone}`" aria-hidden="true" />
      <slot name="subtitle">{{ subtitle }}</slot>
    </p>
  </div>
</template>

<style scoped>
.ds-bar-title {
  display: grid;
  min-width: 0;
  max-width: 28rem;
  line-height: 1.2;
}

.ds-bar-title__title {
  overflow: hidden;
  margin: 0;
  color: var(--ds-text-primary);
  font-size: var(--ds-text-base);
  font-weight: var(--ds-font-weight-bold);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ds-bar-title__subtitle {
  display: flex;
  overflow: hidden;
  align-items: center;
  gap: var(--ds-space-1);
  margin: 0;
  color: var(--ds-text-secondary);
  font-size: var(--ds-text-xs);
  white-space: nowrap;
}

.ds-bar-title__dot {
  flex: none;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: var(--ds-radius-full);
  background: var(--ds-text-muted);
}

.ds-bar-title__dot--primary {
  background: var(--ds-interactive-primary);
}

.ds-bar-title__dot--success {
  background: var(--ds-status-success-text);
}

.ds-bar-title__dot--warning {
  background: var(--ds-status-warning-text);
}

.ds-bar-title__dot--danger {
  background: var(--ds-status-error-text);
}
</style>
