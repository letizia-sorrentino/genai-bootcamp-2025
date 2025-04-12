// Common Types
export type SortDirection = 'asc' | 'desc'

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    current_page: number
    total_pages: number
    total_items: number
    items_per_page: number
  }
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
  correct_count: number
  wrong_count: number
  audio_url?: string
}

// Study Activity Types
export interface StudyActivity {
  id: number | string
  title: string
  description: string
  thumbnail: string
  launchUrl: string
  stats?: {
    totalAttempts: number
    correctAnswers: number
    averageScore: number
  }
}

// Study Session Types
export interface StudySession {
  id: number
  activity_name: string
  group_id: number
  group_name: string
  start_time: string
  end_time?: string
  review_items_count: number
}

// Word Group Types
export interface WordGroup {
  id: number
  name: string
  description: string
  createdAt: string
  lastStudied?: string
  wordCount: number
} 