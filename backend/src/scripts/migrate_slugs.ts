import { pool } from "../database/pool.js";
import { logger } from "../utils/logger.js";

async function migrateSlugs() {
  try {
    logger.info("Adding slug column and generating slugs...");
    
    // 1. Add column
    await pool.query("ALTER TABLE courses ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE");
    logger.info("✓ Column 'slug' added");

    // 2. Populate
    const res = await pool.query("SELECT id, title FROM courses WHERE slug IS NULL");
    for (const row of res.rows) {
      const slug = row.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      await pool.query("UPDATE courses SET slug = $1 WHERE id = $2", [slug, row.id]);
      logger.info(`✓ Generated slug for ${row.title}: ${slug}`);
    }

    logger.info("✓ Slug migration completed");
    process.exit(0);
  } catch (error) {
    logger.error("Slug migration failed:", error);
    process.exit(1);
  }
}

migrateSlugs();
