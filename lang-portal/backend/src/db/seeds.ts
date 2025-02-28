import { getDb } from './database'

export async function seedDatabase(): Promise<void> {
  const db = await getDb()

  // Seed study activities
  await db.exec(`
    INSERT OR IGNORE INTO study_activities (id, name, url) VALUES
    (1, 'Vocabulary Quiz', 'http://localhost:8081'),
    (2, 'Word Matching', 'http://localhost:8082'),
    (3, 'Typing Practice', 'http://localhost:8083')
  `)

  // Seed initial groups
  await db.exec(`
    INSERT OR IGNORE INTO groups (id, name) VALUES
    (1, 'Basic Vocabulary'),
    (2, 'Food and Drinks'),
    (3, 'Common Verbs')
  `)

  // Seed some initial words
  await db.exec(`
    INSERT OR IGNORE INTO words (id, italian, english, parts) VALUES
    (1, 'ciao', 'hello', '{"type": "greeting"}'),
    (2, 'grazie', 'thank you', '{"type": "greeting"}'),
    (3, 'pane', 'bread', '{"type": "noun"}'),
    (4, 'acqua', 'water', '{"type": "noun"}'),
    (5, 'mangiare', 'to eat', '{"type": "verb"}'),
    (6, 'bere', 'to drink', '{"type": "verb"}')
  `)

  // Associate words with groups
  await db.exec(`
    INSERT OR IGNORE INTO word_groups (word_id, group_id) VALUES
    (1, 1), -- ciao -> Basic Vocabulary
    (2, 1), -- grazie -> Basic Vocabulary
    (3, 2), -- pane -> Food and Drinks
    (4, 2), -- acqua -> Food and Drinks
    (5, 3), -- mangiare -> Common Verbs
    (6, 3)  -- bere -> Common Verbs
  `)

  // Update word counts for groups
  await db.exec(`
    UPDATE groups
    SET words_count = (
      SELECT COUNT(*)
      FROM word_groups
      WHERE word_groups.group_id = groups.id
    )
  `)
} 