import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme, type Theme } from '@/contexts/ThemeContext';

export function WebsitePage() {
  const { theme, setTheme } = useTheme();
  const [heroEmail, setHeroEmail] = useState('');
  const [ctaEmail, setCtaEmail] = useState('');

  const themeOptions: { value: Theme; icon: typeof Sun; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'gold', icon: Sparkles, label: 'Gold' },
  ];

  const nextTheme = () => {
    const idx = themeOptions.findIndex(t => t.value === theme);
    const next = themeOptions[(idx + 1) % themeOptions.length];
    setTheme(next.value);
  };

  const currentThemeIcon = themeOptions.find(t => t.value === theme)!;

  function handleNotify(email: string) {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }
    // Store locally
    const existing = JSON.parse(localStorage.getItem('juryfy_waitlist') || '[]');
    existing.push({ email, date: new Date().toISOString() });
    localStorage.setItem('juryfy_waitlist', JSON.stringify(existing));

    // Send notification email via mailto
    const subject = encodeURIComponent('Juryfy AI - New Waitlist Signup');
    const body = encodeURIComponent(`New waitlist signup:\n\nEmail: ${email}\nDate: ${new Date().toLocaleString()}`);
    window.open(`mailto:juryfyai@gmail.com?subject=${subject}&body=${body}`, '_blank');

    alert('Thank you! We will notify you when Juryfy AI launches.');
  }

  function handleHeroSubmit(e: FormEvent) {
    e.preventDefault();
    handleNotify(heroEmail);
    setHeroEmail('');
  }

  function handleCtaSubmit(e: FormEvent) {
    e.preventDefault();
    handleNotify(ctaEmail);
    setCtaEmail('');
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-[Inter,sans-serif]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-bg-primary/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src="/logo/JuryfyAIlogo.png" alt="Juryfy AI" className="w-10 h-10" />
            <span className="text-lg font-bold text-text-primary">Juryfy AI Solutions</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={nextTheme}
              className="p-2 rounded-lg border border-border hover:bg-bg-elevated transition-colors"
              title={`Theme: ${currentThemeIcon.label}`}
            >
              <currentThemeIcon.icon className="w-4 h-4 text-text-secondary" />
            </button>
            <Link
              to="/app/home"
              className="gradient-btn px-5 py-2 text-white text-sm font-medium"
            >
              Try Platform
            </Link>
          </div>
        </div>
      </nav>

      {/* Section 1: Hero */}
      <section className="bg-bg-primary py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-start">
          {/* Left */}
          <div>
            <span className="inline-block px-3 py-1 text-xs font-bold tracking-wider text-accent-primary bg-accent-primary/10 rounded-full mb-4">
              COMING SOON
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-text-primary mb-4">
              Legal intelligence.<br />Finally connected.
            </h1>
            <p className="text-lg text-text-secondary leading-relaxed mb-8">
              Juryfy AI is building a single AI-powered layer for legal research, drafting, case tracking, analysis, and smarter legal workflows.
            </p>
          </div>

          {/* Right */}
          <div>
            <span className="inline-block px-3 py-1 text-xs font-bold tracking-wider text-orange-600 bg-orange-50 rounded-full mb-4">
              WHY NOW
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
              Too much legal work still lives in disconnected tools.
            </h2>
            <p className="text-text-secondary leading-relaxed mb-8">
              Built for advocates, firms, students, and legal seekers who need speed, clarity, and better legal decisions.
            </p>
            <form onSubmit={handleHeroSubmit} className="flex gap-2">
              <input
                type="email"
                value={heroEmail}
                onChange={(e) => setHeroEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-accent-primary text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors whitespace-nowrap"
              >
                Notify Me
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Section 2: A Nation Waiting in Line for Justice */}
      <section className="bg-bg-elevated py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Image */}
          <div className="rounded-2xl overflow-hidden">
            <img src="/images/nation-waiting.png" alt="A Nation Waiting in Line for Justice" className="w-full h-auto" />
          </div>

          {/* Right: Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-6">
              A Nation Waiting in Line for Justice
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              India's judicial system is drowning under the weight of{' '}
              <span className="text-4xl font-bold text-accent-primary">5.49</span>{' '}
              <span className="font-semibold text-accent-primary">crore pending cases</span>. At the current disposal rate, it would take over{' '}
              <span className="text-4xl font-bold text-accent-primary">300</span>{' '}
              <span className="font-semibold text-accent-primary">years to clear</span> the backlog, with the average case duration stretching to{' '}
              <span className="text-4xl font-bold text-accent-primary">13.5</span>{' '}
              <span className="font-semibold text-accent-primary">years</span>.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Delayed justice isn't just a systemic failure — it's a daily reality for millions of citizens waiting in uncertainty. Families are torn apart, livelihoods are destroyed, and the promise of constitutional rights remains unfulfilled for those who need it most.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Lives on Hold, Behind Bars */}
      <section className="bg-bg-primary py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Two images */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="rounded-2xl overflow-hidden">
              <img src="/images/lives-on-hold-left.png" alt="Overcrowded prisons" className="w-full h-auto" />
            </div>
            <div className="rounded-2xl overflow-hidden">
              <img src="/images/lives-on-hold-right.png" alt="Family waiting" className="w-full h-auto" />
            </div>
          </div>

          {/* Content — full width below both images */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-6">
              Lives on Hold, Behind Bars
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              <span className="text-4xl font-bold text-red-600">77%</span>{' '}
              <span className="font-semibold text-red-600">of prison inmates are undertrials</span> — people who haven't been convicted but are waiting for their day in court. India's prisons operate at{' '}
              <span className="text-4xl font-bold text-red-600">120.5%</span>{' '}
              <span className="font-semibold text-red-600">of capacity</span>.
            </p>
            <p className="text-text-secondary leading-relaxed">
              The presumption of innocence means nothing when the system keeps you locked up for years before trial. These aren't convicted criminals — they're citizens whose lives are frozen in legal limbo, unable to work, support their families, or move forward.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Taxpayer Money Locked Inside Prisons */}
      <section className="bg-bg-elevated py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Image */}
          <div className="rounded-2xl overflow-hidden">
            <img src="/images/taxpayer-money.png" alt="Taxpayer Money Locked Inside Prisons" className="w-full h-auto" />
          </div>

          {/* Right: Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-6">
              Taxpayer Money Locked Inside Prisons
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              India's annual prison budget is{' '}
              <span className="text-3xl font-bold text-amber-600">₹10,035.6 crore</span>. With 73.5% of inmates being undertrials, that's approximately{' '}
              <span className="text-3xl font-bold text-amber-600">₹6,493 crore</span>{' '}
              spent on people who haven't been proven guilty — versus only{' '}
              <span className="text-3xl font-bold text-amber-600">₹2,341.6 crore</span>{' '}
              for actual convicts.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Every day a case is delayed, taxpayers foot the bill. The burden isn't just on the imprisoned — it's on every citizen who funds a system that warehouses the unconvicted instead of delivering swift justice.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: Indian Lawyers Are Overloaded */}
      <section className="bg-bg-primary py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Image */}
          <div className="rounded-2xl overflow-hidden">
            <img src="/images/lawyers-overloaded.png" alt="Indian Lawyers Are Overloaded" className="w-full h-auto" />
          </div>

          {/* Right: Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-6">
              Indian Lawyers Are Overloaded, Not Empowered
            </h2>
            <p className="text-text-secondary leading-relaxed">
              Advocates spend more time managing paperwork, tracking dates, and searching through scattered legal databases than actually practising law. Fragmented workflows, manual case tracking, disconnected research tools, and zero automation mean that even the most skilled lawyers are fighting the system before they fight for their clients.
            </p>
          </div>
        </div>
      </section>

      {/* Section 6: One Lawyer, Many Superpowers */}
      <section className="bg-bg-elevated py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-start">
          {/* Left: Image */}
          <div className="rounded-2xl overflow-hidden">
            <img src="/images/one-lawyer-superpowers.png" alt="One Lawyer, Many Superpowers" className="w-full h-auto" />
          </div>

          {/* Right: Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              One Lawyer, Many Superpowers – Powered by JuryfyAI
            </h2>
            <p className="text-text-secondary leading-relaxed mb-6">
              Juryfy AI brings together everything a legal professional needs into one integrated, intelligent platform — eliminating the chaos of juggling multiple tools and manual processes.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'AI Legal Chatbot',
                'Case Management',
                'Case Analyser',
                'Drafting Engine',
                'Predictive Analytics',
                'FIR Intelligence',
                'Legal Research',
                'Case Intake & Merit Scoring',
                'Agentic AI Workflow',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-accent-primary shrink-0" />
                  <span className="text-text-secondary font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <p className="text-center text-lg text-text-secondary font-medium bg-bg-primary rounded-xl py-6 px-8 shadow-sm border border-border">
            JuryfyAI is coming soon to empower lawyers with all their essential capabilities in one intelligent workspace.
          </p>
        </div>
      </section>

      {/* Section 7: Join the Journey (CTA) */}
      <section className="bg-bg-primary py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-start">
          {/* Left */}
          <div>
            <span className="inline-block px-3 py-1 text-xs font-bold tracking-wider text-accent-primary bg-accent-primary/10 rounded-full mb-4">
              JOIN THE JOURNEY
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Be among the first to experience Juryfy AI.
            </h2>
            <p className="text-text-secondary leading-relaxed">
              We're building the future of legal technology in India. Our platform is currently in development, and we're opening early access to legal professionals, institutions, researchers, and founders who want to shape the product alongside us. Join the waitlist and be the first to know when we launch.
            </p>
          </div>

          {/* Right */}
          <div className="bg-bg-elevated rounded-2xl p-8 border border-border">
            <span className="inline-block px-3 py-1 text-xs font-bold tracking-wider text-orange-600 bg-orange-50 rounded-full mb-4">
              REQUEST LAUNCH ACCESS
            </span>
            <form onSubmit={handleCtaSubmit} className="flex gap-2 mb-4">
              <input
                type="email"
                value={ctaEmail}
                onChange={(e) => setCtaEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-accent-primary text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors whitespace-nowrap"
              >
                NOTIFY ME
              </button>
            </form>
            <p className="text-xs text-text-muted uppercase tracking-wide">
              Suitable for legal professionals, founders, institutions, researchers...
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bg-primary text-text-muted py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo/JuryfyAIlogo.png" alt="Juryfy AI" className="w-8 h-8" />
            <span className="text-sm text-text-secondary font-medium">Juryfy AI Solutions</span>
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} Juryfy AI Solutions. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
