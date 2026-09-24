import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

// The browser drops the whole declaration an undefined custom property sits
// in, so the value is missing rather than wrong.

const ROOT = path.resolve(__dirname)

function filesUnder(at: string, out: string[] = []): string[] {
  for (const entry of readdirSync(at, { withFileTypes: true })) {
    const here = path.join(at, entry.name)
    if (entry.isDirectory()) filesUnder(here, out)
    else if (/\.(vue|css)$/.test(entry.name)) out.push(here)
  }
  return out
}

function namesIn(text: string, pattern: RegExp): Set<string> {
  return new Set(text.match(pattern) ?? [])
}

const DECLARED = /--ds-[a-z0-9-]+(?=\s*:)/g
const USED = /var\(\s*--ds-[a-z0-9-]+/g

const defined = new Set<string>()
for (const file of filesUnder(path.join(ROOT, 'tokens'))) {
  for (const name of namesIn(readFileSync(file, 'utf8'), DECLARED)) defined.add(name)
}
// areas.ts hands a component its own area's three values under fixed names,
// as object keys rather than as CSS declarations.
for (const name of namesIn(readFileSync(path.join(ROOT, 'areas.ts'), 'utf8'), /--ds-[a-z0-9-]+(?=['"]?\s*:)/g)) {
  defined.add(name)
}

describe('every token a component reads is a token something defines', () => {
  it('finds the token files', () => {
    expect(defined.size).toBeGreaterThan(100)
  })

  const missing: string[] = []
  for (const file of [
    ...filesUnder(path.join(ROOT, 'components')),
    ...filesUnder(path.join(ROOT, 'layouts')),
  ]) {
    const text = readFileSync(file, 'utf8')
    const own = namesIn(text, DECLARED)
    text.split('\n').forEach((line, i) => {
      for (const used of namesIn(line, USED)) {
        const name = used.replace(/var\(\s*/, '')
        // A fallback makes the declaration valid, so the page still renders.
        const hasFallback = new RegExp(`var\\(\\s*${name}\\s*,`).test(line)
        if (defined.has(name) || own.has(name) || hasFallback) continue
        missing.push(`${path.relative(ROOT, file)}:${i + 1} reads ${name}`)
      }
    })
  }

  it('names nothing the token files do not define', () => {
    expect(missing).toEqual([])
  })
})
