<script setup lang="ts">
defineProps<{ title: string; description?: string; eyebrow?: string }>()
</script>

<template>
  <header class="ds-page-header">
    <div class="ds-page-header__copy">
      <span v-if="eyebrow" class="ds-page-header__eyebrow">{{ eyebrow }}</span>
      <h1>{{ title }}</h1>
      <p v-if="description">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="ds-page-header__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
.ds-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-space-5);
}

.ds-page-header__copy {
  display: grid;
  gap: var(--ds-space-1);
  min-width: 0;
}

.ds-page-header__eyebrow {
  color: var(--ds-interactive-primary);
  font-size: var(--ds-text-xs);
  font-weight: var(--ds-font-bold);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.ds-page-header h1 {
  margin: 0;
  color: var(--ds-text-primary);
  font-size: var(--ds-text-2xl);
  line-height: 1.15;
}

.ds-page-header p {
  max-width: 64ch;
  margin: 0;
  color: var(--ds-text-secondary);
  font-size: var(--ds-text-sm);
}

.ds-page-header__actions {
  display: flex;
  flex: none;
  align-items: center;
  gap: var(--ds-space-2);
}

@media (max-width: 720px) {
  .ds-page-header {
    align-items: stretch;
    flex-direction: column;
  }

  .ds-page-header__actions {
    align-items: stretch;
  }
}
</style>
