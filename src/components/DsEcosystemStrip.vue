<script setup lang="ts">
import { computed } from 'vue'
import type { WhileSmartApp } from '../composables/useAppUrls'
import { resolveEcosystemApps, type EcosystemApp } from '../ecosystem'
import DsIcon from './DsIcon.vue'

const props = withDefaults(defineProps<{
  apps: EcosystemApp[]
  currentApp?: WhileSmartApp
  eyebrow?: string
  title?: string
  description?: string
}>(), {
  currentApp: undefined,
  eyebrow: 'One account, every app',
  title: 'Keep moving across WhileSmart.',
  description: 'Open the next part of your work without changing accounts.'
})

const visibleApps = computed(() => resolveEcosystemApps(props.apps, props.currentApp))
</script>

<template>
  <section class="ds-ecosystem" aria-labelledby="ds-ecosystem-heading">
    <header class="ds-ecosystem__heading">
      <p>{{ eyebrow }}</p>
      <h2 id="ds-ecosystem-heading">{{ title }}</h2>
      <span>{{ description }}</span>
    </header>
    <ul class="ds-ecosystem__apps">
      <li v-for="app in visibleApps" :key="app.id">
        <a :href="app.url">
          <DsIcon v-if="app.iconName" :name="app.iconName" class="ds-ecosystem__app-icon" />
          <img v-else-if="app.icon" :src="app.icon" alt="" />
          <span>
            <strong>{{ app.name }}</strong>
            <small>{{ app.description }}</small>
          </span>
          <DsIcon name="solar:arrow-right-up-linear" />
        </a>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.ds-ecosystem {
  padding: var(--ds-space-16) var(--ds-space-8);
  background: var(--ds-color-neutral-0);
}

.ds-ecosystem__heading,
.ds-ecosystem__apps {
  width: min(100%, 80rem);
  margin-inline: auto;
}

.ds-ecosystem__heading {
  margin-bottom: var(--ds-space-8);
}

.ds-ecosystem__heading p,
.ds-ecosystem__heading h2,
.ds-ecosystem__heading span {
  margin: 0;
}

.ds-ecosystem__heading p {
  color: var(--ds-color-primary-700);
  font-size: var(--ds-text-xs);
  font-weight: var(--ds-font-weight-semibold);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.ds-ecosystem__heading h2 {
  max-width: 28ch;
  margin-top: var(--ds-space-3);
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  line-height: 1.14;
}

.ds-ecosystem__heading span {
  display: block;
  max-width: 48ch;
  margin-top: var(--ds-space-4);
  color: var(--ds-color-neutral-600);
  font-size: var(--ds-text-lg);
  line-height: var(--ds-leading-relaxed);
}

.ds-ecosystem__apps {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--ds-space-4);
  padding: 0;
  list-style: none;
}

.ds-ecosystem__apps a {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: start;
  gap: var(--ds-space-4);
  height: 100%;
  padding: var(--ds-space-5);
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-radius-xl);
  color: inherit;
  text-decoration: none;
  transition: border-color var(--ds-transition-base), box-shadow var(--ds-transition-base), transform var(--ds-transition-base);
}

.ds-ecosystem__apps a:hover {
  border-color: var(--ds-color-primary-300);
  box-shadow: var(--ds-elevation-2);
  transform: translateY(-2px);
}

.ds-ecosystem__apps img,
.ds-ecosystem__app-icon {
  width: 2.5rem;
  height: 2.5rem;
}

.ds-ecosystem__app-icon {
  color: var(--ds-color-primary-700);
}

.ds-ecosystem__apps a > span {
  display: grid;
  gap: var(--ds-space-1);
}

.ds-ecosystem__apps strong {
  font-size: var(--ds-text-lg);
}

.ds-ecosystem__apps small {
  color: var(--ds-color-neutral-600);
  font-size: var(--ds-text-sm);
  line-height: var(--ds-leading-relaxed);
}

.ds-ecosystem__apps a > :deep(svg) {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--ds-color-primary-700);
}

@media (max-width: 1100px) {
  .ds-ecosystem__apps {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .ds-ecosystem {
    padding: var(--ds-space-12) var(--ds-space-5);
  }

  .ds-ecosystem__heading {
    text-align: center;
  }

  .ds-ecosystem__apps {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
