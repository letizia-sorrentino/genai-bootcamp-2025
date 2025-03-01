import { Database } from 'sqlite'

export async function up(db: Database): Promise<void> {
  await db.exec(`
    ALTER TABLE study_activities ADD COLUMN description TEXT;
  `)
}

export async function down(db: Database): Promise<void> {
  // SQLite doesn't support dropping columns directly
  // We need to recreate the table without the column
  await db.exec(`
    BEGIN TRANSACTION;
    
    -- Create a temporary table with the original schema
    CREATE TABLE temp_study_activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT NOT NULL
    );
    
    -- Copy data from the original table to the temporary table
    INSERT INTO temp_study_activities (id, name, url)
    SELECT id, name, url FROM study_activities;
    
    -- Drop the original table
    DROP TABLE study_activities;
    
    -- Rename the temporary table to the original table name
    ALTER TABLE temp_study_activities RENAME TO study_activities;
    
    COMMIT;
  `)
} 