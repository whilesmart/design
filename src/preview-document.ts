import colors from './tokens/colors.css?inline'
import theme from './tokens/theme.css?inline'

export const createPreviewDocument = (content: string, type: 'document' | 'spreadsheet') => `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
${colors}${theme}
*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:var(--ds-bg-elevated);color:var(--ds-text-primary);font-family:Arial,Helvetica,sans-serif}
body{${type === 'document' ? 'padding:22mm 20mm;font-size:11pt;line-height:1.55' : 'padding:1rem;font-size:13px'}}
h1,h2,h3,h4{margin:1.3em 0 .55em;line-height:1.2;color:var(--ds-text-primary)}h1{font-size:2em}h2{font-size:1.5em}h3{font-size:1.2em}
p{margin:0 0 .8em;min-height:1.2em}ul,ol{margin:.4em 0 1em;padding-left:1.6em}li{margin:.2em 0}a{color:var(--ds-interactive-primary)}
table{width:100%;border-collapse:collapse;margin:1em 0}th,td{min-width:5rem;padding:.5rem .65rem;border:1px solid var(--ds-border-base);text-align:left;vertical-align:top}th{background:var(--ds-bg-subtle);font-weight:600}
img{display:block;max-width:100%;height:auto;margin:1em auto}blockquote{margin:1em 0;padding:.25em 1em;border-left:3px solid var(--ds-border-strong);color:var(--ds-text-secondary)}
pre{overflow-x:auto;padding:1rem;background:var(--ds-bg-subtle);white-space:pre}code{font-family:monospace;overflow-wrap:anywhere}p,li,td,th{overflow-wrap:anywhere}body>table{display:block;overflow-x:auto}input[type=checkbox]{pointer-events:none}
@media(max-width:640px){body{padding:1.25rem;font-size:11pt}th,td{min-width:0}}
</style></head><body>${content}</body></html>`
