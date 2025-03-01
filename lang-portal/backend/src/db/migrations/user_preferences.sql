CREATE TABLE IF NOT EXISTS user_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  theme TEXT DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT 1,
  daily_goal INTEGER DEFAULT 10,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default preferences
INSERT INTO user_preferences (theme, notifications_enabled, daily_goal)
VALUES ('light', 1, 10); 