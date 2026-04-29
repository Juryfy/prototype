import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className = '', hover = false }: GlassCardProps) {
  return (
    <div className={`glass-card p-6 ${hover ? 'glass-card-hover' : ''} ${className}`}>
      {children}
    </div>
  );
}
