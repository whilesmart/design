/* The lines on a canvas, from as many places as know about them.
 *
 * Each source explains one way two cards relate. The canvas draws the union of
 * every source the reader has left on, so a new relationship is a new source
 * rather than a change to the canvas. One source failing costs its own lines,
 * never the others.
 */

export interface CanvasEdge {
  id: string
  source: string
  target: string
  /** Which source drew it. */
  type: string
  label?: string
  /** How much it carries, drawn as thickness. One is a single link. */
  weight?: number
  /** Draws an arrowhead at the target, for relations that run one way. */
  directed?: boolean
  /** Draws the line dashed, for a relation that is expected but not yet complete. */
  pending?: boolean
}

export interface DrawnEdge {
  id: string
  source: string
  target: string
  type: 'smoothstep'
  class: string
  style: { strokeWidth: string }
  label?: string
  labelBgPadding?: [number, number]
  labelBgBorderRadius?: number
  markerEnd?: 'arrowclosed'
}

export interface DrawOptions {
  hidden: Set<string>
  selected: string | null
  /** The node an edge end attaches to, or null when there is none on the canvas. */
  nodeOf(id: string): string | null
}

/** The edges the reader can see, in the shape the flow renderer takes. */
export function drawEdges(edges: CanvasEdge[], { hidden, selected, nodeOf }: DrawOptions): DrawnEdge[] {
  const drawn: DrawnEdge[] = []
  for (const e of edges) {
    const source = nodeOf(e.source)
    const target = nodeOf(e.target)
    if (hidden.has(e.type) || !source || !target || source === target) continue
    const active = !!selected && (e.source === selected || e.target === selected)
    drawn.push({
      id: e.id,
      source,
      target,
      type: 'smoothstep',
      class: ['ds-canvas-edge', `ds-canvas-edge--${e.type}`, active ? 'is-active' : '', e.pending ? 'is-pending' : '']
        .filter(Boolean)
        .join(' '),
      style: { strokeWidth: `${Math.min(1 + Math.log2(Math.max(e.weight ?? 1, 1)), 6)}px` },
      ...(e.label ? { label: e.label, labelBgPadding: [6, 3] as [number, number], labelBgBorderRadius: 6 } : {}),
      ...(e.directed ? { markerEnd: 'arrowclosed' as const } : {}),
    })
  }
  return drawn
}

export interface CanvasEdgeSource<Subject> {
  type: string
  label: string
  load(subject: Subject): Promise<CanvasEdge[]> | CanvasEdge[]
}

export interface EdgeRegistry<Subject> {
  register(source: CanvasEdgeSource<Subject>): void
  sources(): CanvasEdgeSource<Subject>[]
  /** Every edge from every source whose type is in `only`, or from all of them. */
  load(subject: Subject, only?: Iterable<string>): Promise<CanvasEdge[]>
}

export function createEdgeRegistry<Subject>(): EdgeRegistry<Subject> {
  const registered = new Map<string, CanvasEdgeSource<Subject>>()

  return {
    register(source) {
      registered.set(source.type, source)
    },
    sources() {
      return [...registered.values()]
    },
    async load(subject, only) {
      const wanted = only ? new Set(only) : null
      const chosen = [...registered.values()].filter(s => !wanted || wanted.has(s.type))
      const results = await Promise.allSettled(chosen.map(s => s.load(subject)))
      const seen = new Set<string>()
      return results.flatMap(r => (r.status === 'fulfilled' ? r.value : [])).filter((edge) => {
        if (seen.has(edge.id)) return false
        seen.add(edge.id)
        return true
      })
    },
  }
}
