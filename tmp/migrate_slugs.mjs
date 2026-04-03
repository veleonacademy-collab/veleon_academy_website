import pg from 'pg';
const { Pool } = pg;
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from backend
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  },
});

async function migrate() {
  console.log('Starting migration to add slug column...');
  try {
    // 1. Add slug column
    await pool.query(`
      ALTER TABLE courses 
      ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
    `);
    console.log('Added slug column.');

    // 2. Populate slugs for existing courses
    const courses = await pool.query('SELECT id, title FROM courses WHERE slug IS NULL');
    for (const course of courses.rows) {
      const slug = course.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      await pool.query('UPDATE courses SET slug = $1 WHERE id = $2', [slug, course.id]);
      console.log(`Updated course ${course.id} with slug: ${slug}`);
    }

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrate();
