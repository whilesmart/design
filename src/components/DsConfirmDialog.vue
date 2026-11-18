<script setup lang="ts">
import DsButton from './DsButton.vue'
import DsModal from './DsModal.vue'

interface Props {
  modelValue: boolean
  title: string
  description?: string
  confirmLabel: string
  cancelLabel?: string
  tone?: 'default' | 'danger'
  loading?: boolean
}

withDefaults(defineProps<Props>(), { description: '', cancelLabel: 'Cancel', tone: 'default', loading: false })
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; confirm: [] }>()
</script>

<template>
  <DsModal :model-value="modelValue" :title="title" :description="description" size="sm" :busy="loading" @update:model-value="emit('update:modelValue', $event)">
    <template v-if="$slots.default" #default><slot /></template>
    <template #footer>
      <DsButton variant="secondary" :disabled="loading" @click="emit('update:modelValue', false)">{{ cancelLabel }}</DsButton>
      <DsButton :variant="tone === 'danger' ? 'danger' : 'primary'" :loading="loading" @click="emit('confirm')">{{ confirmLabel }}</DsButton>
    </template>
  </DsModal>
</template>
