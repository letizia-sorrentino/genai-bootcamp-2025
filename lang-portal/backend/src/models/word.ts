import { getDb } from '../db/database'

export interface Word {
  id: number
  italian: string
  english: string
  parts: string
}

export interface WordWithStats extends Word {
  correct_count: number
  wrong_count: number
}

export const WordModel = {
  findAll: async (page = 1, sortBy = 'italian', order = 'ASC'): Promise<{ words: WordWithStats[], total: number }> => {
    const db = await getDb()
    const itemsPerPage = 50
    const offset = (page - 1) * itemsPerPage
    
    // Get total count
    const countResult = await db.get('SELECT COUNT(*) as total FROM words')
    const total = countResult.total
    
    // Get words with stats
    const words = await db.all(`
      SELECT 
        w.id,
        w.italian, 
        w.english,
        w.parts,
        COALESCE(SUM(CASE WHEN wri.correct = 1 THEN 1 ELSE 0 END), 0) as correct_count,
        COALESCE(SUM(CASE WHEN wri.correct = 0 THEN 1 ELSE 0 END), 0) as wrong_count
      FROM words w
      LEFT JOIN word_review_items wri ON w.id = wri.word_id
      GROUP BY w.id
      ORDER BY ${sortBy} ${order}
      LIMIT ? OFFSET ?
    `, [itemsPerPage, offset])
    
    return { words, total }
  },
  
  findById: async (id: number): Promise<Word | null> => {
    const db = await getDb()
    const word = await db.get('SELECT * FROM words WHERE id = ?', [id])
    return word || null
  },
  
  getStats: async (id: number): Promise<{ correct_count: number, wrong_count: number }> => {
    const db = await getDb()
    const stats = await db.get(`
      SELECT
        COALESCE(SUM(CASE WHEN wri.correct = 1 THEN 1 ELSE 0 END), 0) as correct_count,
        COALESCE(SUM(CASE WHEN wri.correct = 0 THEN 1 ELSE 0 END), 0) as wrong_count
      FROM word_review_items wri
      WHERE wri.word_id = ?
    `, [id])
    
    return stats || { correct_count: 0, wrong_count: 0 }
  },
  
  getGroups: async (id: number): Promise<Array<{ id: number, name: string }>> => {
    const db = await getDb()
    const groups = await db.all(`
      SELECT g.id, g.name
      FROM groups g
      JOIN word_groups wg ON g.id = wg.group_id
      WHERE wg.word_id = ?
    `, [id])
    
    return groups || []
  }
} 