import { auth, currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { plan } = await req.json();
  const validPlan = plan === 'yearly' ? 'yearly' : 'monthly';

  const now = new Date();
  const end = new Date(now);
  if (validPlan === 'yearly') {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    end.setMonth(end.getMonth() + 1);
  }

  // Get user info from Clerk
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress || '';
  const fullName = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ') || 'User';

  try {
    // Upsert: create user if doesn't exist, update if does
    const { data, error } = await supabaseAdmin.from('users').upsert({
      id: userId,
      email,
      full_name: fullName,
      role: 'subscriber',
      subscription_status: 'active',
      subscription_plan: validPlan,
      subscription_start: now.toISOString(),
      subscription_end: end.toISOString(),
      stripe_customer_id: `demo_${userId}`,
      stripe_subscription_id: `demo_sub_${Date.now()}`,
      charity_contribution_pct: 10,
    }, { onConflict: 'id' }).select().single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Demo activation error:', err);

    // If the table doesn't exist, tell the user to run setup
    if (err?.code === 'PGRST205' || err?.message?.includes('schema cache')) {
      return NextResponse.json({
        error: 'Database tables not set up yet. Please visit /api/setup first.',
        setupRequired: true,
      }, { status: 500 });
    }

    return NextResponse.json({ error: err?.message || 'Failed to activate demo' }, { status: 500 });
  }
}
