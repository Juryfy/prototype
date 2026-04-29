import { useState } from 'react';
import { ShieldCheck, CheckCircle2, Award, Calendar, BookOpen } from 'lucide-react';
import { PageHeader, GlassCard, StatusBadge } from '@/components/ui';
import { mockComplianceItems } from '@/data/mockData';

const statusCards = [
  { title: 'Bar Council Enrollment', status: 'Active', detail: 'Registration: D/2345/2010', sub: 'Next renewal: Sep 2026', color: 'text-success' },
  { title: 'CLE Credits', status: '18/20', detail: 'Continuing Legal Education', sub: '2 credits remaining', color: 'text-warning', progress: 90 },
  { title: 'Professional Insurance', status: 'Active', detail: 'Professional Indemnity Insurance', sub: 'Expires: Aug 2026', color: 'text-success' },
  { title: 'GST Filing', status: 'Current', detail: 'GST Registration Active', sub: 'Last filed: Jan 2026', color: 'text-success' },
];

const milestones = [
  { label: 'Years of Practice', value: '16', icon: Award },
  { label: 'Total Cases Handled', value: '487', icon: BookOpen },
  { label: 'Notable Wins', value: '12', icon: CheckCircle2 },
  { label: 'Client Satisfaction', value: '4.8/5', icon: Award },
];

const upcomingEvents = [
  { title: 'Workshop on CPC Amendments', org: 'Delhi Bar Association', date: 'Feb 18, 2026', credits: '2 CLE', action: 'Register' },
  { title: 'Seminar on Arbitration Law', org: 'ICADR', date: 'Feb 25, 2026', credits: '3 CLE', action: 'Register' },
  { title: 'Annual Bar Council Meeting', org: 'Bar Council of Delhi', date: 'Mar 5, 2026', credits: '', action: 'Scheduled' },
];

export function CompliancePage() {
  const [checklist, setChecklist] = useState(mockComplianceItems.map((c) => ({ ...c, checked: c.status === 'Done' || c.status === 'Active' })));

  function toggleItem(id: string) {
    setChecklist((prev) => prev.map((c) => c.id === id ? { ...c, checked: !c.checked } : c));
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Compliance" icon={ShieldCheck} />

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusCards.map((card) => (
          <GlassCard key={card.title} hover>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-text-secondary">{card.title}</h3>
                <span className={`text-sm font-bold ${card.color}`}>{card.status}</span>
              </div>
              <p className="text-xs text-text-muted">{card.detail}</p>
              {card.progress !== undefined && (
                <div className="w-full h-2 bg-bg-elevated rounded-full overflow-hidden">
                  <div className="h-full bg-accent-primary rounded-full transition-all" style={{ width: `${card.progress}%` }} />
                </div>
              )}
              <p className="text-xs text-text-muted">{card.sub}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Compliance Checklist */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Compliance Checklist</h3>
        <div className="space-y-3">
          {checklist.map((item) => (
            <div key={item.id} className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => toggleItem(item.id)}
                className="mt-1 w-4 h-4 rounded border-border accent-accent-primary"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-text-primary font-medium text-sm">{item.title}</span>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-xs text-text-muted mt-1">{item.details}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Career Milestones */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Career Milestones</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {milestones.map((m) => (
            <div key={m.label} className="text-center p-4 rounded-xl bg-bg-elevated/50">
              <m.icon className="w-6 h-6 text-accent-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-text-primary">{m.value}</p>
              <p className="text-xs text-text-secondary mt-1">{m.label}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Upcoming Events */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-accent-primary" />
          Upcoming Bar Events &amp; CLE
        </h3>
        <div className="space-y-3">
          {upcomingEvents.map((ev) => (
            <div key={ev.title} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0 flex-wrap gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-text-primary font-medium text-sm">{ev.title}</p>
                <p className="text-xs text-text-muted">{ev.org} • {ev.date}{ev.credits ? ` • ${ev.credits}` : ''}</p>
              </div>
              <button className={`px-3 py-1 rounded-lg text-xs font-medium ${ev.action === 'Register' ? 'gradient-btn' : 'bg-bg-elevated text-text-secondary'}`}>
                {ev.action}
              </button>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}