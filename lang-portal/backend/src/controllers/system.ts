import { Request, Response, NextFunction } from 'express'
import { getDb } from '../db/database'
import { successResponse } from '../utils/responseHelper'
import { logger } from '../utils/logger'
import { seedDatabase } from '../db/seeds'

export const systemController = {
  // Reset study history
  resetHistory: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const db = await getDb()
      
      // Delete all study sessions and word review items
      await db.run('DELETE FROM word_review_items')
      await db.run('DELETE FROM study_sessions')
      
      logger.info('Study history has been reset')
      
      successResponse(res, null, 'Study history has been reset')
    } catch (error) {
      next(error)
    }
  },
  
  // Perform a full system reset
  fullReset: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const db = await getDb()
      
      // Delete all data from all tables
      await db.run('DELETE FROM word_review_items')
      await db.run('DELETE FROM study_sessions')
      await db.run('DELETE FROM word_groups')
      await db.run('DELETE FROM words')
      await db.run('DELETE FROM groups')
      await db.run('DELETE FROM study_activities')
      await db.run('DELETE FROM user_preferences')
      
      // Reset auto-increment counters
      await db.run('DELETE FROM sqlite_sequence')
      
      // Re-seed the database
      await seedDatabase()
      
      logger.info('System has been fully reset')
      
      successResponse(res, null, 'System has been fully reset')
    } catch (error) {
      next(error)
    }
  }
} 