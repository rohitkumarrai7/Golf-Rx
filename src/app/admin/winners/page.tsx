'use client';

import { motion } from 'framer-motion';
import { Award, CheckCircle, XCircle, DollarSign, Eye, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { formatDate, formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminWinnersPage() {
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [proofUrl, setProofUrl] = useState<string | null>(null);

  const fetchWinners = () => {
    fetch('/api/admin/winners')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setWinners(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchWinners(); }, []);

  const updateWinner = async (id: string, updates: any) => {
    try {
      const res = await fetch('/api/admin/winners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      if (!res.ok) throw new Error();
      toast.success('Winner updated');
      fetchWinners();
    } catch {
      toast.error('Failed to update');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Award className="h-6 w-6 text-amber-500" /> Winners Management
        </h1>
        <p className="text-slate-500 mt-1">{winners.length} total winners</p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl" />)}
        </div>
      ) : winners.length === 0 ? (
        <Card className="text-center py-8">
          <Award className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No winners yet.</p>
        </Card>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Winner</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Draw Date</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Match</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Prize</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Verification</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Payout</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Proof</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {winners.map((winner) => (
                  <tr key={winner.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-900">{winner.user?.full_name || 'N/A'}</p>
                      <p className="text-xs text-slate-500">{winner.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {winner.draw?.draw_date ? formatDate(winner.draw.draw_date) : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={winner.match_type === 5 ? 'warning' : 'default'}>
                        {winner.match_type}-Match
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                      {formatCurrency(winner.prize_amount)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={
                        winner.verification_status === 'approved' ? 'success' :
                        winner.verification_status === 'rejected' ? 'danger' : 'warning'
                      }>
                        {winner.verification_status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={winner.payout_status === 'paid' ? 'success' : 'info'}>
                        {winner.payout_status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {winner.proof_url ? (
                        <button
                          onClick={() => setProofUrl(winner.proof_url)}
                          className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" /> View
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {winner.verification_status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateWinner(winner.id, { verification_status: 'approved' })}
                              className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-500"
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => updateWinner(winner.id, { verification_status: 'rejected' })}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {winner.verification_status === 'approved' && winner.payout_status === 'pending' && (
                          <button
                            onClick={() => updateWinner(winner.id, { payout_status: 'paid' })}
                            className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-500"
                            title="Mark as Paid"
                          >
                            <DollarSign className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Proof Modal */}
      <Modal
        isOpen={!!proofUrl}
        onClose={() => setProofUrl(null)}
        title="Score Proof"
        className="max-w-2xl"
      >
        {proofUrl && (
          <div className="space-y-4">
            <img src={proofUrl} alt="Score proof" className="w-full rounded-xl" />
            <a
              href={proofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600"
            >
              <ExternalLink className="h-4 w-4" /> Open in new tab
            </a>
          </div>
        )}
      </Modal>
    </div>
  );
}
