<script setup lang="ts">
withDefaults(defineProps<{
  label?: string
  /** The control's id. The label points at it and the error is described by it. */
  id?: string
  error?: string
  required?: boolean
}>(), { label: '', id: undefined, error: '', required: false })
</script>

<template>
  <!--
    A plain container, not the label itself: an element labelled by a <label> takes its
    name from the label's whole subtree, so a wrapping label would fold the error message
    into the control's accessible name.
  -->
  <div class="ds-field">
    <label v-if="label" class="ds-field__label" :for="id">
      {{ label }}<span v-if="required" class="ds-field__required">*</span>
    </label>
    <slot />
    <span v-if="error" :id="id ? `${id}-error` : undefined" class="ds-field__error">{{ error }}</span>
  </div>
</template>
