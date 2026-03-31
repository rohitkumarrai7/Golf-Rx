# Golf Rx — Play. Win. Give.

A modern subscription-driven web platform combining golf performance tracking, charity fundraising, and a monthly draw-based reward engine.

> Built for the **Digital Heroes Full-Stack Trainee Selection Process** — March 2026

---

## Live Demo

- **URL**: [Deployed on Vercel]
- **User Test**: Sign up → Activate Demo → Enter Scores → View Dashboard
- **Admin Test**: Set `role = 'admin'` in Supabase `users` table → Access `/admin`

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16.2 (App Router, Turbopack) |
| **Language** | TypeScript (strict) |
| **Styling** | Tailwind CSS 4 |
| **Authentication** | Clerk (Email, Google SSO) |
| **Database** | Supabase (PostgreSQL + Row Level Security) |
| **Payments** | Stripe (Checkout Sessions + Billing Portal) |
| **Email** | Resend (Transactional emails) |
| **Animations** | Framer Motion |
| **Charts** | Recharts |
| **Hosting** | Vercel |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Sign-in / Sign-up (Clerk)
│   ├── (public)/            # Landing, Pricing, Charities, How It Works
│   ├── (protected)/         # User Dashboard, Onboarding
│   ├── admin/               # Admin Panel (Users, Draws, Charities, Winners, Reports)
│   ├── api/                 # 15+ REST API routes
│   │   ├── subscription/    # Stripe checkout, billing portal, demo mode, verify
│   │   ├── scores/          # CRUD with 5-score rolling logic
│   │   ├── admin/           # Admin-only endpoints (draws, charities, users, winners, reports)
│   │   ├── webhooks/        # Clerk user sync + Stripe subscription lifecycle
│   │   └── ...
│   └── setup/               # Database setup helper page
├── components/
│   ├── layout/              # Navbar, Footer, DashboardSidebar
│   └── ui/                  # Button, Card, Badge, Input, Modal
├── lib/
│   ├── supabase.ts          # DB client (anon + service role + Clerk JWT)
│   ├── stripe.ts            # Stripe client + plan config + prize pool %
│   ├── draw-engine.ts       # Random & algorithmic draw logic + prize calculation
│   ├── email.ts             # 4 email templates (Resend)
│   └── utils.ts             # cn(), formatCurrency(), formatDate()
├── types/                   # TypeScript interfaces for all entities
└── proxy.ts                 # Route protection middleware (Clerk)
```

---

## Features Implemented (per PRD)

### Subscription & Payment (Section 04)
- Monthly (£9.99) and Yearly (£89.99 — 25% off) plans
- Stripe Checkout Sessions with success redirect
- Billing portal for subscription management
- Real-time subscription status validation on protected routes
- Handles: active, cancelled, lapsed, renewal_pending states
- **Demo mode** for evaluators (bypasses Stripe, activates instantly)

### Score Management (Section 05)
- Enter Stableford scores (range: 1–45) with date
- Rolling 5-score system — new score auto-replaces oldest
- Full CRUD (add, edit, delete)
- Displayed in reverse chronological order
- Subscription-gated: only active subscribers can enter scores

### Draw & Reward System (Section 06)
- **Random mode**: 5 unique numbers generated (1–45)
- **Algorithmic mode**: Weighted by score frequency across all users
- Simulation mode: Admin previews results before publishing
- Admin publishes results → winners auto-created → emails sent
- Jackpot (5-match) rolls over if unclaimed

### Prize Pool Logic (Section 07)
| Match | Pool Share | Rollover |
|---|---|---|
| 5-Number | 40% | Yes (Jackpot) |
| 4-Number | 35% | No |
| 3-Number | 25% | No |

- 30% of every subscription feeds the prize pool
- Auto-calculated from active subscriber count
- Split equally among multiple winners per tier

### Charity System (Section 08)
- Select charity during onboarding (required before dashboard)
- Minimum 10% contribution (user can increase up to 100%)
- Change charity anytime from dashboard
- Independent one-off donations (separate from subscription)
- Charity directory with search/filter
- Featured charities highlighted on homepage

### Winner Verification (Section 09)
- Winners upload proof screenshot from dashboard
- Admin reviews: Approve or Reject
- Payout tracking: Pending → Paid
- Email notifications at each stage

### User Dashboard (Section 10)
- Subscription status card (active/inactive, renewal date)
- Score entry/edit modal with validation
- Selected charity + contribution percentage
- Draw participation history
- Winnings overview with verification + payout status

### Admin Panel (Section 11)
- **User Management**: Search, view profiles, edit roles, manage subscriptions
- **Draw Management**: Configure mode, run simulation, preview matches, publish
- **Charity Management**: Full CRUD with featured toggle and event management
- **Winner Management**: View proofs, approve/reject, process payouts
- **Reports & Analytics**: Total users, prize pool, charity contributions, draw statistics

### UI/UX (Section 12)
- Emotion-driven design — charity impact first, not golf cliches
- Animated hero with parallax, floating orbs, draw ball visualization
- Scrolling trust ticker, animated counters, glassmorphism cards
- Testimonials section with member stories
- Mobile-first responsive design across all pages
- Framer Motion micro-interactions throughout
- Scroll-aware navbar with frosted glass effect

### Technical Requirements (Section 13)
- Mobile-first, fully responsive (Tailwind breakpoints)
- Optimized build with Turbopack
- Secure authentication via Clerk + proxy route protection
- 4 transactional email templates (welcome, draw results, winner alert, payout)

---

## Database Schema

8 tables with proper relationships, constraints, and RLS:

- `charities` — Charity profiles with events
- `users` — Linked to Clerk, subscription status, Stripe IDs, charity preference
- `scores` — Stableford scores (1-45, max 5 per user)
- `draws` — Monthly draws with mode and status
- `draw_entries` — User participation with score snapshots
- `winners` — Match results with verification and payout tracking
- `prize_pool` — Per-draw prize distribution
- `donations` — Subscription contributions + one-off donations

Full schema: [`supabase-schema.sql`](supabase-schema.sql) (idempotent — safe to re-run)

---

## Getting Started

### Prerequisites
- Node.js 18+
- Clerk account
- Supabase project
- Stripe account (test mode)
- Resend account (optional — for emails)

### 1. Clone & Install
```bash
git clone https://github.com/rohitkumarrai7/Golf-Rx.git
cd Golf-Rx
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local` and configure all keys.

### 3. Database Setup
- Open Supabase SQL Editor
- Paste contents of `supabase-schema.sql`
- Click Run
- Or visit `/setup` in the app for guided setup

### 4. Stripe Setup
- Create 2 products in Stripe Dashboard:
  - Monthly: £9.99/month → copy Price ID
  - Yearly: £89.99/year → copy Price ID
- Add Price IDs to `.env.local`

### 5. Run
```bash
npm run dev
```

### 6. Demo Access
Sign up → Go to Dashboard → Click **"Activate Demo (Monthly)"** to bypass payment.

---

## API Routes

| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/api/charities` | List charities (with search) | Public |
| GET | `/api/draws` | Published draws | Public |
| GET/POST/PUT/DELETE | `/api/scores` | Manage golf scores | User |
| GET/POST/PUT | `/api/subscription` | Subscription status & checkout | User |
| POST | `/api/subscription/demo` | Activate demo subscription | User |
| POST | `/api/subscription/portal` | Stripe billing portal | User |
| POST | `/api/subscription/verify` | Verify post-checkout activation | User |
| GET/POST | `/api/donations` | Donation history & one-off donations | User |
| GET/POST | `/api/winners` | Winnings & proof upload | User |
| POST | `/api/upload` | File upload to Supabase storage | User |
| GET/POST/PUT/DELETE | `/api/admin/charities` | Charity CRUD | Admin |
| GET/POST | `/api/admin/draws` | Draw management | Admin |
| POST | `/api/admin/draws/publish` | Publish draw results | Admin |
| GET/PUT | `/api/admin/users` | User management | Admin |
| GET/PUT | `/api/admin/winners` | Winner verification & payouts | Admin |
| GET | `/api/admin/reports` | Platform analytics | Admin |
| POST | `/api/webhooks/clerk` | Clerk user sync | Webhook |
| POST | `/api/webhooks/stripe` | Stripe subscription events | Webhook |

---

## Deployment

### Vercel
```bash
npm run build    # Verify build succeeds
vercel --prod    # Deploy
```

Set all `.env.local` variables in Vercel → Project Settings → Environment Variables.

### Post-Deploy
- Update `NEXT_PUBLIC_APP_URL` to production URL
- Configure Clerk webhook: `https://your-domain.com/api/webhooks/clerk`
- Configure Stripe webhook: `https://your-domain.com/api/webhooks/stripe`
- Set Stripe webhook events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

---

## Testing Checklist

- [x] User signup & login (Clerk)
- [x] Subscription flow (monthly + yearly via Stripe)
- [x] Score entry — 5-score rolling logic
- [x] Draw system — simulation & publish
- [x] Charity selection & contribution calculation
- [x] Winner verification & payout tracking
- [x] User Dashboard — all modules
- [x] Admin Panel — full CRUD & analytics
- [x] Responsive design (mobile + desktop)
- [x] Error handling & edge cases

---

## License

Built for the Digital Heroes Full-Stack Trainee Selection Process.
