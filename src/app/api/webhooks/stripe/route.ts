import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan as 'monthly' | 'yearly';

        if (userId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          ) as any;

          await supabaseAdmin.from('users').update({
            subscription_status: 'active',
            subscription_plan: plan,
            subscription_start: new Date(subscription.current_period_start * 1000).toISOString(),
            subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscription.id,
          }).eq('id', userId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const customerId = subscription.customer as string;

        const { data: user } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (user) {
          let status: string;
          switch (subscription.status) {
            case 'active':
              status = 'active';
              break;
            case 'past_due':
              status = 'lapsed';
              break;
            case 'canceled':
              status = 'cancelled';
              break;
            default:
              status = 'inactive';
          }

          await supabaseAdmin.from('users').update({
            subscription_status: status,
            subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
          }).eq('id', user.id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const customerId = subscription.customer as string;

        await supabaseAdmin
          .from('users')
          .update({
            subscription_status: 'inactive',
            subscription_plan: null,
            stripe_subscription_id: null,
          })
          .eq('stripe_customer_id', customerId);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        const customerId = invoice.customer as string;

        await supabaseAdmin
          .from('users')
          .update({ subscription_status: 'lapsed' })
          .eq('stripe_customer_id', customerId);
        break;
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
