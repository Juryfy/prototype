import { Calendar, Clock } from 'lucide-react';
import { PageHeader, GlassCard, StatusBadge } from '@/components/ui';
import { mockHearings, mockDeadlines } from '@/data/mockData';

// February 2026 calendar data
const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS_IN_FEB_2026 = 28;
// Feb 1, 2026 is a Sunday → offset = 6 (Mon=0 ... Sun=6)
const FIRST_DAY_OFFSET = 6;
const HEARING_DATES = [12, 14, 15, 18];
const CURRENT_DATE = 12;

function buildCalendarGrid(): (number | null)[][] {
  const cells: (number | null)[] = [];
  // Leading empty cells
  for (let i = 0; i < FIRST_DAY_OFFSET; i++) cells.push(null);
  for (let d = 1; d <= DAYS_IN_FEB_2026; d++) cells.push(d);
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);
  // Split into weeks
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

function formatHearingDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getDaysRemaining(dueDate: string): number {
  const now = new Date('2026-02-12');
  const due = new Date(dueDate);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function CalendarPage() {
  const weeks = buildCalendarGrid();

  return (
    <div className="space-y-6">
      <PageHeader title="Calendar" icon={Calendar} />

      {/* Monthly Calendar */}
      <GlassCard>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Calendar &amp; Deadlines</h2>
          <p className="text-sm text-text-secondary">Monthly view with hearing dates and critical filing deadlines</p>
        </div>

        <div className="mb-2">
          <h3 className="text-base font-semibold text-text-primary text-center">February 2026</h3>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAY_HEADERS.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-text-muted py-2">{d}</div>
          ))}
        </div>

        {/* Date cells */}
        <div className="grid grid-cols-7 gap-1">
          {weeks.flat().map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} className="aspect-square" />;
            const hasHearing = HEARING_DATES.includes(day);
            const isToday = day === CURRENT_DATE;

            let bgClass = 'hover:bg-bg-elevated/60';
            if (isToday) bgClass = 'bg-danger/30';
            else if (hasHearing) bgClass = 'bg-accent-primary/20';

            return (
              <button
                key={day}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center relative transition-colors ${bgClass}`}
              >
                <span className={`text-sm ${isToday ? 'font-bold text-danger' : 'text-text-primary'}`}>{day}</span>
                {hasHearing && (
                  <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isToday ? 'bg-danger' : 'bg-accent-primary'}`} />
                )}
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Upcoming Hearings + Critical Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Hearings */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-accent-primary" />
            <h2 className="text-lg font-semibold text-text-primary">Upcoming Hearings (Next 7 Days)</h2>
          </div>
          <p className="text-sm text-text-secondary mb-4">Week-ahead schedule with court details and case information</p>

          <div className="space-y-3">
            {mockHearings.map((h) => {
              const isToday = h.date === '2026-02-12';
              return (
                <div key={h.id} className="flex items-start gap-3 p-3 rounded-xl bg-bg-elevated/50">
                  <div className="shrink-0 w-14 text-center">
                    <p className="text-xs font-bold text-accent-primary">{formatHearingDate(h.date)}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">{h.caseNumber} — {h.caseTitle}</p>
                    <p className="text-xs text-text-secondary">{h.courtName} • {h.time}</p>
                  </div>
                  <StatusBadge status={isToday ? 'Today' : 'Upcoming'} variant={isToday ? 'danger' : 'info'} />
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Critical Deadlines */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-5 h-5 text-danger" />
            <h2 className="text-lg font-semibold text-text-primary">Critical Deadlines</h2>
          </div>
          <p className="text-sm text-text-secondary mb-4">Time-sensitive alerts for limitation periods and filing requirements</p>

          <div className="space-y-3">
            {mockDeadlines.map((dl) => {
              const daysLeft = getDaysRemaining(dl.dueDate);
              const isUrgent = daysLeft <= 7;
              return (
                <div key={dl.id} className="flex items-start gap-3 p-3 rounded-xl bg-bg-elevated/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">{dl.title}</p>
                    <p className="text-xs text-text-secondary">{dl.description}</p>
                  </div>
                  <StatusBadge
                    status={`${daysLeft}d left`}
                    variant={isUrgent ? 'danger' : 'info'}
                  />
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
