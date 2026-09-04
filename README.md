# @whilesmart/design

The WhileSmart design system: Vue 3 components, layouts, composables, and design tokens shared by every WhileSmart product surface.

## Install

The package is published to GitHub Packages, which requires an authenticated npm client even for public packages. Add an `.npmrc` next to your `package.json`:

```
@whilesmart:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Set `NODE_AUTH_TOKEN` to a GitHub token with `read:packages`, then:

```bash
npm install @whilesmart/design
```

`vue` and `vue-router` are peer dependencies.

## Use

Load the stylesheet once, at the entry point. It carries the tokens, the base reset, and every component style:

```ts
import '@whilesmart/design/styles'
```

Then import what you need:

```ts
import { DsButton, DsCard, DsCommandPalette } from '@whilesmart/design'
import { DashboardLayout, PublicLayout } from '@whilesmart/design/layouts'
import { useAppSwitcher, appUrl } from '@whilesmart/design/composables'
```

Components are prefixed `Ds`. The root entry also re-exports the layouts and composables, so a single import specifier works if you prefer it.

### Vite plugin

`@whilesmart/design/vite` provides the shared app shell: a loading state rendered before the Vue app mounts, crawlable markup and `llms.txt` for public landing pages, and a helper that rewrites `Set-Cookie` headers for local proxying.

```ts
import { whilesmartAppLoader, localizeSetCookie } from '@whilesmart/design/vite'

export default defineConfig({
  plugins: [whilesmartAppLoader({ site: { /* ... */ } }), vue()]
})
```

### App icons

A few components reference product marks by absolute path (`/mail-icon.svg`, `/files-icon.svg`, `/chat-icon.svg`, `/desk-icon.svg`, `/whilesmart-icon.svg`), so the host application must serve them from its own public directory. The source SVGs ship with the package for copying:

```
@whilesmart/design/icons/mail.svg
```

Icons referenced through the `appIcons` map and the app switcher are inlined into the bundle and need no copying.

## Tokens

Every colour, space, type step, and shadow is a CSS custom property under the `--ds-` prefix, defined in `src/tokens/`. Light values sit on `:root`; the dark theme redeclares them under `[data-theme="dark"]`. Individual token files are importable directly:

```ts
import '@whilesmart/design/tokens/colors.css'
```

Component styles only ever read tokens, never literal colours. `npm run check` enforces that text pairs clear a 4.5:1 contrast ratio in both themes.

## Develop

```bash
npm install
npm test          # unit tests
npm run check     # tokens, contrast, icon names, tests, build
npm run build     # dist/
```

The build produces ESM bundles, `.d.ts` declarations emitted by `vue-tsc`, a flattened `dist/design.css`, and the raw token and icon sources.

## Release

Publishing runs from the `Publish` workflow when a GitHub release is created. Bump the version in `package.json`, merge it, then cut the release; the workflow verifies, builds, and publishes to GitHub Packages.
