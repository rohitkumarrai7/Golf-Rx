'use client';

import { motion } from 'framer-motion';
import { Trophy, Play, Eye, Send, Shuffle, Target } from 'lucide-react';
import { useEffect, useState } from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { formatDate, formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminDrawsPage() {
  const [draws, setDraws] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'random' | 'algorithmic'>('random');
  const [running, setRunning] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);
  const [publishing, setPublishing] = useState<string | null>(null);

  const fetchDraws = () => {
    fetch('/api/admin/draws')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDraws(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchDraws(); }, []);

  const runSimulation = async () => {
    setRunning(true);
    setSimResult(null);
    try {
      const res = await fetch('/api/admin/draws', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      const data = await res.json();
      if (res.ok) {
        setSimResult(data);
        toast.success('Simulation complete!');
        fetchDraws();
      } else {
        toast.error(data.error || 'Simulation failed');
      }
    } catch {
      toast.error('Failed to run simulation');
    } finally {
      setRunning(false);
    }
  };

  const publishDraw = async (drawId: string) => {
    setPublishing(drawId);
    try {
      const res = await fetch('/api/admin/draws/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draw_id: drawId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Published! ${data.winners_created} winners notified.`);
        fetchDraws();
        setSimResult(null);
      } else {
        toast.error(data.error || 'Publish failed');
      }
    } catch {
      toast.error('Failed to publish draw');
    } finally {
      setPublishing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-500" /> Draw Management
        </h1>
        <p className="text-slate-500 mt-1">Run simulations and publish monthly draws.</p>
      </div>

      {/* New Draw */}
      <Card>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Run New Draw</h2>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Draw Mode</label>
            <div className="flex gap-2">
              <button
                onClick={() => setMode('random')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                  mode === 'random' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-600'
                }`}
              >
                <Shuffle className="h-4 w-4" /> Random
              </button>
              <button
                onClick={() => setMode('algorithmic')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                  mode === 'algorithmic' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-600'
                }`}
              >
                <Target className="h-4 w-4" /> Algorithmic
              </button>
            </div>
          </div>
          <Button onClick={runSimulation} loading={running}>
            <Play className="h-4 w-4 mr-1" /> Run Simulation
          </Button>
        </div>
      </Card>

      {/* Simulation Results */}
      {simResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2 border-amber-500">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5 text-amber-500" /> Simulation Results
              <Badge variant="warning">Preview</Badge>
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase font-bold">Drawn Numbers</p>
                <div className="flex gap-2 mt-2">
                  {simResult.drawn_numbers?.map((n: number) => (
                    <span key={n} className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
                      {n}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase font-bold">Total Entries</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{simResult.total_entries}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase font-bold">Prize Pool</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(simResult.prize_pool?.total_pool || 0)}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase font-bold">Jackpot Rollover</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{simResult.jackpot_rolled_over ? 'Yes' : 'No'}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-amber-50 rounded-xl">
                <p className="text-xs font-bold text-amber-600">5-Match Winners</p>
                <p className="text-xl font-bold text-slate-900">{simResult.winners_summary?.tier_5 || 0}</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-xl">
                <p className="text-xs font-bold text-slate-500">4-Match Winners</p>
                <p className="text-xl font-bold text-slate-900">{simResult.winners_summary?.tier_4 || 0}</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-xl">
                <p className="text-xs font-bold text-slate-500">3-Match Winners</p>
                <p className="text-xl font-bold text-slate-900">{simResult.winners_summary?.tier_3 || 0}</p>
              </div>
            </div>

            <Button
              onClick={() => publishDraw(simResult.draw?.id)}
              loading={publishing === simResult.draw?.id}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-1" /> Publish This Draw
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Draw History */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Draw History</h2>
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl" />)}
          </div>
        ) : draws.length === 0 ? (
          <Card className="text-center py-8">
            <Trophy className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No draws yet. Run your first simulation above.</p>
          </Card>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Mode</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Numbers</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Jackpot</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {draws.map((draw) => (
                  <tr key={draw.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{formatDate(draw.draw_date)}</td>
                    <td className="px-4 py-3">
                      <Badge variant="info">{draw.draw_mode}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {draw.drawn_numbers?.map((n: number) => (
                          <span key={n} className="w-7 h-7 rounded bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">
                            {n}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={draw.status === 'published' ? 'success' : 'warning'}>
                        {draw.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {formatCurrency(draw.jackpot_amount || 0)}
                      {draw.rolled_over && <span className="text-amber-500 ml-1">(rolled)</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {draw.status === 'simulation' && (
                        <Button
                          size="sm"
                          onClick={() => publishDraw(draw.id)}
                          loading={publishing === draw.id}
                        >
                          <Send className="h-3 w-3 mr-1" /> Publish
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
