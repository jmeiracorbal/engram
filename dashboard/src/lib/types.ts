export interface Stats {
  total_sessions: number
  total_observations: number
  total_prompts: number
  projects: string[]
}

export interface Observation {
  id: number
  session_id: string
  type: string
  title: string
  content: string
  tool_name: string | null
  project: string | null
  scope: string | null
  topic_key: string | null
  created_at: string
}

export interface Session {
  id: string
  project: string
  directory: string
  started_at: string
  ended_at: string | null
  summary: string | null
  observation_count: number
}

export interface TimelineEntry {
  id: number
  type: string
  title: string
  content: string
  created_at: string
}

export interface Timeline {
  focus: TimelineEntry
  before: TimelineEntry[] | null
  after: TimelineEntry[] | null
  session_info: {
    id: string
    project: string
    started_at: string
  } | null
  total_in_range: number
}

export interface SearchResult {
  id: number
  type: string
  title: string
  content: string
  project: string | null
  created_at: string
  rank: number
}

export interface Prompt {
  id: number
  session_id: string
  content: string
  project: string | null
  created_at: string
}
