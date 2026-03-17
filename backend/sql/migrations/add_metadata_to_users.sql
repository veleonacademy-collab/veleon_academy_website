-- Migration to add metadata column to users table
-- This is used for tracking payment reminders and other flexible user data
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Index for JSONB data access performance
CREATE INDEX IF NOT EXISTS idx_users_metadata ON users USING GIN (metadata);
