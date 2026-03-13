import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"
import { useAsync } from "@/hooks/use-async"
import { formatDate, formatRelative, truncate, typeColor } from "@/lib/format"
import { ArrowLeft, Brain, Clock, FolderOpen } from "lucide-react"

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const decodedId = decodeURIComponent(id ?? "")

  const sessions = useAsync(() => api.recentSessions(undefined, 100), [])
  const session = sessions.data?.find((s) => s.id === decodedId)

  const observations = useAsync(
    () =>
      session
        ? api.recentObservations(session.project, 100)
        : Promise.resolve([]),
    [session?.id]
  )

  const sessionObs = observations.data?.filter((o) => o.session_id === decodedId) ?? []

  if (sessions.status === "loading") {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-4 mr-1" /> Back
        </Button>
        <p className="text-muted-foreground">Session not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <FolderOpen className="size-5" />
            {session.project}
          </h2>
          <p className="text-sm text-muted-foreground">
            {formatDate(session.started_at)}
            {session.ended_at ? ` — ${formatDate(session.ended_at)}` : " — in progress"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{session.observation_count}</p>
            <p className="text-xs text-muted-foreground">Observations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{session.ended_at ? "Done" : "Active"}</p>
            <p className="text-xs text-muted-foreground">Status</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{formatRelative(session.started_at)}</p>
            <p className="text-xs text-muted-foreground">Started</p>
          </CardContent>
        </Card>
      </div>

      {session.summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Summary</CardTitle>
          </CardHeader>
          <Separator />
          <ScrollArea className="max-h-[40vh]">
            <CardContent className="pt-4">
              <pre className="text-sm whitespace-pre-wrap break-words font-sans leading-relaxed">
                {session.summary}
              </pre>
            </CardContent>
          </ScrollArea>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="size-4" />
            Session Observations ({sessionObs.length})
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          {observations.status === "loading" && (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          )}
          {sessionObs.length === 0 && observations.status !== "loading" && (
            <p className="text-sm text-muted-foreground italic">No observations in this session</p>
          )}
          {sessionObs.length > 0 && (
            <div className="space-y-2">
              {sessionObs.map((obs) => (
                <button
                  key={obs.id}
                  onClick={() => navigate(`/observations/${obs.id}`)}
                  className="flex items-start gap-3 w-full rounded-md p-3 text-left hover:bg-muted/50 transition-colors border"
                >
                  <Badge className={`shrink-0 text-xs mt-0.5 ${typeColor(obs.type)}`}>
                    {obs.type}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{obs.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {truncate(obs.content.replace(/\n/g, " "), 100)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground/70">
                        <Clock className="size-3 inline mr-1" />
                        {formatRelative(obs.created_at)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
