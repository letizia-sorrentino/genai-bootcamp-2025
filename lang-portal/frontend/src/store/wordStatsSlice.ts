import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '@/lib/api-client'
import type { Word } from '@/lib/types/api'

interface WordStats {
  id: number
  correct_count: number
  wrong_count: number
}

interface WordStatsState {
  stats: Record<number, WordStats>
  loading: boolean
  error: string | null
}

// Load initial state from localStorage
const loadState = (): WordStatsState => {
  try {
    const serializedState = localStorage.getItem('wordStats');
    console.log('Loading word stats from localStorage:', serializedState);
    if (serializedState === null) {
      return {
        stats: {},
        loading: false,
        error: null
      };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Error loading word stats from localStorage:', err);
    return {
      stats: {},
      loading: false,
      error: null
    };
  }
};

// Save state to localStorage
const saveState = (state: WordStatsState) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('wordStats', serializedState);
    console.log('Saved word stats to localStorage:', state);
  } catch (err) {
    console.error('Error saving word stats to localStorage:', err);
  }
};

const initialState: WordStatsState = loadState();

export const updateWordStats = createAsyncThunk(
  'wordStats/update',
  async ({ wordId, isCorrect }: { wordId: number; isCorrect: boolean }, { getState }) => {
    // For now, just return the optimistic update
    const state = getState() as { wordStats: WordStatsState };
    const currentStats = state.wordStats.stats[wordId] || { id: wordId, correct_count: 0, wrong_count: 0 };
    
    const newStats = {
      id: wordId,
      correct_count: isCorrect ? currentStats.correct_count + 1 : currentStats.correct_count,
      wrong_count: isCorrect ? currentStats.wrong_count : currentStats.wrong_count + 1
    };

    console.log('Updating stats for word', wordId, 'from', currentStats, 'to', newStats);
    return newStats;
  }
)

export const wordStatsSlice = createSlice({
  name: 'wordStats',
  initialState,
  reducers: {
    setWordStats: (state, action) => {
      const word = action.payload as Word
      state.stats[word.id] = {
        id: word.id,
        correct_count: word.correct_count || 0,
        wrong_count: word.wrong_count || 0
      }
      saveState(state);
    },
    setMultipleWordStats: (state, action) => {
      const words = action.payload as Word[]
      words.forEach(word => {
        state.stats[word.id] = {
          id: word.id,
          correct_count: word.correct_count || 0,
          wrong_count: word.wrong_count || 0
        }
      })
      saveState(state);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateWordStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWordStats.fulfilled, (state, action) => {
        state.loading = false;
        // Update with the returned stats
        const newStats = action.payload;
        state.stats[newStats.id] = newStats;
        saveState(state);
        console.log('Updated stats:', newStats);
      })
      .addCase(updateWordStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update word stats';
        console.error('Failed to update word stats:', action.error);
      });
  }
})

export const { setWordStats, setMultipleWordStats } = wordStatsSlice.actions
export default wordStatsSlice.reducer 