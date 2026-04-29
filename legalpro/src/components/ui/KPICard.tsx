import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  subtitle?: string;
  icon?: LucideIcon;
  accentColor?: string;
}

export function KPICard({ title, value, trend, trendUp, subtitle, icon: Icon, accentColor }: KPICardProps) {
  return (
    <GlassCard
      hover
      className={`relative overflow-hidden ${accentColor ? '' : 'gradient-accent-bar'}`}
    >
      {accentColor && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ backgroundColor: accentColor }}
        />
      )}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-text-secondary text-sm">{title}</p>
          <p className="text-3xl font-bold text-text-primary">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 text-sm">
              {trendUp !== undefined && (
                trendUp
                  ? <TrendingUp className="w-4 h-4 text-success" />
                  : <TrendingDown className="w-4 h-4 text-danger" />
              )}
              <span className={trendUp ? 'text-success' : trendUp === false ? 'text-danger' : 'text-text-secondary'}>
                {trend}
              </span>
            </div>
          )}
          {subtitle && <p className="text-text-muted text-xs">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="p-2 rounded-lg bg-accent-primary/10">
            <Icon className="w-5 h-5 text-accent-primary" />
          </div>
        )}
      </div>
    </GlassCard>
  );
}
