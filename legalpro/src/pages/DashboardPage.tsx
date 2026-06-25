import { LayoutDashboard, Briefcase, FolderPlus, CheckCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { PageHeader, KPICard, GlassCard, ChartCard } from '@/components/ui';
import { mockTasks, mockCases, mockInvoices, mockHearings, STORAGE_KEYS } from '@/data/mockData';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTheme } from '@/contexts/ThemeContext';
import type { Task, Case, Invoice, Hearing } from '@/types';

// ─── Chart Data ───

const courtDistributionData = [
  { name: 'District Court', value: 20 },
  { name: 'High Court', value: 16 },
  { name: 'Tribunals', value: 8 },
  { name: 'Supreme Court', value: 3 },
];

const THEME_CHART_COLORS = {
  light: ['#01696f', '#f59e0b', '#6366f1', '#e11d48'],
  dark: ['#6366F1', '#10B981', '#F59E0B', '#F43F5E'],
  gold: ['#D4A853', '#A8A8A8', '#CD7F32', '#6B4E1B'],
};

const THEME_ACCENT = {
  light: '#01696f',
  dark: '#6366F1',
  gold: '#D4A853',
};

const THEME_TOOLTIP = {
  light: { bg: '#FFFFFF', border: '#E9ECEF', label: '#172B4D', item: '#525F7F' },
  dark: { bg: '#1E293B', border: '#334155', label: '#F8FAFC', item: '#94A3B8' },
  gold: { bg: '#1A2332', border: '#2D3A4A', label: '#F5E6D3', item: '#B8A080' },
};

const THEME_AXIS_COLOR = {
  light: '#8898AA',
  dark: '#94A3B8',
  gold: '#7A6B5A',
};

const practiceAreaData = [
  { name: 'Civil', cases: 15 },
  { name: 'Criminal', cases: 12 },
  { name: 'Family', cases: 8 },
  { name: 'Corporate', cases: 6 },
  { name: 'IPR', cases: 4 },
  { name: 'Tax', cases: 2 },
];

// ─── 3D Pie Chart Component ───

function darkenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount);
  const b = Math.max(0, (num & 0x0000ff) - amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function Pie3DChart({ data, colors }: { data: { name: string; value: number }[]; colors: string[] }) {
  const cx = 150, cy = 110, rx = 110, ry = 70;
  const depth = 20;
  const total = data.reduce((sum, d) => sum + d.value, 0);

  // Build slices
  const slices: { startAngle: number; endAngle: number; color: string; darkColor: string }[] = [];
  let currentAngle = -Math.PI / 2; // start from top
  for (let i = 0; i < data.length; i++) {
    const sweepAngle = (data[i].value / total) * 2 * Math.PI;
    slices.push({
      startAngle: currentAngle,
      endAngle: currentAngle + sweepAngle,
      color: colors[i % colors.length],
      darkColor: darkenColor(colors[i % colors.length], 50),
    });
    currentAngle += sweepAngle;
  }

  function ellipsePoint(angle: number, yOffset = 0) {
    return {
      x: cx + rx * Math.cos(angle),
      y: cy + ry * Math.sin(angle) + yOffset,
    };
  }

  function slicePath(startAngle: number, endAngle: number, yOffset: number) {
    const start = ellipsePoint(startAngle, yOffset);
    const end = ellipsePoint(endAngle, yOffset);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    return `M${cx},${cy + yOffset} L${start.x},${start.y} A${rx},${ry} 0 ${largeArc} 1 ${end.x},${end.y} Z`;
  }

  function sidePath(startAngle: number, endAngle: number) {
    // Draw the 3D side (only for slices visible from bottom)
    const steps = 20;
    const angleStep = (endAngle - startAngle) / steps;
    let path = '';
    
    const topStart = ellipsePoint(startAngle, 0);
    const bottomStart = ellipsePoint(startAngle, depth);
    path += `M${topStart.x},${topStart.y} L${bottomStart.x},${bottomStart.y}`;
    
    for (let i = 0; i <= steps; i++) {
      const angle = startAngle + i * angleStep;
      const pt = ellipsePoint(angle, depth);
      path += ` L${pt.x},${pt.y}`;
    }
    
    for (let i = steps; i >= 0; i--) {
      const angle = startAngle + i * angleStep;
      const pt = ellipsePoint(angle, 0);
      path += ` L${pt.x},${pt.y}`;
    }
    
    path += ' Z';
    return path;
  }

  return (
    <div className="flex items-center justify-center" style={{ height: 250 }}>
      <svg viewBox="0 0 300 240" className="w-full h-full max-w-[300px]">
        {/* 3D sides (render back-facing slices first) */}
        {slices.map((slice, i) => {
          // Only render side for slices that face the viewer (bottom half)
          const midAngle = (slice.startAngle + slice.endAngle) / 2;
          if (Math.sin(midAngle) <= -0.3) return null; // skip slices facing away
          return (
            <path
              key={`side-${i}`}
              d={sidePath(slice.startAngle, slice.endAngle)}
              fill={slice.darkColor}
              stroke={slice.darkColor}
              strokeWidth="0.5"
            />
          );
        })}
        {/* Top face */}
        {slices.map((slice, i) => (
          <path
            key={`top-${i}`}
            d={slicePath(slice.startAngle, slice.endAngle, 0)}
            fill={slice.color}
            stroke="#ffffff"
            strokeWidth="1"
          />
        ))}
        {/* Highlight/shine on top */}
        <ellipse cx={cx - 20} cy={cy - 15} rx={30} ry={20} fill="rgba(255,255,255,0.15)" />
      </svg>
    </div>
  );
}

// ─── Priority Badge Helper ───

function getPriorityBadge(priority: string, status: string) {
  if (status === 'Completed') return <span className="badge badge-success">Done</span>;
  switch (priority) {
    case 'Urgent': return <span className="badge badge-danger">Urgent</span>;
    case 'Tomorrow': return <span className="badge badge-warning">Tomorrow</span>;
    case 'Upcoming': return <span className="badge badge-info">Upcoming</span>;
    default: return <span className="badge badge-neutral">{priority}</span>;
  }
}

export function DashboardPage() {
  const [tasks, { update: updateTask }] = useLocalStorage<Task>(STORAGE_KEYS.tasks, mockTasks);
  const [cases] = useLocalStorage<Case>(STORAGE_KEYS.cases, mockCases);
  const [invoices] = useLocalStorage<Invoice>(STORAGE_KEYS.invoices, mockInvoices);
  const [hearings] = useLocalStorage<Hearing>(STORAGE_KEYS.hearings, mockHearings);
  const { theme } = useTheme();

  const COURT_COLORS = THEME_CHART_COLORS[theme];
  const accentColor = THEME_ACCENT[theme];
  const tooltip = THEME_TOOLTIP[theme];
  const axisColor = THEME_AXIS_COLOR[theme];

  // Compute KPIs dynamically from localStorage
  const activeCases = cases.filter(c => c.status === 'Active').length;
  const totalCases = cases.length;
  const wonCases = cases.filter(c => c.status === 'Won').length;
  const winRate = totalCases > 0 ? Math.round((wonCases / totalCases) * 100) : 0;
  const closedCases = cases.filter(c => c.status === 'Won' || c.status === 'Lost' || c.status === 'Settled').length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + Number(i.amount), 0);

  // Today's hearings from localStorage
  const todayStr = new Date().toISOString().split('T')[0];
  const todayHearings = hearings.filter(h => h.date === todayStr);

  const toggleTask = (taskId: string, currentStatus: string) => {
    updateTask(taskId, { status: currentStatus === 'Completed' ? 'Pending' : 'Completed' } as Partial<Task>);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" icon={LayoutDashboard} showNewCase />

      {/* ── 5.1 KPI Section ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Total Active Cases"
          value={String(activeCases)}
          trend={`${totalCases} total cases`}
          trendUp={true}
          icon={Briefcase}
          accentColor={accentColor}
        />
        <KPICard
          title="Pending Tasks"
          value={String(pendingTasks)}
          trend={`${completedTasks} completed`}
          trendUp={false}
          icon={FolderPlus}
          accentColor="#10B981"
        />
        <KPICard
          title="Cases Closed"
          value={String(closedCases)}
          subtitle={`${wonCases} Won • ${cases.filter(c => c.status === 'Lost').length} Lost • ${cases.filter(c => c.status === 'Settled').length} Settled`}
          icon={CheckCircle}
          accentColor="#F59E0B"
        />
        <KPICard
          title="Win Rate"
          value={`${winRate}%`}
          trend={totalRevenue > 0 ? `₹${(totalRevenue / 100000).toFixed(1)}L revenue` : ''}
          trendUp={true}
          icon={TrendingUp}
          accentColor="#F43F5E"
        />
      </div>

      {/* ── 5.2 Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartCard title="Court-Wise Case Distribution" description="Active cases distributed across jurisdictions">
          <Pie3DChart data={courtDistributionData} colors={COURT_COLORS} />
          <div className="flex flex-wrap gap-4 mt-2 justify-center">
            {courtDistributionData.map((entry, i) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COURT_COLORS[i] }} />
                <span className="text-text-secondary">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Practice Area Breakdown" description="Case volume by legal specialization">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={practiceAreaData}>
              <defs>
                <linearGradient id="dashBarGold" x1="0" y1="0" x2="0.3" y2="1">
                  <stop offset="0%" stopColor="#F5E0A0" />
                  <stop offset="20%" stopColor="#E8C068" />
                  <stop offset="50%" stopColor="#D4A853" />
                  <stop offset="80%" stopColor="#B8860B" />
                  <stop offset="100%" stopColor="#8B6914" />
                </linearGradient>
                <linearGradient id="dashBarLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#01696f" />
                </linearGradient>
                <linearGradient id="dashBarDark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A5B4FC" />
                  <stop offset="100%" stopColor="#6366F1" />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: tooltip.bg, border: `1px solid ${tooltip.border}`, borderRadius: '8px' }}
                labelStyle={{ color: tooltip.label }}
                itemStyle={{ color: tooltip.item }}
              />
              <Bar dataKey="cases" fill={`url(#dashBar${theme === 'gold' ? 'Gold' : theme === 'dark' ? 'Dark' : 'Light'})`} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── 5.3 Tasks & Workflow ── */}
      <div className="mb-6">
        <GlassCard>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Tasks & Workflow</h3>
            <p className="text-sm text-text-secondary mt-1">Track daily tasks, deadlines, and e-filing status</p>
          </div>

          {/* Mini KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <div className="glass-card p-4">
              <p className="text-text-secondary text-xs">Daily Tasks</p>
              <p className="text-2xl font-bold text-text-primary">8</p>
              <p className="text-xs text-text-muted">5 of 8 completed</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-text-secondary text-xs">Overdue Tasks</p>
              <p className="text-2xl font-bold text-danger">3</p>
              <p className="text-xs text-danger">Requires immediate attention</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-text-secondary text-xs">Pending Filings</p>
              <p className="text-2xl font-bold text-text-primary">6</p>
              <p className="text-xs text-text-muted">Ready for e-Courts</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-text-secondary text-xs">Monthly Completion</p>
              <p className="text-2xl font-bold text-text-primary">87%</p>
              <div className="mt-1 w-full h-2 bg-bg-elevated rounded-full overflow-hidden">
                <div className="h-full bg-success rounded-full" style={{ width: '87%' }} />
              </div>
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-bg-elevated/50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={task.status === 'Completed'}
                  onChange={() => toggleTask(task.id, task.status)}
                  className="w-4 h-4 rounded border-border accent-accent-primary cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.status === 'Completed' ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                    {task.title}
                  </p>
                  <p className="text-xs text-text-muted">
                    Client: {task.clientName} • Due: {new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                {getPriorityBadge(task.priority, task.status)}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* ── 5.4 Performance + Client + Billing ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Performance Metrics */}
        <GlassCard>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Performance Metrics</h3>
            <p className="text-sm text-text-secondary mt-1">Key indicators for practice efficiency and success</p>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-secondary">Win Rate</span>
                <span className="text-text-primary font-medium">75%</span>
              </div>
              <div className="w-full h-2 bg-bg-elevated rounded-full overflow-hidden">
                <div className="h-full bg-success rounded-full" style={{ width: '75%' }} />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Avg Case Duration</span>
              <div className="text-right">
                <span className="text-sm font-medium text-text-primary">8.5 months</span>
                <p className="text-xs text-success">-12% from last year</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Client Retention</span>
              <span className="text-sm font-medium text-text-primary">92%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Referral Rate</span>
              <span className="text-sm font-medium text-text-primary">45%</span>
            </div>
          </div>
        </GlassCard>

        {/* Client Management */}
        <GlassCard>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Client Management</h3>
            <p className="text-sm text-text-secondary mt-1">Client portfolio overview with communication tracking</p>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Active Clients</span>
              <div className="text-right">
                <span className="text-sm font-medium text-text-primary">28</span>
                <p className="text-xs text-success">↑ +4 this month</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">New Clients</span>
              <div className="text-right">
                <span className="text-sm font-medium text-text-primary">7</span>
                <p className="text-xs text-text-muted">This month</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Unread Messages</span>
              <span className="text-sm font-medium text-warning">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Client Satisfaction NPS</span>
              <span className="text-sm font-medium text-text-primary">9.2/10</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Payment Pending</span>
              <span className="text-sm font-medium text-warning">₹2,45,000</span>
            </div>
          </div>
        </GlassCard>

        {/* Billing & Finances */}
        <GlassCard>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Billing & Finances</h3>
            <p className="text-sm text-text-secondary mt-1">Revenue tracking, invoicing, and expense management</p>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Total Earnings</span>
              <div className="text-right">
                <span className="text-sm font-medium text-text-primary">₹12.8L</span>
                <p className="text-xs text-success">↑ +18% MoM</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Outstanding</span>
              <div className="text-right">
                <span className="text-sm font-medium text-warning">₹2.4L</span>
                <p className="text-xs text-text-muted">8 invoices</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Fees Collected (Feb)</span>
              <span className="text-sm font-medium text-text-primary">₹3,85,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Monthly Expenses</span>
              <span className="text-sm font-medium text-text-primary">₹1,25,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Net Profit (Feb)</span>
              <span className="text-sm font-medium text-success">₹2,60,000</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* ── 5.5 Today's Hearings ── */}
      <div className="mb-6">
        <GlassCard>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Today's Hearings</h3>
            <p className="text-sm text-text-secondary mt-1">Scheduled court appearances with bench details</p>
          </div>
          <div className="space-y-3">
            {todayHearings.length > 0 ? (
              todayHearings.map((hearing) => (
                <div key={hearing.id} className="flex items-start gap-4 p-4 rounded-lg bg-bg-elevated/30 border border-border/50">
                  <div className="text-center min-w-[70px]">
                    <p className="text-sm font-bold" style={{ color: '#F43F5E' }}>{hearing.time}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">
                      {hearing.caseNumber} — {hearing.caseTitle}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      {hearing.courtName}{hearing.benchInfo ? ` • ${hearing.benchInfo}` : ''}
                    </p>
                  </div>
                  <span className="badge badge-info">Scheduled</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-text-muted text-center py-4">No hearings scheduled for today.</p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
