<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, useSlots } from 'vue'
import { useLayoutConfig } from '../composables/useLayoutConfig'
import { resolveAppSwitcherApps, type AppDefinition } from '../composables/useAppSwitcher'
import DsIcon from '../components/DsIcon.vue'
import DsAvatar from '../components/DsAvatar.vue'
import DsButton from '../components/DsButton.vue'
import DsWorkspaceBackdrop, { type WorkspaceBrandingConfig } from '../components/DsWorkspaceBackdrop.vue'
const launcherIcon = new URL('../assets/launcher.svg', import.meta.url).href
import { appWordmarks } from '../assets/wordmarks'

export interface User {
  first_name: string
  last_name: string
  email: string
  avatar?: string
  avatar_url?: string
}

interface Props {
  user?: User | null
  apps?: AppDefinition[]
  additionalApps?: AppDefinition[]
  excludeAppIds?: string[]
  includeCurrentApp?: boolean
  currentAppId?: string
  brandIconUrl?: string
  workspaceBranding?: WorkspaceBrandingConfig
  supportUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  user: null,
  apps: undefined,
  additionalApps: undefined,
  excludeAppIds: undefined,
  includeCurrentApp: false,
  currentAppId: undefined,
  brandIconUrl: undefined,
  workspaceBranding: undefined,
  supportUrl: undefined
})

const emit = defineEmits<{
  logout: []
  navigateHome: []
  navigateToApp: [appId: string]
}>()

const layoutConfig = useLayoutConfig()
const appsMenuOpen = ref(false)
const userMenuOpen = ref(false)

const displayApps = computed(() => resolveAppSwitcherApps({
  apps: props.apps,
  additionalApps: props.additionalApps,
  excludeAppIds: props.excludeAppIds,
  currentAppId: props.currentAppId,
  includeCurrentApp: props.includeCurrentApp
}))
// The switcher hides the app you are already in, so brand and watermark lookups need the unfiltered list.
const allApps = computed(() => resolveAppSwitcherApps({
  apps: props.apps,
  additionalApps: props.additionalApps,
  includeCurrentApp: true
}))
const isIconifyIcon = (icon: string): icon is `solar:${string}` | `material-symbols:${string}` =>
  icon.startsWith('solar:') || icon.startsWith('material-symbols:')

const brandWordmark = computed(() =>
  !props.brandIconUrl && props.currentAppId && props.currentAppId in appWordmarks
    ? appWordmarks[props.currentAppId as keyof typeof appWordmarks]
    : undefined
)

const resolvedBrandIconUrl = computed(() => {
  if (props.brandIconUrl) return props.brandIconUrl
  if (props.currentAppId) {
    const app = allApps.value.find(a => a.id === props.currentAppId)
    if (app?.icon) return app.icon
  }
  return '/whilesmart-icon.svg'
})

declare global {
  interface Window {
    __DESK_BRANDING__?: WorkspaceBrandingConfig
  }
}

const runtimeBranding = computed(() => typeof window === 'undefined' ? undefined : window.__DESK_BRANDING__)
const resolvedWorkspaceBranding = computed(() => ({
  ...runtimeBranding.value,
  ...props.workspaceBranding
}))
const slots = useSlots()
const resolvedWorkspaceAppMark = computed(() => {
  const branding = resolvedWorkspaceBranding.value
  if (branding.appMarkUrl) return branding.appMarkUrl
  if (props.currentAppId && branding.appMarks?.[props.currentAppId]) return branding.appMarks[props.currentAppId]
  if (props.currentAppId) return allApps.value.find(app => app.id === props.currentAppId)?.icon
  return undefined
})

const workspaceMarkStyle = computed(() => resolvedWorkspaceBranding.value.showAppMark !== false && resolvedWorkspaceAppMark.value
  ? { '--ds-workspace-app-mark-image': `url("${resolvedWorkspaceAppMark.value}")` }
  : undefined)

const userName = computed(() => props.user ? `${props.user.first_name} ${props.user.last_name}`.trim() : 'User')

const leftNavbarItems = computed(() =>
  [...layoutConfig.navbarItems.value]
    .filter(item => item.position === 'left' || !item.position)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
)

const centerNavbarItems = computed(() =>
  [...layoutConfig.navbarItems.value]
    .filter(item => item.position === 'center')
    .sort((a, b) => (a.order || 0) - (b.order || 0))
)

