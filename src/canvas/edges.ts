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
