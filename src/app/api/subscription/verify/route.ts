import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Get user's Stripe customer ID
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('stripe_customer_id, subscription_status')
      .eq('id', userId)
      .single();

    // Already active — nothing to do
    if (user?.subscription_status === 'active') {
      return NextResponse.json({ status: 'active' });
    }

    if (!user?.stripe_customer_id) {
      return NextResponse.json({ status: 'no_customer' });
    }

    // Check Stripe for active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripe_customer_id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      // Also check for recently completed checkout sessions
      const sessions = await stripe.checkout.sessions.list({
        customer: user.stripe_customer_id,
        limit: 5,
      });

      const completedSession = sessions.data.find(
        (s) => s.status === 'complete' && s.subscription
      );

      if (completedSession && completedSession.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
          completedSession.subscription as string
        );

        if (subscription.status === 'active') {
          const plan = completedSession.metadata?.plan as 'monthly' | 'yearly' || 'monthly';
          await supabaseAdmin.from('users').update({
            subscription_status: 'active',
            subscription_plan: plan,
            subscription_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
            subscription_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            stripe_subscription_id: subscription.id,
          }).eq('id', userId);

          return NextResponse.json({ status: 'active' });
        }
      }

      return NextResponse.json({ status: 'inactive' });
    }

    // Found active subscription — sync to database
    const subscription = subscriptions.data[0] as any;
    const plan = subscription.items.data[0]?.price?.recurring?.interval === 'year' ? 'yearly' : 'monthly';

    await supabaseAdmin.from('users').update({
      subscription_status: 'active',
      subscription_plan: plan,
      subscription_start: new Date(subscription.current_period_start * 1000).toISOString(),
      subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
      stripe_subscription_id: subscription.id,
    }).eq('id', userId);

    return NextResponse.json({ status: 'active' });
  } catch (err) {
    console.error('Subscription verify error:', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
