import { Database } from 'sqlite'

export async function up(db: Database): Promise<void> {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      italian TEXT NOT NULL,
      english TEXT NOT NULL,
      parts TEXT
    );

    -- Create indexes for commonly queried columns
    CREATE INDEX IF NOT EXISTS idx_words_italian ON words(italian);
    CREATE INDEX IF NOT EXISTS idx_words_english ON words(english);
  `)
}

export async function down(db: Database): Promise<void> {
  await db.exec(`
    DROP TABLE IF EXISTS words;
  `)
} 