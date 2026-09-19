<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import DsField from './DsField.vue'

interface Props {
  modelValue?: string
  label?: string
  id?: string
  placeholder?: string
  rows?: number
  disabled?: boolean
  error?: string
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '',
  rows: 5,
  disabled: false,
  error: '',
  required: false
})

defineEmits<{ 'update:modelValue': [value: string] }>()

const textarea = ref<HTMLTextAreaElement | null>(null)
defineExpose({ textarea })

const uid = useId()
const controlId = computed(() => props.id ?? uid)
const describedBy = computed(() => (props.error ? `${controlId.value}-error` : undefined))
</script>

<template>
  <DsField :label="label" :id="controlId" :error="error" :required="required">
    <textarea
      :id="controlId"
      ref="textarea"
      class="ds-field__control ds-textarea__control"
      :class="{ 'ds-field__control--error': error }"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :disabled="disabled"
      :required="required"
      :aria-invalid="error ? true : undefined"
      :aria-describedby="describedBy"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
  </DsField>
</template>

<style scoped>
.ds-textarea__control {
  resize: vertical;
  line-height: 1.5;
}
</style>
