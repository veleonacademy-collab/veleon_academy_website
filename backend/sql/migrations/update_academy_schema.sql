-- Update Enrollments to add assigned tutor and installment details
ALTER TABLE enrollments 
ADD COLUMN tutor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN installments_total INTEGER DEFAULT 1,
ADD COLUMN installments_paid INTEGER DEFAULT 0;

-- Comments / Complains Table
CREATE TABLE IF NOT EXISTS complains (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'unresolved', -- unresolved, resolved
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Remarks from Tutor about Student
CREATE TABLE IF NOT EXISTS remarks (
    id SERIAL PRIMARY KEY,
    tutor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    remark_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
