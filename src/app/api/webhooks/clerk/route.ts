import { supabaseAdmin } from '@/lib/supabase';
import { sendWelcomeEmail } from '@/lib/email';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const payload = await req.json();
  const eventType = payload.type;

  try {
    switch (eventType) {
      case 'user.created': {
        const { id, email_addresses, first_name, last_name } = payload.data;
        const email = email_addresses?.[0]?.email_address || '';
        const fullName = [first_name, last_name].filter(Boolean).join(' ') || 'User';

        // Create user record in Supabase
        await supabaseAdmin.from('users').upsert({
          id,
          email,
          full_name: fullName,
          role: 'subscriber',
          subscription_status: 'inactive',
          charity_contribution_pct: 10,
        });

        // Send welcome email
        await sendWelcomeEmail(email, fullName);
        break;
      }

      case 'user.updated': {
        const { id, email_addresses, first_name, last_name } = payload.data;
        const email = email_addresses?.[0]?.email_address || '';
        const fullName = [first_name, last_name].filter(Boolean).join(' ') || 'User';

        await supabaseAdmin.from('users').update({
          email,
          full_name: fullName,
        }).eq('id', id);
        break;
      }

      case 'user.deleted': {
        const { id } = payload.data;
        await supabaseAdmin.from('users').delete().eq('id', id);
        break;
      }
    }
  } catch (err) {
    console.error('Clerk webhook error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
