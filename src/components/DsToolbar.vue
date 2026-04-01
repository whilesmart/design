<script setup lang="ts">
interface Props {
  bordered?: boolean
}

withDefaults(defineProps<Props>(), {
  bordered: true
})
</script>

<template>
  <div class="ds-toolbar" :class="{ 'ds-toolbar--bordered': bordered }">
    <div class="ds-toolbar__left">
      <slot name="left" />
    </div>
    <div class="ds-toolbar__center">
      <slot name="center" />
    </div>
    <div class="ds-toolbar__right">
      <slot name="right" />
    </div>
  </div>
</template>

<style scoped>
.ds-toolbar {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: var(--ds-bg-surface, #fff);
  min-height: 48px;
  gap: 0.75rem;
}

.ds-toolbar--bordered {
  border-bottom: 1px solid var(--ds-border-color, #e0e0e0);
}

.ds-toolbar__left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ds-toolbar__center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.ds-toolbar__right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
