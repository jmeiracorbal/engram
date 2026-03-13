import { useState, useMemo } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { api } from "@/lib/api"
import { useAsync } from "@/hooks/use-async"
import { formatDate, typeColor, truncate } from "@/lib/format"
import { Clock, ArrowDown } from "lucide-react"

export function TimelinePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const observationId = searchParams.get("observation_id")
  const [depth, setDepth] = useState(100)

  const timeline = useAsync(
    () =>
      observationId
        ? api.timeline(Number(observationId))
        : Promise.resolve(null),
    [observationId]
  )

  const allBefore = useMemo(() => timeline.data?.before ?? [], [timeline.data])
  const allAfter = useMemo(() => timeline.data?.after ?? [], [timeline.data])
  const totalEntries = allBefore.length + allAfter.length

  const visibleBefore = useMemo(() => {
    if (totalEntries === 0) return []
    const count = Math.round((depth / 100) * allBefore.length)
    return allBefore.slice(-count)
  }, [allBefore, depth, totalEntries])

  const visibleAfter = useMemo(() => {
    if (totalEntries === 0) return []
    const count = Math.round((depth / 100) * allAfter.length)
    return allAfter.slice(0, count)
  }, [allAfter, depth, totalEntries])

  const visibleCount = visibleBefore.length + visibleAfter.length

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Clock className="size-6" />
          Timeline
        </h2>
        <p className="text-muted-foreground">
          Chronological context around observation #{observationId}
        </p>
      </div>

      {timeline.status === "loading" && (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {timeline.status === "error" && (
        <Card className="border-destructive/50">
          <CardContent className="pt-6 text-sm text-destructive">
            {timeline.error}
          </CardContent>
        </Card>
      )}

      {timeline.data && timeline.data.focus && (
        <>
          <div className="flex items-center justify-between gap-4">
            {timeline.data.session_info && (
              <div className="flex items-center gap-3 text-sm">
                <Badge variant="outline">{timeline.data.session_info.project}</Badge>
                <span className="text-muted-foreground">
                  {formatDate(timeline.data.session_info.started_at)}
                </span>
              </div>
            )}
          </div>

          {totalEntries > 0 && (
            <Card>
              <CardContent className="py-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Timeline depth</span>
                  <span className="tabular-nums font-medium">
                    {visibleCount} of {totalEntries} entries
                  </span>
                </div>
                <Slider
                  value={[depth]}
                  onValueChange={(v) => setDepth(Array.isArray(v) ? v[0] : v)}
                  min={0}
                  max={100}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground/60">
                  <span>Focus only</span>
                  <span>Full range</span>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

            {visibleBefore.length > 0 && (
              <div className="space-y-2 mb-4">
                <p className="text-xs text-muted-foreground font-medium pl-12 uppercase tracking-wider">
                  Before ({visibleBefore.length})
                </p>
                {visibleBefore.map((entry) => (
                  <TimelineItem
                    key={entry.id}
                    entry={entry}
                    onClick={() => navigate(`/observations/${entry.id}`)}
                  />
                ))}
                <div className="flex justify-center py-1">
                  <ArrowDown className="size-4 text-muted-foreground" />
                </div>
              </div>
            )}

            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary ring-4 ring-primary/20 z-10" />
              <Card className="ml-12 border-primary/30 shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Badge className={typeColor(timeline.data.focus.type)}>
                        {timeline.data.focus.type}
                      </Badge>
                      {timeline.data.focus.title}
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">
                      #{timeline.data.focus.id}
                    </span>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-3">
                  <pre className="text-xs whitespace-pre-wrap wrap-break-word font-sans leading-relaxed text-muted-foreground">
                    {truncate(timeline.data.focus.content, 500)}
                  </pre>
                  <p className="text-xs text-muted-foreground/70 mt-2">
                    {formatDate(timeline.data.focus.created_at)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {visibleAfter.length > 0 && (
              <div className="space-y-2 mt-4">
                <div className="flex justify-center py-1">
                  <ArrowDown className="size-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground font-medium pl-12 uppercase tracking-wider">
                  After ({visibleAfter.length})
                </p>
                {visibleAfter.map((entry) => (
                  <TimelineItem
                    key={entry.id}
                    entry={entry}
                    onClick={() => navigate(`/observations/${entry.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {!observationId && timeline.status !== "loading" && !timeline.data && (
        <div className="text-center py-12 text-muted-foreground">
          <Clock className="size-10 mx-auto mb-3 opacity-30" />
          <p>No observation selected</p>
          <p className="text-xs mt-1">
            Access timelines from the <button className="text-primary hover:underline" onClick={() => navigate("/observations")}>observations</button> list by clicking on an observation ID
          </p>
        </div>
      )}
    </div>
  )
}

function TimelineItem({
  entry,
  onClick,
}: {
  entry: { id: number; type: string; title: string; created_at: string }
  onClick: () => void
}) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-muted-foreground/40 z-10" />
      <button
        onClick={onClick}
        className="ml-12 w-[calc(100%-3rem)] text-left rounded-md border p-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`text-xs ${typeColor(entry.type)}`}>
            {entry.type}
          </Badge>
          <span className="text-sm truncate">{entry.title}</span>
          <span className="text-xs text-muted-foreground ml-auto shrink-0">
            #{entry.id}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDate(entry.created_at)}
        </p>
      </button>
    </div>
  )
}
