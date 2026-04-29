import { UserSearch, User, CheckCircle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line,
} from 'recharts';
import { PageHeader, GlassCard } from '@/components/ui';

/* ── Mock chart data ── */

const caseDurationData = [
  { month: 'Jul', months: 11 },
  { month: 'Aug', months: 13 },
  { month: 'Sep', months: 12.5 },
  { month: 'Oct', months: 15 },
  { month: 'Nov', months: 14 },
  { month: 'Dec', months: 14.2 },
];

const decisionSpeedData = [
  { type: 'Commercial', days: 42 },
  { type: 'Criminal', days: 28 },
  { type: 'Civil', days: 55 },
  { type: 'Family', days: 35 },
];

const counselWinLossData = [
  { name: 'Wins', value: 28 },
  { name: 'Losses', value: 64 },
  { name: 'Settled', value: 8 },
];
const counselColors = ['#10B981', '#F43F5E', '#F59E0B'];

/* ── Pill badge helper ── */
function Pill({ label, color = 'bg-accent-primary/20 text-accent-hover' }: { label: string; color?: string }) {
  return <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>{label}</span>;
}

/* ── Circular indicator ── */
function CircularIndicator({ value, size = 80, color = '#6366F1' }: { value: number; size?: number; color?: string }) {
  return (
    <div
      className="rounded-full border-4 flex items-center justify-center font-bold"
      style={{ width: size, height: size, borderColor: color, color }}
    >
      {value}%
    </div>
  );
}

/* ── Progress bar ── */
function ProgressBar({ label, value, color = 'bg-accent-primary' }: { label: string; value: number; color?: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-text-secondary">{label}</span>
        <span className="text-text-primary font-medium">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-bg-elevated">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function ProfilingPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Intelligent Profiling" icon={UserSearch} />

      {/* Section title */}
      <div>
        <h2 className="text-2xl font-bold gradient-text">Intelligent Profiling</h2>
        <p className="text-text-secondary text-sm mt-1">
          Gain strategic advantage with AI-powered behavioral analytics
        </p>
      </div>

      {/* Two side-by-side cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── LEFT: Judge Behavior Analytics ── */}
        <GlassCard>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Judge Behavior Analytics</h3>

          {/* Judge avatar + info */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-full bg-bg-elevated flex items-center justify-center">
              <User className="w-7 h-7 text-text-muted" />
            </div>
            <div>
              <p className="font-semibold text-text-primary">Justice Rajesh Kumar</p>
              <p className="text-sm text-text-secondary">Delhi High Court</p>
            </div>
          </div>

          {/* Win Rate Tendency */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-text-secondary mb-3">Win Rate Tendency</h4>
            <div className="flex items-start gap-6">
              <div className="flex-1 space-y-3">
                <ProgressBar label="Defendant" value={46} color="bg-accent-primary" />
                <ProgressBar label="Plaintiff" value={33} color="bg-purple-500" />
              </div>
              <div className="flex-shrink-0">
                <CircularIndicator value={68} size={72} color="#6366F1" />
                <p className="text-[10px] text-text-muted text-center mt-1">Overall</p>
              </div>
            </div>
          </div>

          {/* Bail Range Case Duration */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-text-secondary mb-1">Bail Range Case Duration</h4>
            <p className="text-2xl font-bold text-text-primary mb-2">14.2 <span className="text-sm font-normal text-text-muted">months</span></p>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={caseDurationData}>
                  <Line type="monotone" dataKey="months" stroke="#6366F1" strokeWidth={2} dot={{ r: 3, fill: '#6366F1' }} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1E293B', border: 'none', borderRadius: 8, fontSize: 12 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Preferred Arguments */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-text-secondary mb-2">Preferred Arguments</h4>
            <div className="flex flex-wrap gap-2">
              <Pill label="Prosecutorial grounds" color="bg-accent-primary/20 text-accent-hover" />
              <Pill label="Evidence-focused" color="bg-purple-500/20 text-purple-400" />
            </div>
          </div>

          {/* Decision Speed by Case Type */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-text-secondary mb-2">Decision Speed by Case Type</h4>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={decisionSpeedData}>
                  <XAxis dataKey="type" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1E293B', border: 'none', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="days" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tactical Insight */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
            <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
            <p className="text-xs text-text-primary">
              Judge tends to grant interim relief in 72% of commercial disputes
            </p>
          </div>
        </GlassCard>

        {/* ── RIGHT: Opposing Counsel Intelligence ── */}
        <GlassCard>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Opposing Counsel Intelligence</h3>

          {/* Counsel avatar + info */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full bg-bg-elevated flex items-center justify-center">
              <User className="w-7 h-7 text-text-muted" />
            </div>
            <div>
              <p className="font-semibold text-text-primary">Adv. Priya Sharma</p>
              <div className="flex flex-wrap gap-1 mt-1">
                <Pill label="Corporate Law" color="bg-accent-primary/20 text-accent-hover" />
                <Pill label="Arbitration" color="bg-purple-500/20 text-purple-400" />
              </div>
            </div>
          </div>

          {/* Win/Loss Ratio */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-text-secondary mb-2">Win/Loss Ratio</h4>
            <div className="flex items-center gap-4">
              <div className="relative h-36 w-36">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={counselWinLossData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {counselWinLossData.map((_, i) => (
                        <Cell key={i} fill={counselColors[i]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1E293B', border: 'none', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-text-primary">28%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-success" />
                  <span className="text-xs text-text-secondary">Wins 28%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-danger" />
                  <span className="text-xs text-text-secondary">Losses 64%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-warning" />
                  <span className="text-xs text-text-secondary">Settled 8%</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  <Pill label="Corporate Law" color="bg-accent-primary/15 text-accent-hover" />
                  <Pill label="Litigation" color="bg-purple-500/15 text-purple-400" />
                  <Pill label="#5 settled" color="bg-warning/15 text-warning" />
                </div>
              </div>
            </div>
          </div>

          {/* Strategy Pattern */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-text-secondary mb-2">Strategy Pattern</h4>
            <div className="flex flex-wrap gap-2">
              <Pill label="Delay tactic: Adj." color="bg-danger/15 text-danger" />
              <Pill label="Delay tactic: Ext." color="bg-warning/15 text-warning" />
              <Pill label="# Motion heavy: Net" color="bg-accent-primary/15 text-accent-hover" />
            </div>
          </div>

          {/* Tactical Insights */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-text-secondary mb-2">Tactical Insights</h4>
            <ul className="space-y-2 text-xs text-text-primary">
              <li className="flex items-start gap-2">
                <span className="text-warning mt-0.5">•</span>
                Weak in cross-examination of technical witnesses — exploit with expert testimony
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning mt-0.5">•</span>
                Tends to settle when litigation costs exceed ₹5L — push for early cost escalation
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning mt-0.5">•</span>
                Lost 3 of last 5 arbitration cases — arbitration clause may be advantageous
              </li>
            </ul>
          </div>

          {/* Your Advantage Score */}
          <div>
            <h4 className="text-sm font-medium text-text-secondary mb-3">Your Advantage Score</h4>
            <div className="flex items-center gap-4">
              <CircularIndicator value={72} size={80} color="#10B981" />
              <p className="text-xs text-text-muted">
                Based on historical performance, strategy patterns, and case type alignment
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
