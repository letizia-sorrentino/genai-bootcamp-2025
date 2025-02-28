import { getDb } from '../db/database'
import { WordWithStats } from './word'

export interface Group {
  id: number
  name: string
  words_count: number
}

export const GroupModel = {
  findAll: async (page = 1): Promise<{ groups: Group[], total: number }> => {
    const db = await getDb()
    const itemsPerPage = 50
    const offset = (page - 1) * itemsPerPage
    
    // Get total count
    const countResult = await db.get('SELECT COUNT(*) as total FROM groups')
    const total = countResult.total
    
    // Get groups
    const groups = await db.all(`
      SELECT 
        id, 
        name, 
        words_count
      FROM groups
      ORDER BY name ASC
      LIMIT ? OFFSET ?
    `, [itemsPerPage, offset])
    
    return { groups, total }
  },
  
  findById: async (id: number): Promise<Group | null> => {
    const db = await getDb()
    const group = await db.get('SELECT * FROM groups WHERE id = ?', [id])
    return group || null
  },
  
  getWords: async (groupId: number, page = 1): Promise<{ words: WordWithStats[], total: number }> => {
    const db = await getDb()
    const itemsPerPage = 50
    const offset = (page - 1) * itemsPerPage
    
    // Get total count
    const countResult = await db.get(`
      SELECT COUNT(*) as total 
      FROM words w
      JOIN word_groups wg ON w.id = wg.word_id
      WHERE wg.group_id = ?
    `, [groupId])
    
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
      JOIN word_groups wg ON w.id = wg.word_id
      LEFT JOIN word_review_items wri ON w.id = wri.word_id
      WHERE wg.group_id = ?
      GROUP BY w.id
      ORDER BY w.italian ASC
      LIMIT ? OFFSET ?
    `, [groupId, itemsPerPage, offset])
    
    return { words, total }
  },
  
  updateWordCount: async (groupId: number): Promise<void> => {
    const db = await getDb()
    
    await db.run(`
      UPDATE groups
      SET words_count = (
        SELECT COUNT(*)
        FROM word_groups
        WHERE group_id = ?
      )
      WHERE id = ?
    `, [groupId, groupId])
  }
} 