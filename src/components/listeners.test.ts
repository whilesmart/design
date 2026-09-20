import { describe, expect, it } from 'vitest'
import { createApp, createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import DsDataTable from './DsDataTable.vue'
import DsTrendChart from './DsTrendChart.vue'
import DsDropdown from './DsDropdown.vue'
import DsInput from './DsInput.vue'
import DsButton from './DsButton.vue'
import DsTabs from './DsTabs.vue'
import DsInitials from './DsInitials.vue'
import DsBrandMark from './DsBrandMark.vue'

// Vue strips listeners for declared emits from $attrs. Detecting them any other way than
// through the vnode props silently reports "nobody is listening" and drops the affordance.
const render = (component: unknown, props: Record<string, unknown>) =>
  renderToString(createSSRApp({ render: () => h(component as never, props) }))

const rows = [{ id: 1, name: 'Ada' }]
const columns = [{ key: 'name', label: 'Name' }]
const points = [
  { date: '2026-09-01', value: 1 },
  { date: '2026-09-02', value: 4 },
]

describe('DsDataTable row affordance', () => {
  it('marks rows clickable when a rowClick listener is bound', async () => {
    const html = await render(DsDataTable, { rows, columns, onRowClick: () => {} })
    expect(html).toContain('is-clickable')
  })

  it('leaves rows inert when nothing is listening', async () => {
    const html = await render(DsDataTable, { rows, columns })
    expect(html).not.toContain('is-clickable')
  })

  it('lets the prop force the affordance on', async () => {
    const html = await render(DsDataTable, { rows, columns, clickable: true })
    expect(html).toContain('is-clickable')
  })

  it('lets the prop force the affordance off while still emitting', async () => {
    const html = await render(DsDataTable, { rows, columns, clickable: false, onRowClick: () => {} })
    expect(html).not.toContain('is-clickable')
  })
})

describe('DsTrendChart drill-down affordance', () => {
  it('takes a pointer when a pointClick listener is bound', async () => {
    const html = await render(DsTrendChart, { title: 'New users', points, onPointClick: () => {} })
    expect(html).toContain('ds-trend__hit--drillable')
  })

  it('takes no pointer when nothing is listening', async () => {
    const html = await render(DsTrendChart, { title: 'New users', points })
    expect(html).not.toContain('ds-trend__hit--drillable')
  })
})

describe('DsTrendChart single point', () => {
  it('draws a marker, since a polyline of one point strokes nothing', async () => {
    const html = await render(DsTrendChart, { title: 'New users', points: [points[0]] })
    expect(html).toContain('ds-trend__dot')
    expect(html).not.toContain('ds-trend__line')
  })

  it('draws the line and area once there are two points', async () => {
    const html = await render(DsTrendChart, { title: 'New users', points })
    expect(html).toContain('ds-trend__line')
    expect(html).not.toContain('ds-trend__dot')
  })
})

describe('DsDropdown ids', () => {
  it('gives two uncontrolled dropdowns different listbox ids', async () => {
    const options = [{ value: 'a', label: 'A' }]
    const html = await renderToString(
      createSSRApp({
        render: () => [
          h(DsDropdown as never, { modelValue: 'a', options }),
          h(DsDropdown as never, { modelValue: 'a', options }),
        ],
      }),
    )
    const ids = [...html.matchAll(/aria-controls="([^"]+)"/g)].map((match) => match[1])
    expect(ids).toHaveLength(2)
    expect(ids[0]).not.toBe(ids[1])
  })
})

describe('DsDropdown option ids', () => {
  it('stays a valid id when an option value holds whitespace', async () => {
    const options = [
      { value: 'in progress', label: 'In progress' },
      { value: 'a/b', label: 'A or B' },
    ]
    const html = await render(DsDropdown, { modelValue: 'in progress', options })
    for (const id of [...html.matchAll(/id="([^"]*-option-[^"]*)"/g)].map((m) => m[1])) {
      expect(id).not.toMatch(/\s/)
    }
  })
})

describe('DsTrendChart click', () => {
  it('resolves the point from the click, not from a prior hover', async () => {
    const emitted: unknown[] = []
    const host = document.createElement('div')
    document.body.append(host)
    createApp({
      render: () =>
        h(DsTrendChart as never, {
          title: 'New users',
          points,
          onPointClick: (point: unknown) => emitted.push(point),
        }),
    }).mount(host)
    const rect = host.querySelector('rect[fill="transparent"]') as SVGRectElement
    rect.getBoundingClientRect = () => ({ left: 0, width: 640 }) as DOMRect
    rect.dispatchEvent(new MouseEvent('click', { clientX: 640, bubbles: true }))
    expect(emitted).toHaveLength(1)
  })
})

describe('field accessible name', () => {
  it('keeps the error out of the control name and describes it instead', async () => {
    const html = await render(DsInput, { label: 'Email', error: 'Enter a valid email', required: true })
    // The wrapper must not be the label, or the name becomes "Email * Enter a valid email".
    expect(html).not.toMatch(/<label[^>]*class="ds-field"/)
    const id = html.match(/<input[^>]*\sid="([^"]+)"/)![1]
    expect(html).toMatch(new RegExp(`<label[^>]*for="${id}"`))
    expect(html).toMatch(new RegExp(`aria-describedby="${id}-error"`))
    expect(html).toContain('aria-invalid="true"')
  })

  it('associates the label even when the caller gives no id', async () => {
    const html = await render(DsInput, { label: 'Email' })
    const id = html.match(/<input[^>]*\sid="([^"]+)"/)![1]
    expect(id).toBeTruthy()
    expect(html).toMatch(new RegExp(`<label[^>]*for="${id}"`))
  })
})

