import { Request, Response, NextFunction } from 'express'
import { getDb } from '../db/database'
import { paginatedResponse, successResponse } from '../utils/responseHelper'
import { NotFoundError } from '../utils/errorHandler'
import { logger } from '../utils/logger'

export const studySessionsController = {
  // Get all study sessions
  getAll: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const db = await getDb()
      const page = parseInt(req.query.page as string) || 1
      const itemsPerPage = parseInt(req.query.limit as string) || 50
      const offset = (page - 1) * itemsPerPage
      
      // Get total count
      const countResult = await db.get('SELECT COUNT(*) as total FROM study_sessions')
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
        ORDER BY ss.created_at DESC
        LIMIT ? OFFSET ?
      `, [itemsPerPage, offset])
      
      logger.debug(`Retrieved ${sessions.length} study sessions for page ${page}`)
      
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
  
  // Get single study session
  getById: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const db = await getDb()
      const { id } = req.params
      
      const session = await db.get(`
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
        WHERE ss.id = ?
      `, [id])
      
      if (!session) {
        throw new NotFoundError(`Study session with ID ${id} not found`)
      }
      
      logger.debug(`Retrieved study session with ID ${id}`)
      
      successResponse(res, session)
    } catch (error) {
      next(error)
    }
  },
  
  // Get words for a study session
  getWords: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const db = await getDb()
      const { id } = req.params
      const page = parseInt(req.query.page as string) || 1
      const itemsPerPage = parseInt(req.query.limit as string) || 50
      const offset = (page - 1) * itemsPerPage
      
      // Check if session exists
      const session = await db.get('SELECT id FROM study_sessions WHERE id = ?', [id])
      if (!session) {
        throw new NotFoundError(`Study session with ID ${id} not found`)
      }
      
      // Get total count
      const countResult = await db.get(`
        SELECT COUNT(DISTINCT wri.word_id) as total 
        FROM word_review_items wri
        WHERE wri.study_session_id = ?
      `, [id])
      const totalItems = countResult.total
      const totalPages = Math.ceil(totalItems / itemsPerPage)
      
      // Get words reviewed in this session
      const words = await db.all(`
        SELECT 
          w.italian, 
          w.english,
          COALESCE(SUM(CASE WHEN wri.correct = 1 THEN 1 ELSE 0 END), 0) as correct_count,
          COALESCE(SUM(CASE WHEN wri.correct = 0 THEN 1 ELSE 0 END), 0) as wrong_count
        FROM words w
        JOIN word_review_items wri ON w.id = wri.word_id
        WHERE wri.study_session_id = ?
        GROUP BY w.id
        LIMIT ? OFFSET ?
      `, [id, itemsPerPage, offset])
      
      logger.debug(`Retrieved ${words.length} words for study session ${id}`)
      
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
  
  // Record a word review
  recordReview: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const db = await getDb()
      const { id, word_id } = req.params
      const { correct } = req.body
      
      if (correct === undefined) {
        throw new Error('Correct field is required')
      }
      
      // Check if session exists
      const session = await db.get('SELECT id FROM study_sessions WHERE id = ?', [id])
      if (!session) {
        throw new NotFoundError(`Study session with ID ${id} not found`)
      }
      
      // Check if word exists
      const word = await db.get('SELECT id FROM words WHERE id = ?', [word_id])
      if (!word) {
        throw new NotFoundError(`Word with ID ${word_id} not found`)
      }
      
      // Create a new word review
      const result = await db.run(`
        INSERT INTO word_review_items (word_id, study_session_id, correct, created_at)
        VALUES (?, ?, ?, datetime('now'))
      `, [word_id, id, correct ? 1 : 0])
      
      logger.debug(`Recorded review for word ${word_id} in session ${id} (correct: ${correct})`)
      
      successResponse(res, {
        word_id: parseInt(word_id),
        study_session_id: parseInt(id),
        correct: Boolean(correct),
        created_at: new Date().toISOString()
      })
    } catch (error) {
      next(error)
    }
  }
} 