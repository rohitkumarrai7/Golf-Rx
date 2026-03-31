import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
} as any);

export const PLANS = {
  monthly: {
    name: 'Monthly Plan',
    price: 9.99,
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
    interval: 'month' as const,
    description: 'Full access with monthly billing',
  },
  yearly: {
    name: 'Yearly Plan',
    price: 89.99,
    priceId: process.env.STRIPE_YEARLY_PRICE_ID!,
    interval: 'year' as const,
    description: 'Save 25% with annual billing',
    savings: '25%',
  },
};

export const PRIZE_POOL_PERCENTAGE = 0.3; // 30% of subscription goes to prize pool
export const CHARITY_MIN_PERCENTAGE = 0.1; // 10% minimum to charity
