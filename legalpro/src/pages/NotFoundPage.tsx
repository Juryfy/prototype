import { Link } from 'react-router';
import { GlassCard } from '@/components/ui';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg-primary">
      <GlassCard className="max-w-md w-full text-center !p-8">
        <h1 className="text-4xl font-bold text-text-primary mb-2">404</h1>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Page Not Found</h2>
        <p className="text-text-secondary mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/app/dashboard"
          className="gradient-btn inline-block px-6 py-3 text-white font-medium rounded-xl"
        >
          Back to Dashboard
        </Link>
      </GlassCard>
    </div>
  );
}
