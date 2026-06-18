-- Migration: Add cohort column to folders and update unique constraint/index

ALTER TABLE folders ADD COLUMN IF NOT EXISTS cohort VARCHAR(50) NOT NULL DEFAULT '';

-- Drop the old unique constraint (course_id, name)
ALTER TABLE folders DROP CONSTRAINT IF EXISTS folders_course_id_name_key;

-- Create the new unique index (course_id, cohort, name)
CREATE UNIQUE INDEX IF NOT EXISTS folders_course_id_cohort_name_idx ON folders (course_id, cohort, name);
