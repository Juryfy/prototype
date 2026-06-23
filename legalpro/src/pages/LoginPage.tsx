import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, Eye, EyeOff, Sun, Moon, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme, type Theme } from '@/contexts/ThemeContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, setTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const themeOptions: { value: Theme; icon: typeof Sun; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'gold', icon: Sparkles, label: 'Gold' },
  ];

  function cycleTheme() {
    const order: Theme[] = ['light', 'dark', 'gold'];
    const idx = order.indexOf(theme);
    setTheme(order[(idx + 1) % order.length]);
  }

  const CurrentIcon = themeOptions.find(t => t.value === theme)!.icon;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    const success = await login(email, password);
    if (success) {
      navigate('/app/dashboard');
    } else {
      setError('Invalid email or password.');
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4 relative">
      {/* Theme toggle — top right */}
      <button
        onClick={cycleTheme}
        className="absolute top-4 right-4 p-2 rounded-lg bg-accent-primary/20 text-accent-primary hover:bg-accent-primary hover:text-white transition-all"
        title={`Theme: ${theme}`}
        aria-label="Switch theme"
      >
        <CurrentIcon className="w-5 h-5" />
      </button>

      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <img src="/logo.png" alt="Juryfy" className="w-[72px] h-[72px] brightness-150 contrast-125 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
          <span className="text-3xl font-bold gradient-text">Juryfy</span>
        </div>

        {/* Glass Card */}
        <div className="glass-card p-8">
          <h1 className="text-2xl font-bold text-text-primary text-center mb-1">Welcome Back</h1>
          <p className="text-text-secondary text-center text-sm mb-6">
            Sign in to your legal practice dashboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-bg-card border border-border rounded-lg py-2.5 pl-10 pr-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-bg-card border border-border rounded-lg py-2.5 pl-10 pr-10 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Error */}
            {error && (
              <p className="text-danger text-sm text-center">{error}</p>
            )}

            {/* Submit */}
            <button type="submit" className="w-full gradient-btn py-2.5 font-medium">
              Sign In
            </button>
          </form>

          {/* Footer links */}
          <p className="text-text-secondary text-sm text-center mt-5">
            Don't have an account?{' '}
            <Link to="/app/register" className="text-accent-hover hover:underline">
              Create one
            </Link>
          </p>


          <Link
            to="/"
            className="block text-text-muted text-xs text-center mt-4 hover:text-accent-primary transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
