-- Add transaction_id to tasks to link payments, and missing indexes
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS transaction_id INTEGER REFERENCES transactions(id) ON DELETE SET NULL;

-- Missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_transaction_id ON tasks(transaction_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_course_id ON curriculum(course_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_progress_tutor_id ON curriculum_progress(tutor_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_progress_curriculum_id ON curriculum_progress(curriculum_id);
