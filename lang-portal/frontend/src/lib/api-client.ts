import { PaginatedResponse, SortDirection, Word, StudyActivity, StudySession, WordGroup, DashboardStats } from "./types/api"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

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
  
  // First get the raw text to log and debug
  const responseText = await response.text();
  console.log('Raw API response:', responseText);
  
  // Try to parse as JSON
  let jsonResponse;
  try {
    jsonResponse = JSON.parse(responseText);
    console.log('Parsed API response:', jsonResponse);
  } catch (e) {
    console.error('Failed to parse API response as JSON:', e);
    throw new ApiError(500, 'Invalid JSON response from server');
  }
  
  // Handle the backend response format which might be:
  // { success: true, message: "Success", items: [...] }
  // or { success: true, message: "Success", data: {...} }
  
  // If the response has a success property and items or data, extract it
  if (jsonResponse && jsonResponse.success === true) {
    console.log('Received successful response with success flag');
    
    // Return items array if it exists
    if (Array.isArray(jsonResponse.items)) {
      console.log('Returning items array from response');
      return {
        data: jsonResponse.items,
        pagination: jsonResponse.pagination || {
          current_page: 1,
          total_pages: 1,
          total_items: jsonResponse.items.length
        }
      } as unknown as T;
    }
    
    // Return data object if it exists
    if (jsonResponse.data) {
      console.log('Returning data object from response');
      return jsonResponse.data as T;
    }
  }
  
  // If response is an array, wrap it
  if (Array.isArray(jsonResponse)) {
    console.log('Returning array response');
    return {
      data: jsonResponse,
      pagination: {
        current_page: 1,
        total_pages: 1,
        total_items: jsonResponse.length
      }
    } as unknown as T;
  }
  
  // If no special handling needed, return the response as is
  console.log('Returning response as is');
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
  getStudyActivities: () => 
    fetchApi<any>('/study_activities').then((response: any) => {
      // If response is already an array, return it
      if (Array.isArray(response)) {
        return response as StudyActivity[];
      }
      
      // If response has data property that is an array, return it
      if (response && Array.isArray(response.data)) {
        return response.data as StudyActivity[];
      }
      
      // Map the backend response format to the frontend expected format
      if (response && response.items && Array.isArray(response.items)) {
        return response.items.map((item: any) => ({
          id: item.id,
          title: item.name || '',
          thumbnail: item.thumbnail || '',
          description: item.description || '',
          launchUrl: item.url || ''
        }));
      }
      
      console.error('Unexpected response format for study activities:', response);
      return [] as StudyActivity[];
    }),
  getStudyActivity: (id: number) => 
    fetchApi<StudyActivity>(`/study_activities/${id}`),
  launchStudyActivity: (id: number, groupId: number) => 
    fetchApi<{ launchUrl: string }>(`/study_activities/${id}/launch`, {
      method: 'POST',
      body: { groupId }
    }),

  // Study Sessions
  getStudySessions: (params: PaginationParams = {}) => 
    fetchApi<PaginatedResponse<StudySession>>('/study_sessions', {
      queryParams: params
    }),
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
} 