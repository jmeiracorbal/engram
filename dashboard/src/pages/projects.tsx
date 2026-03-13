import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { SearchInput } from "@/components/search-input"
import { api } from "@/lib/api"
import { useAsync } from "@/hooks/use-async"
import { formatRelative } from "@/lib/format"
import { FolderOpen, FolderClock, Brain, Clock, ChevronRight, CheckCircle2, Loader2 } from "lucide-react"
import type { Session } from "@/lib/types"

const PROJECT_COLORS = [
  "var(--engram-lavender)",
  "var(--engram-teal)",
  "var(--engram-peach)",
  "var(--engram-blue)",
  "var(--engram-mauve)",
  "var(--engram-yellow)",
  "var(--engram-red)",
]

export function ProjectsPage() {
  const [filter, setFilter] = useState("")
  const stats = useAsync(() => api.stats(), [])
  const sessions = useAsync(() => api.recentSessions(undefined, 200), [])

  const projects = useMemo(() => {
    if (!stats.data || !sessions.data) return []

    return stats.data.projects.map((name, i) => {
      const projectSessions = sessions.data!.filter((s) => s.project === name)
      const totalObs = projectSessions.reduce((sum, s) => sum + s.observation_count, 0)
      const activeSessions = projectSessions.filter((s) => !s.ended_at).length
      const lastSession = projectSessions[0]
      const color = PROJECT_COLORS[i % PROJECT_COLORS.length]
      return { name, sessions: projectSessions, sessionCount: projectSessions.length, totalObs, activeSessions, lastSession, color }
    })
  }, [stats.data, sessions.data])

  const filtered = useMemo(() => {
    if (!filter.trim()) return projects
    const q = filter.toLowerCase()
    return projects.filter((p) => p.name.toLowerCase().includes(q))
  }, [projects, filter])

  const isLoading = stats.status === "loading" || sessions.status === "loading"
  const error = stats.error ?? sessions.error

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <FolderOpen className="size-6" />
          Projects
        </h2>
        <p className="text-muted-foreground">All projects with agent memory activity</p>
      </div>

      <SearchInput
        value={filter}
        onChange={setFilter}
        onSubmit={() => {}}
        onClear={filter ? () => setFilter("") : undefined}
        placeholder="Filter projects..."
        submitLabel="Filter"
      />

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      )}

      {error && (
        <Card className="border-destructive/50">
          <CardContent className="pt-6 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <FolderOpen className="size-10 mx-auto mb-3 opacity-30" />
          {filter ? (
            <p>No projects matching "{filter}"</p>
          ) : (
            <p>No projects yet</p>
          )}
        </div>
      )}

      {filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}

interface ProjectData {
  name: string
  sessions: Session[]
  sessionCount: number
  totalObs: number
  activeSessions: number
  lastSession: Session | undefined
  color: string
}

function ProjectCard({ project: p }: { project: ProjectData }) {
  const navigate = useNavigate()

  return (
    <Card
      className="group cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all relative overflow-hidden"
      onClick={() => navigate(`/observations?project=${encodeURIComponent(p.name)}`)}
    >
      <div
        className="absolute top-0 left-0 w-full h-1"
        style={{ backgroundColor: p.color }}
      />
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start gap-4">
          <div
            className="flex items-center justify-center size-12 rounded-lg shrink-0 text-lg font-bold"
            style={{
              backgroundColor: `color-mix(in srgb, ${p.color} 15%, transparent)`,
              color: p.color,
            }}
          >
            {p.name.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold leading-snug truncate">{p.name}</h3>
              <ChevronRight className="size-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors shrink-0" />
            </div>

            {p.lastSession?.summary && (
              <p className="text-xs text-muted-foreground/70 leading-relaxed line-clamp-2">
                {p.lastSession.summary}
              </p>
            )}

            <div className="grid grid-cols-3 gap-3">
              <MiniStat
                icon={<FolderClock className="size-3.5" />}
                value={p.sessionCount}
                label="sessions"
                color={p.color}
              />
              <MiniStat
                icon={<Brain className="size-3.5" />}
                value={p.totalObs}
                label="observations"
                color={p.color}
              />
              <MiniStat
                icon={p.activeSessions > 0
                  ? <Loader2 className="size-3.5" />
                  : <CheckCircle2 className="size-3.5" />
                }
                value={p.activeSessions > 0 ? p.activeSessions : p.sessionCount}
                label={p.activeSessions > 0 ? "active" : "completed"}
                color={p.color}
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {p.activeSessions > 0 && (
                <Badge
                  className="text-[10px] px-1.5 py-0"
                  style={{
                    backgroundColor: `color-mix(in srgb, var(--engram-peach) 15%, transparent)`,
                    color: "var(--engram-peach)",
                  }}
                >
                  {p.activeSessions} active
                </Badge>
              )}
              {p.lastSession && (
                <span className="text-[10px] text-muted-foreground/50 flex items-center gap-0.5">
                  <Clock className="size-2.5" />
                  Last activity {formatRelative(p.lastSession.started_at)}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MiniStat({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode
  value: number
  label: string
  color: string
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-md px-2.5 py-1.5"
      style={{ backgroundColor: `color-mix(in srgb, ${color} 8%, transparent)` }}
    >
      <span style={{ color }} className="shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-sm font-semibold tabular-nums leading-none">{value}</p>
        <p className="text-[10px] text-muted-foreground/60 leading-tight">{label}</p>
      </div>
    </div>
  )
}
