-- Create veleonheart table for keep-alive tracking
CREATE TABLE IF NOT EXISTS veleonheart (
    id INT PRIMARY KEY,
    last_ping TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    counter BIGINT DEFAULT 1
);

-- Initialize the single row if it doesn't exist
INSERT INTO veleonheart (id, counter) VALUES (1, 1) ON CONFLICT (id) DO NOTHING;
