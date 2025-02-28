// Common Types
export type SortDirection = 'asc' | 'desc'

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
}

// Dashboard Types
export interface LastStudySession {
  activityName: string
  lastAccessed: string
  correctCount: number
  incorrectCount: number
  groupId: number
  groupName: string
}

export interface StudyProgress {
  wordsStudied: number
  totalWords: number
  masteryPercentage: number
}

export interface QuickStats {
  successRate: number
  totalSessions: number
  activeGroups: number
  studyStreak: number
}

export interface DashboardStats {
  totalWords: number
  totalGroups: number
  studySessionsCount: number
  correctAnswersCount: number
  wrongAnswersCount: number
  lastWeekActivity: DailyActivity[]
}

export interface DailyActivity {
  date: string
  sessionsCount: number
  correctCount: number
  wrongCount: number
}

// Word Types
export interface Word {
  id: number
  italian: string
  english: string
  audioUrl: string
  correctCount: number
  wrongCount: number
}

// Study Activity Types
export interface StudyActivity {
  id: number
  title: string
  thumbnail: string
  description: string
  launchUrl: string
}

// Study Session Types
export interface StudySession {
  id: number
  activityName: string
  groupName: string
  startTime: string
  endTime: string
  reviewItemCount: number
  correctCount: number
  incorrectCount: number
}

// Word Group Types
export interface WordGroup {
  id: number
  name: string
  description: string
  wordCount: number
  lastStudied: string | null
  createdAt: string
} 