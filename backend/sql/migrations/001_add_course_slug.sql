-- Add slug column to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Generate slugs for existing courses based on title
UPDATE courses 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;
