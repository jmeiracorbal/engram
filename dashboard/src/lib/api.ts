import type { Stats, Observation, Session, Timeline, SearchResult, Prompt } from "./types"

const BASE = import.meta.env.DEV ? "/api" : ""

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(body.error ?? `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  health: () => fetchJSON<{ status: string }>("/health"),

  stats: () => fetchJSON<Stats>("/stats"),

  recentObservations: (project?: string, limit = 50) => {
    const params = new URLSearchParams()
    if (project) params.set("project", project)
    params.set("limit", String(limit))
    return fetchJSON<Observation[]>(`/observations/recent?${params}`)
  },

  getObservation: (id: number) =>
    fetchJSON<Observation>(`/observations/${id}`),

  search: (q: string, opts?: { type?: string; project?: string; limit?: number }) => {
    const params = new URLSearchParams({ q })
    if (opts?.type) params.set("type", opts.type)
    if (opts?.project) params.set("project", opts.project)
    if (opts?.limit) params.set("limit", String(opts.limit))
    return fetchJSON<SearchResult[]>(`/search?${params}`)
  },

  recentSessions: (project?: string, limit = 20) => {
    const params = new URLSearchParams()
    if (project) params.set("project", project)
    params.set("limit", String(limit))
    return fetchJSON<Session[]>(`/sessions/recent?${params}`)
  },

  timeline: (observationId: number, before = 30, after = 30) =>
    fetchJSON<Timeline>(
      `/timeline?observation_id=${observationId}&before=${before}&after=${after}`
    ),

  context: (project?: string) => {
    const params = new URLSearchParams()
    if (project) params.set("project", project)
    return fetchJSON<{ context: string }>(`/context?${params}`)
  },

  recentPrompts: (project?: string, limit = 20) => {
    const params = new URLSearchParams()
    if (project) params.set("project", project)
    params.set("limit", String(limit))
    return fetchJSON<Prompt[]>(`/prompts/recent?${params}`)
  },

  searchPrompts: (q: string, project?: string, limit = 10) => {
    const params = new URLSearchParams({ q })
    if (project) params.set("project", project)
    if (limit) params.set("limit", String(limit))
    return fetchJSON<Prompt[]>(`/prompts/search?${params}`)
  },
}
