const wordmark = (name: string) => ({
  light: new URL(`./wordmarks/${name}.svg`, import.meta.url).href,
  dark: new URL(`./wordmarks/${name}-dark.svg`, import.meta.url).href
})

export const appWordmarks = {
  desk: wordmark('desk'),
  mail: wordmark('mail'),
  files: wordmark('files'),
  docs: wordmark('docs'),
  slides: wordmark('slides'),
  calendar: wordmark('calendar'),
  chat: wordmark('chat'),
  moments: wordmark('moments'),
  console: wordmark('console'),
  accounts: wordmark('accounts'),
  mindpad: wordmark('mindpad')
}

export type WordmarkProduct = keyof typeof appWordmarks
