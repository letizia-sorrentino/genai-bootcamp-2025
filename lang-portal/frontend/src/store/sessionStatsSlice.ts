import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SessionStats {
  totalAttempts: number;  // This counts completed quizzes
  correctAnswers: number;
  averageScore: number;
  recentSessions: Array<{
    date: string;
    score: number;
    total: number;
    groupId?: number;
  }>;
}

// Load initial state from localStorage
const loadState = (): SessionStats => {
  try {
    const serializedState = localStorage.getItem('quizSessionStats');
    console.log('Loading stats from localStorage:', serializedState);
    if (serializedState === null) {
      return {
        totalAttempts: 0,
        correctAnswers: 0,
        averageScore: 0,
        recentSessions: []
      };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Error loading session stats from localStorage:', err);
    return {
      totalAttempts: 0,
      correctAnswers: 0,
      averageScore: 0,
      recentSessions: []
    };
  }
};

// Save state to localStorage
const saveState = (state: SessionStats) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('quizSessionStats', serializedState);
    console.log('Saved stats to localStorage:', state);
  } catch (err) {
    console.error('Error saving session stats to localStorage:', err);
  }
};

const initialState: SessionStats = loadState();

export const sessionStatsSlice = createSlice({
  name: 'sessionStats',
  initialState,
  reducers: {
    updateSessionStats: (state, action: PayloadAction<{ isCorrect: boolean }>) => {
      const { isCorrect } = action.payload;
      if (isCorrect) {
        state.correctAnswers += 1;
      }
      // We calculate average score based on total questions answered in all quizzes
      if (state.totalAttempts > 0) {
        state.averageScore = (state.correctAnswers / (state.totalAttempts * 10)) * 100;
      }
      saveState(state);
      console.log('Updated session stats:', state);
    },
    completeSession: (state, action: PayloadAction<{ correct: number; total: number; groupId?: number }>) => {
      const { correct, total, groupId } = action.payload;
      const score = (correct / total) * 100;
      
      // Increment total attempts only when a quiz is completed
      state.totalAttempts += 1;
      state.averageScore = (state.correctAnswers / (state.totalAttempts * 10)) * 100;

      state.recentSessions.unshift({
        date: new Date().toISOString(),
        score,
        total,
        groupId
      });

      // Keep only the last 5 sessions
      if (state.recentSessions.length > 5) {
        state.recentSessions.pop();
      }
      
      saveState(state);
      console.log('Completed session, updated stats:', state);
    },
    resetSessionStats: (state) => {
      state.totalAttempts = 0;
      state.correctAnswers = 0;
      state.averageScore = 0;
      state.recentSessions = [];
      saveState(state);
      console.log('Reset session stats:', state);
    },
    clearAllStats: (state) => {
      state.totalAttempts = 0;
      state.correctAnswers = 0;
      state.averageScore = 0;
      state.recentSessions = [];
      saveState(state);
      console.log('Cleared all stats');
    }
  }
});

export const { updateSessionStats, completeSession, resetSessionStats, clearAllStats } = sessionStatsSlice.actions;
export default sessionStatsSlice.reducer; 