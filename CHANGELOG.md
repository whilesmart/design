# Changelog

All notable changes to the WhileSmart design system are documented in this file.

## [Unreleased]

### Added

- Chat building blocks: a message with a bubble for either side and pending and failed
  states, a question that starts on its recommended option and sends the answer when it
  is confirmed (one answer or several, as cards with detail or as pills, or in one tap),
  a step list for work in progress, a feed of the latest activity, and a composer that
  sends on Enter, grows with its text and offers attachments only when told what can be
  attached.
- A slot at the top of the console rail for the product's primary action.
- `DsBarTitle`: a page's title and subtitle, with an optional status dot, sized to sit in
  the console bar before the search.
- `--ds-accent-fill`, `--ds-accent-fill-strong`, `--ds-accent-ink` and
  `--ds-on-interactive-primary`: a tinted surface, the accent text that reads on it, and
  the text on a primary button, each defined for both themes.
- Brand kit building blocks: `DsColourPalette` (named swatches to copy, or to pick, rename,
  add and remove), `DsAssetSlots` (a slot per asset variant, each shown on the ground it is
  used on, with upload, replace and remove), `DsFontSpecimen` (a family set in its own face)
  and `DsRuleList` (what a brand must and must not do). `--ds-ground-light` and
  `--ds-ground-dark` are the fixed grounds assets are judged on.
- `DsSidebarGroup`: a labelled group of sidebar items.
- `DsButton` takes `to` and navigates as a router link while keeping its look.
- `DsField` and `DsSpotArt` are exported from the package entry.
- `--ds-brand-console-ground` and `--ds-brand-console-page`: a brand can set the fill
  around the boxed console's content area and the content area itself.

### Fixed

- The search box renders on a server whose `navigator` has no `platform`.
- A sidebar item with `to` renders its link with an `href`, so it opens in a new tab and
  works without script.
- Modal, page header and ecosystem strip titles keep their weight in apps whose CSS reset
  flattens headings.
- The create button's chevron stays at its end when the icons slot is empty.
- Info status text meets 4.5:1 on its fill; status text and fill pairs are part of the
  contrast check.
- Dark theme: table headers, primary chips, the active sidebar row, modal and search
  icons, avatars and state panels no longer keep their light tint, and primary buttons
  carry dark text on their light fill.

## [0.2.0] - 2026-09-20

### Changed for existing installations

Nothing was removed from the public API. Three defaults changed.

- Tables are denser. Cells now read `--ds-table-cell-padding`, which defaults to the house
  density of `6px 10px` rather than the previous `~10px 16px`. A host that wants the old
  spacing sets `--ds-brand-table-cell-padding`.
- The sidebar item sits at the same corner radius as a button, `--ds-radius-control`, rather
  than the 14px it alone used. A host that wants the old corner sets
  `--ds-brand-radius-control`.
- `DsSidebar` no longer forces itself full width below 768px. Placement is the caller's, so
  a rail that needs a narrow-screen treatment sets it where it is placed.
- `DsButton` renders `type="button"` unless told otherwise. A button inside a form that
  relied on the browser's implicit `submit` needs `type="submit"` to keep submitting.

### Added

- A brand contract: a host application can carry its own colour ramps, fonts, card radius,
  control radius and table density without overriding anything else.
- Area colours, so a place in the product owns a colour that its navigation, icon tile and
  page accents all share.
- A console shell, dropdown, stat tile, ranking list, labelled trend chart, tabs, menu,
  brand mark, application tag, initials mark, field wrapper and spot illustrations.
- Select, textarea, switch, pagination, page header and complete state primitives for
  administration interfaces.
- Empty and error states carry an illustration instead of a small glyph.
- The contrast test covers every area pair in both themes.

### Fixed

- Pagination rendered nothing, because its button was never imported.
- `DsAvatar` drew its fallback by calling a hosted avatar service with the person's name in
  the URL. The avatar is now drawn in process, so no name leaves the application.
- A chart given a single point drew nothing: a polyline of one point strokes nothing and the
  area collapses to zero width. It draws a marker instead.
- A disabled `DsButton` rendered as an anchor still emitted `click`, since an anchor has no
  native disabled state. It is now guarded like the native button.
- Input, select and textarea each carried their own copy of the label, error and field
  styles, and the input's focus ring was a hard-coded blue that ignored the brand. All three
  now share one field surface.
- The sidebar item and the console navigation item were two implementations of one row, and
  the console shell re-implemented the sidebar. Each is now one component.

## [0.1.0] - 2026-09-04

### Added

- Vue 3 components, layouts, and composables shipped as compiled ES modules with type declarations
- A single stylesheet carrying the design tokens, the base reset, and every component style
- The shared Vite app shell: a pre-mount loading state, crawlable landing page markup, and `llms.txt`
- Design tokens and product mark sources published alongside the bundle, so applications can read and copy them
- Contrast and icon name verification, which fails a release when a text pair drops below 4.5:1 in either theme
