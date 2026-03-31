'use client';

import { motion } from 'framer-motion';
import { Heart, CheckCircle, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import type { Charity } from '@/types';

export default function OnboardingPage() {
  const router = useRouter();
  const [charities, setCharities] = useState<Charity[]>([]);
  const [selectedCharity, setSelectedCharity] = useState<string | null>(null);
  const [contribution, setContribution] = useState(10);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/charities')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCharities(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!selectedCharity) {
      toast.error('Please select a charity');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/subscription', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          charity_id: selectedCharity,
          charity_contribution_pct: contribution,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Welcome aboard!');
      router.push('/dashboard');
    } catch {
      toast.error('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-slate-900">Welcome! Let's get you set up.</h1>
        <p className="text-slate-600 mt-2">Choose a charity to support with your subscription.</p>
      </motion.div>

      {/* Contribution slider */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6"
      >
        <label className="block text-sm font-bold text-slate-900 mb-3">
          Charity Contribution: <span className="text-amber-500">{contribution}%</span>
        </label>
        <input
          type="range"
          min={10}
          max={50}
          value={contribution}
          onChange={(e) => setContribution(parseInt(e.target.value))}
          className="w-full accent-amber-500"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>10% (minimum)</span>
          <span>50%</span>
        </div>
      </motion.div>

      {/* Charity selection */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-slate-100 rounded-2xl h-20" />
          ))}
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {charities.map((charity, i) => (
            <motion.button
              key={charity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
              onClick={() => setSelectedCharity(charity.id)}
              className={`w-full text-left flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                selectedCharity === charity.id
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-slate-100 bg-white hover:border-amber-300'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-rose-400 to-rose-600 flex items-center justify-center shrink-0">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900">{charity.name}</p>
                <p className="text-sm text-slate-500 truncate">{charity.description}</p>
              </div>
              {selectedCharity === charity.id && (
                <CheckCircle className="h-6 w-6 text-amber-500 shrink-0" />
              )}
            </motion.button>
          ))}
        </div>
      )}

      <Button size="lg" className="w-full" onClick={handleSave} loading={saving}>
        Continue to Dashboard <ArrowRight className="h-5 w-5 ml-2" />
      </Button>
    </div>
  );
}
