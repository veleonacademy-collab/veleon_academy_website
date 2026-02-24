-- Link transactions to enrollments for academy payment tracking
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS enrollment_id INTEGER REFERENCES enrollments(id) ON DELETE SET NULL;

-- Index for querying payments by enrollment
CREATE INDEX IF NOT EXISTS idx_transactions_enrollment_id ON transactions(enrollment_id);

-- Index for querying installments by enrollment via transaction
CREATE INDEX IF NOT EXISTS idx_installments_transaction_id ON installments(transaction_id);

-- Index for querying installments by status (e.g. overdue)
CREATE INDEX IF NOT EXISTS idx_installments_status ON installments(status);

-- Index for querying enrollments by student and status
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_portal_locked ON enrollments(portal_locked);

-- Index for class recordings per course
CREATE INDEX IF NOT EXISTS idx_class_recordings_course_id ON class_recordings(course_id);

-- Index for assignments per course
CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON assignments(course_id);

-- Index for submissions per student
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON submissions(assignment_id);

-- Tutor courses indexes
CREATE INDEX IF NOT EXISTS idx_tutor_courses_tutor_id ON tutor_courses(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_courses_course_id ON tutor_courses(course_id);
