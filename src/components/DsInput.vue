<script setup lang="ts">
interface Props {
  modelValue?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  placeholder?: string
  disabled?: boolean
  error?: string
  label?: string
  id?: string
  required?: boolean
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  placeholder: '',
  disabled: false,
  error: '',
  required: false
})

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="ds-input-wrapper">
    <label v-if="label" :for="id" class="ds-input__label">
      {{ label }}
      <span v-if="required" class="ds-input__required">*</span>
    </label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      class="ds-input"
      :class="{ 'ds-input--error': error }"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <span v-if="error" class="ds-input__error">{{ error }}</span>
  </div>
</template>

<style scoped>
.ds-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-1);
}

.ds-input__label {
  font-size: var(--ds-text-sm);
  font-weight: var(--ds-font-medium);
  color: var(--ds-text-secondary);
}

.ds-input__required {
  color: var(--ds-color-error-500);
}

.ds-input {
  width: 100%;
  padding: var(--ds-space-2) var(--ds-space-3);
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-radius-md);
  font-size: var(--ds-text-sm);
  background: var(--ds-bg-elevated);
  color: var(--ds-text-primary);
  transition: all var(--ds-transition-fast);
}

.ds-input::placeholder {
  color: var(--ds-text-muted);
}

.ds-input:focus {
  outline: none;
  border-color: var(--ds-border-focus);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.ds-input:disabled {
  background: var(--ds-bg-base);
  color: var(--ds-text-disabled);
  cursor: not-allowed;
}

.ds-input--error {
  border-color: var(--ds-color-error-500);
}

.ds-input--error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.ds-input__error {
  font-size: var(--ds-text-xs);
  color: var(--ds-color-error-600);
}
</style>
