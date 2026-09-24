<script setup lang="ts">
import DsAvatar from './DsAvatar.vue'
import DsIcon from './DsIcon.vue'
import DsMenu from './DsMenu.vue'

withDefaults(
  defineProps<{
    name: string
    email?: string
    src?: string
    /** Draws the name beside the avatar. */
    showName?: boolean
    label?: string
  }>(),
  { email: '', src: '', showName: false, label: 'Account' },
)
</script>

<template>
  <DsMenu align="end" class="ds-account">
    <template #trigger>
      <button type="button" class="ds-account__trigger" :aria-label="label">
        <DsAvatar :name="name" :src="src" size="sm" />
        <span v-if="showName" class="ds-account__said">{{ name }}</span>
        <DsIcon name="solar:alt-arrow-down-linear" class="ds-account__arrow" />
      </button>
    </template>

    <div class="ds-account__who">
      <p class="ds-account__name">{{ name }}</p>
      <p v-if="email" class="ds-account__email">{{ email }}</p>
    </div>

    <slot />
  </DsMenu>
</template>

<style scoped>
.ds-account__trigger {
  display: inline-flex;
  max-width: 14rem;
  align-items: center;
  gap: var(--ds-space-2);
  border: 0;
  border-radius: var(--ds-radius-full);
  padding: 2px;
  background: transparent;
  color: var(--ds-text-primary);
  font: inherit;
  font-size: var(--ds-text-sm);
  cursor: pointer;
}

.ds-account__trigger:hover {
  background: var(--ds-bg-hover);
}

.ds-account__said {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ds-account__arrow {
  flex: none;
  color: var(--ds-text-muted);
  font-size: var(--ds-text-xs);
}

.ds-account__who {
  padding: var(--ds-space-2) var(--ds-space-3);
  margin-bottom: var(--ds-space-1);
  border-bottom: 1px solid var(--ds-border-base);
}

.ds-account__name,
.ds-account__email {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ds-account__name {
  color: var(--ds-text-primary);
  font-size: var(--ds-text-sm);
  font-weight: 500;
}

.ds-account__email {
  color: var(--ds-text-muted);
  font-size: var(--ds-text-xs);
}
</style>
