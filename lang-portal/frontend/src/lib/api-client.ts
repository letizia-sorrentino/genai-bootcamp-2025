import { PaginatedResponse, SortDirection, Word, StudyActivity, StudySession, WordGroup } from "./types/api"

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new ApiError(
      response.status,
      error.message || 'An error occurred'
    )
  }
  return response.json()
}

interface FetchOptions {
  method?: string
  body?: any
  headers?: Record<string, string>
}

async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {} } = options

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include'
  })

  return handleResponse<T>(response)
}

interface PaginationParams {
  page?: number
  sortBy?: string
  sortDirection?: SortDirection
  activityId?: number
}

export const api = {
  // Dashboard
  getDashboard: () => 
    fetchApi<DashboardStats>('/dashboard'),
  
  // Words
  getWords: (params: PaginationParams) => 
    fetchApi<PaginatedResponse<Word>>('/words', { 
      body: params 
    }),
  getWord: (id: number) => 
    fetchApi<Word>(`/words/${id}`),

  // Study Activities
  getStudyActivities: () => 
    fetchApi<StudyActivity[]>('/study_activities'),
  getStudyActivity: (id: number) => 
    fetchApi<StudyActivity>(`/study_activities/${id}`),
  launchStudyActivity: (id: number, groupId: number) => 
    fetchApi<{ launchUrl: string }>(`/study_activities/${id}/launch`, {
      method: 'POST',
      body: { groupId }
    }),

  // Study Sessions
  getStudySessions: (params: PaginationParams) => 
    fetchApi<PaginatedResponse<StudySession>>('/study_sessions', {
      body: params
    }),
  getStudySession: (id: number) => 
    fetchApi<StudySession>(`/study_sessions/${id}`),

  // Settings
  resetHistory: () => 
    fetchApi('/reset_history', { method: 'POST' }),
  fullReset: () => 
    fetchApi('/full_reset', { method: 'POST' }),

  // Word Groups
  getWordGroups: (params: PaginationParams) => 
    fetchApi<PaginatedResponse<WordGroup>>('/word_groups', {
      body: params
    }),
  getWordGroup: (id: number) => 
    fetchApi<WordGroup>(`/word_groups/${id}`),
  getGroupWords: (groupId: number, params: PaginationParams) => 
    fetchApi<PaginatedResponse<Word>>(`/word_groups/${groupId}/words`, {
      body: params
    }),
  getGroupSessions: (groupId: number, params: PaginationParams) => 
    fetchApi<PaginatedResponse<StudySession>>(`/word_groups/${groupId}/sessions`, {
      body: params
    }),
} 