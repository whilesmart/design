import { computed, ref } from 'vue'
import { conversationUrl } from './useAppUrls'
import type { ConversationSheetTarget } from '../components/DsConversationSheet.vue'
import type { PostRowView } from '../components/DsPostList.vue'

export interface SheetPost {
  id: string
  authorName: string
  content: string
  createdAt: string
}

const STORAGE_KEY = 'desk-conversation-sheet'
const GROUP_WINDOW_MS = 5 * 60 * 1000

export function sheetKey(target: Pick<ConversationSheetTarget, 'ownerType' | 'ownerId'>): string {
  return `${target.ownerType}:${target.ownerId}`
}

function readAll(): Record<string, SheetPost[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, SheetPost[]>) : {}
  } catch {
    return {}
  }
}

function writeAll(value: Record<string, SheetPost[]>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    /* storage unavailable; the thread still works for this session */
  }
}

export function buildSheetRows(posts: SheetPost[], now = new Date()): PostRowView[] {
  const rows: PostRowView[] = []
  let previous: SheetPost | undefined

  for (const post of posts) {
    const created = new Date(post.createdAt)
    const sameDay =
      previous !== undefined &&
      new Date(previous.createdAt).toDateString() === created.toDateString()

    if (!sameDay) {
      const distance = Math.round(
        (new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() -
          new Date(created.getFullYear(), created.getMonth(), created.getDate()).getTime()) /
          86_400_000
      )
      rows.push({
        kind: 'day',
        key: `day-${created.toDateString()}`,
        label: distance === 0 ? 'Today' : distance === 1 ? 'Yesterday' : created.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      })
      previous = undefined
    }

    const grouped =
      previous !== undefined &&
      previous.authorName === post.authorName &&
      created.getTime() - new Date(previous.createdAt).getTime() <= GROUP_WINDOW_MS

    rows.push({
      kind: 'post',
      key: post.id,
      id: post.id,
      author: { id: post.authorName, name: post.authorName },
      content: post.content,
      time: created.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      grouped,
      reactions: []
    })
    previous = post
  }

  return rows
}

export function useConversationSheet(options: { authorName: () => string }) {
  const open = ref(false)
  const target = ref<ConversationSheetTarget | null>(null)
  const draft = ref('')
  const threads = ref<Record<string, SheetPost[]>>(readAll())

  const posts = computed(() => (target.value ? threads.value[sheetKey(target.value)] ?? [] : []))
  const rows = computed(() => buildSheetRows(posts.value))

  function openSheet(next: ConversationSheetTarget): void {
    target.value = next
    draft.value = ''
    threads.value = readAll()
    open.value = true
  }

  function close(): void {
    open.value = false
  }

  function send(content: string): void {
    const body = content.trim()
    if (!body || !target.value) return
    const key = sheetKey(target.value)
    threads.value = {
      ...threads.value,
      [key]: [
        ...(threads.value[key] ?? []),
        { id: crypto.randomUUID(), authorName: options.authorName(), content: body, createdAt: new Date().toISOString() }
      ]
    }
    writeAll(threads.value)
    draft.value = ''
  }

  // Files and Chat are separate origins, so the thread cannot be read from Chat directly. Handing off
  // carries every message in the URL and clears the local copy, so one transcript exists, not two.
  function openFull(): void {
    if (!target.value) return
    const key = sheetKey(target.value)
    const messages = (threads.value[key] ?? []).map(post => post.content)
    const url = conversationUrl({ ...target.value, messages })

    const remaining = { ...threads.value }
    delete remaining[key]
    threads.value = remaining
    writeAll(remaining)

    window.location.href = url
  }

  return { open, target, draft, rows, posts, openSheet, close, send, openFull }
}
