import { Request, Response, NextFunction } from 'express'
import { getDb } from '../db/database'
import { paginatedResponse, successResponse } from '../utils/responseHelper'
import { NotFoundError } from '../utils/errorHandler'
import { logger } from '../utils/logger'

export const wordsController = {
  // Get paginated list of words
  getAll: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const db = await getDb()
      const page = parseInt(req.query.page as string) || 1
      const itemsPerPage = 50
      const offset = (page - 1) * itemsPerPage
      
      const sortBy = req.query.sort_by as string || 'italian'
      const order = (req.query.order as string || 'asc').toUpperCase()
      
      // Validate sort parameters
      const validSortFields = ['italian', 'english', 'correct_count', 'wrong_count']
      const validOrders = ['ASC', 'DESC']
      
      if (!validSortFields.includes(sortBy) || !validOrders.includes(order)) {
        throw new Error('Invalid sort parameters')
      }
      
      // Get total count
      const countResult = await db.get('SELECT COUNT(*) as total FROM words')
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
        LEFT JOIN word_review_items wri ON w.id = wri.word_id
        GROUP BY w.id
        ORDER BY ${sortBy} ${order}
        LIMIT ? OFFSET ?
      `, [itemsPerPage, offset])
      
      logger.debug(`Retrieved ${words.length} words for page ${page}`)
      
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
  
  // Get single word
  getById: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const db = await getDb()
      const { id } = req.params
      
      // Get word with stats
      const word = await db.get(`
        SELECT 
          w.italian, 
          w.english
        FROM words w
        WHERE w.id = ?
      `, [id])
      
      if (!word) {
        throw new NotFoundError(`Word with ID ${id} not found`)
      }
      
      // Get stats
      const stats = await db.get(`
        SELECT
          COALESCE(SUM(CASE WHEN wri.correct = 1 THEN 1 ELSE 0 END), 0) as correct_count,
          COALESCE(SUM(CASE WHEN wri.correct = 0 THEN 1 ELSE 0 END), 0) as wrong_count
        FROM word_review_items wri
        WHERE wri.word_id = ?
      `, [id])
      
      // Get groups
      const groups = await db.all(`
        SELECT g.id, g.name
        FROM groups g
        JOIN word_groups wg ON g.id = wg.group_id
        WHERE wg.word_id = ?
      `, [id])
      
      logger.debug(`Retrieved word with ID ${id}`)
      
      successResponse(res, {
        ...word,
        stats,
        groups
      })
    } catch (error) {
      next(error)
    }
  }
} 