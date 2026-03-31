'use client';

import { motion } from 'framer-motion';
import { BarChart3, Users, Trophy, Heart, Wallet, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';

export default function AdminReportsPage() {
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
    { label: 'Prize Pool', value: formatCurrency(reports?.total_prize_pool || 0), icon: Trophy, color: 'bg-amber-50 text-amber-500' },
    { label: 'Charity Donations', value: formatCurrency(reports?.total_charity_donations || 0), icon: Heart, color: 'bg-rose-50 text-rose-500' },
    { label: 'Total Draws', value: reports?.total_draws || 0, icon: BarChart3, color: 'bg-purple-50 text-purple-500' },
    { label: 'Total Payouts', value: formatCurrency(reports?.total_payouts || 0), icon: Wallet, color: 'bg-indigo-50 text-indigo-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-purple-500" /> Reports & Analytics
        </h1>
        <p className="text-slate-500 mt-1">Platform-wide statistics and insights.</p>
      </div>

      {/* Stats Grid */}
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

      {/* Charity Breakdown */}
      {reports?.charity_totals && reports.charity_totals.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Charity Contribution Breakdown</h2>
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Charity</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Total Donated</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Supporters</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Share</th>
                </tr>
              </thead>
              <tbody>
                {reports.charity_totals.map((ct: any) => {
                  const totalDonations = reports.total_charity_donations || 1;
                  const share = ((ct.total / totalDonations) * 100).toFixed(1);
                  return (
                    <tr key={ct.charity_id} className="border-b border-slate-50 last:border-0">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{ct.charity_name}</td>
                      <td className="px-4 py-3 text-sm text-right text-slate-600">{formatCurrency(ct.total)}</td>
                      <td className="px-4 py-3 text-sm text-right text-slate-600">{ct.count}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${share}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 w-10 text-right">{share}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Card */}
      <Card>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Platform Summary</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-500">Conversion Rate</p>
            <p className="text-lg font-bold text-slate-900">
              {reports?.total_users
                ? `${(((reports?.active_subscribers || 0) / reports.total_users) * 100).toFixed(1)}%`
                : '0%'}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Avg Revenue per User</p>
            <p className="text-lg font-bold text-slate-900">
              {reports?.active_subscribers
                ? formatCurrency(9.99)
                : formatCurrency(0)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
