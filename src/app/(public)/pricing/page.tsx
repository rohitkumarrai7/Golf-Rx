'use client';

import { motion } from 'framer-motion';
import { Check, Star, ArrowRight, Shield, Heart, Trophy } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import toast from 'react-hot-toast';

const features = [
  'Enter & track your golf scores',
  'Monthly prize draw entry',
  'Choose & support a charity',
  'Full user dashboard',
  'Winner verification & payouts',
  'Email notifications',
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isSignedIn } = useUser();

  const handleSubscribe = async () => {
    if (!isSignedIn) {
      window.location.href = '/sign-up';
      return;
    }

    setLoading(true);
    try {
      const plan = annual ? 'yearly' : 'monthly';
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Failed to start checkout');
      }
    } catch {
      toast.error('Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
            Simple, Transparent <span className="text-amber-500">Pricing</span>
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            One plan, two billing options. Every feature included. No hidden fees.
          </p>

          {/* Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                !annual ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                annual ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Yearly <span className="text-emerald-500 ml-1">Save 25%</span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-lg mx-auto"
        >
          <div className="relative bg-white rounded-3xl border-2 border-amber-500 shadow-xl shadow-amber-500/10 overflow-hidden">
            {/* Badge */}
            <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl flex items-center gap-1">
              <Star className="h-3 w-3" /> Most Popular
            </div>

            <div className="p-8 md:p-10">
              {/* Price */}
              <div className="text-center mb-8">
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  {annual ? 'Yearly Plan' : 'Monthly Plan'}
                </h2>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-5xl font-bold text-slate-900">
                    £{annual ? '89.99' : '9.99'}
                  </span>
                  <span className="text-slate-500 mb-1.5">/{annual ? 'year' : 'month'}</span>
                </div>
                {annual && (
                  <p className="text-sm text-emerald-600 mt-2 font-medium">
                    That's just £7.50/month — save £29.89/year!
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-slate-700">
                    <Check className="h-5 w-5 text-emerald-500 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                size="lg"
                className="w-full text-base"
                onClick={handleSubscribe}
                loading={loading}
              >
                {isSignedIn ? 'Subscribe Now' : 'Get Started'} <ArrowRight className="h-5 w-5 ml-2" />
              </Button>

              {/* Demo access for evaluators */}
              {isSignedIn && (
                <button
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const plan = annual ? 'yearly' : 'monthly';
                      const res = await fetch('/api/subscription/demo', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ plan }),
                      });
                      if (res.ok) {
                        toast.success('Demo subscription activated!');
                        window.location.href = '/dashboard';
                      }
                    } catch { toast.error('Failed'); }
                    finally { setLoading(false); }
                  }}
                  className="w-full mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium py-2 px-4 rounded-xl border border-emerald-200 hover:bg-emerald-50 transition-all"
                >
                  Activate Demo Access (Evaluators)
                </button>
              )}

              {/* Breakdown */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Where your money goes</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-amber-500" /> Prize Pool
                    </span>
                    <span className="font-semibold text-slate-900">30%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 flex items-center gap-2">
                      <Heart className="h-4 w-4 text-rose-500" /> Your Charity (min)
                    </span>
                    <span className="font-semibold text-slate-900">10%+</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-500" /> Platform & Operations
                    </span>
                    <span className="font-semibold text-slate-900">60%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto mt-20"
        >
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'Can I cancel anytime?',
                a: 'Yes, you can cancel your subscription at any time. You will retain access until the end of your current billing period.',
              },
              {
                q: 'How are prizes paid out?',
                a: 'Winners are notified via email. After uploading proof of your scores and admin verification, prizes are paid directly to your bank account.',
              },
              {
                q: 'Can I change my charity?',
                a: 'Yes, you can change your selected charity and contribution percentage from your dashboard at any time.',
              },
              {
                q: 'What is Stableford scoring?',
                a: 'Stableford is a scoring system where points are awarded based on the number of strokes taken at each hole. Scores typically range from 0 to 45 points per round.',
              },
            ].map((faq) => (
              <details
                key={faq.q}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm group"
              >
                <summary className="px-6 py-4 cursor-pointer font-semibold text-slate-900 list-none flex items-center justify-between">
                  {faq.q}
                  <ArrowRight className="h-4 w-4 text-slate-400 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-6 pb-4 text-slate-600 text-sm leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
