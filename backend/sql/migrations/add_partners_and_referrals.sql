-- Alter users to add referral code and referring partner columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(50) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Alter enrollments to add referring partner column
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS referred_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
