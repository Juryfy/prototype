import { useState } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, getDaysInMonth as dfnsGetDaysInMonth, getDay, startOfMonth, addMonths, subMonths, isSameMonth, differenceInDays } from 'date-fns';
import { PageHeader, GlassCard, StatusBadge } from '@/components/ui';
import { mockHearings, mockDeadlines, STORAGE_KEYS } from '@/data/mockData';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { Hearing } from '@/types';

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getFirstDayOffset(date: Date): number {
  const day = getDay(startOfMonth(date));
  return day === 0 ? 6 : day - 1; // Adjust for Monday start
}

function buildCalendarGrid(date: Date): (number | null)[][] {
  const daysInMonth = dfnsGetDaysInMonth(date);
  const firstDayOffset = getFirstDayOffset(date);
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

function formatHearingDate(dateStr: string): string {
  return format(new Date(dateStr), 'MMM d');
}

function formatMonthYear(date: Date): string {
  return format(date, 'MMMM yyyy');
}

export function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date();
  const [hearings] = useLocalStorage<Hearing>(STORAGE_KEYS.hearings, mockHearings);

  const weeks = buildCalendarGrid(currentMonth);

  // Get hearing dates for the current displayed month
  const hearingDatesInMonth = hearings
    .filter(h => {
      const hDate = new Date(h.date);
      return hDate.getFullYear() === currentMonth.getFullYear() &&
             hDate.getMonth() === currentMonth.getMonth();
    })
    .map(h => new Date(h.date).getDate());

  const isCurrentMonth = isSameMonth(today, currentMonth);

  const goToPrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  function getDaysRemaining(dueDate: string): number {
    return differenceInDays(new Date(dueDate), new Date());
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Calendar" icon={Calendar} />

      {/* Monthly Calendar */}
      <GlassCard>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Calendar &amp; Deadlines</h2>
          <p className="text-sm text-text-secondary">Monthly view with hearing dates and critical filing deadlines</p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={goToPrevMonth}
            className="p-2 rounded-lg hover:bg-bg-elevated/60 transition-colors text-text-secondary hover:text-text-primary"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-base font-semibold text-text-primary">{formatMonthYear(currentMonth)}</h3>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg hover:bg-bg-elevated/60 transition-colors text-text-secondary hover:text-text-primary"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
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
            const hasHearing = hearingDatesInMonth.includes(day);
            const isToday = isCurrentMonth && day === today.getDate();

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
            {hearings.map((h) => {
              const todayStr = today.toISOString().split('T')[0];
              const isHearingToday = h.date === todayStr;
              return (
                <div key={h.id} className="flex items-start gap-3 p-3 rounded-xl bg-bg-elevated/50">
                  <div className="shrink-0 w-14 text-center">
                    <p className="text-xs font-bold text-accent-primary">{formatHearingDate(h.date)}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">{h.caseNumber} — {h.caseTitle}</p>
                    <p className="text-xs text-text-secondary">{h.courtName} • {h.time}</p>
                  </div>
                  <StatusBadge status={isHearingToday ? 'Today' : 'Upcoming'} variant={isHearingToday ? 'danger' : 'info'} />
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
