<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Props {
  src?: string
  name: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), { src: '', size: 'md' })
const imageFailed = ref(false)

watch(() => props.src, () => { imageFailed.value = false })

const fallbackUrl = computed(() => {
  const seed = props.name.trim() || 'User'
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear`
})

const imageUrl = computed(() => props.src && !imageFailed.value ? props.src : fallbackUrl.value)
</script>

<template>
  <img
    class="ds-avatar"
    :class="`ds-avatar--${size}`"
    :src="imageUrl"
    :alt="name"
    referrerpolicy="no-referrer"
    @error="imageFailed = true"
  />
</template>

<style scoped>
.ds-avatar {
  display: block;
  flex-shrink: 0;
  border-radius: var(--ds-radius-full);
  object-fit: cover;
  background: var(--ds-color-secondary);
}

.ds-avatar--sm { width: 1.5rem; height: 1.5rem; }
.ds-avatar--md { width: 2rem; height: 2rem; }
.ds-avatar--lg { width: 4rem; height: 4rem; }
</style>
