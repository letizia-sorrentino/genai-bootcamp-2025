import { Request, Response, NextFunction } from 'express'
import { getDb } from '../db/database'
import { successResponse } from '../utils/responseHelper'
import { logger } from '../utils/logger'

export const userPreferencesController = {
  // Get user preferences
  get: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const db = await getDb()
      
      // Get user preferences (always use ID 1 since this is a single-user app)
      const preferences = await db.get(`
        SELECT theme, notifications_enabled, daily_goal
        FROM user_preferences
        WHERE id = 1
      `)
      
      // If no preferences exist, create default preferences
      if (!preferences) {
        await db.run(`
          INSERT INTO user_preferences (theme, notifications_enabled, daily_goal)
          VALUES ('light', 1, 10)
        `)
        
        const newPreferences = await db.get(`
          SELECT theme, notifications_enabled, daily_goal
          FROM user_preferences
          WHERE id = 1
        `)
        
        logger.debug('Created default user preferences')
        successResponse(res, newPreferences)
        return
      }
      
      logger.debug('Retrieved user preferences')
      successResponse(res, preferences)
    } catch (error) {
      next(error)
    }
  },
  
  // Update user preferences
  update: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const db = await getDb()
      const { theme, notifications_enabled, daily_goal } = req.body
      
      // Validate input
      if (theme && !['light', 'dark'].includes(theme)) {
        throw new Error('Theme must be either "light" or "dark"')
      }
      
      if (notifications_enabled !== undefined && typeof notifications_enabled !== 'boolean') {
        throw new Error('notifications_enabled must be a boolean')
      }
      
      if (daily_goal !== undefined && (typeof daily_goal !== 'number' || daily_goal < 1 || daily_goal > 100)) {
        throw new Error('daily_goal must be a number between 1 and 100')
      }
      
      // Check if preferences exist
      const existingPreferences = await db.get('SELECT id FROM user_preferences WHERE id = 1')
      
      if (!existingPreferences) {
        // Create preferences if they don't exist
        await db.run(`
          INSERT INTO user_preferences (
            id, 
            theme, 
            notifications_enabled, 
            daily_goal, 
            updated_at
          )
          VALUES (
            1, 
            ?, 
            ?, 
            ?, 
            datetime('now')
          )
        `, [
          theme || 'light',
          notifications_enabled === undefined ? 1 : (notifications_enabled ? 1 : 0),
          daily_goal || 10
        ])
      } else {
        // Update existing preferences
        const updates = []
        const params = []
        
        if (theme !== undefined) {
          updates.push('theme = ?')
          params.push(theme)
        }
        
        if (notifications_enabled !== undefined) {
          updates.push('notifications_enabled = ?')
          params.push(notifications_enabled ? 1 : 0)
        }
        
        if (daily_goal !== undefined) {
          updates.push('daily_goal = ?')
          params.push(daily_goal)
        }
        
        if (updates.length > 0) {
          updates.push('updated_at = datetime("now")')
          
          await db.run(`
            UPDATE user_preferences
            SET ${updates.join(', ')}
            WHERE id = 1
          `, params)
        }
      }
      
      // Get updated preferences
      const updatedPreferences = await db.get(`
        SELECT theme, notifications_enabled, daily_goal
        FROM user_preferences
        WHERE id = 1
      `)
      
      logger.debug('Updated user preferences')
      successResponse(res, updatedPreferences)
    } catch (error) {
      next(error)
    }
  }
} 