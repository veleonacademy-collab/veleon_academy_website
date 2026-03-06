-- Migration to rename 'user' role to 'student'
UPDATE users SET role = 'student' WHERE role = 'user';

-- Update default value for future users (if not handled by code)
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'student';
