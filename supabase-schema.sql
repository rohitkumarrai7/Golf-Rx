-- =============================================
-- Golf Charity Platform - Supabase Schema
-- Safe to re-run — uses IF NOT EXISTS and DROP IF EXISTS
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLES
-- =============================================

-- Charities table (created first because users references it)
CREATE TABLE IF NOT EXISTS charities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  upcoming_events JSONB DEFAULT '[]'::jsonb,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Users table (linked to Clerk auth)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'subscriber' CHECK (role IN ('subscriber', 'admin')),
  subscription_status TEXT NOT NULL DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'cancelled', 'lapsed', 'renewal_pending', 'inactive')),
  subscription_plan TEXT CHECK (subscription_plan IN ('monthly', 'yearly')),
  subscription_start TIMESTAMPTZ,
  subscription_end TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  charity_id UUID REFERENCES charities(id) ON DELETE SET NULL,
  charity_contribution_pct NUMERIC NOT NULL DEFAULT 10 CHECK (charity_contribution_pct >= 10 AND charity_contribution_pct <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Scores table
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Draws table
CREATE TABLE IF NOT EXISTS draws (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_date DATE NOT NULL,
  draw_mode TEXT NOT NULL CHECK (draw_mode IN ('random', 'algorithmic')),
  drawn_numbers INTEGER[] NOT NULL,
  status TEXT NOT NULL DEFAULT 'simulation' CHECK (status IN ('simulation', 'published')),
  jackpot_amount NUMERIC NOT NULL DEFAULT 0,
  rolled_over BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Draw entries
CREATE TABLE IF NOT EXISTS draw_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scores_snapshot INTEGER[] NOT NULL,
  matched_count INTEGER NOT NULL DEFAULT 0
);

-- Winners table
CREATE TABLE IF NOT EXISTS winners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_type INTEGER NOT NULL CHECK (match_type IN (3, 4, 5)),
  prize_amount NUMERIC NOT NULL DEFAULT 0,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  proof_url TEXT,
  payout_status TEXT NOT NULL DEFAULT 'pending' CHECK (payout_status IN ('pending', 'paid')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prize pool table
CREATE TABLE IF NOT EXISTS prize_pool (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  total_pool NUMERIC NOT NULL DEFAULT 0,
  tier_5_amount NUMERIC NOT NULL DEFAULT 0,
  tier_4_amount NUMERIC NOT NULL DEFAULT 0,
  tier_3_amount NUMERIC NOT NULL DEFAULT 0,
  jackpot_carryover NUMERIC NOT NULL DEFAULT 0
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  charity_id UUID NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  type TEXT NOT NULL CHECK (type IN ('subscription_contribution', 'one_off')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_date ON scores(date DESC);
CREATE INDEX IF NOT EXISTS idx_draw_entries_draw_id ON draw_entries(draw_id);
CREATE INDEX IF NOT EXISTS idx_draw_entries_user_id ON draw_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_winners_draw_id ON winners(draw_id);
CREATE INDEX IF NOT EXISTS idx_winners_user_id ON winners(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_charity_id ON donations(charity_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE prize_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies first (safe re-run)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Service role full access users" ON users;
DROP POLICY IF EXISTS "Users can view own scores" ON scores;
DROP POLICY IF EXISTS "Users can insert own scores" ON scores;
DROP POLICY IF EXISTS "Users can update own scores" ON scores;
DROP POLICY IF EXISTS "Users can delete own scores" ON scores;
DROP POLICY IF EXISTS "Service role full access scores" ON scores;
DROP POLICY IF EXISTS "Anyone can view charities" ON charities;
DROP POLICY IF EXISTS "Service role full access charities" ON charities;
DROP POLICY IF EXISTS "Anyone can view published draws" ON draws;
DROP POLICY IF EXISTS "Service role full access draws" ON draws;
DROP POLICY IF EXISTS "Users can view own entries" ON draw_entries;
DROP POLICY IF EXISTS "Service role full access draw_entries" ON draw_entries;
DROP POLICY IF EXISTS "Users can view own wins" ON winners;
DROP POLICY IF EXISTS "Users can update own wins" ON winners;
DROP POLICY IF EXISTS "Service role full access winners" ON winners;
DROP POLICY IF EXISTS "Anyone can view prize pool" ON prize_pool;
DROP POLICY IF EXISTS "Service role full access prize_pool" ON prize_pool;
DROP POLICY IF EXISTS "Users can view own donations" ON donations;
DROP POLICY IF EXISTS "Users can insert own donations" ON donations;
DROP POLICY IF EXISTS "Service role full access donations" ON donations;

-- Recreate all policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id);
CREATE POLICY "Service role full access users" ON users FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own scores" ON scores FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own scores" ON scores FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own scores" ON scores FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete own scores" ON scores FOR DELETE USING (auth.uid()::text = user_id);
CREATE POLICY "Service role full access scores" ON scores FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Anyone can view charities" ON charities FOR SELECT USING (true);
CREATE POLICY "Service role full access charities" ON charities FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Anyone can view published draws" ON draws FOR SELECT USING (status = 'published');
CREATE POLICY "Service role full access draws" ON draws FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own entries" ON draw_entries FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Service role full access draw_entries" ON draw_entries FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own wins" ON winners FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can update own wins" ON winners FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Service role full access winners" ON winners FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Anyone can view prize pool" ON prize_pool FOR SELECT USING (true);
CREATE POLICY "Service role full access prize_pool" ON prize_pool FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own donations" ON donations FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own donations" ON donations FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Service role full access donations" ON donations FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- STORAGE BUCKET
-- =============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('proofs', 'proofs', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can upload proofs" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view proofs" ON storage.objects;

CREATE POLICY "Users can upload proofs" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'proofs' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view proofs" ON storage.objects FOR SELECT
USING (bucket_id = 'proofs');

-- =============================================
-- SEED DATA (only inserts if not already present)
-- =============================================

INSERT INTO charities (name, description, image_url, upcoming_events, is_featured)
SELECT 'Golf for Good Foundation', 'Empowering underprivileged youth through golf programs. We provide equipment, coaching, and scholarships to young people who would otherwise never have the opportunity to play.', 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600', '[{"title": "Annual Charity Golf Day", "date": "2026-06-15", "description": "Join us for our biggest fundraising event of the year!", "location": "St Andrews Links"}]'::jsonb, true
WHERE NOT EXISTS (SELECT 1 FROM charities WHERE name = 'Golf for Good Foundation');

INSERT INTO charities (name, description, image_url, upcoming_events, is_featured)
SELECT 'Green Hearts Initiative', 'Promoting mental health awareness through outdoor sports and community engagement. Our programs combine the therapeutic benefits of golf with professional mental health support.', 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600', '[{"title": "Mental Health Awareness Walk & Golf", "date": "2026-05-20", "description": "A combined wellness event", "location": "Royal Liverpool"}]'::jsonb, false
WHERE NOT EXISTS (SELECT 1 FROM charities WHERE name = 'Green Hearts Initiative');

INSERT INTO charities (name, description, image_url, upcoming_events, is_featured)
SELECT 'Fairway Future Trust', 'Building sustainable communities by converting unused land into public golf courses and green spaces. Every project creates jobs, provides recreation, and improves local environments.', 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600', '[{"title": "Community Green Space Opening", "date": "2026-07-10", "description": "Celebrate the opening of our newest community course", "location": "Manchester"}]'::jsonb, true
WHERE NOT EXISTS (SELECT 1 FROM charities WHERE name = 'Fairway Future Trust');

INSERT INTO charities (name, description, image_url, upcoming_events, is_featured)
SELECT 'Swing for Change', 'Dedicated to using sport as a vehicle for social change. We run after-school programs, holiday camps, and mentoring initiatives that give young people purpose and direction.', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600', '[{"title": "Summer Camp Registration Open", "date": "2026-04-01", "description": "Register for our summer youth program", "location": "Birmingham"}]'::jsonb, false
WHERE NOT EXISTS (SELECT 1 FROM charities WHERE name = 'Swing for Change');

INSERT INTO charities (name, description, image_url, upcoming_events, is_featured)
SELECT 'Veterans on the Green', 'Supporting military veterans through golf-based rehabilitation and social programs. Golf provides structure, camaraderie, and a pathway back to civilian life.', 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600', '[{"title": "Veterans Memorial Tournament", "date": "2026-11-11", "description": "Annual tournament honoring our veterans", "location": "Gleneagles"}]'::jsonb, true
WHERE NOT EXISTS (SELECT 1 FROM charities WHERE name = 'Veterans on the Green');
