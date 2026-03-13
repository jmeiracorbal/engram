import { useState, useEffect, useMemo } from "react"
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
import { Brain, X } from "lucide-react"
import type { Observation, SearchResult } from "@/lib/types"

type ObservationItem = {
  id: number
  type: string
  title: string
  content: string
  project: string | null
  created_at: string
}

function toItem(obs: Observation): ObservationItem {
  return { id: obs.id, type: obs.type, title: obs.title, content: obs.content, project: obs.project, created_at: obs.created_at }
}

function searchToItem(r: SearchResult): ObservationItem {
  return { id: r.id, type: r.type, title: r.title, content: r.content, project: r.project, created_at: r.created_at }
}

export function ObservationsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const projectFilter = searchParams.get("project") ?? ""

  const [query, setQuery] = useState("")
  const [searchResults, setSearchResults] = useState<ObservationItem[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const allObservations = useAsync(
    () => api.recentObservations(projectFilter || undefined, 100),
    [projectFilter]
  )

  const isSearchActive = query.trim().length > 0 && searchResults !== null

  const items = useMemo(() => {
    if (isSearchActive) {
      return projectFilter
        ? searchResults.filter((o) => o.project === projectFilter)
        : searchResults
    }
    return allObservations.data?.map(toItem) ?? []
  }, [isSearchActive, searchResults, allObservations.data, projectFilter])

  const isLoading = searching || allObservations.status === "loading"
  const error = searchError ?? allObservations.error

  async function handleSearch() {
    if (!query.trim()) {
      setSearchResults(null)
      return
    }
    setSearching(true)
    setSearchError(null)
    try {
      const data = await api.search(query, {
        limit: 50,
        project: projectFilter || undefined,
      })
      setSearchResults(data.map(searchToItem))
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Search failed")
    } finally {
      setSearching(false)
    }
  }

  function clearSearch() {
    setQuery("")
    setSearchResults(null)
    setSearchError(null)
  }

  function clearProjectFilter() {
    const next = new URLSearchParams(searchParams)
    next.delete("project")
    setSearchParams(next)
  }

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults(null)
    }
  }, [query])

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
        value={query}
        onChange={setQuery}
        onSubmit={handleSearch}
        onClear={query ? clearSearch : undefined}
        placeholder="Search for decisions, patterns, bugs..."
        submitLabel="Search"
        loading={searching}
        autoFocus
      />

      {projectFilter && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1 pr-1">
            project: {projectFilter}
            <button
              onClick={clearProjectFilter}
              className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
            >
              <X className="size-3" />
            </button>
          </Badge>
        </div>
      )}

      {isSearchActive && (
        <p className="text-sm text-muted-foreground">
          {items.length} result{items.length !== 1 && "s"} for "{query}"
          {projectFilter && ` in ${projectFilter}`}
        </p>
      )}

      {error && (
        <Card className="border-destructive/50">
          <CardContent className="pt-6 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Brain className="size-10 mx-auto mb-3 opacity-30" />
          {isSearchActive ? (
            <>
              <p>No results for "{query}"</p>
              <p className="text-xs mt-1">Try different keywords or a broader query</p>
            </>
          ) : (
            <p>No observations yet</p>
          )}
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <div className="space-y-3">
          {items.map((item) => (
            <ObservationCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}

function ObservationCard({ item }: { item: ObservationItem }) {
  const navigate = useNavigate()
  const preview = truncate(item.content, 300)

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/observations/${item.id}`)}
    >
      <CardContent className="py-4 space-y-2">
        <h3 className="text-sm font-semibold leading-snug">{item.title}</h3>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            className="text-xs font-mono text-primary/70 hover:text-primary hover:underline transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/timeline?observation_id=${item.id}`)
            }}
          >
            #{item.id}
          </button>
          <Badge className={`text-xs ${typeColor(item.type)}`}>
            {item.type}
          </Badge>
          {item.project && (
            <Badge variant="outline" className="text-xs">
              {item.project}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground/60">
            {formatRelative(item.created_at)}
          </span>
        </div>

        <div className="prose prose-sm max-w-none text-muted-foreground prose-headings:text-muted-foreground prose-headings:text-xs prose-headings:font-semibold prose-p:text-xs prose-p:leading-relaxed prose-p:my-0.5 prose-ul:text-xs prose-ol:text-xs prose-li:text-xs prose-li:my-0 prose-code:text-xs prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:text-xs prose-pre:bg-muted prose-pre:my-1 prose-strong:text-muted-foreground prose-a:text-primary/70 line-clamp-3 overflow-hidden">
          <Markdown remarkPlugins={[remarkGfm]}>{preview}</Markdown>
        </div>
      </CardContent>
    </Card>
  )
}
