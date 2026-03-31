import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { sendWinnerAlertEmail } from '@/lib/email';

async function checkAdmin() {
  const { userId } = await auth();
  if (!userId) return null;
  const { data: user } = await supabaseAdmin.from('users').select('role').eq('id', userId).single();
  if (user?.role !== 'admin') return null;
  return userId;
}

export async function POST(req: NextRequest) {
  const adminId = await checkAdmin();
  if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { draw_id } = await req.json();
  if (!draw_id) return NextResponse.json({ error: 'draw_id required' }, { status: 400 });

  // Get draw
  const { data: draw } = await supabaseAdmin
    .from('draws')
    .select('*')
    .eq('id', draw_id)
    .eq('status', 'simulation')
    .single();

  if (!draw) return NextResponse.json({ error: 'Draw not found or already published' }, { status: 404 });

  // Get prize pool
  const { data: pool } = await supabaseAdmin
    .from('prize_pool')
    .select('*')
    .eq('draw_id', draw_id)
    .single();

  if (!pool) return NextResponse.json({ error: 'Prize pool not found' }, { status: 404 });

  // Get entries with 3+ matches
  const { data: winningEntries } = await supabaseAdmin
    .from('draw_entries')
    .select('user_id, matched_count')
    .eq('draw_id', draw_id)
    .gte('matched_count', 3);

  // Calculate prize per winner per tier
  const tier5Winners = winningEntries?.filter(e => e.matched_count === 5) || [];
  const tier4Winners = winningEntries?.filter(e => e.matched_count === 4) || [];
  const tier3Winners = winningEntries?.filter(e => e.matched_count === 3) || [];

  const tier5Prize = tier5Winners.length > 0 ? pool.tier_5_amount / tier5Winners.length : 0;
  const tier4Prize = tier4Winners.length > 0 ? pool.tier_4_amount / tier4Winners.length : 0;
  const tier3Prize = tier3Winners.length > 0 ? pool.tier_3_amount / tier3Winners.length : 0;

  // Create winner records
  const winnerRecords = [
    ...tier5Winners.map(w => ({
      draw_id,
      user_id: w.user_id,
      match_type: 5,
      prize_amount: Math.round(tier5Prize * 100) / 100,
    })),
    ...tier4Winners.map(w => ({
      draw_id,
      user_id: w.user_id,
      match_type: 4,
      prize_amount: Math.round(tier4Prize * 100) / 100,
    })),
    ...tier3Winners.map(w => ({
      draw_id,
      user_id: w.user_id,
      match_type: 3,
      prize_amount: Math.round(tier3Prize * 100) / 100,
    })),
  ];

  if (winnerRecords.length > 0) {
    await supabaseAdmin.from('winners').insert(winnerRecords);
  }

  // Publish draw
  await supabaseAdmin
    .from('draws')
    .update({ status: 'published' })
    .eq('id', draw_id);

  // Send emails to winners
  for (const record of winnerRecords) {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('email, full_name')
      .eq('id', record.user_id)
      .single();

    if (user) {
      await sendWinnerAlertEmail(
        user.email,
        user.full_name,
        record.match_type,
        record.prize_amount
      );
    }
  }

  return NextResponse.json({
    success: true,
    winners_created: winnerRecords.length,
  });
}
