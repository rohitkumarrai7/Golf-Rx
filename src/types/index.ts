export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'subscriber' | 'admin';
  subscription_status: 'active' | 'cancelled' | 'lapsed' | 'renewal_pending' | 'inactive';
  subscription_plan: 'monthly' | 'yearly' | null;
  subscription_start: string | null;
  subscription_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  charity_id: string | null;
  charity_contribution_pct: number;
  created_at: string;
}

export interface Score {
  id: string;
  user_id: string;
  score: number;
  date: string;
  created_at: string;
}

export interface Charity {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  upcoming_events: CharityEvent[];
  is_featured: boolean;
  created_at: string;
}

export interface CharityEvent {
  title: string;
  date: string;
  description: string;
  location?: string;
}

export interface Draw {
  id: string;
  draw_date: string;
  draw_mode: 'random' | 'algorithmic';
  drawn_numbers: number[];
  status: 'simulation' | 'published';
  jackpot_amount: number;
  rolled_over: boolean;
  created_at: string;
}

export interface DrawEntry {
  id: string;
  draw_id: string;
  user_id: string;
  scores_snapshot: number[];
  matched_count: number;
}

export interface Winner {
  id: string;
  draw_id: string;
  user_id: string;
  match_type: 3 | 4 | 5;
  prize_amount: number;
  verification_status: 'pending' | 'approved' | 'rejected';
  proof_url: string | null;
  payout_status: 'pending' | 'paid';
  created_at: string;
  user?: User;
  draw?: Draw;
}

export interface PrizePool {
  id: string;
  draw_id: string;
  total_pool: number;
  tier_5_amount: number;
  tier_4_amount: number;
  tier_3_amount: number;
  jackpot_carryover: number;
}

export interface Donation {
  id: string;
  user_id: string;
  charity_id: string;
  amount: number;
  type: 'subscription_contribution' | 'one_off';
  created_at: string;
  charity?: Charity;
}
