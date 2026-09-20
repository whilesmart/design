<script setup lang="ts">
import { computed } from 'vue'
import { areaStyle, type AreaColor } from '../areas'

export type SpotArtName = 'empty' | 'error' | 'search' | 'success' | 'measure' | 'mail'

const props = withDefaults(defineProps<{
  name?: SpotArtName
  area?: AreaColor
  size?: number
}>(), { name: 'empty', area: 'indigo', size: 120 })

const style = computed(() => ({ ...areaStyle(props.area), width: `${props.size}px` }))
</script>

<template>
  <svg class="ds-spot" :style="style" viewBox="0 0 120 120" role="presentation" aria-hidden="true">
    <circle class="ds-spot__ground" cx="60" cy="60" r="56" />

    <g v-if="name === 'empty'">
      <rect class="ds-spot__solid" x="30" y="52" width="60" height="38" rx="8" />
      <path class="ds-spot__ink-stroke" d="M30 66h18l6 10h12l6-10h18" />
      <rect class="ds-spot__ink-soft" x="42" y="28" width="36" height="20" rx="5" />
      <path class="ds-spot__ink-stroke" d="M52 38h16" />
    </g>

    <g v-else-if="name === 'error'">
      <path class="ds-spot__solid" d="M60 26 98 90H22Z" />
      <path class="ds-spot__on-solid-stroke" d="M60 50v20" />
      <circle class="ds-spot__on-solid" cx="60" cy="80" r="4" />
    </g>

    <g v-else-if="name === 'search'">
      <circle class="ds-spot__ink-soft" cx="54" cy="54" r="24" />
      <circle class="ds-spot__ink-stroke" cx="54" cy="54" r="24" fill="none" />
      <path class="ds-spot__solid-stroke" d="m73 73 16 16" />
      <path class="ds-spot__ink-stroke" d="M44 54h20M54 44v20" />
    </g>

    <g v-else-if="name === 'success'">
      <circle class="ds-spot__solid" cx="60" cy="60" r="30" />
      <path class="ds-spot__on-solid-stroke" d="m47 61 9 9 18-20" />
    </g>

    <g v-else-if="name === 'measure'">
      <rect class="ds-spot__ink-soft" x="30" y="66" width="14" height="24" rx="4" />
      <rect class="ds-spot__ink-soft" x="53" y="50" width="14" height="40" rx="4" />
      <rect class="ds-spot__solid" x="76" y="34" width="14" height="56" rx="4" />
      <path class="ds-spot__ink-stroke" d="M26 96h68" />
    </g>

    <g v-else>
      <rect class="ds-spot__solid" x="26" y="40" width="68" height="44" rx="8" />
      <path class="ds-spot__on-solid-stroke" d="m26 46 34 24 34-24" />
    </g>
  </svg>
</template>

<style scoped>
.ds-spot {
  display: block;
  height: auto;
}

.ds-spot__ground {
  fill: var(--ds-area-fill);
  opacity: 0.55;
}

.ds-spot__solid {
  fill: var(--ds-area-solid);
}

.ds-spot__ink-soft {
  fill: var(--ds-bg-elevated);
}

.ds-spot__ink-stroke {
  fill: none;
  stroke: var(--ds-area-ink);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.ds-spot__solid-stroke {
  fill: none;
  stroke: var(--ds-area-solid);
  stroke-width: 5;
  stroke-linecap: round;
}

.ds-spot__on-solid {
  fill: var(--ds-area-on-solid);
}

.ds-spot__on-solid-stroke {
  fill: none;
  stroke: var(--ds-area-on-solid);
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
