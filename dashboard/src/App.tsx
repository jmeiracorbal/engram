import { BrowserRouter, Routes, Route } from "react-router-dom"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ConnectionGuard } from "@/components/connection-guard"
import { AppLayout } from "@/components/layout/app-layout"
import { DashboardPage } from "@/pages/dashboard"
import { ObservationDetailPage } from "@/pages/observation-detail"
import { SessionsPage } from "@/pages/sessions"
import { SessionDetailPage } from "@/pages/session-detail"
import { ObservationsPage } from "@/pages/search"
import { TimelinePage } from "@/pages/timeline"
import { ProjectsPage } from "@/pages/projects"
import { NotFoundPage } from "@/pages/not-found"

export default function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <ConnectionGuard>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="*" element={<NotFoundPage />} />
              <Route index element={<DashboardPage />} />
              <Route path="observations" element={<ObservationsPage />} />
              <Route path="observations/:id" element={<ObservationDetailPage />} />
              <Route path="sessions" element={<SessionsPage />} />
              <Route path="sessions/:id" element={<SessionDetailPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="timeline" element={<TimelinePage />} />
            </Route>
          </Routes>
        </ConnectionGuard>
      </TooltipProvider>
    </BrowserRouter>
  )
}
