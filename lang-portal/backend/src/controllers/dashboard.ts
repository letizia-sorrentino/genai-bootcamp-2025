import { Request, Response, NextFunction } from 'express'
import { getDb } from '../db/database'
import { successResponse } from '../utils/responseHelper'
import { logger } from '../utils/logger'

export const dashboardController = {
  // Get last study session
  getLastStudySession: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const db = await getDb()
      
      const lastSession = await db.get(`
        SELECT 
          ss.id,
          ss.group_id,
          ss.created_at,
          ss.study_activity_id,
          g.name as group_name
        FROM study_sessions ss
        JOIN groups g ON ss.group_id = g.id
        ORDER BY ss.created_at DESC
        LIMIT 1
      `)
      
      logger.debug('Retrieved last study session')
      
      if (!lastSession) {
        successResponse(res, null)
        return
      }
      
      successResponse(res, lastSession)
    } catch (error) {
      next(error)
    }
  },
  
  // Get study progress
  getStudyProgress: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const db = await getDb()
      
      // Get total words studied (words with at least one review)
      const wordsStudied = await db.get(`
        SELECT COUNT(DISTINCT word_id) as total_words_studied
        FROM word_review_items
      `)
      
      // Get total available words
      const totalWords = await db.get(`
        SELECT COUNT(*) as total_available_words
        FROM words
      `)
      
      logger.debug('Retrieved study progress')
      
      successResponse(res, {
        total_words_studied: wordsStudied?.total_words_studied || 0,
        total_available_words: totalWords?.total_available_words || 0
      })
    } catch (error) {
      next(error)
    }
  },
  
  // Get quick stats
  getQuickStats: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const db = await getDb()
      
      // Get success rate
      const reviewStats = await db.get(`
        SELECT 
          COUNT(*) as total_reviews,
          SUM(CASE WHEN correct = 1 THEN 1 ELSE 0 END) as correct_reviews
        FROM word_review_items
      `)
      
      const successRate = reviewStats.total_reviews > 0
        ? (reviewStats.correct_reviews / reviewStats.total_reviews) * 100
        : 0
      
      // Get total study sessions
      const sessionCount = await db.get(`
        SELECT COUNT(*) as total_study_sessions
        FROM study_sessions
      `)
      
      // Get total active groups (groups with at least one word)
      const activeGroups = await db.get(`
        SELECT COUNT(*) as total_active_groups
        FROM groups
        WHERE words_count > 0
      `)
      
      // Calculate study streak (simplified - just return 3 for now)
      // In a real implementation, this would analyze study session dates
      const studyStreak = 3
      
      logger.debug('Retrieved quick stats')
      
      successResponse(res, {
        success_rate: parseFloat(successRate.toFixed(1)),
        total_study_sessions: sessionCount?.total_study_sessions || 0,
        total_active_groups: activeGroups?.total_active_groups || 0,
        study_streak_days: studyStreak
      })
    } catch (error) {
      next(error)
    }
  }
} 