import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        layouts: 'src/layouts/index.ts',
        composables: 'src/composables/index.ts'
      },
      formats: ['es']
    },
    rollupOptions: {
      external: ['vue', 'vue-router', '@iconify/vue'],
      output: { assetFileNames: 'style.css' }
    },
    cssCodeSplit: false,
    assetsInlineLimit: 8192,
    sourcemap: true,
    emptyOutDir: true
  },
  test: {
    include: ['src/**/*.test.ts']
  }
})
