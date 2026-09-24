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
