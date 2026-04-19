-- Cached LinkedIn profiles
CREATE TABLE IF NOT EXISTS linkedin_profiles (
  id SERIAL PRIMARY KEY,
  linkedin_url TEXT UNIQUE NOT NULL,
  name TEXT,
  headline TEXT,
  current_title TEXT,
  current_company TEXT,
  years_of_experience INTEGER,
  
  -- Stored as JSONB for flexibility
  all_employers JSONB DEFAULT '[]'::jsonb,
  education_background JSONB DEFAULT '[]'::jsonb,
  skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Metadata
  raw_data JSONB,
  last_enriched_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_linkedin_profiles_url ON linkedin_profiles(linkedin_url);
CREATE INDEX IF NOT EXISTS idx_linkedin_profiles_title ON linkedin_profiles(current_title);

-- Career searches/journeys
CREATE TABLE IF NOT EXISTS career_searches (
  id SERIAL PRIMARY KEY,
  
  -- Input
  user_linkedin_url TEXT,
  goal_title TEXT,
  goal_company TEXT,
  goal_industry TEXT,
  
  -- Results (cached)
  similar_profiles JSONB DEFAULT '[]'::jsonb,
  insights JSONB,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for search history
CREATE INDEX IF NOT EXISTS idx_career_searches_user ON career_searches(user_linkedin_url);

-- Mentorship requests (for future use)
CREATE TABLE IF NOT EXISTS mentorship_requests (
  id SERIAL PRIMARY KEY,
  requester_linkedin_url TEXT,
  mentor_linkedin_url TEXT,
  status TEXT DEFAULT 'pending',
  message TEXT,
  match_score INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Mentor stats (for badge system - future feature)
CREATE TABLE IF NOT EXISTS mentor_stats (
  linkedin_url TEXT PRIMARY KEY,
  mentees_count INTEGER DEFAULT 0,
  is_mentor BOOLEAN DEFAULT false,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Shareable traces (read-only snapshot of a career path result, identified by uuid)
CREATE TABLE IF NOT EXISTS shared_traces (
  id UUID PRIMARY KEY,
  goal_title TEXT,
  user_name TEXT,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE INDEX IF NOT EXISTS idx_shared_traces_created_at ON shared_traces(created_at DESC);

-- Allow anonymous reads (the share URL acts as the auth token)
ALTER TABLE shared_traces ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'shared_traces' AND policyname = 'public_read_shared_traces'
  ) THEN
    CREATE POLICY public_read_shared_traces ON shared_traces FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'shared_traces' AND policyname = 'public_insert_shared_traces'
  ) THEN
    CREATE POLICY public_insert_shared_traces ON shared_traces FOR INSERT WITH CHECK (true);
  END IF;
END $$;
