CREATE TABLE IF NOT EXISTS sales_leads (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(50) NOT NULL,
  selected_track VARCHAR(20) NOT NULL CHECK (selected_track IN ('full', 'excel_only')),
  payment_term VARCHAR(20) NOT NULL CHECK (payment_term IN ('full', 'installment')),
  amount_due NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index on email for quick lookups
CREATE INDEX IF NOT EXISTS idx_sales_leads_email ON sales_leads(email);

-- Index on created_at for chronological listing
CREATE INDEX IF NOT EXISTS idx_sales_leads_created_at ON sales_leads(created_at DESC);
