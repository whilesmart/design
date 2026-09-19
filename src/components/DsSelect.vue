<script setup lang="ts">
import { computed, useId } from 'vue'
import DsField from './DsField.vue'

interface Props {
  modelValue?: string
  label?: string
  id?: string
  disabled?: boolean
  error?: string
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  disabled: false,
  error: '',
  required: false
})

defineEmits<{ 'update:modelValue': [value: string] }>()

const uid = useId()
const controlId = computed(() => props.id ?? uid)
const describedBy = computed(() => (props.error ? `${controlId.value}-error` : undefined))
</script>

<template>
  <DsField class="ds-select" :label="label" :id="controlId" :error="error" :required="required">
    <select
      :id="controlId"
      class="ds-field__control ds-select__control"
      :class="{ 'ds-field__control--error': error }"
      :value="modelValue"
      :disabled="disabled"
      :required="required"
      :aria-invalid="error ? true : undefined"
      :aria-describedby="describedBy"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <slot />
    </select>
  </DsField>
</template>

<style scoped>
/* A select needs room for its own arrow, and sits at the control height of a button. */
.ds-select__control {
  min-height: 2.5rem;
  padding: var(--ds-space-2) var(--ds-space-8) var(--ds-space-2) var(--ds-space-3);
}
</style>
