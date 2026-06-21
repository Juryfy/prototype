import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';

export function WebsitePage() {
  const [ctaEmail, setCtaEmail] = useState('');

  function handleNotify(email: string) {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }
    const existing = JSON.parse(localStorage.getItem('juryfy_waitlist') || '[]');
    existing.push({ email, date: new Date().toISOString() });
    localStorage.setItem('juryfy_waitlist', JSON.stringify(existing));

    const subject = encodeURIComponent('Juryfy AI - New Waitlist Signup');
    const body = encodeURIComponent(`New waitlist signup:\n\nEmail: ${email}\nDate: ${new Date().toLocaleString()}`);
    window.open(`mailto:juryfyai@gmail.com?subject=${subject}&body=${body}`, '_blank');

    alert('Thank you! We will notify you when Juryfy AI launches.');
  }

  function handleCtaSubmit(e: FormEvent) {
    e.preventDefault();
    handleNotify(ctaEmail);
    setCtaEmail('');
  }

  return (
    <div className="min-h-screen font-[Poppins,sans-serif]" style={{ backgroundColor: '#f5f1e8', color: '#3c3c3c' }}>
      {/* ═══════════════════════════════════════════════════════════════
          NAVIGATION
      ═══════════════════════════════════════════════════════════════ */}
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b" style={{ backgroundColor: 'rgba(245, 241, 232, 0.95)', borderColor: '#e8e0d4' }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <img src="/logo/JuryfyAIlogo.png" alt="Juryfy AI" className="w-24 h-24 md:w-40 md:h-40" />
            <span className="text-xl md:text-2xl font-bold tracking-wide" style={{ color: '#00416a' }}>JURYFY AI SOLUTIONS</span>
          </div>
          <Link
            to="/app/home"
            className="px-5 py-2 text-sm font-medium rounded-md border-2 transition-colors hover:text-white"
            style={{ borderColor: '#00416a', color: '#00416a' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#00416a'; e.currentTarget.style.color = '#ffffff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#00416a'; }}
          >
            Try Platform
          </Link>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#f5f1e8' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 text-center">
          {/* Coming Soon Badge — stylish with gradient border and glow */}
          <span
            className="inline-block px-6 py-2 text-sm font-semibold tracking-widest uppercase rounded-full mb-8"
            style={{
              background: 'linear-gradient(135deg, rgba(0,65,106,0.08), rgba(0,65,106,0.03))',
              border: '1.5px solid #00416a',
              color: '#00416a',
              letterSpacing: '0.15em',
              boxShadow: '0 2px 12px rgba(0,65,106,0.1)',
            }}
          >
            Coming Soon
          </span>

          {/* Main Heading — bold, centered, single line */}
          <h1
            className="text-3xl md:text-5xl lg:text-5xl font-black leading-tight mb-5 whitespace-nowrap"
            style={{ color: '#00416a' }}
          >
            Legal Intelligence Finally Connected
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-lg max-w-3xl mx-auto mb-8 leading-relaxed" style={{ color: '#3c3c3c', letterSpacing: '0.02em' }}>
            Juryfy AI Is Building A Single AI-Powered Layer For Legal Research, Drafting, Case Tracking, Analysis, And Smarter Legal Workflows.
          </p>

          {/* Problem Statement */}
          <h2 className="text-lg md:text-xl font-bold mb-2" style={{ color: '#00416a', letterSpacing: '0.02em' }}>
            Too Much Legal Work Still Lives In Disconnected Tools
          </h2>
          <p className="text-sm md:text-base max-w-2xl mx-auto mb-6" style={{ color: '#3c3c3c', letterSpacing: '0.02em' }}>
            Built For Advocates, Firms, Students, And Legal Seekers Who Need Speed, Clarity, And Better Legal Decisions
          </p>
        </div>

        {/* Hero Banner Image — full width */}
        <div className="w-full overflow-hidden">
          <img
            src="/images/image1.png"
            alt="Indian Legal System - Supreme Court, Justice and Legal Technology"
            className="w-full h-auto object-cover"
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2: A Nation Waiting In Line For Justice
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#f5f1e8' }}>
        <div className="max-w-[1600px] mx-auto px-0 sm:px-0 lg:px-0 grid md:grid-cols-[1fr_1fr] gap-0 items-center">
          {/* Left: Image */}
          <div>
            <img src="/images/image3.png" alt="A Nation Waiting In Line For Justice" className="w-full h-full object-contain scale-100" />
          </div>

          {/* Right: Content */}
          <div className="px-8 md:px-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: '#00416a' }}>
              A Nation Waiting In Line For Justice
            </h2>
            <p className="leading-relaxed mb-5" style={{ color: '#3c3c3c', fontSize: '1.05rem' }}>
              {"India's Judicial System Is Drowning Under The Weight Of "}
              <span className="font-bold" style={{ color: '#00416a' }}>5.49 Crore Pending Cases</span>
              {". At The Current Disposal Rate, It Would Take Over "}
              <span className="font-bold" style={{ color: '#00416a' }}>300 Years To Clear</span>
              {" The Backlog, With The Average Case Duration Stretching To "}
              <span className="font-bold" style={{ color: '#00416a' }}>13.5 Years</span>.
            </p>
            <p className="leading-relaxed" style={{ color: '#3c3c3c', fontSize: '1.05rem' }}>
              {"Delayed Justice Isn't Just A Systemic Failure — It's A Daily Reality For Millions Of Citizens Waiting In Uncertainty. Families Are Torn Apart, Livelihoods Are Destroyed, And The Promise Of Constitutional Rights Remains Unfulfilled For Those Who Need It Most."}
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3: Lives On Hold, Behind Bars
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#f5f1e8' }}>
        <div className="max-w-[1600px] mx-auto px-0 sm:px-0 lg:px-0 grid md:grid-cols-[1fr_1fr] gap-0 items-center">
          {/* Left: Content */}
          <div className="px-8 md:px-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: '#00416a' }}>
              Lives On Hold, Behind Bars
            </h2>
            <p className="leading-relaxed mb-5" style={{ color: '#3c3c3c', fontSize: '1.05rem' }}>
              <span className="font-bold" style={{ color: '#00416a', textDecoration: 'underline' }}>77% Of Prison Inmates Are Undertrials</span>
              {" — People Who Haven't Been Convicted But Are Waiting For Their Day In Court. India's Prisons Operate At "}
              <span className="font-bold" style={{ color: '#b91c1c' }}>120.5% Of Capacity</span>.
            </p>
            <p className="leading-relaxed" style={{ color: '#3c3c3c', fontSize: '1.05rem' }}>
              {"The Presumption Of Innocence Means Nothing When The System Keeps You Locked Up For Years Before Trial. These Aren't Convicted Criminals — They're Citizens Whose Lives Are Frozen In Legal Limbo, Unable To Work, Support Their Families, Or Move Forward."}
            </p>
          </div>

          {/* Right: Image */}
          <div>
            <img src="/images/image4.png" alt="Lives On Hold, Behind Bars" className="w-full h-full object-contain scale-100" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 4: Taxpayer Money Locked Inside Prisons
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#f5f1e8' }}>
        <div className="max-w-[1600px] mx-auto px-0 sm:px-0 lg:px-0 grid md:grid-cols-[1fr_1fr] gap-0 items-center">
          {/* Left: Image */}
          <div>
            <img src="/images/image5.png" alt="Taxpayer Money Locked Inside Prisons" className="w-full h-full object-contain scale-100" />
          </div>

          {/* Right: Content */}
          <div className="px-8 md:px-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: '#00416a' }}>
              Taxpayer Money Locked Inside Prisons
            </h2>
            <p className="leading-relaxed mb-5" style={{ color: '#3c3c3c', fontSize: '1.05rem' }}>
              {"India's Annual Prison Budget Is "}
              <span className="font-bold" style={{ color: '#b91c1c' }}>₹10,035.6 Crore</span>
              {". With "}
              <span className="font-bold" style={{ color: '#00416a' }}>73.5%</span>
              {" Of Inmates Being Undertrials, That's Approximately "}
              <span className="font-bold" style={{ color: '#b91c1c' }}>₹6,493 Crore</span>
              {" Spent On People Who Haven't Been Proven Guilty — Versus Only "}
              <span className="font-bold" style={{ color: '#b91c1c' }}>₹2,341.6 Crore</span>
              {" For Actual Convicts."}
            </p>
            <p className="leading-relaxed" style={{ color: '#3c3c3c', fontSize: '1.05rem' }}>
              {"Every Day A Case Is Delayed, Taxpayers Foot The Bill. The Burden Isn't Just On The Imprisoned — It's On Every Citizen Who Funds A System That Warehouses The Unconvicted Instead Of Delivering Swift Justice."}
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 5: Indian Lawyers Are Overloaded, Not Empowered
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#f5f1e8' }}>
        <div className="max-w-[1600px] mx-auto px-0 sm:px-0 lg:px-0 grid md:grid-cols-[1fr_1fr] gap-0 items-center">
          {/* Left: Content */}
          <div className="px-8 md:px-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: '#00416a' }}>
              Indian Lawyers Are Overloaded, Not Empowered
            </h2>
            <p className="leading-relaxed" style={{ color: '#3c3c3c', fontSize: '1.05rem' }}>
              Advocates Spend More Time Managing Paperwork, Tracking Dates, And Searching Through Scattered Legal Databases Than Actually Practising Law. Fragmented Workflows, Manual Case Tracking, Disconnected Research Tools, And Zero Automation Mean That Even The Most Skilled Lawyers Are Fighting The System Before They Fight For Their Clients.
            </p>
          </div>

          {/* Right: Image */}
          <div>
            <img src="/images/image6.png" alt="Indian Lawyers Are Overloaded" className="w-full h-full object-contain scale-100" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 6: One Lawyer, Many Superpowers
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#f5f1e8' }}>
        <div className="max-w-[1600px] mx-auto px-0 sm:px-0 lg:px-0 grid md:grid-cols-[1fr_1fr] gap-0 items-center">
          {/* Left: Image — larger, fills space */}
          <div>
            <img src="/images/image2.png" alt="One Lawyer, Many Superpowers" className="w-full h-full object-contain scale-100" />
          </div>

          {/* Right: Content */}
          <div className="px-8 md:px-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#00416a' }}>
              One Lawyer, Many Superpowers – Powered By JuryfyAI
            </h2>
            <p className="leading-relaxed mb-6" style={{ color: '#3c3c3c', fontSize: '1.05rem' }}>
              Juryfy AI Brings Together Everything A Legal Professional Needs Into One Integrated, Intelligent Platform — Eliminating The Chaos Of Juggling Multiple Tools And Manual Processes.
            </p>
            <ul className="space-y-3">
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
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: '#00416a' }} />
                  <span className="font-bold" style={{ color: '#00416a' }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom banner */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <p
            className="text-center text-base md:text-lg font-medium rounded-xl py-5 px-8 border shadow-sm whitespace-nowrap"
            style={{ backgroundColor: '#ffffff', borderColor: '#d4d0c8', color: '#3c3c3c' }}
          >
            JuryfyAI Is Coming Soon To Empower Lawyers With All Their Essential Capabilities In One Intelligent Workspace.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FOOTER / CTA — Dark Navy
      ═══════════════════════════════════════════════════════════════ */}
      <footer className="py-16 md:py-20" style={{ backgroundColor: '#003d5c' }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">

          {/* Two columns */}
          <div className="grid md:grid-cols-2 gap-32 items-start">
            {/* Left: Join the Journey */}
            <div>
              <span
                className="inline-block px-5 py-2 text-sm font-bold tracking-wider rounded-md border mb-8"
                style={{ borderColor: '#ffffff', color: '#ffffff' }}
              >
                JOIN THE JOURNEY
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-snug">
                A Nation Waiting In Line For Justice
              </h2>
              <p className="leading-relaxed text-base md:text-lg" style={{ color: '#ffffff' }}>
                {"We're Building The Future Of Legal Technology In India. Our Platform Is Currently In Development, And We're Opening Early Access To Legal Professionals, Institutions, Researchers, And Founders Who Want To Shape The Product Alongside Us. Join The Waitlist And Be The First To Know When We Launch."}
              </p>
            </div>

            {/* Right: Request Launch Access */}
            <div className="text-left md:ml-auto">
              <span
                className="inline-block px-5 py-2 text-sm font-bold tracking-wider rounded-md border mb-8"
                style={{ borderColor: '#ffffff', color: '#ffffff' }}
              >
                REQUEST LAUNCH ACCESS
              </span>
              <form onSubmit={handleCtaSubmit} className="flex gap-3 mb-4">
                <input
                  type="email"
                  value={ctaEmail}
                  onChange={(e) => setCtaEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-72 px-4 py-3 border rounded-md text-base text-left focus:outline-none focus:ring-2 focus:ring-white/30"
                  style={{ borderColor: '#cbd5e0', backgroundColor: '#ffffff', color: '#3c3c3c' }}
                />
                <button
                  type="submit"
                  className="px-7 py-3 text-base font-medium rounded-md transition-colors whitespace-nowrap border hover:bg-white/10"
                  style={{ borderColor: '#ffffff', color: '#ffffff', backgroundColor: 'transparent' }}
                >
                  Notify Me
                </button>
              </form>
              <p style={{ color: '#ffffff', fontSize: '1rem' }}>
                Suitable For Legal Professionals, Founders, Institutions, Researchers...
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-16 pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
            <p className="text-center text-sm" style={{ color: '#ffffff' }}>
              &copy; 2026 Juryfy AI Solutions. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