describe('DsButton disabled', () => {
  it('does not emit click as a disabled anchor, matching the native button', async () => {
    const emitted: unknown[] = []
    const host = document.createElement('div')
    document.body.append(host)
    createApp({
      render: () =>
        h(DsButton as never, { as: 'a', href: '/x', disabled: true, onClick: () => emitted.push(1) }),
    }).mount(host)
    host.querySelector('a')!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(emitted).toHaveLength(0)
  })
})

describe('DsTabs keyboard reach', () => {
  const options = [
    { key: 'a', label: 'A' },
    { key: 'b', label: 'B' },
  ]

  it('keeps one tab stop when the value matches an option', async () => {
    const html = await render(DsTabs, { modelValue: 'b', options, role: 'tablist' })
    expect([...html.matchAll(/tabindex="-1"/g)]).toHaveLength(1)
  })

  it('keeps one tab stop when the value matches nothing', async () => {
    const html = await render(DsTabs, { modelValue: 'gone', options, role: 'tablist' })
    expect([...html.matchAll(/tabindex="-1"/g)]).toHaveLength(1)
  })
})

describe('DsDropdown error description', () => {
  it('describes the trigger with the error even when no id is given', async () => {
    const html = await render(DsDropdown, {
      modelValue: 'a',
      options: [{ value: 'a', label: 'A' }],
      label: 'Client',
      error: 'Pick a client',
    })
    const described = html.match(/aria-describedby="([^"]+)"/)![1]
    expect(html).toContain(`id="${described}"`)
  })
})

describe('DsInitials', () => {
  it('takes the first code point, not the first code unit', async () => {
    const html = await render(DsInitials, { name: '😀 Lovelace' })
    expect(html).toContain('😀L')
    expect(html).not.toContain('�')
  })
})

describe('DsTrendChart tooltip', () => {
  it('places the tooltip where the point is drawn', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    createApp({ render: () => h(DsTrendChart as never, { title: 'New users', points }) }).mount(host)
    const rect = host.querySelector('rect[fill="transparent"]') as SVGRectElement
    rect.getBoundingClientRect = () => ({ left: 0, width: 640 }) as DOMRect
    rect.dispatchEvent(new MouseEvent('mousemove', { clientX: 640, bubbles: true }))
    await new Promise((resolve) => setTimeout(resolve))
    const tooltip = host.querySelector('.ds-trend__tooltip') as HTMLElement
    // The last point sits at viewBox x=628 of 640, so the tooltip belongs at 98.1%.
    expect(Number.parseFloat(tooltip.style.left)).toBeCloseTo((628 / 640) * 100, 1)
  })
})

describe('DsBrandMark', () => {
  it('takes the first code point of the product name', async () => {
    const html = await render(DsBrandMark, { name: '😀 Trakli' })
    expect(html).toContain('😀')
    expect(html).not.toContain('�')
  })
})
