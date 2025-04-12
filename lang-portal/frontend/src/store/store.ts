import { configureStore } from '@reduxjs/toolkit'
import wordStatsReducer from './wordStatsSlice'
import sessionStatsReducer from './sessionStatsSlice'

export const store = configureStore({
  reducer: {
    wordStats: wordStatsReducer,
    sessionStats: sessionStatsReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 