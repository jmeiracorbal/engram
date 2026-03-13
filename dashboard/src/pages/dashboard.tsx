import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { useAsync } from "@/hooks/use-async"
import { formatRelative, typeColor, truncate } from "@/lib/format"
import { Brain, FolderClock, MessageSquare, FolderOpen, Clock, ChevronRight, LayoutDashboard } from "lucide-react"
import type { Observation, Session } from "@/lib/types"

export function DashboardPage() {
  const navigate = useNavigate()
  const stats = useAsync(() => api.stats(), [])
  const recent = useAsync(() => api.recentObservations(undefined, 5), [])
  const sessions = useAsync(() => api.recentSessions(undefined, 50), [])

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <LayoutDashboard className="size-6" />
          Dashboard
        </h2>
        <p className="text-muted-foreground">
          Overview of your agent memory system
        </p>
      </div>

      {stats.status === "loading" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}
      {stats.status === "error" && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">
              Could not connect to engram server: {stats.error}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Make sure <code className="bg-muted px-1 rounded">engram serve</code> is running on port 7437
            </p>
          </CardContent>
        </Card>
      )}

      {stats.data && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Sessions"
              value={stats.data.total_sessions}
              description="Coding sessions tracked"
              icon={FolderClock}
              color="var(--engram-lavender)"
              onClick={() => navigate("/sessions")}
            />
            <StatCard
              title="Observations"
              value={stats.data.total_observations}
              description="Observations stored"
              icon={Brain}
              color="var(--engram-teal)"
              onClick={() => navigate("/observations")}
            />
            <StatCard
              title="Prompts"
              value={stats.data.total_prompts}
              description="User prompts saved"
              icon={MessageSquare}
              color="var(--engram-peach)"
            />
            <StatCard
              title="Projects"
              value={stats.data.projects.length}
              description="Active projects"
              icon={FolderOpen}
              color="var(--engram-blue)"
            />
          </div>

        </>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Observations</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/observations")}>
              View all
            </Button>
          </CardHeader>
          <CardContent>
            {recent.status === "loading" && (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            )}
            {recent.data && recent.data.length === 0 && (
              <p className="text-sm text-muted-foreground italic">No observations yet</p>
            )}
            {recent.data && recent.data.length > 0 && (
              <div>
                {recent.data.map((obs, i) => (
                  <RecentItem key={obs.id} obs={obs} isLast={i === recent.data!.length - 1} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Projects</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/sessions")}>
              All sessions
            </Button>
          </CardHeader>
          <CardContent>
            {(!stats.data || stats.data.projects.length === 0) && sessions.status !== "loading" && (
              <p className="text-sm text-muted-foreground italic">No projects yet</p>
            )}
            {sessions.status === "loading" && (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            )}
            {stats.data && stats.data.projects.length > 0 && sessions.data && (
              <ProjectList projects={stats.data.projects} sessions={sessions.data} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color,
  onClick,
}: {
  title: string
  value: number
  description: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  color: string
  onClick?: () => void
}) {
  return (
    <Card
      className={`relative overflow-hidden transition-all ${onClick ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5" : ""}`}
      onClick={onClick}
    >
      <div
        className="absolute top-0 left-0 w-full h-1"
        style={{ backgroundColor: color }}
      />
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tabular-nums tracking-tight">{value}</p>
            <p className="text-xs text-muted-foreground/60">{description}</p>
          </div>
          <div
            className="flex items-center justify-center size-10 rounded-lg"
            style={{ backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)` }}
          >
            <Icon className="size-5" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function RecentItem({ obs, isLast }: { obs: Observation; isLast: boolean }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(`/observations/${obs.id}`)}
      className={`group flex items-start gap-3 w-full text-left p-3 rounded-lg hover:bg-muted/60 transition-colors ${!isLast ? "border-b border-border/50" : ""}`}
    >
      <div
        className="flex items-center justify-center size-8 rounded-md shrink-0 mt-0.5"
        style={{
          backgroundColor: `color-mix(in srgb, ${typeAccent(obs.type)} 15%, transparent)`,
        }}
      >
        <Brain className="size-3.5" style={{ color: typeAccent(obs.type) }} />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm font-medium leading-snug truncate">{obs.title}</p>
        <p className="text-xs text-muted-foreground/70 truncate">
          {truncate(obs.content.replace(/\n/g, " "), 80)}
        </p>
        <div className="flex items-center gap-2">
          <Badge className={`text-[10px] px-1.5 py-0 ${typeColor(obs.type)}`}>
            {obs.type}
          </Badge>
          {obs.project && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {obs.project}
            </Badge>
          )}
          <span className="text-[10px] text-muted-foreground/50 flex items-center gap-0.5">
            <Clock className="size-2.5" />
            {formatRelative(obs.created_at)}
          </span>
        </div>
      </div>
      <ChevronRight className="size-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors shrink-0 mt-2" />
    </button>
  )
}

const TYPE_ACCENTS: Record<string, string> = {
  decision: "var(--engram-lavender)",
  pattern: "var(--engram-teal)",
  bugfix: "var(--engram-red)",
  architecture: "var(--engram-peach)",
  convention: "var(--engram-mauve)",
  discovery: "var(--engram-yellow)",
  preference: "var(--engram-blue)",
}

function typeAccent(type: string): string {
  return TYPE_ACCENTS[type] ?? "var(--engram-lavender)"
}

const PROJECT_COLORS = [
  "var(--engram-lavender)",
  "var(--engram-teal)",
  "var(--engram-peach)",
  "var(--engram-blue)",
  "var(--engram-mauve)",
  "var(--engram-yellow)",
  "var(--engram-red)",
]

function ProjectList({ projects, sessions }: { projects: string[]; sessions: Session[] }) {
  const navigate = useNavigate()
  const limit = 6

  const projectData = projects.slice(0, limit).map((name, i) => {
    const projectSessions = sessions.filter((s) => s.project === name)
    const totalObs = projectSessions.reduce((sum, s) => sum + s.observation_count, 0)
    const lastSession = projectSessions[0]
    const color = PROJECT_COLORS[i % PROJECT_COLORS.length]
    return { name, sessionCount: projectSessions.length, totalObs, lastSession, color }
  })

  return (
    <div>
      {projectData.map((p, i) => (
        <button
          key={p.name}
          onClick={() => navigate(`/observations?project=${encodeURIComponent(p.name)}`)}
          className={`group flex items-start gap-3 w-full text-left p-3 rounded-lg hover:bg-muted/60 transition-colors ${i < projectData.length - 1 ? "border-b border-border/50" : ""}`}
        >
          <div
            className="flex items-center justify-center size-8 rounded-md shrink-0 mt-0.5 text-xs font-bold"
            style={{
              backgroundColor: `color-mix(in srgb, ${p.color} 15%, transparent)`,
              color: p.color,
            }}
          >
            {p.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-sm font-medium leading-snug truncate">{p.name}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-1">
                <FolderClock className="size-2.5" />
                {p.sessionCount} sessions
              </Badge>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-1">
                <Brain className="size-2.5" />
                {p.totalObs} observations
              </Badge>
              {p.lastSession && (
                <span className="text-[10px] text-muted-foreground/50 flex items-center gap-0.5">
                  <Clock className="size-2.5" />
                  {formatRelative(p.lastSession.started_at)}
                </span>
              )}
            </div>
          </div>
          <ChevronRight className="size-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors shrink-0 mt-1.5" />
        </button>
      ))}
      {projects.length > limit && (
        <p className="text-xs text-muted-foreground/50 text-center pt-2">
          +{projects.length - limit} more projects
        </p>
      )}
    </div>
  )
}
