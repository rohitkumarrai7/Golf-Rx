import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { data, error } = await supabaseAdmin
      .from('scores')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(5);

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error('Scores GET error:', err);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { score, date } = await req.json();

  if (!score || score < 1 || score > 45) {
    return NextResponse.json({ error: 'Score must be between 1 and 45' }, { status: 400 });
  }
  if (!date) {
    return NextResponse.json({ error: 'Date is required' }, { status: 400 });
  }

  try {
    // Check existing scores count
    const { data: existing } = await supabaseAdmin
      .from('scores')
      .select('id, date')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    // If 5 or more scores exist, delete the oldest
    if (existing && existing.length >= 5) {
      await supabaseAdmin
        .from('scores')
        .delete()
        .eq('id', existing[0].id);
    }

    const { data, error } = await supabaseAdmin
      .from('scores')
      .insert({ user_id: userId, score, date })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error('Scores POST error:', err);
    return NextResponse.json({ error: 'Failed to save score. Please check Supabase connection.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, score, date } = await req.json();

  if (!id) return NextResponse.json({ error: 'Score ID required' }, { status: 400 });
  if (score && (score < 1 || score > 45)) {
    return NextResponse.json({ error: 'Score must be between 1 and 45' }, { status: 400 });
  }

  const updateData: any = {};
  if (score) updateData.score = score;
  if (date) updateData.date = date;

  try {
    const { data, error } = await supabaseAdmin
      .from('scores')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error('Scores PUT error:', err);
    return NextResponse.json({ error: 'Failed to update score' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'Score ID required' }, { status: 400 });

  try {
    const { error } = await supabaseAdmin
      .from('scores')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Scores DELETE error:', err);
    return NextResponse.json({ error: 'Failed to delete score' }, { status: 500 });
  }
}
