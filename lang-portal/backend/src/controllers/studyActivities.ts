import { Request, Response, NextFunction } from 'express'
import { getDb } from '../db/database'
import { paginatedResponse, successResponse } from '../utils/responseHelper'
import { NotFoundError } from '../utils/errorHandler'
import { logger } from '../utils/logger'

export const studyActivitiesController = {
  // Get all study activities
  getAll: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const db = await getDb()
      const page = parseInt(req.query.page as string) || 1
      const itemsPerPage = parseInt(req.query.limit as string) || 50
      const offset = (page - 1) * itemsPerPage
      
      // Get total count
      const countResult = await db.get('SELECT COUNT(*) as total FROM study_activities')
      const totalItems = countResult.total
      const totalPages = Math.ceil(totalItems / itemsPerPage)
      
      // Get study activities
      const activities = await db.all(`
        SELECT id, name, url, description
        FROM study_activities
        LIMIT ? OFFSET ?
      `, [itemsPerPage, offset])
      
      logger.debug(`Retrieved ${activities.length} study activities for page ${page}`)
      
      paginatedResponse(res, activities, {
        current_page: page,
        total_pages: totalPages,
        total_items: totalItems,
        items_per_page: itemsPerPage
      })
    } catch (error) {
      next(error)
    }
  },
  
  // Get single study activity
  getById: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const db = await getDb()
      const { id } = req.params
      
      const activity = await db.get(`
        SELECT id, name, url, description
        FROM study_activities
        WHERE id = ?
      `, [id])
      
      if (!activity) {
        throw new NotFoundError(`Study activity with ID ${id} not found`)
      }
      
      logger.debug(`Retrieved study activity with ID ${id}`)
      
      successResponse(res, activity)
    } catch (error) {
      next(error)
    }
  },
  
  // Get study sessions for an activity
  getStudySessions: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const db = await getDb()
      const { id } = req.params
      const page = parseInt(req.query.page as string) || 1
      const itemsPerPage = parseInt(req.query.limit as string) || 50
      const offset = (page - 1) * itemsPerPage
      
      // Check if activity exists
      const activity = await db.get('SELECT id FROM study_activities WHERE id = ?', [id])
      if (!activity) {
        throw new NotFoundError(`Study activity with ID ${id} not found`)
      }
      
      // Get total count
      const countResult = await db.get(`
        SELECT COUNT(*) as total 
        FROM study_sessions 
        WHERE study_activity_id = ?
      `, [id])
      const totalItems = countResult.total
      const totalPages = Math.ceil(totalItems / itemsPerPage)
      
      // Get study sessions
      const sessions = await db.all(`
        SELECT 
          ss.id,
          sa.name as activity_name,
          g.name as group_name,
          ss.created_at as start_time,
          ss.created_at as end_time, -- Simplified, in a real app this would be a separate field
          (SELECT COUNT(*) FROM word_review_items WHERE study_session_id = ss.id) as review_items_count
        FROM study_sessions ss
        JOIN study_activities sa ON ss.study_activity_id = sa.id
        JOIN groups g ON ss.group_id = g.id
        WHERE ss.study_activity_id = ?
        ORDER BY ss.created_at DESC
        LIMIT ? OFFSET ?
      `, [id, itemsPerPage, offset])
      
      logger.debug(`Retrieved ${sessions.length} study sessions for activity ${id}`)
      
      paginatedResponse(res, sessions, {
        current_page: page,
        total_pages: totalPages,
        total_items: totalItems,
        items_per_page: itemsPerPage
      })
    } catch (error) {
      next(error)
    }
  },
  
  // Launch a study activity
  launch: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const db = await getDb()
      const { id } = req.params
      const { group_id } = req.body
      
      if (!group_id) {
        throw new Error('Group ID is required')
      }
      
      // Check if activity exists
      const activity = await db.get('SELECT id FROM study_activities WHERE id = ?', [id])
      if (!activity) {
        throw new NotFoundError(`Study activity with ID ${id} not found`)
      }
      
      // Check if group exists
      const group = await db.get('SELECT id FROM groups WHERE id = ?', [group_id])
      if (!group) {
        throw new NotFoundError(`Group with ID ${group_id} not found`)
      }
      
      // Create a new study session
      const result = await db.run(`
        INSERT INTO study_sessions (study_activity_id, group_id, created_at)
        VALUES (?, ?, datetime('now'))
      `, [id, group_id])
      
      logger.debug(`Created new study session for activity ${id} and group ${group_id}`)
      
      successResponse(res, {
        id: result.lastID,
        group_id
      })
    } catch (error) {
      next(error)
    }
  }
} 