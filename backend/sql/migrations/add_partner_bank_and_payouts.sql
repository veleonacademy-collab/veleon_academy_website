-- Migration: Add partner bank account details and enrollment commission payout tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_number VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_name VARCHAR(100);

ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS commission_paid BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS commission_paid_at TIMESTAMPTZ;
