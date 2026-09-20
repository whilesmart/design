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

### Carrying your own brand

`src/tokens/brand.css` lists every token a host may redefine: the primary and secondary
ramps, the sans and mono families, the card radius, the control radius and the table
density. Redeclare them on `:root` in a stylesheet loaded after
`@whilesmart/design/styles`, and the whole system follows:

```css
:root {
  --ds-brand-primary-800: #047844;
  /* ... the rest of the ramp ... */
  --ds-brand-font-sans: 'Ubuntu', system-ui, sans-serif;
}
```

Set the whole ramp. A partial one leaves the remaining steps on the WhileSmart defaults and
shifts hue between steps. Hold your own values to the same 4.5:1 bar: the check here covers
the defaults, not yours.

### Area colours

An area colour names a place in the product, never a status. A navigation destination, its
icon tile and the accents on its own page all draw from one area, so a reader learns the
colour once. A row, a chip or a finding that carries meaning uses the status tokens instead.
The two never share a surface.

Each area has a soft `fill`, an `ink` that clears 4.5:1 on that fill, and a `solid` for a
filled tile carrying `--ds-area-on-solid`. Components take an `area` prop; `areaStyle()`
resolves it for anything hand-rolled.

## Develop

```bash
npm install
npm test          # unit tests
npm run check     # tokens, contrast, icon names, tests, build
npm run build     # dist/
```

The build produces ESM bundles, `.d.ts` declarations emitted by `vue-tsc`, a flattened `dist/design.css`, and the raw token and icon sources.

## Release

Releases run through the shared `js/publish` action in `whilesmart/workflows`, so this repository follows the same flow as every other WhileSmart package.

1. Bump `version` in `package.json` and add the matching `## [version]` section to `CHANGELOG.md`. The release fails without it, because a version published without notes cannot be published again to add them.
2. Merge that to `main`.
3. Push the tag: `git tag v0.2.0 && git push origin v0.2.0`.

The workflow verifies the tag against `package.json`, runs `npm run check`, publishes to GitHub Packages, and creates the GitHub release from the changelog entry.
