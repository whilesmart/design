<script setup lang="ts">
export interface WorkspaceBrandingConfig {
  organizationName?: string
  organizationMarkUrl?: string
  appMarkUrl?: string
  appMarks?: Record<string, string>
  showAppMark?: boolean
  showOrganizationMark?: boolean
}

withDefaults(defineProps<{
  appMarkUrl?: string
  organizationMarkUrl?: string
  organizationName?: string
  showAppMark?: boolean
  showOrganizationMark?: boolean
}>(), {
  appMarkUrl: undefined,
  organizationMarkUrl: '/whilesmart-icon.svg',
  organizationName: 'WhileSmart',
  showAppMark: true,
  showOrganizationMark: true
})
</script>

<template>
  <div class="workspace-backdrop" aria-hidden="true">
    <img
      v-if="showAppMark && appMarkUrl"
      :src="appMarkUrl"
      alt=""
      class="workspace-backdrop__app-mark"
    />
    <div
      v-if="showOrganizationMark && organizationMarkUrl"
      class="workspace-backdrop__organization"
      :title="organizationName"
    >
      <img :src="organizationMarkUrl" alt="" />
    </div>
  </div>
</template>

<style scoped>
.workspace-backdrop {
  position: fixed;
  inset: var(--ds-navbar-height) 0 0;
  z-index: var(--ds-z-workspace-decoration);
  overflow: hidden;
  pointer-events: none;
}

.workspace-backdrop__app-mark {
  position: absolute;
  top: 50%;
  left: 50%;
  width: clamp(9rem, 19vw, 17rem);
  height: clamp(9rem, 19vw, 17rem);
  object-fit: contain;
  opacity: var(--ds-workspace-app-mark-opacity);
  transform: translate(-50%, -50%);
  filter: saturate(0.88) contrast(1.08);
}

.workspace-backdrop__organization {
  position: absolute;
  right: clamp(-8rem, -6vw, -3rem);
  bottom: clamp(-8rem, -7vw, -3rem);
  width: clamp(20rem, 34vw, 34rem);
  height: clamp(20rem, 34vw, 34rem);
  opacity: var(--ds-workspace-organization-mark-opacity);
}

.workspace-backdrop__organization img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: saturate(0.82) contrast(1.04);
}

@media (max-width: 768px) {
  .workspace-backdrop__app-mark {
    width: 8rem;
    height: 8rem;
  }

  .workspace-backdrop__organization {
    right: -7rem;
    bottom: -7rem;
    width: 22rem;
    height: 22rem;
  }
}
</style>
