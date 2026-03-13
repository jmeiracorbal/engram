import { useHealth } from "@/hooks/use-health"
import { Loader2, WifiOff, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ConnectionGuard({ children }: { children: React.ReactNode }) {
  const { status, retry } = useHealth()

  if (status === "checking") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="size-8 mx-auto animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Connecting to engram server...</p>
        </div>
      </div>
    )
  }

  if (status === "disconnected") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-5 max-w-md px-6">
          <div
            className="flex items-center justify-center size-16 mx-auto rounded-2xl"
            style={{ backgroundColor: "color-mix(in srgb, var(--engram-red) 15%, transparent)" }}
          >
            <WifiOff className="size-8" style={{ color: "var(--engram-red)" }} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Unable to connect to engram</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The dashboard requires the engram server running on port <code className="bg-muted px-1.5 py-0.5 rounded text-xs">7437</code>. Start it with:
            </p>
            <pre className="bg-muted rounded-lg px-4 py-3 text-sm font-mono text-left">
              engram serve
            </pre>
          </div>
          <div className="space-y-2">
            <Button onClick={retry} variant="outline" className="gap-2">
              <RefreshCw className="size-4" />
              Retry connection
            </Button>
            <p className="text-xs text-muted-foreground/60">
              Retrying automatically every 5 seconds...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
