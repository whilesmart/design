import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const dist = path.join(root, 'dist')

function inline(file) {
  const source = fs.readFileSync(file, 'utf8')
  return source.replace(/@import\s+['"]([^'"]+)['"];?/g, (_, target) =>
    inline(path.resolve(path.dirname(file), target))
  )
}

function copyTree(from, to) {
  fs.mkdirSync(to, { recursive: true })
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name)
    const target = path.join(to, entry.name)
    if (entry.isDirectory()) copyTree(source, target)
    else fs.copyFileSync(source, target)
  }
}

copyTree(path.join(root, 'src/tokens'), path.join(dist, 'css/tokens'))
copyTree(path.join(root, 'src/base'), path.join(dist, 'css/base'))
copyTree(path.join(root, 'src/assets/app-icons'), path.join(dist, 'icons'))

const componentStyles = path.join(dist, 'style.css')
if (!fs.existsSync(componentStyles)) throw new Error('dist/style.css is missing, run the library build first')

const bundle = [inline(path.join(root, 'src/index.css')), fs.readFileSync(componentStyles, 'utf8')].join('\n')
fs.writeFileSync(path.join(dist, 'design.css'), bundle)

console.log(`Wrote dist/design.css (${(bundle.length / 1024).toFixed(1)} kB), token sources, and ${fs.readdirSync(path.join(dist, 'icons')).length} app icons.`)
