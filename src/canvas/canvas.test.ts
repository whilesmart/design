import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  LANE_SIZE,
  forgetPositions,
  layoutLanes,
  readSavedPositions,
  savePosition,
} from './layout'
import { createEdgeRegistry } from './edges'

const lanes = [
  { id: 'src', label: 'src/' },
  { id: 'docs', label: 'docs/' },
]

describe('layoutLanes', () => {
  it('puts each lane in its own column and stacks its cards', () => {
    const { lanes: placed, items } = layoutLanes(lanes, [
      { id: 'a', lane: 'src' },
      { id: 'b', lane: 'src' },
      { id: 'c', lane: 'docs' },
    ])

    const column = LANE_SIZE.card.width + LANE_SIZE.padding * 2 + LANE_SIZE.gap.x
    expect(placed.map(l => l.position.x)).toEqual([0, column])

    const at = Object.fromEntries(items.map(i => [i.id, i.position]))
    expect(at.a.x).toBe(at.b.x)
    expect(at.b.y - at.a.y).toBe(LANE_SIZE.card.height + LANE_SIZE.gap.y)
    expect(at.c.x).toBe(column + LANE_SIZE.padding)
    expect(at.c.y).toBe(at.a.y)
  })

  it('draws the same picture from the same data', () => {
    const items = [{ id: 'a', lane: 'src' }, { id: 'c', lane: 'docs' }]
    expect(layoutLanes(lanes, items)).toEqual(layoutLanes(lanes, items))
  })

  it('makes a lane tall enough for every card in it', () => {
    const { lanes: placed, items } = layoutLanes(lanes, [
      { id: 'a', lane: 'src' },
      { id: 'b', lane: 'src' },
      { id: 'c', lane: 'src' },
    ])
    const last = items.at(-1)!
    expect(placed[0].height).toBeGreaterThanOrEqual(last.position.y + LANE_SIZE.card.height)
  })

  it('wraps a crowded lane into further columns instead of one tall stack', () => {
    const many = Array.from({ length: LANE_SIZE.rows + 1 }, (_, i) => ({ id: `m${i}`, lane: 'src' }))
    const { lanes: placed, items } = layoutLanes(lanes, [...many, { id: 'd', lane: 'docs' }])

    const first = items[0].position
    const wrapped = items[LANE_SIZE.rows].position
    expect(wrapped.y).toBe(first.y)
    expect(wrapped.x).toBe(first.x + LANE_SIZE.card.width + LANE_SIZE.gap.y)

    const src = placed.find(l => l.id === 'src')!
    const docs = placed.find(l => l.id === 'docs')!
    expect(src.width).toBeGreaterThanOrEqual(wrapped.x + LANE_SIZE.card.width - src.position.x)
    expect(docs.position.x).toBe(src.width + LANE_SIZE.gap.x)
    expect(src.height).toBeLessThan(LANE_SIZE.header + (LANE_SIZE.rows + 1) * LANE_SIZE.card.height)
  })

  it('starts a new row of lanes rather than growing one wide strip', () => {
    const many = Array.from({ length: 12 }, (_, i) => ({ id: `l${i}`, label: `l${i}/` }))
    const { lanes: placed } = layoutLanes(many, many.map(l => ({ id: `c${l.id}`, lane: l.id })))

    expect(Math.max(...placed.map(l => l.position.x + l.width))).toBeLessThanOrEqual(LANE_SIZE.width)
    const rows = [...new Set(placed.map(l => l.position.y))]
    expect(rows.length).toBeGreaterThan(1)
    const first = placed.filter(l => l.position.y === rows[0])
    expect(rows[1]).toBeGreaterThanOrEqual(Math.max(...first.map(l => l.height)))
  })

  it('keeps an empty lane on the canvas', () => {
    const { lanes: placed } = layoutLanes(lanes, [{ id: 'a', lane: 'src' }])
    expect(placed.find(l => l.id === 'docs')!.height).toBeGreaterThan(0)
  })

  it('leaves out an item whose lane was not passed', () => {
    const { items } = layoutLanes(lanes, [{ id: 'a', lane: 'gone' }])
    expect(items).toEqual([])
  })

  it('keeps a card where the reader dragged it', () => {
    const { items } = layoutLanes(lanes, [{ id: 'a', lane: 'src' }], { a: { x: 900, y: 40 } })
    expect(items[0].position).toEqual({ x: 900, y: 40 })
  })
})

