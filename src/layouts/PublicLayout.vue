<script setup lang="ts">
import { useAppSwitcher } from '../composables/useAppSwitcher'

interface Props {
  brandIconUrl?: string
  brandText?: string
  showSignIn?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  brandIconUrl: '/whilesmart-icon.svg',
  brandText: 'WhileSmart',
  showSignIn: true
})

const { getLoginUrl } = useAppSwitcher()

const handleSignIn = () => {
  window.location.href = getLoginUrl(window.location.href)
}
</script>

<template>
  <div class="layout">
    <nav class="navbar">
      <div class="navbar-left">
        <a href="/" class="brand">
          <img :src="brandIconUrl" :alt="brandText" class="brand-icon" />
          <span class="brand-text">{{ brandText }}</span>
        </a>
      </div>

      <div class="navbar-right">
        <slot name="navbar-right">
          <button v-if="showSignIn" class="sign-in-btn" @click="handleSignIn">
            Sign in
          </button>
        </slot>
      </div>
    </nav>

    <main class="main-content">
      <slot />
    </main>

    <footer class="footer">
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
  /* clip, not hidden: hidden forces overflow-y to auto, which makes this a
     scroll container and stops the sticky navbar sticking to the viewport. */
  overflow-x: clip;
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

.brand {
  display: flex;
  align-items: center;
  gap: var(--ds-space-2);
  text-decoration: none;
  color: var(--ds-text-secondary);
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

.navbar-right :deep(.ds-button) {
  white-space: nowrap;
}

.sign-in-btn {
  background: var(--ds-color-primary);
  color: white;
  border: none;
  border-radius: var(--ds-radius-base);
  padding: var(--ds-space-2) var(--ds-space-4);
  font-size: var(--ds-text-sm);
  font-weight: var(--ds-font-weight-medium);
  cursor: pointer;
  transition: all var(--ds-transition-fast);
}

.sign-in-btn:hover {
  background: var(--ds-color-primary-hover);
}

.main-content {
  flex: 1;
  position: relative;
  z-index: 1;
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
}

@media (max-width: 560px) {
  .brand-text {
    display: none;
  }
}
</style>
