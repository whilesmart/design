<script setup lang="ts">
withDefaults(defineProps<{ family: string; role: string; sample?: string; weight?: number }>(), {
  sample: 'The quick brown fox jumps over the lazy dog',
  weight: 600,
})
</script>

<template>
  <figure class="ds-specimen">
    <span class="ds-specimen__glyphs" :style="{ fontFamily: `'${family}', var(--ds-font-sans)`, fontWeight: weight }" aria-hidden="true">Aa</span>
    <figcaption class="ds-specimen__meta">
      <span class="ds-specimen__role">{{ role }}</span>
      <strong class="ds-specimen__family" :style="{ fontFamily: `'${family}', var(--ds-font-sans)` }">{{ family }}</strong>
      <span class="ds-specimen__sample" :style="{ fontFamily: `'${family}', var(--ds-font-sans)` }">{{ sample }}</span>
    </figcaption>
  </figure>
</template>

<style scoped>
.ds-specimen {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: var(--ds-space-4);
  margin: 0;
  padding: var(--ds-space-4);
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-radius-card);
  background: var(--ds-bg-surface);
}

.ds-specimen__glyphs {
  color: var(--ds-text-primary);
  font-size: 3rem;
  line-height: 1;
}

.ds-specimen__meta {
  display: grid;
  gap: 0.125rem;
  min-width: 0;
}

.ds-specimen__role {
  color: var(--ds-text-muted);
  font-size: var(--ds-text-xs);
  font-weight: var(--ds-font-weight-semibold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.ds-specimen__family {
  color: var(--ds-text-primary);
  font-size: var(--ds-text-lg);
}

.ds-specimen__sample {
  overflow: hidden;
  color: var(--ds-text-secondary);
  font-size: var(--ds-text-sm);
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
