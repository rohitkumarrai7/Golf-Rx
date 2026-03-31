import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

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

  // Total users
  const { count: totalUsers } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact', head: true });

  // Active subscribers
  const { count: activeSubscribers } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('subscription_status', 'active');

  // Total draws
  const { count: totalDraws } = await supabaseAdmin
    .from('draws')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published');

  // Total prize pool (current month)
  const { data: latestPool } = await supabaseAdmin
    .from('prize_pool')
    .select('total_pool')
    .order('id', { ascending: false })
    .limit(1)
    .single();

  // Total payouts
  const { data: payouts } = await supabaseAdmin
    .from('winners')
    .select('prize_amount')
    .eq('payout_status', 'paid');

  const totalPayouts = (payouts || []).reduce((sum: number, p: any) => sum + (p.prize_amount || 0), 0);

  // Charity donations
  const { data: donations } = await supabaseAdmin
    .from('donations')
    .select('amount');

  const totalCharityDonations = (donations || []).reduce((sum: number, d: any) => sum + (d.amount || 0), 0);

  // Charity totals breakdown
  const { data: charityTotals } = await supabaseAdmin
    .from('donations')
    .select('charity_id, amount, charity:charities(name)');

  const charityBreakdown: Record<string, { charity_id: string; charity_name: string; total: number; count: number }> = {};
  for (const d of charityTotals || []) {
    const id = d.charity_id;
    if (!charityBreakdown[id]) {
      charityBreakdown[id] = {
        charity_id: id,
        charity_name: (d.charity as any)?.name || 'Unknown',
        total: 0,
        count: 0,
      };
    }
    charityBreakdown[id].total += d.amount || 0;
    charityBreakdown[id].count += 1;
  }

  return NextResponse.json({
    total_users: totalUsers || 0,
    active_subscribers: activeSubscribers || 0,
    total_draws: totalDraws || 0,
    total_prize_pool: latestPool?.total_pool || 0,
    total_payouts: totalPayouts,
    total_charity_donations: totalCharityDonations,
    charity_totals: Object.values(charityBreakdown),
  });
}
