# Changelog

All notable changes to the WhileSmart design system are documented in this file.

## [0.1.0] - 2026-09-04

### Added

- Vue 3 components, layouts, and composables shipped as compiled ES modules with type declarations
- A single stylesheet carrying the design tokens, the base reset, and every component style
- The shared Vite app shell: a pre-mount loading state, crawlable landing page markup, and `llms.txt`
- Design tokens and product mark sources published alongside the bundle, so applications can read and copy them
- Contrast and icon name verification, which fails a release when a text pair drops below 4.5:1 in either theme
