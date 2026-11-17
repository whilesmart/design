export interface WorkspaceOption {
  id: string | number
  name: string
  /** Personal, team, or whatever a product calls its kinds. */
  kind?: string
}

/** What the trigger says. */
export function nameOf(
  options: WorkspaceOption[],
  active: string | number | null | undefined,
): string {
  if (active === null || active === undefined) return ''
  return options.find((one) => one.id === active)?.name ?? ''
}

/** The workspace a menu is pointed at, if it is among the options. */
export function activeOf(
  options: WorkspaceOption[],
  active: string | number | null | undefined,
): WorkspaceOption | null {
  if (active === null || active === undefined) return null
  return options.find((one) => one.id === active) ?? null
}

/** Up to two letters for a tile: the first letters of the first two words. */
export function initialsOf(name: string | null | undefined): string {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean)
  return words.slice(0, 2).map((word) => [...word][0]!.toUpperCase()).join('')
}
