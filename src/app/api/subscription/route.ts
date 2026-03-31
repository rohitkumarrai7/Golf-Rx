import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { stripe, PLANS } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // User doesn't exist yet, create them
      if (error.code === 'PGRST116') {
        const { data: newUser } = await supabaseAdmin
          .from('users')
          .insert({
            id: userId,
            email: '',
            full_name: '',
            role: 'subscriber',
            subscription_status: 'inactive',
            charity_contribution_pct: 10,
          })
          .select()
          .single();
        return NextResponse.json(newUser);
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Subscription GET error:', err);
    // Return a default user object when Supabase is unavailable
    return NextResponse.json({
      id: userId,
      email: '',
      full_name: '',
      role: 'subscriber',
      subscription_status: 'inactive',
      subscription_plan: null,
      subscription_start: null,
      subscription_end: null,
      stripe_customer_id: null,
      stripe_subscription_id: null,
      charity_id: null,
      charity_contribution_pct: 10,
      created_at: new Date().toISOString(),
    });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { plan } = await req.json();

  if (plan !== 'monthly' && plan !== 'yearly') {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  const planConfig = plan === 'monthly' ? PLANS.monthly : PLANS.yearly;

  // Get or create user
  let { data: user } = await supabaseAdmin
    .from('users')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  let customerId = user?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      metadata: { userId },
    });
    customerId = customer.id;
    await supabaseAdmin
      .from('users')
      .update({ stripe_customer_id: customerId })
      .eq('id', userId);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: planConfig.priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?cancelled=true`,
    metadata: {
      userId,
      plan,
    },
  });

  return NextResponse.json({ url: session.url });
}

export async function PUT(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const updateData: any = {};

  if (body.charity_id !== undefined) updateData.charity_id = body.charity_id;
  if (body.charity_contribution_pct !== undefined) {
    const pct = Number(body.charity_contribution_pct);
    if (pct < 10 || pct > 100) {
      return NextResponse.json({ error: 'Contribution must be between 10% and 100%' }, { status: 400 });
    }
    updateData.charity_contribution_pct = pct;
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
