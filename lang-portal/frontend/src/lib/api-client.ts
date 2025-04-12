import { PaginatedResponse, SortDirection, Word, StudyActivity, StudySession, WordGroup, DashboardStats } from "./types/api"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      error.message || 'An error occurred'
    );
  }
  
  const responseText = await response.text();
  console.log('Raw API response:', responseText);
  
  let jsonResponse;
  try {
    jsonResponse = JSON.parse(responseText);
    console.log('Parsed API response:', jsonResponse);
  } catch (e) {
    console.error('Failed to parse API response as JSON:', e);
    throw new ApiError(500, 'Invalid JSON response from server');
  }

  // Handle the success response format
  if (jsonResponse && jsonResponse.success === true) {
    if (jsonResponse.items) {
      // For list responses, preserve original IDs and ensure stats are initialized
      const itemsWithStats = jsonResponse.items.map((item: any) => ({
        ...item,
        correct_count: item.correct_count || 0,
        wrong_count: item.wrong_count || 0
      }));
      
      return {
        data: itemsWithStats,
        pagination: jsonResponse.pagination
      } as unknown as T;
    } else if (jsonResponse.data) {
      // For single item responses, ensure stats are initialized
      const data = {
        ...jsonResponse.data,
        correct_count: jsonResponse.data.correct_count || 0,
        wrong_count: jsonResponse.data.wrong_count || 0
      };
      return data as T;
    }
  }

  // Return the response as is if no special handling needed
  return jsonResponse as T;
}

interface FetchOptions {
  method?: string
  body?: any
  queryParams?: Record<string, any>
  headers?: Record<string, string>
}

// Helper function to convert an object to URL query parameters
function objectToQueryParams(obj: Record<string, any>): string {
  const params = new URLSearchParams();
  
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      // Convert camelCase to snake_case (e.g., sortBy -> sort_by)
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      params.append(snakeKey, String(value));
    }
  });
  
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { method = 'GET', body, queryParams, headers = {} } = options

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers
  }

  // For GET requests, append query parameters to the URL
  let url = `${API_BASE_URL}${endpoint}`;
  if (method === 'GET' && queryParams) {
    url += objectToQueryParams(queryParams);
  }

  console.log(`Fetching ${url} with method ${method}`);
  
  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      // Only include body for non-GET requests
      body: method !== 'GET' && body ? JSON.stringify(body) : undefined,
      credentials: 'include',
      // Add mode: 'cors' explicitly
      mode: 'cors'
    });
    
    return handleResponse<T>(response);
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    
    // Check if it's a CORS error
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('This might be a CORS error. Check that the backend CORS configuration allows requests from this origin.');
      
      // You can add custom handling for CORS errors here
      // For example, return a mock response for development
      if (import.meta.env.DEV) {
        console.warn('Returning mock data in development mode due to CORS error');
        return { error: 'CORS error - backend server might be down or misconfigured' } as unknown as T;
      }
    }
    
    throw error;
  }
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
  getWords: (params: PaginationParams = {}) => 
    fetchApi<PaginatedResponse<Word>>('/words', { 
      queryParams: params
    }),
  getWord: (id: number) => 
    fetchApi<Word>(`/words/${id}`),

  // Study Activities
  getStudyActivities: () => {
    // Define our static list of study activities
    const activities: StudyActivity[] = [
      {
        id: "word-quiz",
        title: 'Word Quiz',
        description: 'Test your vocabulary by translating words from English to Italian',
        thumbnail: '🎯',
        launchUrl: '/word_quiz'
      }
    ];

    // Return the activities directly without making an API call
    return Promise.resolve(activities);
  },
  getStudyActivity: (id: number | string) => {
    // Return the Word Quiz activity if ID matches
    if (id === "word-quiz" || id === 1) {
      return Promise.resolve({
        id: "word-quiz",
        title: 'Word Quiz',
        description: 'Test your vocabulary by translating words from English to Italian',
        thumbnail: '🎯',
        launchUrl: '/word_quiz',
        stats: {
          totalAttempts: 0,
          correctAnswers: 0,
          averageScore: 0
        }
      } as StudyActivity);
    }
    return Promise.reject(new ApiError(404, 'Activity not found'));
  },
  launchStudyActivity: (id: number, groupId: number) => 
    fetchApi<{ launchUrl: string }>(`/study_activities/${id}/launch`, {
      method: 'POST',
      body: { groupId }
    }),

  // Study Sessions
  getStudySessions: (params: PaginationParams = {}) => {
    // For now, return empty sessions list
    return Promise.resolve({
      data: [],
      pagination: {
        current_page: 1,
        total_pages: 0,
        total_items: 0,
        items_per_page: 50
      }
    });
  },
  getStudySession: (id: number) => 
    fetchApi<StudySession>(`/study_sessions/${id}`),

  // Settings
  resetHistory: () => 
    fetchApi('/reset_history', { method: 'POST' }),
  fullReset: () => 
    fetchApi('/full_reset', { method: 'POST' }),

  // Word Groups
  getWordGroups: (params: PaginationParams = {}) => 
    fetchApi<PaginatedResponse<WordGroup>>('/groups', {
      queryParams: params
    }).then(response => {
      // Add logging for date fields
      if (response && response.data) {
        console.log('Raw word groups response:', response);
        // Check date fields
        response.data.forEach(group => {
          console.log(`Group ${group.id} (${group.name}) dates:`, {
            createdAt: group.createdAt,
            lastStudied: group.lastStudied
          });
        });
      }
      return response;
    }),
  getWordGroup: (id: number) => 
    fetchApi<WordGroup>(`/groups/${id}`),
  getGroupWords: (groupId: number, params: PaginationParams = {}) => 
    fetchApi<PaginatedResponse<Word>>(`/groups/${groupId}/words`, {
      queryParams: params
    }),
  getGroupSessions: (groupId: number, params: PaginationParams = {}) => 
    fetchApi<PaginatedResponse<StudySession>>(`/groups/${groupId}/study_sessions`, {
      queryParams: params
    }),

  // Word Statistics
  updateWordStats: (wordId: number, isCorrect: boolean) =>
    fetchApi<void>(`/words/${wordId}/stats`, {
      method: 'POST',
      body: { is_correct: isCorrect }
    }).then(response => {
      console.log('Stats update response:', response);
      return response;
    }).catch(error => {
      console.error('Error updating stats:', error);
      throw error;
    }),
} 