const rightNavbarItems = computed(() =>
  [...layoutConfig.navbarItems.value]
    .filter(item => item.position === 'right')
    .sort((a, b) => (a.order || 0) - (b.order || 0))
)

const handleLogout = () => {
  emit('logout')
}

const handleNavigateHome = () => {
  emit('navigateHome')
}

const handleNavigateToApp = (appId: string) => {
  appsMenuOpen.value = false
  if (appId === props.currentAppId) {
    emit('navigateHome')
  } else {
    emit('navigateToApp', appId)
    const target = displayApps.value.find(app => app.id === appId)
    if (target) window.location.href = target.url
  }
}

const closeMenus = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.apps-menu-container')) {
    appsMenuOpen.value = false
  }
  if (!target.closest('.user-menu')) {
    userMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeMenus)
})

onUnmounted(() => {
  document.removeEventListener('click', closeMenus)
})
</script>

<template>
  <div class="layout" :style="workspaceMarkStyle">
    <DsWorkspaceBackdrop
      :app-mark-url="resolvedWorkspaceAppMark"
      :organization-mark-url="resolvedWorkspaceBranding.organizationMarkUrl"
      :organization-name="resolvedWorkspaceBranding.organizationName"
      :show-app-mark="false"
      :show-organization-mark="resolvedWorkspaceBranding.showOrganizationMark"
    />
    <nav class="navbar">
      <div class="navbar-left">
        <a
          :href="layoutConfig.appHomeLink.value"
          class="brand"
          @click.prevent="handleNavigateHome"
        >
          <template v-if="brandWordmark">
            <img :src="brandWordmark.light" :alt="`Whilesmart ${layoutConfig.appName.value}`" class="brand-wordmark brand-wordmark--light" />
            <img :src="brandWordmark.dark" alt="" class="brand-wordmark brand-wordmark--dark" />
            <img :src="resolvedBrandIconUrl" :alt="`Whilesmart ${layoutConfig.appName.value}`" class="brand-icon brand-icon--compact" />
          </template>
          <template v-else>
            <img :src="resolvedBrandIconUrl" alt="Whilesmart" class="brand-icon" />
            <span class="brand-text">{{ layoutConfig.appName.value }}</span>
          </template>
        </a>
        <slot name="navbar-left" />
        <component
          v-for="item in leftNavbarItems"
          :key="item.id"
          :is="item.component"
        />
      </div>

      <div v-if="$slots['navbar-center'] || centerNavbarItems.length > 0" class="navbar-center">
        <slot name="navbar-center" />
        <component
          v-for="item in centerNavbarItems"
          :key="item.id"
          :is="item.component"
        />
      </div>

      <div class="navbar-right">
        <slot name="navbar-right" />
        <component
          v-for="item in rightNavbarItems"
          :key="item.id"
          :is="item.component"
        />

        <a v-if="supportUrl" class="icon-btn help-btn" :href="supportUrl" title="Support" aria-label="Support">
          <DsIcon name="solar:question-circle-linear" />
        </a>

        <div class="apps-menu-container">
          <button
            type="button"
            class="icon-btn apps-btn"
            :class="{ 'apps-btn--open': appsMenuOpen }"
            :aria-expanded="appsMenuOpen"
            aria-label="Whilesmart apps"
            title="Whilesmart apps"
            @click.stop="appsMenuOpen = !appsMenuOpen"
          >
            <img :src="launcherIcon" alt="" class="apps-btn__icon" width="24" height="24" />
          </button>

          <div v-if="appsMenuOpen" class="apps-dropdown">
            <div class="apps-grid">
              <button
                v-for="app in displayApps"
                :key="app.id"
                @click="handleNavigateToApp(app.id)"
                class="app-item"
                :class="{ active: app.id === currentAppId }"
              >
                <div class="app-icon-wrapper">
                  <DsIcon v-if="isIconifyIcon(app.icon)" :name="app.icon" class="app-icon app-icon--glyph" />
                  <img v-else :src="app.icon" :alt="app.name" class="app-icon" />
                </div>
                <span class="app-label">{{ app.name }}</span>
              </button>
            </div>
          </div>
        </div>

        <div v-if="user" class="user-menu">
          <button
            class="user-btn"
            @click.stop="userMenuOpen = !userMenuOpen"
            :title="`Whilesmart Account\n${user.email}`"
          >
            <DsAvatar :src="user.avatar_url || user.avatar" :name="userName" />
          </button>

          <div v-if="userMenuOpen" class="user-dropdown">
            <div class="user-dropdown-header">
              <DsAvatar :src="user.avatar_url || user.avatar" :name="userName" size="lg" />
              <div class="user-info">
                <div class="user-full-name">
                  {{ user.first_name }} {{ user.last_name }}
                </div>
                <div class="user-email">{{ user.email }}</div>
              </div>
            </div>
            <div v-if="$slots['user-menu']" class="user-dropdown-section">
              <slot name="user-menu" :close="() => { userMenuOpen = false }" />
            </div>
            <div class="user-dropdown-actions">
              <DsButton variant="secondary" full-width @click="handleNavigateToApp('accounts')">
                Manage your Whilesmart Account
              </DsButton>
            </div>
            <div class="user-dropdown-footer">
              <button @click="handleLogout" class="sign-out-btn">Sign out</button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <main :class="['main-content', { 'full-width': layoutConfig.fullWidth.value, 'main-content--assisted': !!slots.assistant }]">
      <slot />
    </main>

    <slot v-if="user" name="assistant" />
    <footer v-if="layoutConfig.showFooter.value" class="footer">
      <div class="footer-links">
        <a href="#">Privacy Policy</a>
        <span class="separator">·</span>
        <a href="#">Terms of Service</a>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  background: var(--ds-shell-ground);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-x: hidden;
}

