import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export function NotFoundPage() {
  const location = useLocation()

  return (
    <div className="flex h-full items-center justify-center">
      <div className="max-w-md space-y-4 text-center">
        <div className="inline-flex items-center justify-center rounded-full bg-destructive/10 p-3 text-destructive mb-1">
          <AlertTriangle className="size-5" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">Page not found</h2>
        <p className="text-sm text-muted-foreground">
          The path <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{location.pathname}</code> does not exist in this dashboard.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <Button size="sm">
            <Link to="/">Back to dashboard</Link>
          </Button>
          <Button variant="outline" size="sm">
            <Link to="/observations">Go to observations</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
