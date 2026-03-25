<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useLayoutConfig } from '../composables/useLayoutConfig'
import { useAppSwitcher, type AppDefinition } from '../composables/useAppSwitcher'

export interface User {
  first_name: string
  last_name: string
  email: string
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
  brandIconUrl: '/whilesmart-icon.svg'
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

const userInitials = computed(() => {
  if (!props.user) return '?'
  return `${props.user.first_name[0]}${props.user.last_name[0]}`.toUpperCase()
})

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
          <img :src="brandIconUrl" alt="WhileSmart" class="brand-icon" />
          <span class="brand-text">{{ layoutConfig.appName.value }}</span>
        </a>
        <component
          v-for="item in leftNavbarItems"
          :key="item.id"
          :is="item.component"
        />
      </div>

      <div v-if="centerNavbarItems.length > 0" class="navbar-center">
        <component
          v-for="item in centerNavbarItems"
          :key="item.id"
          :is="item.component"
        />
      </div>

      <div class="navbar-right">
        <component
          v-for="item in rightNavbarItems"
          :key="item.id"
          :is="item.component"
        />

        <button class="icon-btn help-btn" title="Support">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        <div class="apps-menu-container">
          <button
            class="icon-btn apps-btn"
            @click.stop="appsMenuOpen = !appsMenuOpen"
            title="WhileSmart Apps"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"/>
            </svg>
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
                  <span class="app-icon">{{ app.icon }}</span>
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
            <div class="avatar">{{ userInitials }}</div>
          </button>

          <div v-if="userMenuOpen" class="user-dropdown">
            <div class="user-dropdown-header">
              <div class="user-avatar-large">{{ userInitials }}</div>
              <div class="user-info">
                <div class="user-full-name">
                  {{ user.first_name }} {{ user.last_name }}
                </div>
                <div class="user-email">{{ user.email }}</div>
              </div>
            </div>
            <div class="user-dropdown-actions">
              <button class="manage-btn" @click="handleNavigateToApp('accounts')">
                Manage your WhileSmart Account
              </button>
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
  background:
    radial-gradient(ellipse at 0% 0%, rgba(45, 57, 142, 0.12) 0%, transparent 50%),
    radial-gradient(ellipse at 100% 0%, rgba(68, 192, 235, 0.14) 0%, transparent 50%),
    radial-gradient(ellipse at 100% 100%, rgba(45, 57, 142, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 0% 100%, rgba(68, 192, 235, 0.12) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(45, 57, 142, 0.06) 0%, transparent 70%),
    var(--ds-bg-surface);
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
  background: var(--ds-bg-elevated);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--ds-space-6);
  z-index: var(--ds-z-fixed);
  border-bottom: 1px solid var(--ds-border-base);
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
  font-size: 1.5rem;
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

.manage-btn {
  width: 100%;
  background: none;
  border: 1px solid var(--ds-border-strong);
  border-radius: var(--ds-radius-full);
  padding: var(--ds-space-2) var(--ds-space-4);
  font-size: var(--ds-text-sm);
  font-weight: var(--ds-font-weight-medium);
  color: var(--ds-text-primary);
  cursor: pointer;
  transition: all var(--ds-transition-fast);
}

.manage-btn:hover {
  background: var(--ds-bg-surface);
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
