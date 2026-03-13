import { NavLink, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { LayoutDashboard, Brain, FolderClock, FolderOpen } from "lucide-react"

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/projects", icon: FolderOpen, label: "Projects" },
  { to: "/observations", icon: Brain, label: "Observations" },
  { to: "/sessions", icon: FolderClock, label: "Sessions" },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar>
      <SidebarHeader className="p-0">
        <div
          className="flex items-center justify-center px-4 py-3.5"
          style={{
            background: "linear-gradient(135deg, oklch(0.35 0.12 300) 0%, oklch(0.45 0.10 280) 50%, oklch(0.50 0.08 200) 100%)",
          }}
        >
          <span className="flex items-baseline gap-1.5">
            <span
              className="text-sm font-bold tracking-widest uppercase text-white"
              style={{ textShadow: "0 1px 6px rgba(196,167,231,0.4)" }}
            >
              engram
            </span>
            <span className="text-xs font-light tracking-wide text-white/60">
              dashboard
            </span>
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.to === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(item.to)
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      isActive={isActive}
                      render={<NavLink to={item.to} />}
                    >
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}
