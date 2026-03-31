'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Copy, ExternalLink, RefreshCw, Database, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';

const SQL_SCHEMA = `-- =============================================
-- Golf Charity Platform - Supabase Schema
-- Run this ENTIRE script in your Supabase SQL Editor
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Charities table
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_date ON scores(date DESC);
CREATE INDEX IF NOT EXISTS idx_draw_entries_draw_id ON draw_entries(draw_id);
CREATE INDEX IF NOT EXISTS idx_draw_entries_user_id ON draw_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_winners_draw_id ON winners(draw_id);
CREATE INDEX IF NOT EXISTS idx_winners_user_id ON winners(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_charity_id ON donations(charity_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE prize_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Service role full access users" ON users FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access scores" ON scores FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Anyone can view charities" ON charities FOR SELECT USING (true);
CREATE POLICY "Service role full access charities" ON charities FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Anyone can view published draws" ON draws FOR SELECT USING (status = 'published');
CREATE POLICY "Service role full access draws" ON draws FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access draw_entries" ON draw_entries FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access winners" ON winners FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Anyone can view prize pool" ON prize_pool FOR SELECT USING (true);
CREATE POLICY "Service role full access prize_pool" ON prize_pool FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access donations" ON donations FOR ALL USING (auth.role() = 'service_role');

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('proofs', 'proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Seed charities
INSERT INTO charities (name, description, image_url, upcoming_events, is_featured) VALUES
('Golf for Good Foundation', 'Empowering underprivileged youth through golf programs. We provide equipment, coaching, and scholarships to young people who would otherwise never have the opportunity to play.', 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600', '[{"title": "Annual Charity Golf Day", "date": "2026-06-15", "description": "Join us for our biggest fundraising event of the year!", "location": "St Andrews Links"}]', true),
('Green Hearts Initiative', 'Promoting mental health awareness through outdoor sports and community engagement. Our programs combine the therapeutic benefits of golf with professional mental health support.', 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600', '[{"title": "Mental Health Awareness Walk & Golf", "date": "2026-05-20", "description": "A combined wellness event", "location": "Royal Liverpool"}]', false),
('Fairway Future Trust', 'Building sustainable communities by converting unused land into public golf courses and green spaces. Every project creates jobs, provides recreation, and improves local environments.', 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600', '[{"title": "Community Green Space Opening", "date": "2026-07-10", "description": "Celebrate the opening of our newest community course", "location": "Manchester"}]', true),
('Swing for Change', 'Dedicated to using sport as a vehicle for social change. We run after-school programs, holiday camps, and mentoring initiatives that give young people purpose and direction.', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600', '[{"title": "Summer Camp Registration Open", "date": "2026-04-01", "description": "Register for our summer youth program", "location": "Birmingham"}]', false),
('Veterans on the Green', 'Supporting military veterans through golf-based rehabilitation and social programs. Golf provides structure, camaraderie, and a pathway back to civilian life.', 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600', '[{"title": "Veterans Memorial Tournament", "date": "2026-11-11", "description": "Annual tournament honoring our veterans", "location": "Gleneagles"}]', true);`;

export default function SetupPage() {
  const [tables, setTables] = useState<Record<string, boolean>>({});
  const [checking, setChecking] = useState(true);
  const [copied, setCopied] = useState(false);

  const checkTables = async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/setup');
      const data = await res.json();
      setTables(data.tables || {});
    } catch {
      setTables({});
    }
    setChecking(false);
  };

  useEffect(() => { checkTables(); }, []);

  const allReady = Object.values(tables).length > 0 && Object.values(tables).every(Boolean);

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
            <Database className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Database Setup</h1>
          <p className="text-slate-500 mt-2">
            Set up your Supabase database in 2 minutes.
          </p>
        </div>

        {/* Status */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">Table Status</h2>
            <button
              onClick={checkTables}
              disabled={checking}
              className="text-sm text-amber-500 hover:text-amber-600 font-medium flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {checking ? (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <RefreshCw className="h-4 w-4 animate-spin" /> Checking tables...
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(tables).map(([table, exists]) => (
                <div
                  key={table}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${
                    exists
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {exists ? (
                    <CheckCircle className="h-4 w-4 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0" />
                  )}
                  {table}
                </div>
              ))}
            </div>
          )}

          {allReady && (
            <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-emerald-700 font-semibold flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                All tables are set up! You're ready to go.
              </p>
              <Link href="/dashboard">
                <Button size="sm" className="mt-3">
                  Go to Dashboard <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Instructions */}
        {!allReady && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="font-bold text-slate-900 mb-4">Setup Instructions</h2>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm shrink-0">1</div>
                <div>
                  <p className="font-medium text-slate-900">Open Supabase SQL Editor</p>
                  <a
                    href="https://supabase.com/dashboard/project/zqytyqhsyulzqttybkdd/sql/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-amber-500 hover:text-amber-600 flex items-center gap-1 mt-1"
                  >
                    Open SQL Editor <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm shrink-0">2</div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 mb-2">Copy & paste this SQL</p>
                  <button
                    onClick={handleCopy}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                      copied
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? 'Copied to clipboard!' : 'Copy SQL Schema'}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm shrink-0">3</div>
                <div>
                  <p className="font-medium text-slate-900">Click "Run" in the SQL Editor</p>
                  <p className="text-sm text-slate-500 mt-1">This creates all tables, indexes, policies, and seed data.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm shrink-0">4</div>
                <div>
                  <p className="font-medium text-slate-900">Click "Refresh" above to verify</p>
                  <p className="text-sm text-slate-500 mt-1">All tables should turn green.</p>
                </div>
              </div>
            </div>

            {/* SQL Preview */}
            <div className="mt-6">
              <details className="group">
                <summary className="text-sm font-medium text-slate-500 cursor-pointer hover:text-slate-700">
                  Preview SQL ({SQL_SCHEMA.split('\n').length} lines)
                </summary>
                <pre className="mt-2 bg-slate-900 text-slate-300 text-xs p-4 rounded-xl overflow-x-auto max-h-60 overflow-y-auto">
                  {SQL_SCHEMA}
                </pre>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