.navbar {
  position: sticky;
  top: 0;
  height: var(--ds-navbar-height);
  background: var(--ds-shell-ground);
  display: grid;
  grid-template-columns: minmax(10rem, 1fr) minmax(20rem, var(--ds-header-search-max-width)) minmax(10rem, 1fr);
  gap: clamp(var(--ds-space-3), 2vw, var(--ds-space-6));
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--ds-space-6);
  z-index: var(--ds-z-fixed);
}

.navbar-left {
  grid-column: 1;
  display: flex;
  align-items: center;
  gap: var(--ds-space-3);
}

.navbar-center {
  grid-column: 2;
  display: flex;
  align-items: center;
  gap: var(--ds-space-3);
  width: 100%;
  min-width: 0;
}

.navbar-center > * {
  width: 100%;
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--ds-space-2);
  text-decoration: none;
  color: var(--ds-text-secondary);
  cursor: pointer;
}

.brand-icon {
  width: 2rem;
  height: 2rem;
}

.brand-wordmark {
  display: block;
  width: auto;
  height: 2.5rem;
}

.brand-wordmark--dark,
.brand-icon--compact {
  display: none;
}

:global([data-theme="dark"] .brand-wordmark--light) {
  display: none;
}

:global([data-theme="dark"] .brand-wordmark--dark) {
  display: block;
}

.brand-text {
  font-size: 1.375rem;
  font-weight: var(--ds-font-weight-normal);
  color: var(--ds-text-secondary);
}

.navbar-right {
  grid-column: 3;
  display: flex;
  align-items: center;
  gap: var(--ds-space-1);
  justify-content: flex-end;
}

.icon-btn {
  background: none;
  border: none;
  padding: var(--ds-space-2);
  border-radius: var(--ds-radius-control);
  font-size: 1.25rem;
  color: var(--ds-text-secondary);
  cursor: pointer;
  transition: background var(--ds-transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background: var(--ds-shell-hover);
}

.apps-menu-container {
  position: relative;
}

.apps-btn__icon {
  display: block;
  width: 1.5rem;
  height: 1.5rem;
}

.apps-btn--open {
  background: var(--ds-shell-hover);
}

.apps-dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: var(--ds-space-2);
  background: var(--ds-bg-elevated);
  border-radius: var(--ds-radius-lg);
  box-shadow: var(--ds-shadow-xl);
  padding: var(--ds-space-4);
  min-width: 280px;
  z-index: var(--ds-z-dropdown);
  border: 1px solid var(--ds-border-base);
}

.apps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--ds-space-3);
}

.app-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ds-space-2);
  padding: var(--ds-space-3);
  background: none;
  border: none;
  border-radius: var(--ds-radius-md);
  cursor: pointer;
  transition: background var(--ds-transition-fast);
}

.app-item:hover {
  background: var(--ds-bg-surface);
}

.app-item.active {
  background: var(--ds-bg-surface);
}

.app-item {
  border-radius: var(--ds-radius-control);
}

