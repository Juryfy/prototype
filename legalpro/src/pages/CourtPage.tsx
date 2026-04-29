import { useState } from 'react';
import {
  Gavel, Search, BookOpen, MessageSquare, Mic,
  Download, CheckCircle, Clock, Globe, Zap,
} from 'lucide-react';
import { PageHeader, GlassCard, StatusBadge } from '@/components/ui';

/* ═══════════════════════════════════════════════
   Section 1 — Live Courtroom Assistant
   ═══════════════════════════════════════════════ */

function LiveCourtroomAssistant() {
  return (
    <GlassCard>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-text-primary">Live Courtroom Assistant</h2>
        <span className="badge badge-success flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          Live Mode Active
        </span>
      </div>

      {/* Active session indicator */}
      <div className="flex items-center gap-2 mb-5 p-3 rounded-lg bg-bg-elevated/60">
        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
        <span className="text-sm text-text-primary">Live Mode Active — Chamber 12, Delhi HC</span>
        <Mic className="w-4 h-4 text-text-muted ml-auto" />
        <span className="text-xs text-text-muted">Recording key point...</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Case law detection */}
        <div className="p-4 rounded-xl bg-bg-elevated/50 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-warning" />
            <p className="text-sm font-medium text-text-primary">Real-Time Case Law Detection</p>
          </div>
          <p className="text-xs text-text-secondary mb-2">
            Judge mentioned <span className="text-accent-hover font-medium">Section 138 NI Act</span>
          </p>
          <p className="text-xs text-success mb-3">3 relevant cases found within 0.4 seconds</p>
          <ul className="space-y-1.5">
            {[
              'Dashrath Rupsingh Rathod v. State of Maharashtra (2014)',
              'Meters and Instruments v. Kanchan Mehta (2017)',
              'Laxmi Dyechem v. State of Gujarat (2012)',
            ].map((c) => (
              <li key={c} className="text-xs text-accent-hover hover:underline cursor-pointer">{c}</li>
            ))}
          </ul>
        </div>

        {/* Counter-argument */}
        <div className="p-4 rounded-xl border border-danger/30 bg-danger/5">
          <p className="text-xs font-semibold text-danger mb-2">Counter-Argument Ready</p>
          <p className="text-xs text-text-secondary leading-relaxed">
            The opposing counsel's reliance on Section 138 may be challenged on jurisdictional grounds per
            the Supreme Court ruling in Dashrath Rupsingh Rathod, which held that the complaint must be
            filed where the cheque was delivered for collection, not where the bank is situated.
          </p>
        </div>
      </div>

      {/* Quick action buttons */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {[
            { icon: Search, label: 'Case law search' },
            { icon: BookOpen, label: 'Section lookup' },
            { icon: MessageSquare, label: 'Counter Argument' },
            { icon: Mic, label: 'Voice note' },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              title={label}
              className="w-9 h-9 rounded-lg bg-bg-elevated flex items-center justify-center hover:bg-accent-primary/20 transition-colors"
            >
              <Icon className="w-4 h-4 text-text-secondary" />
            </button>
          ))}
        </div>
        <span className="text-xs text-text-muted">Avg response time: <span className="text-accent-hover font-medium">2.3s</span></span>
      </div>
    </GlassCard>
  );
}

/* ═══════════════════════════════════════════════
   Section 2 — Cause List Monitor & Auto-Brief
   ═══════════════════════════════════════════════ */

