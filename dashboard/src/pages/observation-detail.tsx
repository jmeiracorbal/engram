import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"
import { useAsync } from "@/hooks/use-async"
import { formatDate, typeColor } from "@/lib/format"
import { ArrowLeft, Clock, Hash, FolderOpen, Wrench, Layers, FileText, Code, Copy, Check } from "lucide-react"

type ContentView = "markdown" | "raw"

const MD_HINTS = /(?:^#{1,6}\s|^\s*[-*+]\s|^\s*\d+\.\s|```|^\s*>\s|\*\*|__|\[.*\]\(.*\)|^\|.*\|)/m

function looksLikeMarkdown(text: string): boolean {
  return MD_HINTS.test(text)
}

export function ObservationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const obs = useAsync(() => api.getObservation(Number(id)), [id])
  const [view, setView] = useState<ContentView>("markdown")
  const [copied, setCopied] = useState(false)

  function copyContent(content: string) {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (obs.status === "loading") {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    )
  }

  if (obs.status === "error") {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-4 mr-1" /> Back
        </Button>
        <Card className="border-destructive/50">
          <CardContent className="pt-6 text-sm text-destructive">{obs.error}</CardContent>
        </Card>
      </div>
    )
  }

  if (!obs.data) return null

  const o = obs.data

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h2 className="text-xl font-bold tracking-tight">{o.title}</h2>
          <p className="text-sm text-muted-foreground">Observation #{o.id}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <MetaRow icon={<Hash className="size-3.5" />} label="Type">
              <Badge className={typeColor(o.type)}>{o.type}</Badge>
            </MetaRow>
            <MetaRow icon={<Clock className="size-3.5" />} label="Created">
              {formatDate(o.created_at)}
            </MetaRow>
            {o.project && (
              <MetaRow icon={<FolderOpen className="size-3.5" />} label="Project">
                <Badge variant="outline">{o.project}</Badge>
              </MetaRow>
            )}
            {o.scope && (
              <MetaRow icon={<Layers className="size-3.5" />} label="Scope">
                {o.scope}
              </MetaRow>
            )}
            {o.tool_name && (
              <MetaRow icon={<Wrench className="size-3.5" />} label="Tool">
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{o.tool_name}</code>
              </MetaRow>
            )}
            <MetaRow icon={<Layers className="size-3.5" />} label="Session">
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{o.session_id}</code>
            </MetaRow>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/timeline?observation_id=${o.id}`)}
            >
              <Clock className="size-3.5 mr-1" />
              View Timeline
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Content</CardTitle>
          <div className="flex items-center gap-1">
            {looksLikeMarkdown(o.content) && (
              <>
                <Button
                  variant={view === "markdown" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 px-2.5 text-xs gap-1.5"
                  onClick={() => setView("markdown")}
                >
                  <FileText className="size-3.5" />
                  Markdown
                </Button>
                <Button
                  variant={view === "raw" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 px-2.5 text-xs gap-1.5"
                  onClick={() => setView("raw")}
                >
                  <Code className="size-3.5" />
                  Raw
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2.5 text-xs gap-1.5"
              onClick={() => copyContent(o.content)}
            >
              {copied ? (
                <><Check className="size-3.5 text-green-600" /> Copied</>
              ) : (
                <><Copy className="size-3.5" /> Copy</>
              )}
            </Button>
          </div>
        </CardHeader>
        <Separator />
        <ScrollArea className="max-h-[60vh]">
          <CardContent className="pt-4">
            {view === "markdown" && looksLikeMarkdown(o.content) ? (
              <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none prose-pre:bg-muted prose-pre:text-foreground prose-a:text-primary prose-li:text-foreground/90 prose-blockquote:border-primary/30 prose-table:text-sm prose-th:text-foreground prose-td:text-foreground/90">
                <Markdown remarkPlugins={[remarkGfm]}>{o.content}</Markdown>
              </div>
            ) : (
              <pre className="text-sm whitespace-pre-wrap wrap-break-word font-mono leading-relaxed bg-muted/30 rounded-md p-4">
                {o.content}
              </pre>
            )}
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  )
}

function MetaRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-muted-foreground min-w-[60px]">{label}</span>
      <span>{children}</span>
    </div>
  )
}
