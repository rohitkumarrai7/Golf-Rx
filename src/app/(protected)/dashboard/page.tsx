'use client';

import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import {
  Trophy, Heart, Target, Calendar, CreditCard, TrendingUp,
  Plus, Edit2, Trash2, Upload, CheckCircle, Clock, AlertCircle,
  ChevronRight, Wallet, ArrowRight
} from 'lucide-react';
import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { User, Score, Charity, Winner, Draw } from '@/types';

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { user: clerkUser } = useUser();
  const searchParams = useSearchParams();
  const [userData, setUserData] = useState<User | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);

  // Score form
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [editingScore, setEditingScore] = useState<Score | null>(null);
  const [scoreValue, setScoreValue] = useState('');
  const [scoreDate, setScoreDate] = useState('');
  const [scoreLoading, setScoreLoading] = useState(false);

  // Charity
  const [showCharityModal, setShowCharityModal] = useState(false);
  const [charityPct, setCharityPct] = useState(10);

  // Proof upload
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<Winner | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [subRes, scoresRes, charitiesRes, winnersRes, drawsRes] = await Promise.all([
        fetch('/api/subscription'),
        fetch('/api/scores'),
        fetch('/api/charities'),
        fetch('/api/winners'),
        fetch('/api/draws'),
      ]);

      const [subData, scoresData, charitiesData, winnersData, drawsData] = await Promise.all([
        subRes.json(),
        scoresRes.json(),
        charitiesRes.json(),
        winnersRes.json(),
        drawsRes.json(),
      ]);

      if (subData && !subData.error) setUserData(subData);
      if (Array.isArray(scoresData)) setScores(scoresData);
      if (Array.isArray(charitiesData)) setCharities(charitiesData);
      if (Array.isArray(winnersData)) setWinners(winnersData);
      if (Array.isArray(drawsData)) setDraws(drawsData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // After Stripe checkout redirect, verify and activate subscription
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      fetch('/api/subscription/verify', { method: 'POST' })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === 'active') {
            toast.success('Subscription activated! Welcome aboard!');
            fetchData();
          }
        })
        .catch(() => {});
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [searchParams, fetchData]);

  // Score handlers
  const handleAddScore = async () => {
    const val = parseInt(scoreValue);
    if (isNaN(val) || val < 1 || val > 45) {
      toast.error('Score must be between 1 and 45');
      return;
    }
    if (!scoreDate) {
      toast.error('Please select a date');
      return;
    }

    setScoreLoading(true);
    try {
      const method = editingScore ? 'PUT' : 'POST';
      const body = editingScore
        ? { id: editingScore.id, score: val, date: scoreDate }
        : { score: val, date: scoreDate };

      const res = await fetch('/api/scores', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Failed to save score');

      toast.success(editingScore ? 'Score updated!' : 'Score added!');
      setShowScoreModal(false);
      setEditingScore(null);
      setScoreValue('');
      setScoreDate('');
      fetchData();
    } catch {
      toast.error('Failed to save score');
    } finally {
      setScoreLoading(false);
    }
  };

  const handleDeleteScore = async (id: string) => {
    if (!confirm('Delete this score?')) return;
    try {
      await fetch(`/api/scores?id=${id}`, { method: 'DELETE' });
      toast.success('Score deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete score');
    }
  };

  // Charity update
  const handleUpdateCharity = async (charityId: string, pct: number) => {
    try {
      const res = await fetch('/api/subscription', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ charity_id: charityId, charity_contribution_pct: pct }),
      });
      if (!res.ok) throw new Error();
      toast.success('Charity updated!');
      setShowCharityModal(false);
      fetchData();
    } catch {
      toast.error('Failed to update charity');
    }
  };

  // Subscribe
  const handleSubscribe = async (plan: string) => {
    try {
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      toast.error('Failed to start checkout');
    }
  };

  // Demo activate (for evaluators / testing)
  const handleDemoActivate = async (plan: string) => {
    try {
      const res = await fetch('/api/subscription/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.setupRequired) {
        toast.error('Database not set up yet!');
        window.location.href = '/setup';
        return;
      }
      if (!res.ok) throw new Error(data.error);
      toast.success('Demo subscription activated!');
      fetchData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to activate demo');
    }
  };

  // Proof upload
  const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !selectedWinner) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', e.target.files[0]);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      const { url } = await uploadRes.json();

      await fetch('/api/winners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winner_id: selectedWinner.id, proof_url: url }),
      });

      toast.success('Proof uploaded successfully!');
      setShowProofModal(false);
      setSelectedWinner(null);
      fetchData();
    } catch {
      toast.error('Failed to upload proof');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500" />
      </div>
    );
  }

  const isActive = userData?.subscription_status === 'active';
  const selectedCharity = charities.find(c => c.id === userData?.charity_id);
  const totalWinnings = winners.reduce((sum, w) => sum + (w.prize_amount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {clerkUser?.firstName || 'Golfer'}!
        </h1>
        <p className="text-slate-500 mt-1">Here's your dashboard overview.</p>
      </div>

      {/* Subscription Banner */}
      {!isActive && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-linear-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-white"
        >
          <h2 className="text-lg font-bold mb-2">Subscribe to Get Started</h2>
          <p className="text-amber-100 mb-4">
            You need an active subscription to enter scores and participate in draws.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleSubscribe('monthly')}
              className="bg-white text-amber-600 hover:bg-amber-50"
            >
              Monthly - £9.99
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleSubscribe('yearly')}
              className="bg-white/20 text-white hover:bg-white/30"
            >
              Yearly - £89.99 (Save 25%)
            </Button>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-amber-100 text-xs mb-2">Evaluator / Demo Access:</p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDemoActivate('monthly')}
                className="bg-emerald-500 text-white hover:bg-emerald-600 border-0"
              >
                Activate Demo (Monthly)
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDemoActivate('yearly')}
                className="bg-emerald-500/70 text-white hover:bg-emerald-600 border-0"
              >
                Activate Demo (Yearly)
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Subscription</p>
              <Badge variant={isActive ? 'success' : 'danger'}>
                {userData?.subscription_status || 'inactive'}
              </Badge>
            </div>
          </div>
          {userData?.subscription_end && (
            <p className="text-xs text-slate-400 mt-2">
              {isActive ? 'Renews' : 'Ends'}: {formatDate(userData.subscription_end)}
            </p>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Target className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Scores</p>
              <p className="font-bold text-slate-900">{scores.length}/5 entered</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
              <Heart className="h-5 w-5 text-rose-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Charity</p>
              <p className="font-bold text-slate-900 text-sm truncate max-w-[150px]">
                {selectedCharity?.name || 'Not selected'}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Won</p>
              <p className="font-bold text-slate-900">{formatCurrency(totalWinnings)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Scores Section */}
      <section id="scores">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" /> My Scores
          </h2>
          {isActive && (
            <Button
              size="sm"
              onClick={() => {
                setEditingScore(null);
                setScoreValue('');
                setScoreDate(new Date().toISOString().split('T')[0]);
                setShowScoreModal(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Score
            </Button>
          )}
        </div>

        {scores.length === 0 ? (
          <Card className="text-center py-8">
            <Target className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No scores yet. Add your first Stableford score!</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {scores.map((score, i) => (
              <motion.div
                key={score.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between bg-white rounded-xl p-4 border border-slate-100 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                    {score.score}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Stableford Score</p>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(score.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingScore(score);
                      setScoreValue(score.score.toString());
                      setScoreDate(score.date);
                      setShowScoreModal(true);
                    }}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Edit2 className="h-4 w-4 text-slate-400" />
                  </button>
                  <button
                    onClick={() => handleDeleteScore(score.id)}
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Charity Section */}
      <section id="charity">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500" /> My Charity
          </h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setCharityPct(userData?.charity_contribution_pct || 10);
              setShowCharityModal(true);
            }}
          >
            Change Charity
          </Button>
        </div>

        {selectedCharity ? (
          <Card className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-linear-to-br from-rose-400 to-rose-600 flex items-center justify-center shrink-0">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900">{selectedCharity.name}</h3>
              <p className="text-sm text-slate-600 line-clamp-2">{selectedCharity.description}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-rose-500">{userData?.charity_contribution_pct}%</p>
              <p className="text-xs text-slate-500">Contribution</p>
            </div>
          </Card>
        ) : (
          <Card className="text-center py-8">
            <Heart className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No charity selected yet.</p>
            <Button size="sm" className="mt-3" onClick={() => setShowCharityModal(true)}>
              Choose a Charity
            </Button>
          </Card>
        )}
      </section>

      {/* Draws Section */}
      <section id="draws">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-amber-500" /> Draw History
        </h2>

        {draws.length === 0 ? (
          <Card className="text-center py-8">
            <Trophy className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No draws yet. Stay tuned for the next monthly draw!</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {draws.map((draw) => (
              <Card key={draw.id} className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">
                    Draw — {formatDate(draw.draw_date)}
                  </p>
                  <p className="text-sm text-slate-500">
                    Mode: {draw.draw_mode} | Numbers: {draw.drawn_numbers.join(', ')}
                  </p>
                </div>
                <Badge variant={draw.rolled_over ? 'warning' : 'success'}>
                  {draw.rolled_over ? 'Jackpot Rolled Over' : 'Completed'}
                </Badge>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Winnings Section */}
      <section id="winnings">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
          <Wallet className="h-5 w-5 text-emerald-500" /> My Winnings
        </h2>

        {winners.length === 0 ? (
          <Card className="text-center py-8">
            <Wallet className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No winnings yet. Keep entering your scores!</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {winners.map((winner) => (
              <Card key={winner.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold">
                    {winner.match_type}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {winner.match_type}-Number Match
                    </p>
                    <p className="text-sm text-slate-500">
                      Prize: {formatCurrency(winner.prize_amount)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <Badge
                      variant={
                        winner.verification_status === 'approved'
                          ? 'success'
                          : winner.verification_status === 'rejected'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {winner.verification_status}
                    </Badge>
                    <div className="mt-1">
                      <Badge variant={winner.payout_status === 'paid' ? 'success' : 'info'}>
                        {winner.payout_status}
                      </Badge>
                    </div>
                  </div>
                  {winner.verification_status === 'pending' && !winner.proof_url && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedWinner(winner);
                        setShowProofModal(true);
                      }}
                    >
                      <Upload className="h-4 w-4 mr-1" /> Upload Proof
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Score Modal */}
      <Modal
        isOpen={showScoreModal}
        onClose={() => setShowScoreModal(false)}
        title={editingScore ? 'Edit Score' : 'Add New Score'}
      >
        <div className="space-y-4">
          <Input
            label="Stableford Score (1-45)"
            type="number"
            min={1}
            max={45}
            value={scoreValue}
            onChange={(e) => setScoreValue(e.target.value)}
            placeholder="Enter score..."
          />
          <Input
            label="Date Played"
            type="date"
            value={scoreDate}
            onChange={(e) => setScoreDate(e.target.value)}
          />
          <div className="flex gap-3">
            <Button onClick={handleAddScore} loading={scoreLoading} className="flex-1">
              {editingScore ? 'Update Score' : 'Add Score'}
            </Button>
            <Button variant="ghost" onClick={() => setShowScoreModal(false)}>
              Cancel
            </Button>
          </div>
          {!editingScore && scores.length >= 5 && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
              You have 5 scores. Adding a new one will replace the oldest.
            </p>
          )}
        </div>
      </Modal>

      {/* Charity Modal */}
      <Modal
        isOpen={showCharityModal}
        onClose={() => setShowCharityModal(false)}
        title="Choose Your Charity"
        className="max-w-2xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Contribution: {charityPct}%
            </label>
            <input
              type="range"
              min={10}
              max={100}
              value={charityPct}
              onChange={(e) => setCharityPct(parseInt(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>10% (min)</span>
              <span>100%</span>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2">
            {charities.map((charity) => (
              <button
                key={charity.id}
                onClick={() => handleUpdateCharity(charity.id, charityPct)}
                className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  userData?.charity_id === charity.id
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-slate-100 hover:border-amber-300 hover:bg-amber-50/50'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-rose-400 to-rose-600 flex items-center justify-center shrink-0">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm">{charity.name}</p>
                  <p className="text-xs text-slate-500 truncate">{charity.description}</p>
                </div>
                {userData?.charity_id === charity.id && (
                  <CheckCircle className="h-5 w-5 text-amber-500 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Proof Upload Modal */}
      <Modal
        isOpen={showProofModal}
        onClose={() => setShowProofModal(false)}
        title="Upload Score Proof"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Upload a screenshot of your scores from your golf platform to verify your win.
          </p>
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
            <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-500 mb-3">Click to upload or drag and drop</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadProof}
              disabled={uploading}
              className="text-sm"
            />
          </div>
          {uploading && (
            <div className="flex items-center gap-2 text-sm text-amber-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-500" />
              Uploading...
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
