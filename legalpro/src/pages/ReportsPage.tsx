import { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Clock, FileBarChart } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PageHeader, GlassCard, KPICard, TabBar, ChartCard } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { theme } = useTheme();

  const tooltipStyle = {
    background: theme === 'gold' ? '#1A2332' : theme === 'dark' ? '#1E293B' : '#FFFFFF',
    border: `1px solid ${theme === 'gold' ? '#2D3A4A' : theme === 'dark' ? '#334155' : '#E9ECEF'}`,
    borderRadius: 12,
    color: theme === 'gold' ? '#F5E6D3' : theme === 'dark' ? '#F8FAFC' : '#172B4D',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <PageHeader title="Reports" icon={BarChart3} />
        <button
          onClick={() => {
            const report = `PRACTICE PERFORMANCE REPORT\n${'='.repeat(35)}\nGenerated: ${new Date().toLocaleDateString()}\n\nKPIs:\n• Cases Per Month: 7.8\n• Revenue per Case: ₹65K\n• Monthly Growth: +18%\n• Time to Closure: 8.5 months\n\nPractice Area Performance:\n• Civil: 18 cases, 72% win rate, ₹8.2L revenue\n• Criminal: 12 cases, 68% win rate, ₹5.4L revenue\n• Family: 8 cases, 80% win rate, ₹3.8L revenue\n• Corporate: 5 cases, 85% win rate, ₹6.5L revenue\n• IPR: 3 cases, 67% win rate, ₹2.1L revenue\n• Taxation: 1 case, 100% win rate, ₹1.2L revenue\n\nReferral Sources:\n• Client Referrals: 45%\n• Bar Network: 30%\n• Direct Inquiry: 20%\n• Online: 5%`;
            const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'practice-performance-report.txt';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }}
          className="gradient-btn flex items-center gap-2 px-4 py-2 text-sm font-medium"
        >
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
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value}%`, 'Share']} />
                <Legend wrapperStyle={{ color: '#94A3B8', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {activeTab === 'financial' && (
        <GlassCard>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Financial Reports</h3>
          <p className="text-sm text-text-secondary mb-4">Revenue analysis, expense tracking, and billing insights.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-bg-elevated rounded-xl text-center">
              <p className="text-2xl font-bold text-accent-primary">₹12.5L</p>
              <p className="text-xs text-text-secondary mt-1">Total Revenue (YTD)</p>
            </div>
            <div className="p-4 bg-bg-elevated rounded-xl text-center">
              <p className="text-2xl font-bold text-success">₹8.2L</p>
              <p className="text-xs text-text-secondary mt-1">Collected</p>
            </div>
            <div className="p-4 bg-bg-elevated rounded-xl text-center">
              <p className="text-2xl font-bold text-warning">₹4.3L</p>
              <p className="text-xs text-text-secondary mt-1">Outstanding</p>
            </div>
          </div>
        </GlassCard>
      )}

      {activeTab === 'case-analysis' && (
        <GlassCard>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Case Analysis Reports</h3>
          <p className="text-sm text-text-secondary mb-4">Win/loss trends, practice area breakdown, and duration analysis.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-bg-elevated rounded-xl text-center">
              <p className="text-2xl font-bold text-success">72%</p>
              <p className="text-xs text-text-secondary mt-1">Overall Win Rate</p>
            </div>
            <div className="p-4 bg-bg-elevated rounded-xl text-center">
              <p className="text-2xl font-bold text-accent-primary">47</p>
              <p className="text-xs text-text-secondary mt-1">Total Cases Analyzed</p>
            </div>
            <div className="p-4 bg-bg-elevated rounded-xl text-center">
              <p className="text-2xl font-bold text-text-primary">8.5</p>
              <p className="text-xs text-text-secondary mt-1">Avg. Duration (months)</p>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}