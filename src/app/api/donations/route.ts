import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('donations')
    .select('*, charity:charities(name)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { charity_id, amount } = await req.json();

  if (!charity_id || !amount || amount <= 0) {
    return NextResponse.json({ error: 'Valid charity_id and amount required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('donations')
    .insert({
      user_id: userId,
      charity_id,
      amount,
      type: 'one_off',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
