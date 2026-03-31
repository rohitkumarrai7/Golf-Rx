'use client';

import { motion } from 'framer-motion';
import { Users, Trophy, Heart, Wallet, TrendingUp, BarChart3 } from 'lucide-react';
import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';

export default function AdminOverviewPage() {
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/reports')
      .then(res => res.json())
      .then(data => {
        setReports(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500" />
      </div>
    );
  }

  const stats = [
    { label: 'Total Users', value: reports?.total_users || 0, icon: Users, color: 'bg-blue-50 text-blue-500' },
    { label: 'Active Subscribers', value: reports?.active_subscribers || 0, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-500' },
    { label: 'Total Prize Pool', value: formatCurrency(reports?.total_prize_pool || 0), icon: Trophy, color: 'bg-amber-50 text-amber-500' },
    { label: 'Charity Donations', value: formatCurrency(reports?.total_charity_donations || 0), icon: Heart, color: 'bg-rose-50 text-rose-500' },
    { label: 'Total Draws', value: reports?.total_draws || 0, icon: BarChart3, color: 'bg-purple-50 text-purple-500' },
    { label: 'Total Payouts', value: formatCurrency(reports?.total_payouts || 0), icon: Wallet, color: 'bg-indigo-50 text-indigo-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of platform statistics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charity breakdown */}
      {reports?.charity_totals && reports.charity_totals.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Charity Contributions</h2>
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Charity</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Total Donated</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Supporters</th>
                </tr>
              </thead>
              <tbody>
                {reports.charity_totals.map((ct: any) => (
                  <tr key={ct.charity_id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{ct.charity_name || ct.charity_id}</td>
                    <td className="px-4 py-3 text-sm text-right text-slate-600">{formatCurrency(ct.total || 0)}</td>
                    <td className="px-4 py-3 text-sm text-right text-slate-600">{ct.count || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
