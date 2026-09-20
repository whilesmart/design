<script setup lang="ts">
import DsButton from './DsButton.vue'

interface Props {
  page: number
  pages: number
  disabled?: boolean
  label?: string
  previousLabel?: string
  nextLabel?: string
}

withDefaults(defineProps<Props>(), {
  disabled: false,
  label: 'Pagination',
  previousLabel: 'Previous',
  nextLabel: 'Next'
})

defineEmits<{
  change: [page: number]
}>()
</script>

<template>
  <nav v-if="pages >= 1" class="ds-pagination" :aria-label="label">
    <DsButton
      variant="secondary"
      size="sm"
      :disabled="disabled || page <= 1"
      @click="$emit('change', page - 1)"
    >
      {{ previousLabel }}
    </DsButton>
    <span><slot>Page {{ page }} of {{ pages }}</slot></span>
    <DsButton
      variant="secondary"
      size="sm"
      :disabled="disabled || page >= pages"
      @click="$emit('change', page + 1)"
    >
      {{ nextLabel }}
    </DsButton>
  </nav>
</template>

<style scoped>
.ds-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-space-4);
  padding-top: var(--ds-space-4);
  color: var(--ds-text-secondary);
  font-size: var(--ds-text-sm);
}
</style>
