-- Supabase Database Schema for Gamification Analyzer
-- Run these commands in your Supabase SQL editor

-- Table to store analysis results
CREATE TABLE IF NOT EXISTS analysis_results (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    summary_stats JSONB NOT NULL,
    ranking_data JSONB NOT NULL,
    raw_data_count INTEGER DEFAULT 0
);

-- Table to store admin sessions
CREATE TABLE IF NOT EXISTS admin_sessions (
    id SERIAL PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_analysis_results_created_at ON analysis_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);

-- Enable Row Level Security (RLS)
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Policy to allow public read access to analysis_results
CREATE POLICY "Allow public read access to analysis_results" 
ON analysis_results FOR SELECT 
USING (true);

-- Policy to allow all operations on analysis_results (for API)
CREATE POLICY "Allow all operations on analysis_results" 
ON analysis_results FOR ALL 
USING (true);

-- Policy to allow all operations on admin_sessions (for API)
CREATE POLICY "Allow all operations on admin_sessions" 
ON admin_sessions FOR ALL 
USING (true);

-- Clean up expired sessions function
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM admin_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to clean up expired sessions
-- This would need to be set up in Supabase dashboard under Database > Cron Jobs
-- SELECT cron.schedule('cleanup-expired-sessions', '0 0 * * *', 'SELECT cleanup_expired_sessions();');

