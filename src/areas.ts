/**
 * Every name here has a matching --ds-area-<name>-* block in tokens/brand.css.
 * scripts/check-tokens.mjs fails when the two lists drift.
 */
export const areaColors = [
  'indigo',
  'cyan',
  'green',
  'amber',
  'violet',
  'rose',
  'teal',
  'orange',
  'slate',
] as const

export type AreaColor = (typeof areaColors)[number]

/** Resolves an area name to the three custom properties every area-aware component reads. */
export function areaStyle(area: AreaColor | undefined) {
  if (!area) return undefined
  return {
    '--ds-area-fill': `var(--ds-area-${area}-fill)`,
    '--ds-area-ink': `var(--ds-area-${area}-ink)`,
    '--ds-area-solid': `var(--ds-area-${area}-solid)`,
  }
}
