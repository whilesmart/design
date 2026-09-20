<script setup lang="ts">
interface Props {
  modelValue?: boolean
  label?: string
  description?: string
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  modelValue: false,
  label: '',
  description: '',
  disabled: false
})

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <label class="ds-switch" :class="{ 'ds-switch--disabled': disabled }">
    <input
      class="ds-switch__input"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <span class="ds-switch__control" aria-hidden="true"><span /></span>
    <span v-if="label || description" class="ds-switch__copy">
      <strong v-if="label">{{ label }}</strong>
      <small v-if="description">{{ description }}</small>
    </span>
  </label>
</template>

<style scoped>
.ds-switch {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-space-3);
  cursor: pointer;
}

.ds-switch__input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

.ds-switch__control {
  display: flex;
  width: 2.5rem;
  height: 1.5rem;
  flex: 0 0 auto;
  align-items: center;
  padding: 2px;
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-radius-full);
  background: var(--ds-bg-muted);
  transition: all var(--ds-transition-fast);
}

.ds-switch__control span {
  width: 1.125rem;
  height: 1.125rem;
  border-radius: var(--ds-radius-full);
  background: var(--ds-bg-elevated);
  box-shadow: var(--ds-elevation-1);
  transition: transform var(--ds-transition-fast);
}

.ds-switch__input:checked+.ds-switch__control {
  border-color: var(--ds-interactive-primary);
  background: var(--ds-interactive-primary);
}

.ds-switch__input:checked+.ds-switch__control span {
  transform: translateX(1rem);
}

.ds-switch__input:focus-visible+.ds-switch__control {
  outline: 3px solid color-mix(in srgb,var(--ds-interactive-primary) 20%,transparent);
  outline-offset: 2px;
}

.ds-switch__copy {
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-1);
  color: var(--ds-text-primary);
  font-size: var(--ds-text-sm);
}

.ds-switch__copy small {
  color: var(--ds-text-secondary);
  font-weight: var(--ds-font-normal);
}

.ds-switch--disabled {
  cursor: not-allowed;
  opacity: .6;
}
</style>
