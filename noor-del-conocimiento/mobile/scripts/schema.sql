-- Noor del Conocimiento - SQLite Schema
-- Migración de questions.json + AsyncStorage a SQLite

-- Preguntas (reemplaza questions.json de 827KB)
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY,
  question_es TEXT NOT NULL,
  question_en TEXT NOT NULL,
  question_ar TEXT NOT NULL,
  options_es TEXT NOT NULL,  -- JSON array
  options_en TEXT NOT NULL,  -- JSON array
  options_ar TEXT NOT NULL,  -- JSON array
  correct_answer_es TEXT NOT NULL,
  correct_answer_en TEXT NOT NULL,
  correct_answer_ar TEXT NOT NULL,
  explanation_es TEXT NOT NULL,
  explanation_en TEXT NOT NULL,
  explanation_ar TEXT NOT NULL,
  category TEXT NOT NULL,           -- "Corán y General" | "Seerah" | "Profetas"
  difficulty TEXT NOT NULL,         -- "easy" | "medium" | "hard"
  arabic_verse TEXT,
  source TEXT,
  verified INTEGER DEFAULT 1,       -- 0/1
  flag INTEGER DEFAULT 0,           -- 0/1
  correction_note TEXT
);

-- Índice para queries de filtrado rápido
CREATE INDEX IF NOT EXISTS idx_questions_filter 
ON questions(category, difficulty, verified, flag);

-- Índice para queries por idioma (verificar que existe traducción)
CREATE INDEX IF NOT EXISTS idx_questions_servable 
ON questions(correct_answer_es, correct_answer_en, correct_answer_ar);

-- Tarjetas de repetición espaciada (reemplaza @noor:sr_cards de AsyncStorage)
CREATE TABLE IF NOT EXISTS sr_cards (
  question_id INTEGER PRIMARY KEY,
  ease_factor REAL NOT NULL DEFAULT 2.5,
  interval_days INTEGER NOT NULL DEFAULT 0,
  repetitions INTEGER NOT NULL DEFAULT 0,
  next_review_at INTEGER NOT NULL,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Índice para queries de tarjetas vencidas
CREATE INDEX IF NOT EXISTS idx_sr_due 
ON sr_cards(next_review_at);

-- Preguntas jugadas (reemplaza @noor:played_questions de AsyncStorage)
CREATE TABLE IF NOT EXISTS played_questions (
  question_id INTEGER PRIMARY KEY,
  played_at INTEGER NOT NULL,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Índice para ordenar por recencia
CREATE INDEX IF NOT EXISTS idx_played_recency 
ON played_questions(played_at);

-- Preguntas falladas (reemplaza @noor:missed_questions de AsyncStorage)
CREATE TABLE IF NOT EXISTS missed_questions (
  question_id INTEGER PRIMARY KEY,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Metadata de la base de datos (versión, fecha de build, etc.)
CREATE TABLE IF NOT EXISTS db_metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Insertar metadata inicial
INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('schema_version', '1');
INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('created_at', datetime('now'));
