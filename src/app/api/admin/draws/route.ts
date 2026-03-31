import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import {
  generateRandomNumbers,
  generateAlgorithmicNumbers,
  calculateMatches,
  calculatePrizePool,
} from '@/lib/draw-engine';

async function checkAdmin() {
  const { userId } = await auth();
  if (!userId) return null;
  const { data: user } = await supabaseAdmin.from('users').select('role').eq('id', userId).single();
  if (user?.role !== 'admin') return null;
  return userId;
}

export async function GET() {
  const adminId = await checkAdmin();
  if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { data, error } = await supabaseAdmin
    .from('draws')
    .select('*, prize_pool(*)')
    .order('draw_date', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const adminId = await checkAdmin();
  if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { mode } = await req.json();
  if (mode !== 'random' && mode !== 'algorithmic') {
    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
  }

  // Get all active subscribers
  const { data: activeUsers } = await supabaseAdmin
    .from('users')
    .select('id, subscription_plan')
    .eq('subscription_status', 'active');

  if (!activeUsers || activeUsers.length === 0) {
    return NextResponse.json({ error: 'No active subscribers' }, { status: 400 });
  }

  // Get all scores for active users
  const userIds = activeUsers.map(u => u.id);
  const { data: allScores } = await supabaseAdmin
    .from('scores')
    .select('user_id, score')
    .in('user_id', userIds);

  // Generate drawn numbers
  let drawnNumbers: number[];
  if (mode === 'algorithmic') {
    const scoreValues = (allScores || []).map(s => s.score);
    drawnNumbers = generateAlgorithmicNumbers(scoreValues);
  } else {
    drawnNumbers = generateRandomNumbers();
  }

  // Get last jackpot carryover
  const { data: lastDraw } = await supabaseAdmin
    .from('draws')
    .select('id')
    .eq('status', 'published')
    .order('draw_date', { ascending: false })
    .limit(1)
    .single();

  let jackpotCarryover = 0;
  if (lastDraw) {
    const { data: lastPool } = await supabaseAdmin
      .from('prize_pool')
      .select('jackpot_carryover')
      .eq('draw_id', lastDraw.id)
      .single();
    jackpotCarryover = lastPool?.jackpot_carryover || 0;
  }

  // Calculate prize pool
  const monthlyCount = activeUsers.filter(u => u.subscription_plan === 'monthly').length;
  const yearlyCount = activeUsers.filter(u => u.subscription_plan === 'yearly').length;
  const pool = calculatePrizePool(monthlyCount, yearlyCount, 9.99, 89.99, 0.3, jackpotCarryover);

  // Create draw record
  const { data: draw, error: drawError } = await supabaseAdmin
    .from('draws')
    .insert({
      draw_date: new Date().toISOString().split('T')[0],
      draw_mode: mode,
      drawn_numbers: drawnNumbers,
      status: 'simulation',
      jackpot_amount: pool.tier_5_amount,
      rolled_over: false,
    })
    .select()
    .single();

  if (drawError) return NextResponse.json({ error: drawError.message }, { status: 500 });

  // Create draw entries and calculate matches
  const entries: any[] = [];
  const winners: { user_id: string; matched: number }[] = [];

  // Group scores by user
  const scoresByUser: Record<string, number[]> = {};
  for (const s of allScores || []) {
    if (!scoresByUser[s.user_id]) scoresByUser[s.user_id] = [];
    scoresByUser[s.user_id].push(s.score);
  }

  for (const user of activeUsers) {
    const userScores = (scoresByUser[user.id] || []).slice(0, 5);
    if (userScores.length === 0) continue;

    const matchedCount = calculateMatches(userScores, drawnNumbers);

    entries.push({
      draw_id: draw.id,
      user_id: user.id,
      scores_snapshot: userScores,
      matched_count: matchedCount,
    });

    if (matchedCount >= 3) {
      winners.push({ user_id: user.id, matched: matchedCount });
    }
  }

  // Insert entries
  if (entries.length > 0) {
    await supabaseAdmin.from('draw_entries').insert(entries);
  }

  // Check if there's a 5-match winner
  const has5Match = winners.some(w => w.matched === 5);
  const newJackpotCarryover = has5Match ? 0 : pool.tier_5_amount;

  // Update draw rolled_over status
  if (!has5Match) {
    await supabaseAdmin
      .from('draws')
      .update({ rolled_over: true })
      .eq('id', draw.id);
  }

  // Create prize pool record
  await supabaseAdmin.from('prize_pool').insert({
    draw_id: draw.id,
    total_pool: pool.total_pool,
    tier_5_amount: pool.tier_5_amount,
    tier_4_amount: pool.tier_4_amount,
    tier_3_amount: pool.tier_3_amount,
    jackpot_carryover: newJackpotCarryover,
  });

  // Count winners by tier
  const tier5Winners = winners.filter(w => w.matched === 5).length;
  const tier4Winners = winners.filter(w => w.matched === 4).length;
  const tier3Winners = winners.filter(w => w.matched === 3).length;

  return NextResponse.json({
    draw,
    drawn_numbers: drawnNumbers,
    total_entries: entries.length,
    prize_pool: pool,
    winners_summary: {
      tier_5: tier5Winners,
      tier_4: tier4Winners,
      tier_3: tier3Winners,
    },
    jackpot_rolled_over: !has5Match,
  });
}