describe('saved positions', () => {
  // Node 25 has a localStorage of its own that shadows any DOM environment's.
  beforeEach(() => {
    const kept = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => kept.get(key) ?? null,
      setItem: (key: string, value: string) => void kept.set(key, value),
      removeItem: (key: string) => void kept.delete(key),
    })
  })

  it('come back under the key they were saved with', () => {
    savePosition('memory:one', 'a', { x: 1, y: 2 })
    savePosition('memory:one', 'b', { x: 3, y: 4 })
    expect(readSavedPositions('memory:one')).toEqual({ a: { x: 1, y: 2 }, b: { x: 3, y: 4 } })
    expect(readSavedPositions('memory:two')).toEqual({})
  })

  it('are forgotten on reset', () => {
    savePosition('memory:one', 'a', { x: 1, y: 2 })
    forgetPositions('memory:one')
    expect(readSavedPositions('memory:one')).toEqual({})
  })

  it('read as none when what was stored is not JSON', () => {
    localStorage.setItem('memory:one', '{')
    expect(readSavedPositions('memory:one')).toEqual({})
  })
})

describe('createEdgeRegistry', () => {
  const edge = (id: string, type: string) => ({ id, source: 'a', target: 'b', type })

  it('draws the union of every source', async () => {
    const registry = createEdgeRegistry<string[]>()
    registry.register({ type: 'path', label: 'Shared files', load: () => [edge('p', 'path')] })
    registry.register({ type: 'symbol', label: 'Shared symbols', load: async () => [edge('s', 'symbol')] })
    expect((await registry.load([])).map(e => e.id)).toEqual(['p', 's'])
  })

  it('keeps the other sources when one fails', async () => {
    const registry = createEdgeRegistry<string[]>()
    registry.register({ type: 'broken', label: 'Broken', load: async () => { throw new Error('down') } })
    registry.register({ type: 'path', label: 'Shared files', load: () => [edge('p', 'path')] })
    expect((await registry.load([])).map(e => e.id)).toEqual(['p'])
  })

  it('loads only the sources asked for', async () => {
    const registry = createEdgeRegistry<string[]>()
    registry.register({ type: 'path', label: 'Shared files', load: () => [edge('p', 'path')] })
    registry.register({ type: 'symbol', label: 'Shared symbols', load: () => [edge('s', 'symbol')] })
    expect((await registry.load([], ['symbol'])).map(e => e.id)).toEqual(['s'])
  })

  it('draws a line two sources both report once', async () => {
    const registry = createEdgeRegistry<string[]>()
    registry.register({ type: 'one', label: 'One', load: () => [edge('same', 'one')] })
    registry.register({ type: 'two', label: 'Two', load: () => [edge('same', 'two')] })
    expect(await registry.load([])).toHaveLength(1)
  })

  it('replaces a source registered twice under one type', () => {
    const registry = createEdgeRegistry<string[]>()
    registry.register({ type: 'path', label: 'Old', load: () => [] })
    registry.register({ type: 'path', label: 'New', load: () => [] })
    expect(registry.sources().map(s => s.label)).toEqual(['New'])
  })
})

describe('the canvas card', async () => {
  const { createSSRApp, h } = await import('vue')
  const { renderToString } = await import('vue/server-renderer')
  const { default: DsCanvasCard } = await import('./DsCanvasCard.vue')

  it('marks a selected card and cuts nothing the slots add', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () => h(DsCanvasCard, { title: 'Checkout', subtitle: 'billing/', selected: true }, { footer: () => '3 open' }),
      }),
    )
    expect(html).toContain('is-selected')
    expect(html).toContain('billing/')
    expect(html).toContain('3 open')
  })
})
