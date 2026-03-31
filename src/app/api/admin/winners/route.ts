import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { sendPayoutConfirmationEmail } from '@/lib/email';

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
    .from('winners')
    .select('*, user:users(full_name, email), draw:draws(draw_date)')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const adminId = await checkAdmin();
  if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id, verification_status, payout_status } = await req.json();
  if (!id) return NextResponse.json({ error: 'Winner ID required' }, { status: 400 });

  const updates: any = {};
  if (verification_status) updates.verification_status = verification_status;
  if (payout_status) updates.payout_status = payout_status;

  const { data, error } = await supabaseAdmin
    .from('winners')
    .update(updates)
    .eq('id', id)
    .select('*, user:users(full_name, email)')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send payout email if marked as paid
  if (payout_status === 'paid' && data.user) {
    await sendPayoutConfirmationEmail(
      data.user.email,
      data.user.full_name,
      data.prize_amount
    );
  }

  return NextResponse.json(data);
}
