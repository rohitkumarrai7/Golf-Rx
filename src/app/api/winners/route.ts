import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { data, error } = await supabaseAdmin
      .from('winners')
      .select('*, draw:draws(draw_date, drawn_numbers)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error('Winners GET error:', err);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { winner_id, proof_url } = await req.json();

  if (!winner_id || !proof_url) {
    return NextResponse.json({ error: 'winner_id and proof_url required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('winners')
      .update({ proof_url })
      .eq('id', winner_id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error('Winners POST error:', err);
    return NextResponse.json({ error: 'Failed to upload proof' }, { status: 500 });
  }
}
