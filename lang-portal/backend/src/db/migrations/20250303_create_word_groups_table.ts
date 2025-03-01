import { Database } from 'sqlite'

export async function up(db: Database): Promise<void> {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS word_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word_id INTEGER NOT NULL,
      group_id INTEGER NOT NULL,
      FOREIGN KEY (word_id) REFERENCES words (id),
      FOREIGN KEY (group_id) REFERENCES groups (id)
    );
  `)
}

export async function down(db: Database): Promise<void> {
  await db.exec(`
    DROP TABLE IF EXISTS word_groups;
  `)
} 