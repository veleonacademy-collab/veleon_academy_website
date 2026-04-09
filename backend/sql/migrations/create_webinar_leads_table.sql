CREATE TABLE IF NOT EXISTS webinar_leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    topic VARCHAR(255) DEFAULT 'Data Analytics',
    cohort VARCHAR(100), -- e.g. 'April 2026'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
