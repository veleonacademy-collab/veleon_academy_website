-- Migration to support sales-page only (hidden) courses
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;

-- Idempotently insert sales courses
INSERT INTO courses (title, slug, description, price, thumbnail_url, is_hidden)
VALUES 
  ('Data Analysis - Full Stack', 'data-analysis-full-stack', 'Data Analysis: Become a Job-Ready Pro In 6 Weeks (Full Stack Track: Excel + SQL + Power BI + AI)', 25000.00, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop', true),
  ('Data Analysis - Excel Only', 'data-analysis-excel-only', 'Data Analysis: Become a Job-Ready Pro In 6 Weeks (Excel Only Track)', 15000.00, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop', true)
ON CONFLICT (slug) DO UPDATE 
SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_hidden = EXCLUDED.is_hidden;
