const loaderStyles = `
  #app:has(> .ws-app-loader) { min-height: 100vh; }
  .ws-app-loader {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    overflow: hidden;
    background: rgba(248, 250, 252, 0.9);
    backdrop-filter: blur(18px) saturate(1.15);
  }
  .ws-app-loader::before {
    content: '';
    position: absolute;
    width: 16rem;
    height: 16rem;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(68, 192, 235, 0.2), rgba(45, 57, 142, 0.08) 46%, transparent 72%);
    filter: blur(18px);
    animation: ws-app-loader-breathe 2.4s ease-in-out infinite;
  }
  .ws-app-loader__mark {
    position: relative;
    width: clamp(7rem, 10vw, 9rem);
    height: clamp(7rem, 10vw, 9rem);
    overflow: visible;
    filter: drop-shadow(0 10px 18px rgba(45, 57, 142, 0.24));
  }
  .ws-app-loader__part {
    transform-box: fill-box;
    transform-origin: center;
    animation: ws-app-loader-pulse 1.6s ease-in-out infinite;
  }
  .ws-app-loader__part:nth-child(2) { animation-delay: 0.2s; }
  .ws-app-loader__part:nth-child(3) { animation-delay: 0.4s; }
  .ws-app-loader__part:nth-child(4) { animation-delay: 0.6s; }
  @keyframes ws-app-loader-pulse {
    0%, 55%, 100% { fill: #2d398e; transform: translateY(0) scale(1); opacity: 0.92; }
    25% { fill: #44c0eb; transform: translateY(-0.22rem) scale(1.06); opacity: 1; }
  }
  @keyframes ws-app-loader-breathe {
    0%, 100% { transform: scale(0.88); opacity: 0.68; }
    50% { transform: scale(1.08); opacity: 1; }
  }
  @media (prefers-color-scheme: dark) {
    .ws-app-loader { background: rgba(15, 23, 42, 0.92); }
    .ws-app-loader::before { background: radial-gradient(circle, rgba(68, 192, 235, 0.3), rgba(114, 127, 199, 0.18) 46%, transparent 72%); }
    .ws-app-loader__mark { filter: drop-shadow(0 12px 22px rgba(68, 192, 235, 0.3)); }
  }
  @media (prefers-reduced-motion: reduce) {
    .ws-app-loader__part, .ws-app-loader::before { animation: none; }
  }
`

const loaderMarkup = `<div class="ws-app-loader" role="status" aria-label="Loading WhileSmart">
  <svg class="ws-app-loader__mark" viewBox="0 0 80 80" aria-hidden="true">
    <path class="ws-app-loader__part" d="M49.11,57.62s0,.07,0,0c-.74,1.03-2.1,1.3-3.18,.75-5.82-3.22-15.71-10.01-22.89-22.35-3.59-6.17-5.55-12.13-6.7-16.93,0-1.51,1.15-2.67,2.64-2.67h24.44c1.35,0,2.44,1.23,2.23,2.6-.54,3.77-.81,7.95-.61,12.54,.47,8.98,2.71,16.31,4.74,21.32,.61,1.58,.34,3.36-.68,4.73Z" />
    <path class="ws-app-loader__part" d="M63.66,18.96v12.13c0,2.19-.47,4.32-1.42,6.24-.07,.14-.14,.34-.2,.48-1.29,2.74-3.11,6.17-5.55,9.94-1.15,1.78-3.79,1.58-4.6-.34-2.3-5.55-4.87-14.19-3.93-24.68,.14-1.37,.27-2.67,.54-3.98,.2-1.37,1.42-2.33,2.78-2.33h9.89c1.42,0,2.51,1.17,2.51,2.54Z" />
    <path class="ws-app-loader__part" d="M63.66,48.23v13.44c0,1.03-.81,1.92-1.9,1.92h-6.03c-2.03,0-3.18-2.4-1.83-3.98,2.1-2.54,4.2-5.42,6.23-8.57l2.03-3.22c.54-.69,1.49-.41,1.49,.41Z" />
    <path class="ws-app-loader__part" d="M32.99,53.57c-3.05-2.74-7.72-6.99-11.58-12.54l-.07-.07c-1.56-2.26-5.01-1.17-5.01,1.58v15.08c0,3.29,2.64,5.96,5.89,5.96h19.36c.81,0,1.22-1.03,.61-1.58l-9.21-8.43Z" />
  </svg>
</div>`

export function localizeSetCookie(cookie) {
  return cookie
    .replace(/;\s*domain=[^;]+/gi, '')
    .replace(/;\s*secure/gi, '')
    .replace(/;\s*samesite=\w+/gi, '; SameSite=Lax')
}

export function whilesmartAppLoader() {
  return {
    name: 'whilesmart-app-loader',
    transformIndexHtml(html) {
      return html
        .replace('</head>', `<style>${loaderStyles}</style></head>`)
        .replace('<div id="app"></div>', `<div id="app">${loaderMarkup}</div>`)
    }
  }
}
