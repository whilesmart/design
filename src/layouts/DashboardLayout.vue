<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useLayoutConfig } from '../composables/useLayoutConfig'
import { useAppSwitcher, type AppDefinition } from '../composables/useAppSwitcher'
import DsIcon from '../components/DsIcon.vue'
import DsAvatar from '../components/DsAvatar.vue'
import DsButton from '../components/DsButton.vue'

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
  currentAppId?: string
  brandIconUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  user: null,
  apps: undefined,
  currentAppId: undefined,
  brandIconUrl: undefined
})

const emit = defineEmits<{
  logout: []
  navigateHome: []
  navigateToApp: [appId: string]
}>()

const layoutConfig = useLayoutConfig()
const { apps: defaultApps, navigateToApp: navigateToAppExternal } = useAppSwitcher(props.apps)

const appsMenuOpen = ref(false)
const userMenuOpen = ref(false)

const displayApps = computed(() => props.apps || defaultApps.value)

const resolvedBrandIconUrl = computed(() => {
  if (props.brandIconUrl) return props.brandIconUrl
  if (props.currentAppId) {
    const app = displayApps.value.find(a => a.id === props.currentAppId)
    if (app?.icon) return app.icon
  }
  return '/whilesmart-icon.svg'
})

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
    navigateToAppExternal(appId)
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
  <div class="layout">
    <nav class="navbar">
      <div class="navbar-left">
        <a
          :href="layoutConfig.appHomeLink.value"
          class="brand"
          @click.prevent="handleNavigateHome"
        >
          <img :src="resolvedBrandIconUrl" alt="WhileSmart" class="brand-icon" />
          <span class="brand-text">{{ layoutConfig.appName.value }}</span>
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

        <button class="icon-btn help-btn" title="Support">
          <DsIcon name="solar:question-circle-linear" />
        </button>

        <div class="apps-menu-container">
          <button
            class="icon-btn apps-btn"
            @click.stop="appsMenuOpen = !appsMenuOpen"
            title="WhileSmart Apps"
          >
            <DsIcon name="solar:widget-4-bold-duotone" />
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
                  <img :src="app.icon" :alt="app.name" class="app-icon" />
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
            :title="`WhileSmart Account\n${user.email}`"
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
            <div class="user-dropdown-actions">
              <DsButton variant="secondary" full-width @click="handleNavigateToApp('accounts')">
                Manage your WhileSmart Account
              </DsButton>
            </div>
            <div class="user-dropdown-footer">
              <button @click="handleLogout" class="sign-out-btn">Sign out</button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <main :class="['main-content', { 'full-width': layoutConfig.fullWidth.value }]">
      <slot />
    </main>

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
  background: var(--ds-bg-surface);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-x: hidden;
}

.layout::after {
  content: '';
  position: fixed;
  bottom: -10%;
  right: -5%;
  width: 40vw;
  height: 40vw;
  max-width: 600px;
  max-height: 600px;
  background: url('/whilesmart-icon.svg') no-repeat center;
  background-size: contain;
  opacity: 0.04;
  pointer-events: none;
  z-index: 0;
}

.navbar {
  position: sticky;
  top: 0;
  height: 64px;
  background: color-mix(in srgb, var(--ds-bg-elevated) 86%, transparent);
  backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--ds-space-6);
  z-index: var(--ds-z-fixed);
  border-bottom: 1px solid var(--ds-border-base);
  box-shadow: var(--ds-elevation-1);
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: var(--ds-space-3);
}

.navbar-center {
  display: flex;
  align-items: center;
  gap: var(--ds-space-3);
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: min(43.2vw, 39.6rem);
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

.brand-text {
  font-size: 1.375rem;
  font-weight: var(--ds-font-weight-normal);
  color: var(--ds-text-secondary);
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: var(--ds-space-2);
}

.icon-btn {
  background: none;
  border: none;
  padding: var(--ds-space-3);
  border-radius: var(--ds-radius-full);
  color: var(--ds-text-secondary);
  cursor: pointer;
  transition: background var(--ds-transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background: var(--ds-bg-surface);
}

.apps-menu-container {
  position: relative;
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

.app-label {
  font-size: var(--ds-text-xs);
  color: var(--ds-text-primary);
  text-align: center;
}

.user-menu {
  position: relative;
  margin-left: var(--ds-space-2);
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
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: var(--ds-space-6);
  position: relative;
  z-index: 1;
  overflow-x: hidden;
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
    padding: 0 var(--ds-space-4);
  }

  .main-content {
    padding: var(--ds-space-4);
  }
}
</style>
