import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  // Check which tables exist
  const tables = ['charities', 'users', 'scores', 'draws', 'draw_entries', 'winners', 'prize_pool', 'donations'];
  const status: Record<string, boolean> = {};

  for (const table of tables) {
    try {
      const { error } = await supabaseAdmin.from(table).select('*').limit(1);
      status[table] = !error;
    } catch {
      status[table] = false;
    }
  }

  const allReady = Object.values(status).every(Boolean);

  return NextResponse.json({
    ready: allReady,
    tables: status,
    message: allReady
      ? 'All tables are set up!'
      : 'Some tables are missing. Please run the SQL schema in your Supabase SQL Editor.',
    sqlEditorUrl: `https://supabase.com/dashboard/project/zqytyqhsyulzqttybkdd/sql/new`,
  });
}
