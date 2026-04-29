type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatusBadgeProps {
  status: string;
  variant?: BadgeVariant;
}

const autoVariantMap: Record<string, BadgeVariant> = {
  active: 'success',
  won: 'success',
  paid: 'success',
  completed: 'success',
  done: 'success',
  enabled: 'success',
  current: 'success',
  registered: 'success',
  favorable: 'success',
  pending: 'warning',
  upcoming: 'warning',
  'in progress': 'warning',
  scheduled: 'warning',
  overdue: 'danger',
  urgent: 'danger',
  failed: 'danger',
  loss: 'danger',
  closed: 'info',
  settled: 'info',
  today: 'info',
  neutral: 'neutral',
};

function resolveVariant(status: string, variant?: BadgeVariant): BadgeVariant {
  if (variant) return variant;
  return autoVariantMap[status.toLowerCase()] ?? 'neutral';
}

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  const resolved = resolveVariant(status, variant);
  return (
    <span className={`badge badge-${resolved}`}>
      {status}
    </span>
  );
}
