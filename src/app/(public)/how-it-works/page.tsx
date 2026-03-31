'use client';

import { motion } from 'framer-motion';
import {
  UserPlus, CreditCard, Target, Shuffle, Trophy, Heart,
  ArrowRight, CheckCircle, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

const steps = [
  {
    icon: UserPlus,
    title: 'Sign Up & Subscribe',
    description: 'Create your account and choose a monthly (£9.99) or yearly (£89.99) subscription plan. Quick, easy, and secure via Stripe.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Heart,
    title: 'Choose Your Charity',
    description: 'Browse our directory of verified charities and select the one closest to your heart. At least 10% of your subscription goes directly to them.',
    color: 'from-rose-500 to-rose-600',
  },
  {
    icon: Target,
    title: 'Enter Your Scores',
    description: 'Submit your last 5 golf scores in Stableford format (1-45). Only your latest 5 scores are kept — each new score replaces the oldest.',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    icon: Shuffle,
    title: 'Monthly Draw',
    description: 'At the end of each month, our draw engine generates 5 numbers. Your scores are matched against these numbers to find winners.',
    color: 'from-amber-500 to-amber-600',
  },
  {
    icon: Trophy,
    title: 'Win & Verify',
    description: 'Match 3, 4, or 5 numbers to win! Upload proof of your scores, our team verifies, and your prize is paid out.',
    color: 'from-purple-500 to-purple-600',
  },
];

const matchTiers = [
  { match: '5 Numbers', prize: '40% of Pool', label: 'Jackpot', note: 'Rolls over if no winner!', highlight: true },
  { match: '4 Numbers', prize: '35% of Pool', label: 'Second Tier', note: 'Split equally among winners', highlight: false },
  { match: '3 Numbers', prize: '25% of Pool', label: 'Third Tier', note: 'Split equally among winners', highlight: false },
];

export default function HowItWorksPage() {
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Simple & Transparent
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
            How It <span className="text-amber-500">Works</span>
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            From signup to winning — here's everything you need to know about the Golf Charity Platform.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="max-w-3xl mx-auto mb-20">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex gap-6 mb-8 last:mb-0"
            >
              {/* Timeline */}
              <div className="flex flex-col items-center">
                <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${step.color} flex items-center justify-center shrink-0`}>
                  <step.icon className="h-7 w-7 text-white" />
                </div>
                {i < steps.length - 1 && (
                  <div className="w-0.5 h-full bg-slate-200 mt-2" />
                )}
              </div>

              {/* Content */}
              <div className="pb-8">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Step {i + 1}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Draw Mechanics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-linear-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 text-white mb-20"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            Prize Pool <span className="text-amber-400">Distribution</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {matchTiers.map((tier, i) => (
              <motion.div
                key={tier.match}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl p-6 text-center ${
                  tier.highlight
                    ? 'bg-amber-500/20 border border-amber-500/30'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                <div className="text-xs font-bold tracking-widest text-amber-400 mb-2">{tier.label}</div>
                <div className="text-3xl font-bold mb-1">{tier.prize}</div>
                <div className="text-lg font-semibold text-slate-300 mb-3">{tier.match}</div>
                <div className="text-sm text-slate-400">{tier.note}</div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm">
              30% of every subscription contributes to the prize pool. Pool size grows with more members.
            </p>
          </div>
        </motion.div>

        {/* Draw Modes */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shuffle className="h-5 w-5 text-amber-500" />
              Random Mode
            </h3>
            <p className="text-slate-600 mb-4">
              Standard lottery-style draw. Five numbers are randomly generated between 1 and 45. Pure chance, equal odds for everyone.
            </p>
            <ul className="space-y-2">
              {['Fair and unbiased', 'Equal odds for all subscribers', 'Numbers generated randomly each month'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-amber-500" />
              Algorithmic Mode
            </h3>
            <p className="text-slate-600 mb-4">
              Numbers are weighted based on the most and least frequently occurring scores across all active users. Strategy meets luck.
            </p>
            <ul className="space-y-2">
              {['Score-frequency weighted', 'Rewards common scoring patterns', 'Admin selects mode each month'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Ready to get started?</h2>
          <Link href="/sign-up">
            <Button size="lg">
              Subscribe Now <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
