import { Database } from 'sqlite'

export async function up(db: Database): Promise<void> {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS word_review_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word_id INTEGER NOT NULL,
      study_session_id INTEGER NOT NULL,
      correct BOOLEAN NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (word_id) REFERENCES words (id),
      FOREIGN KEY (study_session_id) REFERENCES study_sessions (id)
    );
  `)
}

export async function down(db: Database): Promise<void> {
  await db.exec(`
    DROP TABLE IF EXISTS word_review_items;
  `)
} 