.app-icon-wrapper {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-icon {
  width: 2rem;
  height: 2rem;
}

.app-icon--glyph {
  color: var(--ds-interactive-primary);
}

.app-label {
  font-size: var(--ds-text-xs);
  color: var(--ds-text-primary);
  text-align: center;
}

.user-menu {
  position: relative;
  margin-left: var(--ds-space-1);
}

.user-btn {
  background: none;
  border: none;
  padding: var(--ds-space-1);
  border-radius: var(--ds-radius-full);
  cursor: pointer;
  transition: box-shadow var(--ds-transition-fast);
}

.user-btn:hover {
  box-shadow: 0 0 0 8px var(--ds-bg-surface);
}

.avatar {
  width: 2rem;
  height: 2rem;
  border-radius: var(--ds-radius-full);
  background: var(--ds-color-secondary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--ds-font-weight-medium);
  font-size: var(--ds-text-sm);
}

.user-dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: var(--ds-space-2);
  background: var(--ds-bg-elevated);
  border-radius: var(--ds-radius-lg);
  box-shadow: var(--ds-shadow-xl);
  min-width: 320px;
  z-index: var(--ds-z-dropdown);
  border: 1px solid var(--ds-border-base);
  overflow: hidden;
}

.user-dropdown-header {
  padding: var(--ds-space-4);
  display: flex;
  align-items: center;
  gap: var(--ds-space-4);
  border-bottom: 1px solid var(--ds-border-base);
}

.user-avatar-large {
  width: 4rem;
  height: 4rem;
  border-radius: var(--ds-radius-full);
  background: var(--ds-color-secondary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--ds-font-weight-medium);
  font-size: var(--ds-text-xl);
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-full-name {
  font-size: var(--ds-text-base);
  font-weight: var(--ds-font-weight-medium);
  color: var(--ds-text-primary);
  margin-bottom: var(--ds-space-1);
}

.user-email {
  font-size: var(--ds-text-sm);
  color: var(--ds-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-dropdown-section {
  padding: var(--ds-space-3) var(--ds-space-4);
  border-bottom: 1px solid var(--ds-border-base);
}

.user-dropdown-actions {
  padding: var(--ds-space-4);
  border-bottom: 1px solid var(--ds-border-base);
}

.user-dropdown-footer {
  padding: var(--ds-space-4);
}

.sign-out-btn {
  width: 100%;
  background: none;
  border: 1px solid var(--ds-border-strong);
  border-radius: var(--ds-radius-base);
  padding: var(--ds-space-2) var(--ds-space-4);
  font-size: var(--ds-text-sm);
  font-weight: var(--ds-font-weight-medium);
  color: var(--ds-text-primary);
  cursor: pointer;
  transition: all var(--ds-transition-fast);
}

.sign-out-btn:hover {
  background: var(--ds-bg-surface);
}

.main-content {
  flex: 1;
  max-width: 90rem;
  width: 100%;
  margin: 0 auto;
  padding: var(--ds-space-6);
  position: relative;
  z-index: 1;
  overflow-x: hidden;
}

.main-content--assisted {
  padding-bottom: calc(var(--ds-space-6) + var(--ds-assistant-clearance));
}

.main-content :deep(.ds-sidebar) {
  --ds-bg-hover: var(--ds-shell-hover);
  border-right: 0;
  background: var(--ds-shell-ground);
}

.main-content.full-width {
  max-width: 100%;
  padding: 0;
  overflow: hidden;
  position: relative;
  min-height: 0;
}

.footer {
  padding: var(--ds-space-4) var(--ds-space-6);
  background: var(--ds-bg-elevated);
  border-top: 1px solid var(--ds-border-base);
}

.footer-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--ds-space-2);
}

.footer-links a {
  font-size: var(--ds-text-xs);
  color: var(--ds-text-secondary);
  text-decoration: none;
}

.footer-links a:hover {
  color: var(--ds-text-primary);
}

.separator {
  color: var(--ds-text-muted);
}

@media (max-width: 768px) {
  .navbar {
    grid-template-columns: auto minmax(10rem, 1fr) auto;
    padding: 0 var(--ds-space-4);
  }

  .brand-text,
  .help-btn,
  .brand-wordmark,
  :global([data-theme="dark"] .brand-wordmark--dark) {
    display: none;
  }

  .brand-icon--compact {
    display: block;
  }

  .main-content {
    padding: var(--ds-space-4);
  }
}
</style>
