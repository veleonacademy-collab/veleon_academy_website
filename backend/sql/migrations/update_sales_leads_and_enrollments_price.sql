-- Migration to add custom pricing overrides and cohort groupings for manual onboarding
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS custom_price NUMERIC(12, 2);
ALTER TABLE sales_leads ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT false;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS cohort VARCHAR(50);
ALTER TABLE class_recordings ADD COLUMN IF NOT EXISTS cohort VARCHAR(50);
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS cohort VARCHAR(50);
