import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

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

  const { data: users, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get scores count for each user
  const usersWithScores = await Promise.all(
    (users || []).map(async (user: any) => {
      const { count } = await supabaseAdmin
        .from('scores')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      return { ...user, scores_count: count || 0 };
    })
  );

  return NextResponse.json(usersWithScores);
}

export async function PUT(req: NextRequest) {
  const adminId = await checkAdmin();
  if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id, ...updates } = await req.json();
  if (!id) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
