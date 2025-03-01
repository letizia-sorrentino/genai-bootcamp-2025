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

  // Update study activities with descriptions
  await db.exec(`
    UPDATE study_activities SET description = 'Test your vocabulary knowledge with flashcards and multiple-choice questions' WHERE id = 1;
    UPDATE study_activities SET description = 'Match Italian words with their English translations in a fun memory game' WHERE id = 2;
    UPDATE study_activities SET description = 'Improve your spelling by typing the Italian words you hear' WHERE id = 3;
  `)

  // Seed initial groups
  await db.exec(`
    INSERT OR IGNORE INTO groups (id, name) VALUES
    (1, 'Basic Vocabulary'),
    (2, 'Food and Drinks'),
    (3, 'Common Verbs'),
    (4, 'Numbers and Time'),
    (5, 'Travel and Directions'),
    (6, 'Family and Relationships')
  `)

  // Seed words - Basic Vocabulary
  await db.exec(`
    INSERT OR IGNORE INTO words (id, italian, english, parts) VALUES
    (1, 'ciao', 'hello', '{"type": "greeting"}'),
    (2, 'grazie', 'thank you', '{"type": "greeting"}'),
    (3, 'sì', 'yes', '{"type": "adverb"}'),
    (4, 'no', 'no', '{"type": "adverb"}'),
    (5, 'per favore', 'please', '{"type": "phrase"}'),
    (6, 'prego', 'you are welcome', '{"type": "phrase"}'),
    (7, 'scusa', 'excuse me', '{"type": "phrase"}'),
    (8, 'buongiorno', 'good morning', '{"type": "greeting"}'),
    (9, 'buonasera', 'good evening', '{"type": "greeting"}'),
    (10, 'arrivederci', 'goodbye', '{"type": "greeting"}'),
    (11, 'come stai', 'how are you', '{"type": "phrase"}'),
    (12, 'bene', 'well', '{"type": "adverb"}'),
    (13, 'male', 'bad', '{"type": "adverb"}'),
    (14, 'aiuto', 'help', '{"type": "noun"}'),
    (15, 'per piacere', 'please', '{"type": "phrase"}')
  `)

  // Seed words - Food and Drinks
  await db.exec(`
    INSERT OR IGNORE INTO words (id, italian, english, parts) VALUES
    (16, 'pane', 'bread', '{"type": "noun"}'),
    (17, 'acqua', 'water', '{"type": "noun"}'),
    (18, 'vino', 'wine', '{"type": "noun"}'),
    (19, 'birra', 'beer', '{"type": "noun"}'),
    (20, 'caffè', 'coffee', '{"type": "noun"}'),
    (21, 'latte', 'milk', '{"type": "noun"}'),
    (22, 'zucchero', 'sugar', '{"type": "noun"}'),
    (23, 'sale', 'salt', '{"type": "noun"}'),
    (24, 'pepe', 'pepper', '{"type": "noun"}'),
    (25, 'pasta', 'pasta', '{"type": "noun"}'),
    (26, 'pizza', 'pizza', '{"type": "noun"}'),
    (27, 'formaggio', 'cheese', '{"type": "noun"}'),
    (28, 'frutta', 'fruit', '{"type": "noun"}'),
    (29, 'verdura', 'vegetable', '{"type": "noun"}'),
    (30, 'carne', 'meat', '{"type": "noun"}'),
    (31, 'pesce', 'fish', '{"type": "noun"}'),
    (32, 'pollo', 'chicken', '{"type": "noun"}'),
    (33, 'riso', 'rice', '{"type": "noun"}'),
    (34, 'uovo', 'egg', '{"type": "noun"}'),
    (35, 'gelato', 'ice cream', '{"type": "noun"}')
  `)

  // Seed words - Common Verbs
  await db.exec(`
    INSERT OR IGNORE INTO words (id, italian, english, parts) VALUES
    (36, 'essere', 'to be', '{"type": "verb"}'),
    (37, 'avere', 'to have', '{"type": "verb"}'),
    (38, 'fare', 'to do/make', '{"type": "verb"}'),
    (39, 'andare', 'to go', '{"type": "verb"}'),
    (40, 'venire', 'to come', '{"type": "verb"}'),
    (41, 'dire', 'to say', '{"type": "verb"}'),
    (42, 'mangiare', 'to eat', '{"type": "verb"}'),
    (43, 'bere', 'to drink', '{"type": "verb"}'),
    (44, 'dormire', 'to sleep', '{"type": "verb"}'),
    (45, 'parlare', 'to speak', '{"type": "verb"}'),
    (46, 'vedere', 'to see', '{"type": "verb"}'),
    (47, 'sentire', 'to hear/feel', '{"type": "verb"}'),
    (48, 'comprare', 'to buy', '{"type": "verb"}'),
    (49, 'leggere', 'to read', '{"type": "verb"}'),
    (50, 'scrivere', 'to write', '{"type": "verb"}'),
    (51, 'correre', 'to run', '{"type": "verb"}'),
    (52, 'camminare', 'to walk', '{"type": "verb"}'),
    (53, 'lavorare', 'to work', '{"type": "verb"}'),
    (54, 'studiare', 'to study', '{"type": "verb"}'),
    (55, 'giocare', 'to play', '{"type": "verb"}')
  `)

  // Seed words - Numbers and Time
  await db.exec(`
    INSERT OR IGNORE INTO words (id, italian, english, parts) VALUES
    (56, 'uno', 'one', '{"type": "number"}'),
    (57, 'due', 'two', '{"type": "number"}'),
    (58, 'tre', 'three', '{"type": "number"}'),
    (59, 'quattro', 'four', '{"type": "number"}'),
    (60, 'cinque', 'five', '{"type": "number"}'),
    (61, 'sei', 'six', '{"type": "number"}'),
    (62, 'sette', 'seven', '{"type": "number"}'),
    (63, 'otto', 'eight', '{"type": "number"}'),
    (64, 'nove', 'nine', '{"type": "number"}'),
    (65, 'dieci', 'ten', '{"type": "number"}'),
    (66, 'ora', 'hour', '{"type": "noun"}'),
    (67, 'minuto', 'minute', '{"type": "noun"}'),
    (68, 'secondo', 'second', '{"type": "noun"}'),
    (69, 'giorno', 'day', '{"type": "noun"}'),
    (70, 'settimana', 'week', '{"type": "noun"}'),
    (71, 'mese', 'month', '{"type": "noun"}'),
    (72, 'anno', 'year', '{"type": "noun"}'),
    (73, 'oggi', 'today', '{"type": "adverb"}'),
    (74, 'domani', 'tomorrow', '{"type": "adverb"}'),
    (75, 'ieri', 'yesterday', '{"type": "adverb"}')
  `)

  // Seed words - Travel and Directions
  await db.exec(`
    INSERT OR IGNORE INTO words (id, italian, english, parts) VALUES
    (76, 'treno', 'train', '{"type": "noun"}'),
    (77, 'autobus', 'bus', '{"type": "noun"}'),
    (78, 'aereo', 'airplane', '{"type": "noun"}'),
    (79, 'macchina', 'car', '{"type": "noun"}'),
    (80, 'bicicletta', 'bicycle', '{"type": "noun"}'),
    (81, 'stazione', 'station', '{"type": "noun"}'),
    (82, 'aeroporto', 'airport', '{"type": "noun"}'),
    (83, 'hotel', 'hotel', '{"type": "noun"}'),
    (84, 'ristorante', 'restaurant', '{"type": "noun"}'),
    (85, 'strada', 'street', '{"type": "noun"}'),
    (86, 'destra', 'right', '{"type": "noun"}'),
    (87, 'sinistra', 'left', '{"type": "noun"}'),
    (88, 'dritto', 'straight', '{"type": "adverb"}'),
    (89, 'nord', 'north', '{"type": "noun"}'),
    (90, 'sud', 'south', '{"type": "noun"}'),
    (91, 'est', 'east', '{"type": "noun"}'),
    (92, 'ovest', 'west', '{"type": "noun"}'),
    (93, 'vicino', 'near', '{"type": "adjective"}'),
    (94, 'lontano', 'far', '{"type": "adjective"}'),
    (95, 'mappa', 'map', '{"type": "noun"}')
  `)

  // Seed words - Family and Relationships
  await db.exec(`
    INSERT OR IGNORE INTO words (id, italian, english, parts) VALUES
    (96, 'famiglia', 'family', '{"type": "noun"}'),
    (97, 'madre', 'mother', '{"type": "noun"}'),
    (98, 'padre', 'father', '{"type": "noun"}'),
    (99, 'fratello', 'brother', '{"type": "noun"}'),
    (100, 'sorella', 'sister', '{"type": "noun"}'),
    (101, 'figlio', 'son', '{"type": "noun"}'),
    (102, 'figlia', 'daughter', '{"type": "noun"}'),
    (103, 'nonno', 'grandfather', '{"type": "noun"}'),
    (104, 'nonna', 'grandmother', '{"type": "noun"}'),
    (105, 'zio', 'uncle', '{"type": "noun"}'),
    (106, 'zia', 'aunt', '{"type": "noun"}'),
    (107, 'cugino', 'cousin (male)', '{"type": "noun"}'),
    (108, 'cugina', 'cousin (female)', '{"type": "noun"}'),
    (109, 'marito', 'husband', '{"type": "noun"}'),
    (110, 'moglie', 'wife', '{"type": "noun"}'),
    (111, 'amico', 'friend (male)', '{"type": "noun"}'),
    (112, 'amica', 'friend (female)', '{"type": "noun"}'),
    (113, 'ragazzo', 'boyfriend', '{"type": "noun"}'),
    (114, 'ragazza', 'girlfriend', '{"type": "noun"}'),
    (115, 'collega', 'colleague', '{"type": "noun"}')
  `)

  // Clear existing word_groups to avoid duplicates
  await db.exec(`DELETE FROM word_groups`)

  // Associate words with groups
  await db.exec(`
    -- Basic Vocabulary (Group 1)
    INSERT INTO word_groups (word_id, group_id) VALUES
    (1, 1), (2, 1), (3, 1), (4, 1), (5, 1), (6, 1), (7, 1), (8, 1), (9, 1), (10, 1),
    (11, 1), (12, 1), (13, 1), (14, 1), (15, 1);

    -- Food and Drinks (Group 2)
    INSERT INTO word_groups (word_id, group_id) VALUES
    (16, 2), (17, 2), (18, 2), (19, 2), (20, 2), (21, 2), (22, 2), (23, 2), (24, 2), (25, 2),
    (26, 2), (27, 2), (28, 2), (29, 2), (30, 2), (31, 2), (32, 2), (33, 2), (34, 2), (35, 2);

    -- Common Verbs (Group 3)
    INSERT INTO word_groups (word_id, group_id) VALUES
    (36, 3), (37, 3), (38, 3), (39, 3), (40, 3), (41, 3), (42, 3), (43, 3), (44, 3), (45, 3),
    (46, 3), (47, 3), (48, 3), (49, 3), (50, 3), (51, 3), (52, 3), (53, 3), (54, 3), (55, 3);

    -- Numbers and Time (Group 4)
    INSERT INTO word_groups (word_id, group_id) VALUES
    (56, 4), (57, 4), (58, 4), (59, 4), (60, 4), (61, 4), (62, 4), (63, 4), (64, 4), (65, 4),
    (66, 4), (67, 4), (68, 4), (69, 4), (70, 4), (71, 4), (72, 4), (73, 4), (74, 4), (75, 4);

    -- Travel and Directions (Group 5)
    INSERT INTO word_groups (word_id, group_id) VALUES
    (76, 5), (77, 5), (78, 5), (79, 5), (80, 5), (81, 5), (82, 5), (83, 5), (84, 5), (85, 5),
    (86, 5), (87, 5), (88, 5), (89, 5), (90, 5), (91, 5), (92, 5), (93, 5), (94, 5), (95, 5);

    -- Family and Relationships (Group 6)
    INSERT INTO word_groups (word_id, group_id) VALUES
    (96, 6), (97, 6), (98, 6), (99, 6), (100, 6), (101, 6), (102, 6), (103, 6), (104, 6), (105, 6),
    (106, 6), (107, 6), (108, 6), (109, 6), (110, 6), (111, 6), (112, 6), (113, 6), (114, 6), (115, 6);
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