import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"
import { useAsync } from "@/hooks/use-async"
import { formatRelative, truncate } from "@/lib/format"
import { FolderClock, Brain, ChevronRight, Clock, CheckCircle2, Loader2 } from "lucide-react"
import type { Session } from "@/lib/types"

export function SessionsPage() {
  const sessions = useAsync(() => api.recentSessions(undefined, 50), [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <FolderClock className="size-6" />
          Sessions
        </h2>
        <p className="text-muted-foreground">Agent coding sessions with stored observations</p>
      </div>

      {sessions.status === "loading" && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {sessions.status === "error" && (
        <Card className="border-destructive/50">
          <CardContent className="pt-6 text-sm text-destructive">
            {sessions.error}
          </CardContent>
        </Card>
      )}

      {sessions.data && sessions.data.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <FolderClock className="size-10 mx-auto mb-3 opacity-30" />
          <p>No sessions yet</p>
        </div>
      )}

      {sessions.data && sessions.data.length > 0 && (
        <div className="space-y-3">
          {sessions.data.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  )
}

function SessionCard({ session }: { session: Session }) {
  const navigate = useNavigate()
  const isCompleted = !!session.ended_at

  return (
    <Card
      className="group cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
      onClick={() => navigate(`/sessions/${encodeURIComponent(session.id)}`)}
    >
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          <div
            className="flex items-center justify-center size-10 rounded-lg shrink-0 mt-0.5"
            style={{
              backgroundColor: isCompleted
                ? "color-mix(in srgb, var(--engram-teal) 15%, transparent)"
                : "color-mix(in srgb, var(--engram-peach) 15%, transparent)",
            }}
          >
            {isCompleted ? (
              <CheckCircle2 className="size-5" style={{ color: "var(--engram-teal)" }} />
            ) : (
              <Loader2 className="size-5" style={{ color: "var(--engram-peach)" }} />
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold leading-snug">{session.project}</p>
              <ChevronRight className="size-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors shrink-0" />
            </div>

            {session.summary && (
              <p className="text-xs text-muted-foreground/70 leading-relaxed">
                {truncate(session.summary, 120)}
              </p>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 gap-1"
              >
                <Brain className="size-2.5" />
                {session.observation_count} observations
              </Badge>
              <Badge
                variant={isCompleted ? "outline" : "secondary"}
                className="text-[10px] px-1.5 py-0"
              >
                {isCompleted ? "completed" : "active"}
              </Badge>
              <span className="text-[10px] text-muted-foreground/50 flex items-center gap-0.5">
                <Clock className="size-2.5" />
                {formatRelative(session.started_at)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
