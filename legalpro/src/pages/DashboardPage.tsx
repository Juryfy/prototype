import { LayoutDashboard, Briefcase, FolderPlus, CheckCircle, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { PageHeader, KPICard, GlassCard, ChartCard } from '@/components/ui';
import { mockTasks, mockCases, STORAGE_KEYS } from '@/data/mockData';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { Task } from '@/types';

// ─── Chart Data ───

const courtDistributionData = [
  { name: 'District Court', value: 20 },
  { name: 'High Court', value: 16 },
  { name: 'Tribunals', value: 8 },
  { name: 'Supreme Court', value: 3 },
];
const COURT_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#F43F5E'];

const practiceAreaData = [
  { name: 'Civil', cases: 15 },
  { name: 'Criminal', cases: 12 },
  { name: 'Family', cases: 8 },
  { name: 'Corporate', cases: 6 },
  { name: 'IPR', cases: 4 },
  { name: 'Tax', cases: 2 },
];

// ─── Mock Hearings for Today (Feb 12) ───

const todayHearings = [
  {
    id: 'th-1',
    time: '10:30 AM',
    caseNumber: 'CC/2345/2025',
    type: 'Civil',
    description: 'Property Dispute',
    court: 'Delhi High Court',
    bench: 'Justice K.K. Sharma',
  },
  {
    id: 'th-2',
    time: '02:00 PM',
    caseNumber: 'CR/789/2025',
    type: 'Criminal',
    description: 'Bail Application',
    court: 'District Court',
    bench: 'Judge R.S. Verma',
  },
  {
    id: 'th-3',
    time: '03:30 PM',
    caseNumber: 'FC/1892/2025',
    type: 'Family',
    description: 'Divorce Petition',
    court: 'Tis Hazari Court',
    bench: 'Judge S.P. Gupta',
  },
];

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

  // Read case data from localStorage (available for dynamic KPI computation)
  const storedCases = (() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.cases);
      return raw ? (JSON.parse(raw) as typeof mockCases) : mockCases;
    } catch { return mockCases; }
  })();
  const activeCaseCount = storedCases.filter((c) => c.status === 'Active').length;

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
          value={String(activeCaseCount)}
          trend="↑ +8.3% from last month"
          trendUp={true}
          icon={Briefcase}
          accentColor="#6366F1"
        />
        <KPICard
          title="New Cases This Month"
          value="12"
          trend="↑ +3 from January"
          trendUp={true}
          icon={FolderPlus}
          accentColor="#10B981"
        />
        <KPICard
          title="Cases Closed This Month"
          value="8"
          subtitle="6 Won • 1 Lost • 1 Settled"
          icon={CheckCircle}
          accentColor="#F59E0B"
        />
        <KPICard
          title="Win Rate"
          value="75%"
          trend="↑ +5% this month"
          trendUp={true}
          icon={TrendingUp}
          accentColor="#F43F5E"
        />
      </div>

      {/* ── 5.2 Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartCard title="Court-Wise Case Distribution" description="Active cases distributed across jurisdictions">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={courtDistributionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                paddingAngle={2}
              >
                {courtDistributionData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COURT_COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#F8FAFC' }}
                itemStyle={{ color: '#94A3B8' }}
              />
            </PieChart>
          </ResponsiveContainer>
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
              <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#F8FAFC' }}
                itemStyle={{ color: '#94A3B8' }}
              />
              <Bar dataKey="cases" fill="#6366F1" radius={[4, 4, 0, 0]} />
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
            {todayHearings.map((hearing) => (
              <div key={hearing.id} className="flex items-start gap-4 p-4 rounded-lg bg-bg-elevated/30 border border-border/50">
                <div className="text-center min-w-[70px]">
                  <p className="text-sm font-bold" style={{ color: '#F43F5E' }}>{hearing.time}</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">
                    {hearing.type} Case {hearing.caseNumber}
                  </p>
                  <p className="text-sm text-text-secondary">{hearing.description}</p>
                  <p className="text-xs text-text-muted mt-1">
                    {hearing.court} • {hearing.bench}
                  </p>
                </div>
                <span className="badge badge-info">Scheduled</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
