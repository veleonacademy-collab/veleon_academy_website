-- Migration: Create class_materials table
CREATE TABLE IF NOT EXISTS class_materials (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    tutor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    cohort VARCHAR(50),
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'document', -- 'document', 'video', 'link'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for performance querying
CREATE INDEX IF NOT EXISTS class_materials_course_cohort_idx ON class_materials (course_id, cohort);
