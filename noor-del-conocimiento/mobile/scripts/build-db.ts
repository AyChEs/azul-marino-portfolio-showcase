#!/usr/bin/env ts-node
/**
 * Script para convertir questions.json → questions.db (SQLite)
 * 
 * Uso:
 *   npm run build:db
 * 
 * Este script:
 * 1. Lee data/questions.json
 * 2. Crea una base de datos SQLite con el schema definido en scripts/schema.sql
 * 3. Inserta todas las preguntas en la tabla `questions`
 * 4. Copia la DB a assets/questions.db para empaquetar en el APK
 */

import * as fs from 'fs';
import * as path from 'path';
import Database from 'better-sqlite3';

const QUESTIONS_JSON_PATH = path.join(__dirname, '..', 'data', 'questions.json');
const SCHEMA_SQL_PATH = path.join(__dirname, 'schema.sql');
const OUTPUT_DB_PATH = path.join(__dirname, '..', 'assets', 'questions.db');

interface QuestionJSON {
  id: number;
  question: { es: string; en: string; ar: string };
  options: { es: string[]; en: string[]; ar: string[] };
  correctAnswer: { es: string; en: string; ar: string };
  explanation: { es: string; en: string; ar: string };
  category: string;
  difficulty: string;
  arabicVerse?: string;
  source?: string;
  verified?: boolean;
  flag?: boolean;
  correction_note?: string;
}

function main() {
  console.log('🔨 Building questions.db from questions.json...\n');

  // Leer questions.json
  console.log('📖 Reading questions.json...');
  const questionsData: QuestionJSON[] = JSON.parse(fs.readFileSync(QUESTIONS_JSON_PATH, 'utf-8'));
  console.log(`   Found ${questionsData.length} questions\n`);

  // Crear directorio assets si no existe
  const assetsDir = path.dirname(OUTPUT_DB_PATH);
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  // Eliminar DB anterior si existe
  if (fs.existsSync(OUTPUT_DB_PATH)) {
    fs.unlinkSync(OUTPUT_DB_PATH);
    console.log('🗑️  Removed existing questions.db\n');
  }

  // Crear nueva base de datos
  console.log('📦 Creating SQLite database...');
  const db = new Database(OUTPUT_DB_PATH);
  
  // Ejecutar schema
  const schemaSql = fs.readFileSync(SCHEMA_SQL_PATH, 'utf-8');
  db.exec(schemaSql);
  console.log('   Schema created\n');

  // Preparar statement para inserción
  const insertStmt = db.prepare(`
    INSERT INTO questions (
      id, question_es, question_en, question_ar,
      options_es, options_en, options_ar,
      correct_answer_es, correct_answer_en, correct_answer_ar,
      explanation_es, explanation_en, explanation_ar,
      category, difficulty, arabic_verse, source,
      verified, flag, correction_note
    ) VALUES (
      @id, @question_es, @question_en, @question_ar,
      @options_es, @options_en, @options_ar,
      @correct_answer_es, @correct_answer_en, @correct_answer_ar,
      @explanation_es, @explanation_en, @explanation_ar,
      @category, @difficulty, @arabic_verse, @source,
      @verified, @flag, @correction_note
    )
  `);

  // Insertar preguntas en transacción
  console.log('📝 Inserting questions...');
  const insertMany = db.transaction((questions: QuestionJSON[]) => {
    for (const q of questions) {
      insertStmt.run({
        id: q.id,
        question_es: q.question.es,
        question_en: q.question.en,
        question_ar: q.question.ar,
        options_es: JSON.stringify(q.options.es),
        options_en: JSON.stringify(q.options.en),
        options_ar: JSON.stringify(q.options.ar),
        correct_answer_es: q.correctAnswer.es,
        correct_answer_en: q.correctAnswer.en,
        correct_answer_ar: q.correctAnswer.ar,
        explanation_es: q.explanation.es,
        explanation_en: q.explanation.en,
        explanation_ar: q.explanation.ar,
        category: q.category,
        difficulty: q.difficulty,
        arabic_verse: q.arabicVerse || null,
        source: q.source || null,
        verified: q.verified === false ? 0 : 1,
        flag: q.flag === true ? 1 : 0,
        correction_note: q.correction_note || null,
      });
    }
  });

  insertMany(questionsData);
  console.log(`   Inserted ${questionsData.length} questions\n`);

  // Actualizar metadata
  db.prepare(`UPDATE db_metadata SET value = datetime('now') WHERE key = 'created_at'`).run();
  db.prepare(`UPDATE db_metadata SET value = ? WHERE key = 'questions_count'`).run(questionsData.length.toString());

  // Verificar
  const count = db.prepare('SELECT COUNT(*) as count FROM questions').get() as { count: number };
  console.log(`✅ Database created successfully!`);
  console.log(`   Questions: ${count.count}`);
  console.log(`   Output: ${OUTPUT_DB_PATH}`);
  
  const stats = fs.statSync(OUTPUT_DB_PATH);
  console.log(`   Size: ${(stats.size / 1024).toFixed(1)} KB\n`);

  // Estadísticas por categoría y dificultad
  const categoryStats = db.prepare(`
    SELECT category, COUNT(*) as count 
    FROM questions 
    WHERE verified = 1 AND flag = 0
    GROUP BY category
  `).all() as { category: string; count: number }[];
  
  console.log('📊 Questions by category (verified, not flagged):');
  for (const stat of categoryStats) {
    console.log(`   ${stat.category}: ${stat.count}`);
  }

  const difficultyStats = db.prepare(`
    SELECT difficulty, COUNT(*) as count 
    FROM questions 
    WHERE verified = 1 AND flag = 0
    GROUP BY difficulty
  `).all() as { difficulty: string; count: number }[];
  
  console.log('\n📊 Questions by difficulty (verified, not flagged):');
  for (const stat of difficultyStats) {
    console.log(`   ${stat.difficulty}: ${stat.count}`);
  }

  db.close();
  console.log('\n✨ Done!\n');
}

try {
  main();
} catch (err: unknown) {
  console.error('❌ Error building database:', err);
  process.exit(1);
}
