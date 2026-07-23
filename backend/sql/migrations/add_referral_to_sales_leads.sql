-- Migration to add referral tracking fields to sales_leads
ALTER TABLE sales_leads ADD COLUMN IF NOT EXISTS referral_code VARCHAR(100);
ALTER TABLE sales_leads ADD COLUMN IF NOT EXISTS lead_source VARCHAR(50) DEFAULT 'direct';

CREATE INDEX IF NOT EXISTS idx_sales_leads_referral_code ON sales_leads(referral_code);
