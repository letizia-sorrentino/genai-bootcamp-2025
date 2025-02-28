import { useState, useCallback } from 'react'
import { ApiError } from '../api-client'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null
  })

  const request = useCallback(async (
    apiCall: () => Promise<T>
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const data = await apiCall()
      setState({ data, loading: false, error: null })
      return data
    } catch (err) {
      const error = err instanceof ApiError 
        ? err.message 
        : 'An unexpected error occurred'
      setState(prev => ({ ...prev, loading: false, error }))
      throw err
    }
  }, [])

  return {
    ...state,
    request
  }
} 