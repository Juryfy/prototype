import { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Clock, FileBarChart } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PageHeader, GlassCard, KPICard, TabBar, ChartCard } from '@/components/ui';

import type { PieLabelRenderProps } from 'recharts';

const tabs = [
  { key: 'performance', label: 'Performance' },
  { key: 'financial', label: 'Financial' },
  { key: 'case-analysis', label: 'Case Analysis' },
];

const practiceAreaData = [
  { area: 'Civil', cases: 18, winRate: '72%', avgDuration: '10 mo', revenue: '₹8.2L', trend: '↑' },
  { area: 'Criminal', cases: 12, winRate: '68%', avgDuration: '8 mo', revenue: '₹5.4L', trend: '↑' },
  { area: 'Family', cases: 8, winRate: '80%', avgDuration: '12 mo', revenue: '₹3.8L', trend: '→' },
  { area: 'Corporate', cases: 5, winRate: '85%', avgDuration: '6 mo', revenue: '₹6.5L', trend: '↑' },
  { area: 'IPR', cases: 3, winRate: '67%', avgDuration: '14 mo', revenue: '₹2.1L', trend: '→' },
  { area: 'Taxation', cases: 1, winRate: '100%', avgDuration: '4 mo', revenue: '₹1.2L', trend: '↑' },
];

const referralData = [
  { name: 'Client Referrals', value: 45, color: '#6366F1' },
  { name: 'Bar Network', value: 30, color: '#10B981' },
  { name: 'Direct Inquiry', value: 20, color: '#F59E0B' },
  { name: 'Online', value: 5, color: '#F43F5E' },
];

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState('performance');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <PageHeader title="Reports" icon={BarChart3} />
        <button className="gradient-btn flex items-center gap-2 px-4 py-2 text-sm font-medium">
          <FileBarChart className="w-4 h-4" /> Generate Report
        </button>
      </div>

      <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Cases Per Month" value="7.8" trend="Above average" trendUp icon={BarChart3} />
            <KPICard title="Revenue per Case" value="₹65K" trend="Consistent" icon={DollarSign} />
            <KPICard title="Monthly Growth" value="+18%" trend="↑ Strong growth" trendUp icon={TrendingUp} />
            <KPICard title="Time to Closure" value="8.5 mo" subtitle="Average case duration" icon={Clock} />
          </div>

          {/* Practice Area Performance Table */}
          <GlassCard>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Practice Area Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-text-secondary font-medium">Practice Area</th>
                    <th className="px-4 py-3 text-left text-text-secondary font-medium">Cases</th>
                    <th className="px-4 py-3 text-left text-text-secondary font-medium">Win Rate</th>
                    <th className="px-4 py-3 text-left text-text-secondary font-medium">Avg Duration</th>
                    <th className="px-4 py-3 text-left text-text-secondary font-medium">Revenue</th>
                    <th className="px-4 py-3 text-left text-text-secondary font-medium">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {practiceAreaData.map((row, i) => (
                    <tr key={row.area} className={`border-b border-border/50 ${i % 2 === 1 ? 'bg-bg-card/30' : ''}`}>
                      <td className="px-4 py-3 text-text-primary font-medium">{row.area}</td>
                      <td className="px-4 py-3 text-text-primary">{row.cases}</td>
                      <td className="px-4 py-3 text-success">{row.winRate}</td>
                      <td className="px-4 py-3 text-text-secondary">{row.avgDuration}</td>
                      <td className="px-4 py-3 text-text-primary">{row.revenue}</td>
                      <td className="px-4 py-3 text-success">{row.trend}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>

          {/* Referral Source Analysis */}
          <ChartCard title="Referral Source Analysis" description="Where your clients come from">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={referralData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={(props: PieLabelRenderProps) => `${props.name} ${props.value}%`}>
                  {referralData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1E293B', borderRadius: 12, color: '#F8FAFC' }} formatter={(value) => [`${value}%`, 'Share']} />
                <Legend wrapperStyle={{ color: '#94A3B8', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {activeTab === 'financial' && (
        <GlassCard>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Financial Reports</h3>
          <p className="text-text-secondary text-sm">Detailed financial analytics and revenue breakdowns coming soon.</p>
        </GlassCard>
      )}

      {activeTab === 'case-analysis' && (
        <GlassCard>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Case Analysis</h3>
          <p className="text-text-secondary text-sm">In-depth case outcome analysis and trends coming soon.</p>
        </GlassCard>
      )}
    </div>
  );
}