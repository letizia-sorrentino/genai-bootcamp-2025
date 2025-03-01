import { Request, Response, NextFunction } from 'express'
import { getDb } from '../db/database'
import { paginatedResponse, successResponse } from '../utils/responseHelper'
import { NotFoundError } from '../utils/errorHandler'
import { logger } from '../utils/logger'

export const groupsController = {
  // Get paginated list of groups
  getAll: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const db = await getDb()
      const page = parseInt(req.query.page as string) || 1
      const itemsPerPage = 50
      const offset = (page - 1) * itemsPerPage
      
      // Get total count
      const countResult = await db.get('SELECT COUNT(*) as total FROM groups')
      const totalItems = countResult.total
      const totalPages = Math.ceil(totalItems / itemsPerPage)
      
      // Get groups
      const groups = await db.all(`
        SELECT 
          id, 
          name, 
          words_count as word_count
        FROM groups
        ORDER BY name ASC
        LIMIT ? OFFSET ?
      `, [itemsPerPage, offset])
      
      logger.debug(`Retrieved ${groups.length} groups for page ${page}`)
      
      paginatedResponse(res, groups, {
        current_page: page,
        total_pages: totalPages,
        total_items: totalItems,
        items_per_page: itemsPerPage
      })
    } catch (error) {
      next(error)
    }
  },
  
  // Get single group
  getById: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const db = await getDb()
      const { id } = req.params
      
      // Get group
      const group = await db.get(`
        SELECT 
          id, 
          name, 
          words_count as total_word_count
        FROM groups
        WHERE id = ?
      `, [id])
      
      if (!group) {
        throw new NotFoundError(`Group with ID ${id} not found`)
      }
      
      logger.debug(`Retrieved group with ID ${id}`)
      
      successResponse(res, {
        id: group.id,
        name: group.name,
        stats: {
          total_word_count: group.total_word_count
        }
      })
    } catch (error) {
      next(error)
    }
  },
  
  // Get words for a group
  getWords: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const db = await getDb()
      const { id } = req.params
      const page = parseInt(req.query.page as string) || 1
      const itemsPerPage = 50
      const offset = (page - 1) * itemsPerPage
      
      // Check if group exists
      const group = await db.get('SELECT id FROM groups WHERE id = ?', [id])
      if (!group) {
        throw new NotFoundError(`Group with ID ${id} not found`)
      }
      
      // Get total count
      const countResult = await db.get(`
        SELECT COUNT(*) as total 
        FROM words w
        JOIN word_groups wg ON w.id = wg.word_id
        WHERE wg.group_id = ?
      `, [id])
      
      const totalItems = countResult.total
      const totalPages = Math.ceil(totalItems / itemsPerPage)
      
      // Get words with stats
      const words = await db.all(`
        SELECT 
          w.italian, 
          w.english,
          COALESCE(SUM(CASE WHEN wri.correct = 1 THEN 1 ELSE 0 END), 0) as correct_count,
          COALESCE(SUM(CASE WHEN wri.correct = 0 THEN 1 ELSE 0 END), 0) as wrong_count
        FROM words w
        JOIN word_groups wg ON w.id = wg.word_id
        LEFT JOIN word_review_items wri ON w.id = wri.word_id
        WHERE wg.group_id = ?
        GROUP BY w.id
        ORDER BY w.italian ASC
        LIMIT ? OFFSET ?
      `, [id, itemsPerPage, offset])
      
      logger.debug(`Retrieved ${words.length} words for group ID ${id}, page ${page}`)
      
      paginatedResponse(res, words, {
        current_page: page,
        total_pages: totalPages,
        total_items: totalItems,
        items_per_page: itemsPerPage
      })
    } catch (error) {
      next(error)
    }
  },
  
  // Get study sessions for a group
  getStudySessions: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const db = await getDb()
      const { id } = req.params
      const page = parseInt(req.query.page as string) || 1
      const itemsPerPage = parseInt(req.query.limit as string) || 50
      const offset = (page - 1) * itemsPerPage
      
      // Check if group exists
      const group = await db.get('SELECT id FROM groups WHERE id = ?', [id])
      if (!group) {
        throw new NotFoundError(`Group with ID ${id} not found`)
      }
      
      // Get total count
      const countResult = await db.get(`
        SELECT COUNT(*) as total 
        FROM study_sessions 
        WHERE group_id = ?
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
        WHERE ss.group_id = ?
        ORDER BY ss.created_at DESC
        LIMIT ? OFFSET ?
      `, [id, itemsPerPage, offset])
      
      logger.debug(`Retrieved ${sessions.length} study sessions for group ${id}`)
      
      paginatedResponse(res, sessions, {
        current_page: page,
        total_pages: totalPages,
        total_items: totalItems,
        items_per_page: itemsPerPage
      })
    } catch (error) {
      next(error)
    }
  }
} 