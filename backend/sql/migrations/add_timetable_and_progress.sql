-- Add Timetable and Progress tracking
ALTER TABLE courses ADD COLUMN IF NOT EXISTS timetable_url TEXT;

CREATE TABLE IF NOT EXISTS curriculum_progress (
    tutor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    curriculum_id INTEGER NOT NULL REFERENCES curriculum(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (tutor_id, curriculum_id)
);
