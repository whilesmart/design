<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    value: number;
    max?: number;
    label: string;
    tone?: "success" | "warning" | "danger" | "brand";
  }>(),
  { max: 100, tone: "brand" },
);
const percent = computed(() =>
  Number.isFinite(props.value) && props.max > 0
    ? Math.max(0, Math.min(100, (props.value / props.max) * 100))
    : 0,
);
</script>

<template>
  <div
    class="ds-progress"
    :class="`ds-progress--${tone}`"
    role="progressbar"
    :aria-label="label"
    :aria-valuenow="percent"
    :aria-valuemin="0"
    :aria-valuemax="100"
  >
    <div class="ds-progress__fill" :style="{ width: `${percent}%` }" />
  </div>
</template>

<style scoped>
.ds-progress {
  height: var(--ds-space-2);
  overflow: hidden;
  border-radius: var(--ds-radius-full);
  background: var(--ds-bg-hover);
}
.ds-progress__fill {
  height: 100%;
  background: var(--ds-brand-primary-800);
  border-radius: inherit;
}
.ds-progress--success .ds-progress__fill {
  background: var(--ds-status-success-text);
}
.ds-progress--warning .ds-progress__fill {
  background: var(--ds-status-warning-text);
}
.ds-progress--danger .ds-progress__fill {
  background: var(--ds-status-error-text);
}

:global([data-theme="dark"]) .ds-progress {
  background: var(--ds-color-neutral-900);
}
:global([data-theme="dark"]) .ds-progress--brand .ds-progress__fill {
  background: var(--ds-brand-primary-400);
}
:global([data-theme="dark"]) .ds-progress--success .ds-progress__fill {
  background: var(--ds-color-success-100);
}
:global([data-theme="dark"]) .ds-progress--warning .ds-progress__fill {
  background: var(--ds-color-warning-100);
}
:global([data-theme="dark"]) .ds-progress--danger .ds-progress__fill {
  background: var(--ds-color-error-100);
}
</style>
