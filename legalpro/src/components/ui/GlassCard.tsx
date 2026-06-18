import type { CSSProperties, ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  style?: CSSProperties;
}

export function GlassCard({ children, className = '', hover = false, style }: GlassCardProps) {
  return (
    <div className={`glass-card p-6 ${hover ? 'glass-card-hover' : ''} ${className}`} style={style}>
      {children}
    </div>
  );
}
