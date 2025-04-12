import { Database } from 'sqlite'

export async function up(db: Database): Promise<void> {
  await db.exec(`
    -- Drop existing table and indexes
    DROP TABLE IF EXISTS word_review_items;
    DROP INDEX IF EXISTS idx_word_review_items_word_id;
    DROP INDEX IF EXISTS idx_word_review_items_session_id;
    DROP INDEX IF EXISTS idx_word_review_items_created_at;

    -- Recreate table with optional study_session_id
    CREATE TABLE word_review_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word_id INTEGER NOT NULL,
      study_session_id INTEGER,
      correct BOOLEAN NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (word_id) REFERENCES words (id),
      FOREIGN KEY (study_session_id) REFERENCES study_sessions (id)
    );

    -- Recreate indexes
    CREATE INDEX idx_word_review_items_word_id ON word_review_items(word_id);
    CREATE INDEX idx_word_review_items_session_id ON word_review_items(study_session_id);
    CREATE INDEX idx_word_review_items_created_at ON word_review_items(created_at);
  `)
}

export async function down(db: Database): Promise<void> {
  await db.exec(`
    -- Drop table and indexes
    DROP TABLE IF EXISTS word_review_items;
    DROP INDEX IF EXISTS idx_word_review_items_word_id;
    DROP INDEX IF EXISTS idx_word_review_items_session_id;
    DROP INDEX IF EXISTS idx_word_review_items_created_at;
  `)
} 