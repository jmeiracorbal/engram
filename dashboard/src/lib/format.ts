export function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatRelative(iso: string): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diff = now - then

  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`

  return formatDate(iso)
}

export function truncate(str: string, max: number): string {
  if (str.length <= max) return str
  return str.slice(0, max) + "…"
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const TYPE_COLORS: Record<string, string> = {
  decision: "bg-[var(--engram-lavender)]/20 text-[var(--engram-lavender)]",
  pattern: "bg-[var(--engram-teal)]/20 text-[var(--engram-blue)]",
  bugfix: "bg-[var(--engram-red)]/15 text-[var(--engram-red)]",
  architecture: "bg-[var(--engram-peach)]/20 text-[var(--engram-peach)]",
  convention: "bg-[var(--engram-mauve)]/20 text-[var(--engram-mauve)]",
  discovery: "bg-[var(--engram-yellow)]/20 text-amber-700",
  preference: "bg-[var(--engram-green)]/20 text-[var(--engram-blue)]",
}

export function typeColor(type: string): string {
  return TYPE_COLORS[type] ?? "bg-secondary text-secondary-foreground"
}
