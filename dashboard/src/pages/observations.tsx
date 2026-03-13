import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { SearchInput } from "@/components/search-input"
import { api } from "@/lib/api"
import { useAsync } from "@/hooks/use-async"
import { formatRelative, truncate, typeColor } from "@/lib/format"
import { Brain } from "lucide-react"
import type { Observation } from "@/lib/types"

export function ObservationsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const projectFilter = searchParams.get("project") ?? ""
  const [filterInput, setFilterInput] = useState(projectFilter)

  const observations = useAsync(
    () => api.recentObservations(projectFilter || undefined, 50),
    [projectFilter]
  )

  function applyFilter() {
    if (filterInput) {
      setSearchParams({ project: filterInput })
    } else {
      setSearchParams({})
    }
  }

  function clearFilter() {
    setFilterInput("")
    setSearchParams({})
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="size-6" />
          Observations
        </h2>
        <p className="text-muted-foreground">All observations stored by your agents</p>
      </div>

      <SearchInput
        value={filterInput}
        onChange={setFilterInput}
        onSubmit={applyFilter}
        onClear={projectFilter ? clearFilter : undefined}
        placeholder="Filter by project..."
        submitLabel="Filter"
      />

      {projectFilter && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            project: {projectFilter}
          </Badge>
        </div>
      )}

      {observations.status === "loading" && (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      )}

      {observations.status === "error" && (
        <Card className="border-destructive/50">
          <CardContent className="pt-6 text-sm text-destructive">
            {observations.error}
          </CardContent>
        </Card>
      )}

      {observations.data && observations.data.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Brain className="size-10 mx-auto mb-3 opacity-30" />
          <p>No observations found</p>
        </div>
      )}

      {observations.data && observations.data.length > 0 && (
        <div className="space-y-3">
          {observations.data.map((obs) => (
            <ObservationCard key={obs.id} obs={obs} />
          ))}
        </div>
      )}
    </div>
  )
}

function ObservationCard({ obs }: { obs: Observation }) {
  const navigate = useNavigate()
  const preview = truncate(obs.content, 300)

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/observations/${obs.id}`)}
    >
      <CardContent className="py-4 space-y-2">
        <h3 className="text-sm font-semibold leading-snug">{obs.title}</h3>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            className="text-xs font-mono text-primary/70 hover:text-primary hover:underline transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/timeline?observation_id=${obs.id}`)
            }}
          >
            #{obs.id}
          </button>
          <Badge className={`text-xs ${typeColor(obs.type)}`}>
            {obs.type}
          </Badge>
          {obs.project && (
            <Badge variant="outline" className="text-xs">
              {obs.project}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground/60">
            {formatRelative(obs.created_at)}
          </span>
        </div>

        <div className="prose prose-sm max-w-none text-muted-foreground prose-headings:text-muted-foreground prose-headings:text-xs prose-headings:font-semibold prose-p:text-xs prose-p:leading-relaxed prose-p:my-0.5 prose-ul:text-xs prose-ol:text-xs prose-li:text-xs prose-li:my-0 prose-code:text-xs prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:text-xs prose-pre:bg-muted prose-pre:my-1 prose-strong:text-muted-foreground prose-a:text-primary/70 line-clamp-3 overflow-hidden">
          <Markdown remarkPlugins={[remarkGfm]}>{preview}</Markdown>
        </div>
      </CardContent>
    </Card>
  )
}