function CauseListMonitor() {
  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-text-primary">Cause List Monitor &amp; Auto-Brief</h2>
        <span className="text-xs text-text-muted">Monitoring 24 cases across 5 courts</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Today's case */}
        <div className="p-4 rounded-xl bg-bg-elevated/50 border border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <StatusBadge status="Adjudication" variant="info" />
            <StatusBadge status="Listed Today" variant="success" />
          </div>
          <p className="text-sm font-medium text-text-primary mb-1">Mehta v. Kumar — CS 450/2023</p>
          <p className="text-xs text-text-secondary mb-1">Delhi High Court, Chamber 5</p>
          <p className="text-xs text-accent-hover font-medium">
            <Clock className="w-3 h-3 inline mr-1" />
            10:30 AM
          </p>
        </div>

        {/* Auto-prepared Brief Kit */}
        <div className="p-4 rounded-xl bg-bg-elevated/50 border border-border/50">
          <p className="text-sm font-medium text-text-primary mb-3">Auto-Prepared Brief Kit</p>
          <ul className="space-y-2 text-xs text-text-secondary">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-success mt-0.5 flex-shrink-0" />
              Last order summary prepared
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-success mt-0.5 flex-shrink-0" />
              Pending compliance checklist ready
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-success mt-0.5 flex-shrink-0" />
              Key arguments extracted from case file
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-success mt-0.5 flex-shrink-0" />
              Judge profile &amp; recent rulings attached
            </li>
          </ul>
          <div className="flex gap-2 mt-4">
            <button className="gradient-btn px-3 py-1.5 text-xs flex items-center gap-1">
              <Download className="w-3 h-3" /> Download Brief
            </button>
            <button className="px-3 py-1.5 text-xs rounded-lg border border-border text-text-secondary hover:bg-bg-elevated transition-colors">
              Mark Attended
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming cases */}
      <div>
        <h4 className="text-sm font-medium text-text-secondary mb-3">Upcoming Cases</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-bg-elevated/40">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status="Argument" variant="warning" />
                <StatusBadge status="Formal Today" variant="info" />
              </div>
              <p className="text-xs text-text-primary">Singh v. State — CRL 220/2024 &bull; Patiala House Court</p>
            </div>
            <span className="text-xs text-text-muted">2:00 PM</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-bg-elevated/40">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status="Upcoming" variant="warning" />
                <StatusBadge status="Next week" variant="neutral" />
              </div>
              <p className="text-xs text-text-primary">Gupta Enterprises v. SEBI — SAT 89/2024 &bull; Securities Appellate Tribunal</p>
            </div>
            <span className="text-xs text-text-muted">Mon, 10:00 AM</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

/* ═══════════════════════════════════════════════
   Section 3 — Smart Steno (Voice-to-Legal-Text)
   ═══════════════════════════════════════════════ */

function SmartSteno() {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <GlassCard>
      <h2 className="text-lg font-semibold text-text-primary mb-5">Smart Steno (Voice-to-Legal-Text)</h2>

      {/* Microphone area */}
      <div className="flex flex-col items-center mb-6">
        <div
          className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-all ${
            isRecording
              ? 'bg-success/20 border-2 border-success shadow-[0_0_20px_rgba(16,185,129,0.3)]'
              : 'bg-bg-elevated border-2 border-border'
          }`}
        >
          <Mic className={`w-10 h-10 ${isRecording ? 'text-success animate-pulse' : 'text-text-muted'}`} />
        </div>
        <button
          onClick={() => setIsRecording(!isRecording)}
          className={`px-5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            isRecording
              ? 'bg-danger text-white hover:bg-danger/80'
              : 'bg-success text-white hover:bg-success/80'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-white animate-pulse' : 'bg-white/60'}`} />
          {isRecording ? 'Stop Recording' : 'Start Dictation'}
        </button>
        <p className="text-xs text-text-muted mt-2">Voice-to-text conversion in Hindi &amp; English</p>
      </div>

      {/* Recent Transcriptions */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-text-secondary mb-3">Recent Transcriptions</h4>
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-bg-elevated/50 border border-border/50">
            <p className="text-[10px] text-text-muted mb-1">Today, 10:45 AM</p>
            <p className="text-xs text-text-secondary italic">
              "The learned counsel for the petitioner submitted that the impugned order dated 15th January 2026 is in violation of principles of natural justice..."
            </p>
          </div>
          <div className="p-3 rounded-lg bg-bg-elevated/50 border border-border/50">
            <p className="text-[10px] text-text-muted mb-1">Yesterday, 3:20 PM</p>
            <p className="text-xs text-text-secondary italic">
              "It is humbly submitted before this Hon'ble Court that the respondent has failed to comply with the order dated 8th December 2025..."
            </p>
          </div>
        </div>
      </div>

      {/* Language metrics */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-accent-hover" />
            <span className="text-xs text-text-primary font-medium">9 Languages</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-success" />
            <span className="text-xs text-text-primary font-medium">95% Accuracy</span>
          </div>
        </div>
        <span className="text-xs text-accent-hover hover:underline cursor-pointer">
          Auto-translate: Dictate notes → Legal format
        </span>
      </div>
    </GlassCard>
  );
}

/* ═══════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════ */

export function CourtPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Real-Time Court Features" icon={Gavel} />
      <LiveCourtroomAssistant />
      <CauseListMonitor />
      <SmartSteno />
    </div>
  );
}
