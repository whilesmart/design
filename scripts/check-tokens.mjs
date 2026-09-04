import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const solar = JSON.parse(fs.readFileSync(path.join(root, 'node_modules/@iconify-json/solar/icons.json'), 'utf8'))
const materialSymbols = JSON.parse(fs.readFileSync(path.join(root, 'node_modules/@iconify-json/material-symbols/icons.json'), 'utf8'))

const sourceFiles = []
function collect(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) collect(target)
    else if (/\.(vue|ts)$/.test(entry.name)) sourceFiles.push(target)
  }
}
collect(path.join(root, 'src'))

const missingSolar = new Set()
const missingMaterialSymbols = new Set()
const hardcodedAppUrls = []
for (const file of sourceFiles) {
  const source = fs.readFileSync(file, 'utf8')
  for (const match of source.matchAll(/solar:([a-z0-9-]+)/g)) {
    if (!solar.icons[match[1]]) missingSolar.add(match[1])
  }
  for (const match of source.matchAll(/material-symbols:([a-z0-9-]+)/g)) {
    if (!materialSymbols.icons[match[1]]) missingMaterialSymbols.add(match[1])
  }
  if (!file.endsWith(path.join('src', 'composables', 'useAppUrls.ts'))) {
    for (const match of source.matchAll(/https:\/\/(accounts|calendar|chat|console|desk|files|mail|moments|platform)\.whilesmart\.com/g)) {
      hardcodedAppUrls.push(`${path.relative(root, file)}:${match[1]}`)
    }
  }
}

if (missingSolar.size) throw new Error(`Unknown Solar icons: ${[...missingSolar].join(', ')}`)
if (missingMaterialSymbols.size) throw new Error(`Unknown Material Symbols: ${[...missingMaterialSymbols].join(', ')}`)
if (hardcodedAppUrls.length) throw new Error(`App URLs must use appUrl(): ${hardcodedAppUrls.join(', ')}`)

const colors = fs.readFileSync(path.join(root, 'src/tokens/colors.css'), 'utf8')

// The dark block redeclares many tokens, so the two themes are parsed apart; one flat map would let
// a dark value shadow its light twin and silently test the wrong colour.
const darkAt = colors.indexOf('[data-theme="dark"]')
const parse = (source) =>
  Object.fromEntries([...source.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((match) => [match[1], match[2]]))
const light = parse(colors.slice(0, darkAt))
const themes = { light, dark: { ...light, ...parse(colors.slice(darkAt)) } }

function luminance(hex) {
  const channels = hex.slice(1).match(/.{2}/g).map((value) => parseInt(value, 16) / 255)
  const linear = channels.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
}

function contrast(tokens, foreground, background) {
  for (const name of [foreground, background]) {
    if (!tokens[name]) throw new Error(`Contrast pair references an undefined token: --${name}`)
  }
  const values = [luminance(tokens[foreground]), luminance(tokens[background])].sort((a, b) => b - a)
  return (values[0] + 0.05) / (values[1] + 0.05)
}

const textPairs = [
  ['ds-color-neutral-900', 'ds-color-neutral-0'],
  ['ds-color-neutral-600', 'ds-color-neutral-0'],
  ['ds-color-neutral-50', 'ds-color-neutral-900'],
  ['ds-color-neutral-300', 'ds-color-neutral-900'],
]

const chatPairs = [
  ['ds-chat-active-ink', 'ds-chat-active-bg'],
  ['ds-chat-mention-ink', 'ds-chat-mention-bg'],
  ['ds-chat-group-ink', 'ds-chat-group-bg'],
  ['ds-chat-direct-ink', 'ds-chat-direct-bg'],
  ['ds-chat-context-ink', 'ds-chat-context-bg'],
  ['ds-chat-saved-ink', 'ds-chat-saved-bg'],
  ['ds-chat-sidebar-read-ink', 'ds-chat-sidebar-bg'],
  ['ds-chat-unread-ink', 'ds-chat-sidebar-bg'],
  ['ds-chat-timestamp-ink', 'ds-chat-post-bg'],
  ['ds-chat-secondary-ink', 'ds-chat-post-bg'],
  ['ds-chat-new-ink', 'ds-chat-post-bg'],
  ['ds-chat-secondary-ink', 'ds-chat-post-hover'],
  ['ds-chat-mention-body-ink', 'ds-chat-mention-highlight'],
]

const failures = []
for (const [theme, tokens] of Object.entries(themes)) {
  for (const [foreground, background] of [...textPairs, ...chatPairs]) {
    if (theme === 'dark' && textPairs.some(([f, b]) => f === foreground && b === background)) continue
    const ratio = contrast(tokens, foreground, background)
    if (ratio < 4.5) failures.push({ theme, foreground, background, ratio: Number(ratio.toFixed(2)) })
  }
}

if (failures.length) throw new Error(`Text contrast below 4.5:1: ${JSON.stringify(failures, null, 2)}`)

console.log(`Verified ${sourceFiles.length} source files, icon names, and ${textPairs.length + chatPairs.length * 2} theme contrast pairs.`)
