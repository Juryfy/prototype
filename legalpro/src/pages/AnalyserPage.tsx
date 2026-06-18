import { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import {
  Brain,
  Download,
  FileText,
  Save,
  Mail,
  Printer,
  Search,
  Loader2,
  Upload,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
// Recharts removed — using custom SVG metallic pie chart
// mockAnalysisResult import kept for reference but unused in fallback mode
import { type AnalysisResult } from '@/data/mockAnalyserData';
// AI service commented out — using fallback data instead
// import { analyzeCase } from '@/services/geminiService';
import { extractTextFromFile, SUPPORTED_FILE_TYPES, SUPPORTED_FILE_TYPES_LABEL } from '@/services/fileExtractor';
import { PageHeader, GlassCard, Modal } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';

// ─── FALLBACK DATA SET 1: Property Dispute Case ───
const FALLBACK_DATA_1: AnalysisResult = {
  caseSummary: {
    legalIssue:
      'The case involves a property dispute under Section 9 of the Specific Relief Act, 1963. The plaintiff seeks specific performance of a contract for sale of immovable property where the seller has refused to execute the sale deed despite receiving 80% of the consideration amount.',
    keyPoints: [
      'Sale agreement executed with Rs. 40 lakhs paid as advance',
      'Seller refusing to execute sale deed citing market value appreciation',
      'Plaintiff in continuous possession of the property since 2021',
      'Time is not of the essence in property contracts under Indian law',
    ],
    successProbability: 78,
  },
  relevantCaseLaws: [
    {
      citation: 'Saralamani Kandappan v. S. Rajalakshmi (2011) 12 SCC 18',
      court: 'Supreme Court',
      practiceArea: 'Specific Relief',
      citedTimes: 127,
      description:
        'Landmark judgment on specific performance of contracts relating to immovable property. Established that readiness and willingness must be pleaded and proved.',
      outcome: 'Favorable',
    },
    {
      citation: 'Nirmala Anand v. Advent Corporation (2002) 8 SCC 146',
      court: 'Supreme Court',
      practiceArea: 'Contract Law',
      citedTimes: 89,
      description:
        'Established principles for granting specific performance when the plaintiff has performed substantial part of the contract.',
      outcome: 'Favorable',
    },
    {
      citation: 'K.S. Vidyanadam v. Vairavan (1997) 3 SCC 1',
      court: 'Supreme Court',
      practiceArea: 'Property Law',
      citedTimes: 156,
      description:
        'Principles regarding partial performance and possession of property under sale agreement. Time is not of essence in property contracts.',
      outcome: 'Neutral',
    },
  ],
  statutoryProvisions: [
    {
      section: 'Section 9',
      act: 'Specific Relief Act, 1963',
      text: 'Except as otherwise provided in this Chapter, specific performance of a contract may, in the discretion of the court, be enforced...',
      relevance: 'Primary',
    },
    {
      section: 'Section 16',
      act: 'Specific Relief Act, 1963',
      text: 'Personal bars to relief: Specific performance of a contract cannot be enforced in favour of a person who would not be entitled to recover compensation...',
      relevance: 'Supporting',
    },
  ],
  caseTypes: ['Civil', 'Property Dispute'],
  jurisdiction: 'India - Civil Court',
  applicableSections: [
    { section: 'Section 9 SRA', description: 'Specific performance of contract for immovable property', relevance: 'High relevance' },
    { section: 'Section 16 SRA', description: 'Personal bars to specific performance relief', relevance: 'Medium relevance' },
    { section: 'Section 53A TPA', description: 'Part performance doctrine for property transfers', relevance: 'High relevance' },
  ],
  requiredDocuments: [
    { id: 'doc-1', description: 'Original Sale Agreement with signatures', checked: true },
    { id: 'doc-2', description: 'Payment receipts and bank transfer records', checked: true },
    { id: 'doc-3', description: 'Possession letter or electricity/water bills in plaintiff name', checked: false },
    { id: 'doc-4', description: 'Legal notice sent to defendant', checked: false },
  ],
  similarCases: [
    { citation: 'Deepika Singh v. Central Administrative Tribunal (2022) 3 SCC 1', outcome: 'Outcome: Specific performance granted', badge: 'WIN' },
    { citation: 'Rajesh Kumar v. State of UP (2020) AIR SC 2345', outcome: 'Outcome: Partial relief with compensation', badge: 'Partial' },
    { citation: 'Anil Mehta v. Suresh Properties (2021) 5 SCC 890', outcome: 'Outcome: Decree in favor of plaintiff', badge: 'WIN' },
  ],
  outcomePrediction: { winningPct: 78, losingPct: 22 },
  keyWinningPoints: [
    'Substantial payment of 80% consideration already made',
    'Continuous possession since 2021 establishes part performance',
    'Recent Supreme Court judgments favor specific performance over compensation',
    'Clear documentary evidence of agreement and payments',
  ],
  riskFactors: [
    'Limitation period of 3 years from breach date',
    'Defendant may allege plaintiff breached payment timeline',
    'Market value appreciation may affect court discretion',
  ],
  strengths: [
    { title: 'Strong Documentary Evidence', description: 'Sale agreement, receipts, and possession documents available' },
    { title: 'Readiness & Willingness Proven', description: 'Plaintiff has demonstrated continuous readiness to perform' },
    { title: 'Favorable Recent Precedents', description: 'Supreme Court rulings support similar claims' },
    { title: 'Part Performance', description: 'Substantial payment made and possession transferred' },
  ],
  challenges: [
    { title: 'Limitation Period Concerns', description: 'Need to establish cause of action within 3 years' },
    { title: "Opposing Party's Counter Claims", description: 'Defendant may argue breach by plaintiff' },
    { title: 'Market Value Changes', description: "Significant appreciation may affect court's discretion" },
  ],
  strategy: [
    { step: 1, title: 'File Suit for Specific Performance', description: 'Immediately file suit under Section 9 of Specific Relief Act with strong documentary evidence.' },
    { step: 2, title: 'Apply for Interim Injunction', description: 'Seek court order preventing defendant from alienating the property to third parties.' },
    { step: 3, title: 'Strengthen Documentation', description: 'Gather additional evidence of readiness, payment records, and possession documents.' },
    { step: 4, title: 'Explore Mediation', description: 'Pursue mediation alongside litigation for faster resolution and optimal outcomes.' },
  ],
  expertRecommendation:
    'Based on analysis of 127 similar property dispute cases, the recommended approach offers a 78% success probability. The combination of substantial payment, possession, and favorable precedents strongly supports a decree for specific performance. Consider engaging expert witnesses on property valuation.',
};

// ─── FALLBACK DATA SET 2: Criminal Fraud Case ───
const FALLBACK_DATA_2: AnalysisResult = {
  caseSummary: {
    legalIssue:
      'The case involves a cyber fraud and financial cheating complaint where the accused used forged documents and impersonation to misappropriate Rs. 25 lakhs from the complainant through a fake real estate investment scheme operated via online platforms.',
    keyPoints: [
      'Rs. 25 lakhs transferred through UPI and bank transfers to accused accounts',
      'Fake property documents and forged NOCs were presented to the complainant',
      'Accused operated through multiple shell companies and fake identities online',
      'Digital trail available through IP logs, transaction records, and WhatsApp chats',
    ],
    successProbability: 65,
  },
  relevantCaseLaws: [
    {
      citation: 'State of Maharashtra v. Vijay Mohan Jadhav (2019) 5 SCC 244',
      court: 'Supreme Court',
      practiceArea: 'Cyber Crime',
      citedTimes: 98,
      description:
        'Established standards for electronic evidence admissibility under Section 65B of Indian Evidence Act in cyber fraud cases.',
      outcome: 'Favorable',
    },
    {
      citation: 'Suhas Katti v. State of Tamil Nadu (2004)',
      court: 'Chennai High Court',
      practiceArea: 'IT Act',
      citedTimes: 203,
      description:
        'First conviction under IT Act provisions for online fraud. Set precedent for prosecuting cyber criminals using digital evidence.',
      outcome: 'Favorable',
    },
    {
      citation: 'Shreya Singhal v. Union of India (2015) 5 SCC 1',
      court: 'Supreme Court',
      practiceArea: 'Constitutional/IT Law',
      citedTimes: 340,
      description:
        'Defined scope of cyber offenses and online intermediary liability. Important for establishing jurisdiction in online fraud cases.',
      outcome: 'Neutral',
    },
  ],
  statutoryProvisions: [
    {
      section: 'Section 420',
      act: 'Indian Penal Code',
      text: 'Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person... shall be punished with imprisonment up to 7 years and fine.',
      relevance: 'Primary',
    },
    {
      section: 'Section 66D',
      act: 'Information Technology Act, 2000',
      text: 'Whoever, by means of any communication device or computer resource cheats by personation, shall be punished with imprisonment up to 3 years and fine up to one lakh rupees.',
      relevance: 'Primary',
    },
    {
      section: 'Section 468',
      act: 'Indian Penal Code',
      text: 'Whoever commits forgery, intending that the document forged shall be used for the purpose of cheating, shall be punished with imprisonment up to 7 years and fine.',
      relevance: 'Supporting',
    },
  ],
  caseTypes: ['Criminal', 'Cyber Crime', 'Financial Fraud'],
  jurisdiction: 'India - BNS/IPC & IT Act',
  applicableSections: [
    { section: 'Section 420 IPC', description: 'Cheating and dishonestly inducing delivery of property', relevance: 'High relevance' },
    { section: 'Section 406 IPC', description: 'Criminal breach of trust', relevance: 'High relevance' },
    { section: 'IT Act Section 66D', description: 'Cheating by personation using computer resource', relevance: 'High relevance' },
    { section: 'Section 468 IPC', description: 'Forgery for purpose of cheating', relevance: 'Medium relevance' },
  ],
  requiredDocuments: [
    { id: 'doc-1', description: 'FIR copy and police complaint', checked: true },
    { id: 'doc-2', description: 'Bank statements showing fraudulent transactions', checked: true },
    { id: 'doc-3', description: 'WhatsApp/email communication screenshots (certified)', checked: false },
    { id: 'doc-4', description: 'Section 65B certificate for electronic evidence', checked: false },
    { id: 'doc-5', description: 'Forged documents received from accused', checked: false },
  ],
  similarCases: [
    { citation: 'State v. Rahul Sharma (2023) Delhi HC Crl. A. 456', outcome: 'Outcome: Convicted under 420 IPC & 66D IT Act', badge: 'WIN' },
    { citation: 'Lata Goyal v. State of NCT Delhi (2019) 8 SCC 456', outcome: 'Outcome: Acquitted due to insufficient digital evidence', badge: 'LOSS' },
    { citation: 'Pradeep Investments v. Cyber Cell (2022) Bom HC WP 1234', outcome: 'Outcome: Partial recovery ordered', badge: 'Partial' },
  ],
  outcomePrediction: { winningPct: 65, losingPct: 35 },
  keyWinningPoints: [
    'Clear digital trail of financial transactions to accused',
    'Forged documents are strong evidence of criminal intent',
    'Multiple victims strengthen pattern of fraud allegation',
    'IP logs and device data can link accused to fake identities',
  ],
  riskFactors: [
    'Electronic evidence must strictly comply with Section 65B requirements',
    'Accused may claim the transactions were legitimate business dealings',
    'Recovery of misappropriated funds is uncertain even with conviction',
    'Cross-jurisdictional challenges if accused operated from multiple states',
  ],
  strengths: [
    { title: 'Clear Financial Trail', description: 'Bank records and UPI logs conclusively show fund movement to accused' },
    { title: 'Documentary Fraud Evidence', description: 'Forged NOCs and fake property papers can be verified as fraudulent' },
    { title: 'Digital Footprint', description: 'WhatsApp chats, emails, and IP logs establish accused identity' },
    { title: 'Multiple Complainants', description: 'Pattern of similar fraud strengthens prosecution case' },
  ],
  challenges: [
    { title: 'Section 65B Compliance', description: 'All electronic evidence must have proper certificates for admissibility' },
    { title: 'Accused Identity Verification', description: 'Need to conclusively link online identities to physical accused' },
    { title: 'Fund Recovery', description: 'Money may have been laundered through multiple accounts' },
    { title: 'Jurisdictional Issues', description: 'Online crimes may span multiple state jurisdictions' },
  ],
  strategy: [
    { step: 1, title: 'File FIR with Cyber Cell', description: 'Lodge complaint with specialized cyber crime police station with all digital evidence.' },
    { step: 2, title: 'Secure Electronic Evidence', description: 'Obtain Section 65B certificates for all digital communications and transaction records.' },
    { step: 3, title: 'Apply for Freezing Order', description: 'Seek court order to freeze accused bank accounts to prevent further dissipation of funds.' },
    { step: 4, title: 'Coordinate with Bank', description: 'File complaint with banks for reversal of fraudulent transactions under RBI guidelines.' },
  ],
  expertRecommendation:
    'Based on analysis of 98 similar cyber fraud cases, this case has a 65% success probability for conviction. The digital evidence trail is strong but requires strict Section 65B compliance. Recommend immediate FIR with cyber cell and simultaneous bank complaint for fund recovery. Engaging a forensic IT expert will significantly strengthen the prosecution.',
};

// Toggle between fallback datasets — uses a simple alternating flag
let fallbackToggle = false;
function getNextFallbackData(): AnalysisResult {
  fallbackToggle = !fallbackToggle;
  return fallbackToggle ? FALLBACK_DATA_1 : FALLBACK_DATA_2;
}

// ─── SVG Metallic Button (gold theme) ───
function MetallicButton({ label, variant, onClick, theme }: { label: string; variant: 'gold' | 'bronze'; onClick?: () => void; theme: 'light' | 'dark' | 'gold' }) {
  // For non-gold themes, render a normal styled button
  if (theme !== 'gold') {
    const cls = variant === 'gold'
      ? 'badge-high'
      : 'badge-medium';
    return (
      <button onClick={onClick} className={`px-3 py-1 rounded-md cursor-pointer hover:opacity-80 transition-opacity text-xs font-medium shrink-0 ml-2 ${cls}`}>
        {label}
      </button>
    );
  }

  // Gold theme: render SVG metallic button
  const gradId = `metalBtn_${variant}_${label.replace(/\s/g, '')}`;
  const stops = variant === 'gold'
    ? [
        { offset: '0%', color: '#fff6d0' },
        { offset: '12%', color: '#f8e7a2' },
        { offset: '28%', color: '#e6c26a' },
        { offset: '52%', color: '#c7963a' },
        { offset: '78%', color: '#f0d688' },
        { offset: '100%', color: '#9f6c1d' },
      ]
    : [
        { offset: '0%', color: '#f5d4b3' },
        { offset: '15%', color: '#e8b88a' },
        { offset: '35%', color: '#cd8e5a' },
        { offset: '55%', color: '#b87333' },
        { offset: '78%', color: '#daa06d' },
        { offset: '100%', color: '#8b4513' },
      ];
  const borderColor = variant === 'gold' ? '#9f6c1d' : '#8b4513';

  // Estimate width based on label length
  const charWidth = 6.5;
  const padding = 12;
  const width = Math.max(label.length * charWidth + padding * 2, 55);
  const height = 24;
  const rx = 5;

  return (
    <button onClick={onClick} className="shrink-0 ml-2 cursor-pointer hover:opacity-85 transition-opacity">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block">
        <defs>
          <radialGradient id={gradId} cx="30%" cy="20%" r="90%">
            {stops.map((s, i) => (
              <stop key={i} offset={s.offset} stopColor={s.color} />
            ))}
          </radialGradient>
          <radialGradient id={`${gradId}_shine`} cx="35%" cy="15%" r="60%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        <rect x="1" y="1" width={width - 2} height={height - 2} rx={rx} fill={`url(#${gradId})`} stroke={borderColor} strokeWidth="1.5" />
        <rect x="1" y="1" width={width - 2} height={height - 2} rx={rx} fill={`url(#${gradId}_shine)`} opacity="0.45" />
        <text x={width / 2} y={height / 2 + 1} textAnchor="middle" dominantBaseline="central" fontSize="10" fontWeight="700" fill="#1a0f00">
          {label}
        </text>
      </svg>
    </button>
  );
}

// ─── Custom Metallic Pie Chart SVG ───
// Theme-specific gradient configs
const PIE_THEME_CONFIG = {
  gold: {
    // Losing slice — gold metallic
    sectorGradient: {
      cx: '30%', cy: '25%', r: '90%',
      stops: [
        { offset: '0%', color: '#fff6d0' },
        { offset: '12%', color: '#f8e7a2' },
        { offset: '28%', color: '#e6c26a' },
        { offset: '52%', color: '#c7963a' },
        { offset: '78%', color: '#f0d688' },
        { offset: '100%', color: '#9f6c1d' },
      ],
    },
    // Winning slice — silver metallic
    baseGradient: {
      cx: '65%', cy: '35%', r: '90%',
      stops: [
        { offset: '0%', color: '#ffffff' },
        { offset: '20%', color: '#eeeeee' },
        { offset: '40%', color: '#c9c9c9' },
        { offset: '60%', color: '#f8f8f8' },
        { offset: '82%', color: '#b7b7b7' },
        { offset: '100%', color: '#8a8a8a' },
      ],
    },
    shine: { cx: '28%', cy: '22%', r: '70%' },
    separatorColor: '#2a2a2a',
    rimColor: 'rgba(255,255,255,0.25)',
    labelColor: '#111',
  },
  dark: {
    // Losing slice — red metallic
    sectorGradient: {
      cx: '35%', cy: '28%', r: '88%',
      stops: [
        { offset: '0%', color: '#fca5a5' },
        { offset: '20%', color: '#f87171' },
        { offset: '45%', color: '#ef4444' },
        { offset: '70%', color: '#dc2626' },
        { offset: '90%', color: '#b91c1c' },
        { offset: '100%', color: '#7f1d1d' },
      ],
    },
    // Winning slice — green metallic
    baseGradient: {
      cx: '50%', cy: '35%', r: '90%',
      stops: [
        { offset: '0%', color: '#86efac' },
        { offset: '20%', color: '#4ade80' },
        { offset: '45%', color: '#22c55e' },
        { offset: '65%', color: '#16a34a' },
        { offset: '85%', color: '#15803d' },
        { offset: '100%', color: '#166534' },
      ],
    },
    shine: { cx: '30%', cy: '25%', r: '65%' },
    separatorColor: '#111827',
    rimColor: 'rgba(255,255,255,0.1)',
    labelColor: '#ffffff',
  },
  light: {
    // Losing slice — red
    sectorGradient: {
      cx: '40%', cy: '28%', r: '88%',
      stops: [
        { offset: '0%', color: '#fca5a5' },
        { offset: '20%', color: '#f87171' },
        { offset: '45%', color: '#ef4444' },
        { offset: '70%', color: '#dc2626' },
        { offset: '90%', color: '#b91c1c' },
        { offset: '100%', color: '#7f1d1d' },
      ],
    },
    // Winning slice — green
    baseGradient: {
      cx: '50%', cy: '35%', r: '90%',
      stops: [
        { offset: '0%', color: '#86efac' },
        { offset: '20%', color: '#4ade80' },
        { offset: '45%', color: '#22c55e' },
        { offset: '65%', color: '#16a34a' },
        { offset: '85%', color: '#15803d' },
        { offset: '100%', color: '#166534' },
      ],
    },
    shine: { cx: '30%', cy: '20%', r: '70%' },
    separatorColor: '#374151',
    rimColor: 'rgba(0,0,0,0.08)',
    labelColor: '#1f2937',
  },
};

function MetallicPieChart({ winningPct, losingPct, theme }: { winningPct: number; losingPct: number; theme: 'light' | 'dark' | 'gold' }) {
  const config = PIE_THEME_CONFIG[theme];
  const cx = 150, cy = 150, r = 120;

  // Calculate the gold/sector slice (losing %)
  // Start from 12 o'clock (top), sweep clockwise
  const angleDeg = (losingPct / 100) * 360;
  const angleRad = (angleDeg) * (Math.PI / 180);

  // End point of the arc (starting from top, going clockwise)
  // Top of circle is (cx, cy - r). Clockwise from top means positive angle from -Y axis
  const endX = cx + r * Math.sin(angleRad);
  const endY = cy - r * Math.cos(angleRad);

  // Large arc flag: if sector > 180 degrees, use large arc
  const largeArc = angleDeg > 180 ? 1 : 0;

  // SVG arc: from top point, clockwise (sweep=1) to endpoint
  const sectorPath = `M${cx} ${cy} L${cx} ${cy - r} A${r} ${r} 0 ${largeArc} 1 ${endX.toFixed(1)} ${endY.toFixed(1)} Z`;

  // Label positions — midpoint angle of each sector
  const losingMidAngle = (angleDeg / 2) * (Math.PI / 180);
  const losingLabelX = cx + r * 0.5 * Math.sin(losingMidAngle);
  const losingLabelY = cy - r * 0.5 * Math.cos(losingMidAngle);

  const winningMidAngle = (angleDeg + (360 - angleDeg) / 2) * (Math.PI / 180);
  const winningLabelX = cx + r * 0.5 * Math.sin(winningMidAngle);
  const winningLabelY = cy - r * 0.5 * Math.cos(winningMidAngle);

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <defs>
        {/* Base (winning) gradient */}
        <radialGradient id="pieBase" cx={config.baseGradient.cx} cy={config.baseGradient.cy} r={config.baseGradient.r}>
          {config.baseGradient.stops.map((s, i) => (
            <stop key={i} offset={s.offset} stopColor={s.color} />
          ))}
        </radialGradient>
        {/* Sector (losing) gradient */}
        <radialGradient id="pieSector" cx={config.sectorGradient.cx} cy={config.sectorGradient.cy} r={config.sectorGradient.r}>
          {config.sectorGradient.stops.map((s, i) => (
            <stop key={i} offset={s.offset} stopColor={s.color} />
          ))}
        </radialGradient>
        {/* Metallic shine overlay */}
        <radialGradient id="pieShine" cx={config.shine.cx} cy={config.shine.cy} r={config.shine.r}>
          <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
          <stop offset="25%" stopColor="rgba(255,255,255,0.4)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        {/* Bevel shadow */}
        <filter id="pieBevel">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Base circle (winning %) */}
      <circle cx={cx} cy={cy} r={r} fill="url(#pieBase)" filter="url(#pieBevel)" />

      {/* Sector slice (losing %) */}
      <path d={sectorPath} fill="url(#pieSector)" />

      {/* Separator lines */}
      <line x1={cx} y1={cy} x2={cx} y2={cy - r} stroke={config.separatorColor} strokeWidth="2" />
      <line x1={cx} y1={cy} x2={endX.toFixed(1)} y2={endY.toFixed(1)} stroke={config.separatorColor} strokeWidth="2" />

      {/* Metallic highlight */}
      <circle cx={cx} cy={cy} r={r} fill="url(#pieShine)" opacity="0.55" />

      {/* Subtle rim */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={config.rimColor} strokeWidth="2" />

      {/* Labels */}
      <text x={losingLabelX} y={losingLabelY} textAnchor="middle" dominantBaseline="central" fontSize="28" fontWeight="700" fill={config.labelColor}>
        {losingPct}%
      </text>
      <text x={winningLabelX} y={winningLabelY} textAnchor="middle" dominantBaseline="central" fontSize="28" fontWeight="700" fill={config.labelColor}>
        {winningPct}%
      </text>
    </svg>
  );
}

const INPUT_TABS = ['Text Entry', 'Copy-Paste', 'Upload Doc'] as const;

/* normalizeResult — kept for future AI re-enablement
function normalizeResult(parsed: Record<string, unknown>): AnalysisResult {
  const normalized: AnalysisResult = {
    caseSummary: {
      legalIssue: (parsed.caseSummary as Record<string, unknown>)?.legalIssue as string || 'Analysis completed.',
      keyPoints: ((parsed.caseSummary as Record<string, unknown>)?.keyPoints as string[]) || [],
      successProbability: ((parsed.caseSummary as Record<string, unknown>)?.successProbability as number) ?? 50,
    },
    relevantCaseLaws: (parsed.relevantCaseLaws as AnalysisResult['relevantCaseLaws']) || [],
    statutoryProvisions: (parsed.statutoryProvisions as AnalysisResult['statutoryProvisions']) || [],
    caseTypes: (parsed.caseTypes as string[]) || ['General'],
    jurisdiction: (parsed.jurisdiction as string) || 'India',
    applicableSections: (parsed.applicableSections as AnalysisResult['applicableSections']) || [],
    requiredDocuments: ((parsed.requiredDocuments as Array<Record<string, unknown>>) || []).map((doc, i) => ({
      id: (doc.id as string) || `doc-${i + 1}`,
      description: (doc.description as string) || '',
      checked: (doc.checked as boolean) ?? false,
    })),
    similarCases: ((parsed.similarCases as Array<Record<string, unknown>>) || []).map((sc) => ({
      citation: (sc.citation as string) || 'Unknown Case',
      outcome: (sc.outcome as string) || 'Outcome: Unknown',
      badge: (['WIN', 'LOSS', 'Partial'].includes(sc.badge as string) ? sc.badge : 'Partial') as 'WIN' | 'LOSS' | 'Partial',
    })),
    outcomePrediction: {
      winningPct: Math.max(5, Math.min(95, (parsed.outcomePrediction as Record<string, unknown>)?.winningPct as number ?? 50)),
      losingPct: Math.max(5, Math.min(95, (parsed.outcomePrediction as Record<string, unknown>)?.losingPct as number ?? 50)),
    },
    keyWinningPoints: (parsed.keyWinningPoints as string[]) || [],
    riskFactors: (parsed.riskFactors as string[]) || [],
    strengths: (parsed.strengths as AnalysisResult['strengths']) || [],
    challenges: (parsed.challenges as AnalysisResult['challenges']) || [],
    strategy: (parsed.strategy as AnalysisResult['strategy']) || [],
    expertRecommendation: (parsed.expertRecommendation as string) || 'Please consult with a qualified advocate for specific legal advice.',
  };
  const total = normalized.outcomePrediction.winningPct + normalized.outcomePrediction.losingPct;
  if (total !== 100) {
    normalized.outcomePrediction.losingPct = 100 - normalized.outcomePrediction.winningPct;
  }
  return normalized;
}
*/

export function AnalyserPage() {
  const { theme } = useTheme();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [caseText, setCaseText] = useState('');
  const [activeInputTab, setActiveInputTab] = useState<string>('Text Entry');
  const [recommendations, setRecommendations] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [, setAnalysisError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  // Bulk upload states
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fileInfos, setFileInfos] = useState<Array<{ name: string; pages: number; wordCount: number }>>([]);
  const [extractedTexts, setExtractedTexts] = useState<Array<{ name: string; text: string }>>([]);

  // Carousel states
  const [analysisResults, setAnalysisResults] = useState<Array<{ fileName: string; result: AnalysisResult }>>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [analyzeProgress, setAnalyzeProgress] = useState('');

  // Modal states
  const [caseTypeModal, setCaseTypeModal] = useState<string | null>(null);
  const [sectionModal, setSectionModal] = useState<string | null>(null);
  const [docModal, setDocModal] = useState<string | null>(null);
  const [similarCaseModal, setSimilarCaseModal] = useState<string | null>(null);
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [showExport, setShowExport] = useState(false);

  // Swipe gesture support for carousel
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50; // minimum swipe distance in px

    if (diff > threshold && activeSlide < analysisResults.length - 1) {
      // Swiped left → next slide
      setActiveSlide(activeSlide + 1);
    } else if (diff < -threshold && activeSlide > 0) {
      // Swiped right → previous slide
      setActiveSlide(activeSlide - 1);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadedFiles(files);
    setIsExtracting(true);
    setAnalysisError(null);
    setAnalysisResults([]);
    setAnalysisResult(null);

    const infos: Array<{ name: string; pages: number; wordCount: number; text: string }> = [];
    for (const file of files) {
      try {
        const { text, pages, wordCount } = await extractTextFromFile(file);
        infos.push({ name: file.name, pages, wordCount, text });
      } catch (error) {
        infos.push({ name: file.name, pages: 0, wordCount: 0, text: '' });
      }
    }

    setFileInfos(infos.map(i => ({ name: i.name, pages: i.pages, wordCount: i.wordCount })));
    setExtractedTexts(infos.map(i => ({ name: i.name, text: i.text })));
    // For single file, set caseText for backward compatibility
    if (infos.length === 1) setCaseText(infos[0].text);
    setActiveInputTab('Upload Doc');
    setIsExtracting(false);
  };

  const handleAnalyze = async () => {
    // AI code commented out — always using fallback data
    // If multiple files uploaded, assign alternating fallback data to each
    if (extractedTexts.length > 1) {
      setIsAnalyzing(true);
      setAnalysisError(null);
      setAnalysisResult(null);
      const results: Array<{ fileName: string; result: AnalysisResult }> = [];

      for (let i = 0; i < extractedTexts.length; i++) {
        const { name, text } = extractedTexts[i];
        if (!text.trim() || text.length < 50) continue;
        setAnalyzeProgress(`Analyzing file ${i + 1} of ${extractedTexts.length}: ${name}`);
        // Simulate short delay for UX
        await new Promise(resolve => setTimeout(resolve, 800));

        // Use alternating fallback data instead of AI call
        const fallbackResult = getNextFallbackData();
        results.push({ fileName: name, result: fallbackResult });
      }

      setAnalysisResults(results);
      setActiveSlide(0);
      setAnalyzeProgress('');
      setIsAnalyzing(false);
      return;
    }

    // Single text analysis — use fallback data directly
    if (!caseText.trim() && extractedTexts.length === 0) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    // Simulate analysis delay for UX
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Always use fallback data (alternates between FALLBACK_DATA_1 and FALLBACK_DATA_2)
    const fallbackResult = getNextFallbackData();
    setAnalysisResult(fallbackResult);
    setAnalysisResults([{ fileName: uploadedFiles.length === 1 ? uploadedFiles[0].name : 'Text Input', result: fallbackResult }]);
    setActiveSlide(0);
    setIsAnalyzing(false);

    /* --- ORIGINAL AI CODE (commented out) ---
    const trimmedText = caseText.trim();
    if (trimmedText.length < 50) {
      setAnalysisError('Please provide detailed case information (at least 50 characters).');
      setAnalysisResult(null);
      return;
    }
    const legalKeywords = ['case', 'court', 'section', 'act', 'law', 'dispute', 'plaintiff', 'defendant', 'accused', 'complainant', 'petition', 'appeal', 'judgment', 'order', 'contract', 'property', 'criminal', 'civil', 'fir', 'bail', 'divorce', 'custody', 'compensation', 'damages', 'fraud', 'cheating', 'theft', 'murder', 'assault', 'negligence', 'breach', 'agreement', 'tenant', 'landlord', 'employer', 'employee', 'insurance', 'claim', 'arbitration', 'tribunal', 'ipc', 'crpc', 'cpc', 'bns', 'bnss', 'constitution', 'article', 'writ', 'habeas', 'mandamus', 'vs', 'versus'];
    const lowerText = trimmedText.toLowerCase();
    const hasLegalContent = legalKeywords.some(keyword => lowerText.includes(keyword));
    if (!hasLegalContent && trimmedText.split(/\s+/).length < 20) {
      setAnalysisError('The text does not appear to contain legal case information.');
      setAnalysisResult(null);
      return;
    }
    try {
      const rawResponse = await analyzeCase(caseText, recommendations);
      const cleanedResponse = rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanedResponse);
      const normalized = normalizeResult(parsed);
      setAnalysisResult(normalized);
      setAnalysisResults([{ fileName: uploadedFiles.length === 1 ? uploadedFiles[0].name : 'Text Input', result: normalized }]);
      setActiveSlide(0);
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : 'Analysis failed.');
      setAnalysisResult(mockAnalysisResult);
    } finally {
      setIsAnalyzing(false);
    }
    --- END ORIGINAL AI CODE --- */
  };

  const handleExport = (type: string) => {
    const data = analysisResults.length > 1 ? analysisResults[activeSlide]?.result : analysisResult;
    if (!data) return;

    if (type === 'Download PDF Report') {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('Legal Case Analysis Report', 14, 22);
      doc.setFontSize(11);
      let y = 35;

      doc.setFontSize(13);
      doc.text('Case Summary', 14, y); y += 8;
      doc.setFontSize(10);
      const summaryLines = doc.splitTextToSize(data.caseSummary.legalIssue, 180);
      doc.text(summaryLines, 14, y); y += summaryLines.length * 5 + 5;

      doc.text(`Success Probability: ${data.caseSummary.successProbability}%`, 14, y); y += 10;

      doc.setFontSize(13);
      doc.text('Applicable Sections', 14, y); y += 8;
      doc.setFontSize(10);
      data.applicableSections.forEach(s => {
        if (y > 270) { doc.addPage(); y = 20; }
        const sectionLines = doc.splitTextToSize(`- ${s.section} - ${s.description}`, 180);
        doc.text(sectionLines, 14, y); y += sectionLines.length * 5 + 1;
      });
      y += 5;

      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFontSize(13);
      doc.text('Key Winning Points', 14, y); y += 8;
      doc.setFontSize(10);
      data.keyWinningPoints.forEach(p => {
        if (y > 270) { doc.addPage(); y = 20; }
        const pointLines = doc.splitTextToSize(`- ${p}`, 180);
        doc.text(pointLines, 14, y); y += pointLines.length * 5 + 1;
      });
      y += 5;

      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFontSize(13);
      doc.text('Risk Factors', 14, y); y += 8;
      doc.setFontSize(10);
      data.riskFactors.forEach(r => {
        if (y > 270) { doc.addPage(); y = 20; }
        const riskLines = doc.splitTextToSize(`- ${r}`, 180);
        doc.text(riskLines, 14, y); y += riskLines.length * 5 + 1;
      });
      y += 5;

      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFontSize(13);
      doc.text('Expert Recommendation', 14, y); y += 8;
      doc.setFontSize(10);
      const recLines = doc.splitTextToSize(data.expertRecommendation, 180);
      doc.text(recLines, 14, y);

      doc.save('case-analysis-report.pdf');
    } else if (type === 'Export to Word') {
      const analysisText = `LEGAL CASE ANALYSIS REPORT\n${'='.repeat(40)}\n\nCase Summary:\n${data.caseSummary.legalIssue}\n\nSuccess Probability: ${data.caseSummary.successProbability}%\n\nKey Points:\n${data.caseSummary.keyPoints.map(p => '• ' + p).join('\n')}\n\nApplicable Sections:\n${data.applicableSections.map(s => '• ' + s.section + ' - ' + s.description).join('\n')}\n\nKey Winning Points:\n${data.keyWinningPoints.map(p => '✓ ' + p).join('\n')}\n\nRisk Factors:\n${data.riskFactors.map(r => '⚠ ' + r).join('\n')}\n\nExpert Recommendation:\n${data.expertRecommendation}`;
      const blob = new Blob([analysisText], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'case-analysis-report.doc';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (type === 'Print Analysis') {
      window.print();
    } else if (type === 'Save to Case File') {
      const analysisText = `LEGAL CASE ANALYSIS REPORT\n${'='.repeat(40)}\n\nCase Summary:\n${data.caseSummary.legalIssue}\n\nSuccess Probability: ${data.caseSummary.successProbability}%\n\nKey Points:\n${data.caseSummary.keyPoints.map(p => '• ' + p).join('\n')}\n\nApplicable Sections:\n${data.applicableSections.map(s => '• ' + s.section + ' - ' + s.description).join('\n')}\n\nKey Winning Points:\n${data.keyWinningPoints.map(p => '✓ ' + p).join('\n')}\n\nRisk Factors:\n${data.riskFactors.map(r => '⚠ ' + r).join('\n')}\n\nExpert Recommendation:\n${data.expertRecommendation}`;
      localStorage.setItem('juryfy_saved_analysis', analysisText);
      alert('Analysis saved to case file!');
    } else if (type === 'Email Report') {
      const analysisText = `LEGAL CASE ANALYSIS REPORT\n${'='.repeat(40)}\n\nCase Summary:\n${data.caseSummary.legalIssue}\n\nSuccess Probability: ${data.caseSummary.successProbability}%\n\nKey Points:\n${data.caseSummary.keyPoints.map(p => '• ' + p).join('\n')}\n\nApplicable Sections:\n${data.applicableSections.map(s => '• ' + s.section + ' - ' + s.description).join('\n')}\n\nKey Winning Points:\n${data.keyWinningPoints.map(p => '✓ ' + p).join('\n')}\n\nRisk Factors:\n${data.riskFactors.map(r => '⚠ ' + r).join('\n')}\n\nExpert Recommendation:\n${data.expertRecommendation}`;
      window.open(`mailto:?subject=Case Analysis Report&body=${encodeURIComponent(analysisText.substring(0, 2000))}`);
    }
  };

  // Determine which data to display (single vs carousel)
  const isCarousel = analysisResults.length > 1;
  const displayData = isCarousel ? analysisResults[activeSlide]?.result : analysisResult;
  const hasAnyResult = isCarousel || !!analysisResult;

  return (
    <div className="space-y-4">
      <PageHeader title="Analyser" icon={Brain} />

      {/* Hero title */}
      <div className="text-center py-2">
        <h2 className="text-3xl font-bold gradient-text mb-1">Legal Case Analyser</h2>
        <p className="text-text-secondary text-sm max-w-2xl mx-auto">
          Submit your case details and get AI-powered insights to assess your chances of success
        </p>
      </div>

      {/* Error / Success indicator */}
      {hasAnyResult && (
        <div className="px-4 py-2 bg-success/10 border border-success/30 rounded-xl text-sm text-success">
          ✓ Analysis complete (Demo Mode — showing sample data)
          {isCarousel && ` — ${analysisResults.length} files analyzed`}
        </div>
      )}

      {/* 3-Column Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* LEFT COLUMN - Input Panel (~25%) */}
        <div className="md:col-span-3 space-y-4">
          <GlassCard className="!p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">More Inputs to Your Case</h3>

            {/* Tabs */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {INPUT_TABS.map((tab) => {
                const icon = tab === 'Text Entry' ? '📄' : tab === 'Copy-Paste' ? '📋' : '✉️';
                return (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveInputTab(tab);
                      // Clear bulk upload state when switching away from Upload Doc
                      if (tab !== 'Upload Doc') {
                        setExtractedTexts([]);
                        setUploadedFiles([]);
                        setFileInfos([]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      activeInputTab === tab
                        ? 'bg-accent-primary/20 border-accent-primary text-accent-primary'
                        : 'bg-transparent border-border text-text-secondary hover:text-text-primary hover:border-text-muted'
                    }`}
                  >
                    {icon} {tab}
                  </button>
                );
              })}
            </div>

            {/* File upload or text area */}
            {activeInputTab === 'Upload Doc' ? (
              <div className="mb-3">
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border rounded-xl cursor-pointer bg-bg-elevated hover:bg-bg-elevated/80 transition-colors">
                  <div className="flex flex-col items-center justify-center py-3">
                    {isExtracting ? (
                      <>
                        <Loader2 className="w-6 h-6 text-accent-primary animate-spin mb-1" />
                        <p className="text-xs text-text-secondary">Extracting text...</p>
                      </>
                    ) : uploadedFiles.length > 0 ? (
                      <>
                        <FileText className="w-6 h-6 text-success mb-1" />
                        <p className="text-xs font-medium text-text-primary">
                          {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} uploaded
                        </p>
                        <p className="text-xs text-text-secondary mt-0.5">
                          Click to change
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-text-muted mb-1" />
                        <p className="text-xs text-text-secondary">
                          <span className="font-medium text-accent-primary">Click to upload</span>
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">{SUPPORTED_FILE_TYPES_LABEL}</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept={SUPPORTED_FILE_TYPES}
                    multiple
                    onChange={handleFileUpload}
                  />
                </label>

                {/* Uploaded files list */}
                {fileInfos.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-36 overflow-y-auto">
                    {fileInfos.map((info, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-bg-elevated rounded-lg">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <FileText className="w-3.5 h-3.5 text-accent-primary shrink-0" />
                          <span className="text-xs text-text-primary truncate">{info.name}</span>
                        </div>
                        <span className="text-xs text-text-muted shrink-0 ml-2">
                          {info.pages}p • {info.wordCount.toLocaleString()}w
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <textarea
                value={caseText}
                onChange={(e) => setCaseText(e.target.value)}
                placeholder="Type or paste your case details here..."
                className="w-full h-32 bg-white/10 border border-accent-primary/30 rounded-xl p-3 text-sm text-white placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary/50 mb-3"
              />
            )}

            {/* Recommendations */}
            <label className="block text-xs font-semibold text-text-primary mb-1">
              User Recommendations/Consideration:
            </label>
            <textarea
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              placeholder="Type or paste the details of your case here..."
              className="w-full h-20 bg-white/10 border border-accent-primary/30 rounded-xl p-3 text-sm text-white placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary/50 mb-4"
            />

            {/* Analyze button */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="gradient-btn w-full py-3 text-center font-bold text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {analyzeProgress || 'Analyzing...'}
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Analyze Case{extractedTexts.length > 1 ? ` (${extractedTexts.length} files)` : ''}
                </>
              )}
            </button>
          </GlassCard>

          {/* Export floating popover */}
          {hasAnyResult && (
            <div className="relative">
              <button
                onClick={() => setShowExport(!showExport)}
                className="gradient-btn w-full py-2.5 text-center font-medium text-white text-sm flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>

              {/* Popover bubble — opens upward */}
              {showExport && (
                <>
                  {/* Backdrop to close on click outside */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowExport(false)} />
                  
                  <div className="absolute bottom-full mb-2 left-0 right-0 z-50 glass-card p-2 shadow-2xl animate-[slideIn_0.2s_ease-out]">
                    <div className="space-y-1">
                      <button onClick={() => { handleExport('Download PDF Report'); setShowExport(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors">
                        <Download className="w-4 h-4" /> Download PDF
                      </button>
                      <button onClick={() => { handleExport('Export to Word'); setShowExport(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors">
                        <FileText className="w-4 h-4" /> Export Word
                      </button>
                      <button onClick={() => { handleExport('Save to Case File'); setShowExport(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors">
                        <Save className="w-4 h-4" /> Save
                      </button>
                      <button onClick={() => { handleExport('Email Report'); setShowExport(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors">
                        <Mail className="w-4 h-4" /> Email
                      </button>
                      <button onClick={() => { handleExport('Print Analysis'); setShowExport(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors">
                        <Printer className="w-4 h-4" /> Print
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* MIDDLE + RIGHT COLUMNS - Carousel or standard layout */}
        {isCarousel ? (
          <div
            className="md:col-span-9 relative"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Carousel header with file name and navigation */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-primary truncate">
                📄 {analysisResults[activeSlide]?.fileName}
              </h3>
              <span className="text-xs text-text-muted">
                {activeSlide + 1} / {analysisResults.length}
              </span>
            </div>

            {/* Navigation arrows */}
            <button
              onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
              disabled={activeSlide === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-accent-primary text-white shadow-xl flex items-center justify-center hover:bg-accent-hover disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveSlide(Math.min(analysisResults.length - 1, activeSlide + 1))}
              disabled={activeSlide === analysisResults.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-accent-primary text-white shadow-xl flex items-center justify-center hover:bg-accent-hover disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Content grid */}
            <div
              key={activeSlide}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden animate-[slideIn_0.3s_ease-out]"
              style={{ animation: 'slideIn 0.3s ease-out' }}
            >
              {/* Left half - Case Type, Sections, Docs */}
              <div className="space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
                {displayData && (
                  <>
                    {/* Case Type & Jurisdiction */}
                    <GlassCard className="!p-4">
                      <h3 className="text-sm font-semibold text-text-primary mb-3">Case Type &amp; Jurisdiction</h3>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {displayData.caseTypes.map((ct) => (
                          <button key={ct} onClick={() => setCaseTypeModal(ct)}
                            className="px-3 py-1 rounded-md cursor-pointer hover:opacity-80 transition-opacity text-xs font-medium border border-accent-primary text-accent-primary bg-accent-primary/10">
                            {ct}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-text-secondary">Jurisdiction: {displayData.jurisdiction}</p>
                    </GlassCard>

                    {/* Applicable Legal Sections */}
                    <GlassCard className="!p-4">
                      <h3 className="text-sm font-semibold text-text-primary mb-3">Applicable Legal Sections</h3>
                      <div className="space-y-2">
                        {displayData.applicableSections.map((sec, i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 bg-bg-elevated rounded-lg">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-semibold text-text-primary">{sec.section}</h4>
                              <p className="text-xs text-text-secondary">{sec.description}</p>
                            </div>
                            <MetallicButton
                              label={sec.relevance}
                              variant={sec.relevance === 'High relevance' ? 'gold' : 'bronze'}
                              onClick={() => setSectionModal(sec.section)}
                              theme={theme}
                            />
                          </div>
                        ))}
                      </div>
                    </GlassCard>

                    {/* Required Documents */}
                    <GlassCard className="!p-4">
                      <h3 className="text-sm font-semibold text-text-primary mb-3">📁 Required Documents</h3>
                      <div className="space-y-2">
                        {displayData.requiredDocuments.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-2.5 bg-bg-elevated rounded-lg">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <input type="checkbox" defaultChecked={doc.checked} className="w-3.5 h-3.5 rounded accent-accent-primary shrink-0" />
                              <span className="text-xs text-text-secondary">{doc.description}</span>
                            </div>
                            <MetallicButton
                              label="Create"
                              variant="bronze"
                              onClick={() => setDocModal(doc.id)}
                              theme={theme}
                            />
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  </>
                )}
              </div>

              {/* Right half - Similar Cases, Outcome, Points */}
              <div className="space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
                {displayData && (
                  <>
                    {/* Similar Historical Cases */}
                    <GlassCard className="!p-4">
                      <h3 className="text-sm font-semibold text-text-primary mb-3">Similar Historical Cases</h3>
                      <div className="space-y-2">
                        {displayData.similarCases.length > 0 ? (
                          displayData.similarCases.map((sc, i) => (
                            <button key={i} onClick={() => setSimilarCaseModal(sc.citation)}
                              className="w-full flex items-center justify-between p-2.5 bg-bg-elevated rounded-lg hover:bg-bg-elevated/80 transition-colors text-left">
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-semibold text-text-primary">{sc.citation}</h4>
                                <p className="text-xs text-text-secondary">{sc.outcome}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-md text-xs font-bold shrink-0 ml-2 border ${
                                sc.badge === 'WIN' ? 'border-green-400 text-green-400 bg-green-400/10'
                                  : sc.badge === 'LOSS' ? 'border-red-400 text-red-400 bg-red-400/10'
                                  : 'border-yellow-400 text-yellow-400 bg-yellow-400/10'
                              }`}>
                                {sc.badge === 'WIN' ? '✓ ' : sc.badge === 'LOSS' ? '✗ ' : '⚠ '}{sc.badge}
                              </span>
                            </button>
                          ))
                        ) : (
                          <p className="text-xs text-text-muted italic">No similar cases found for this analysis.</p>
                        )}
                      </div>
                    </GlassCard>

                    {/* Outcome Prediction + Key Winning Points + Risk Factors */}
                    <GlassCard className="!p-4">
                      <h3 className="text-sm font-semibold text-text-primary mb-3">Outcome Prediction</h3>
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-44 h-44 relative">
                          <MetallicPieChart
                            winningPct={displayData.outcomePrediction.winningPct}
                            losingPct={displayData.outcomePrediction.losingPct}
                            theme={theme}
                          />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <h4 className="text-xs font-bold text-text-primary mb-1">Key Winning Points:</h4>
                            <ul className="space-y-1">
                              {displayData.keyWinningPoints.map((point, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-xs text-text-secondary">
                                  <span className="text-success mt-0.5">•</span>{point}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-text-primary mb-1">Risk Factors:</h4>
                            <ul className="space-y-1">
                              {displayData.riskFactors.map((risk, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-xs text-text-secondary">
                                  <span className="text-danger mt-0.5">•</span>{risk}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Bottom bar */}
                      <div className="flex items-center gap-2 pt-3 border-t border-border">
                        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 border border-success/30">
                          <span className="w-2 h-2 rounded-full bg-success" />
                          <span className="text-sm text-white font-semibold">{displayData.outcomePrediction.winningPct}% - Winning</span>
                        </div>
                        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-danger/10 border border-danger/30">
                          <span className="w-2 h-2 rounded-full bg-danger" />
                          <span className="text-sm text-white font-semibold">{displayData.outcomePrediction.losingPct}% - Losing</span>
                        </div>
                        <button className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-text-secondary hover:text-text-primary transition-colors">
                          Explore
                        </button>
                      </div>
                    </GlassCard>
                  </>
                )}
              </div>
            </div>

            {/* Dot indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {analysisResults.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === activeSlide
                      ? 'bg-accent-primary scale-125'
                      : 'bg-bg-elevated border border-border hover:bg-text-muted'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Standard single-result layout: MIDDLE COLUMN (~37%) */}
            <div className="md:col-span-4 space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-10 h-10 text-accent-primary animate-spin" />
                  <p className="text-text-secondary text-sm">{analyzeProgress || 'Analyzing case...'}</p>
                </div>
              ) : !displayData ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Brain className="w-10 h-10 text-text-muted opacity-30" />
                  <p className="text-text-muted text-xs text-center">Upload a case file or paste case details and click &quot;Analyze Case&quot; to see results here</p>
                </div>
              ) : (
                <>
                  {/* Case Type & Jurisdiction */}
                  <GlassCard className="!p-4">
                    <h3 className="text-sm font-semibold text-text-primary mb-3">Case Type &amp; Jurisdiction</h3>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {displayData.caseTypes.map((ct) => (
                        <button key={ct} onClick={() => setCaseTypeModal(ct)}
                          className="px-3 py-1 rounded-md cursor-pointer hover:opacity-80 transition-opacity text-xs font-medium border border-accent-primary text-accent-primary bg-accent-primary/10">
                          {ct}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-text-secondary">Jurisdiction: {displayData.jurisdiction}</p>
                  </GlassCard>

                  {/* Applicable Legal Sections */}
                  <GlassCard className="!p-4">
                    <h3 className="text-sm font-semibold text-text-primary mb-3">Applicable Legal Sections</h3>
                    <div className="space-y-2">
                      {displayData.applicableSections.map((sec, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 bg-bg-elevated rounded-lg">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-text-primary">{sec.section}</h4>
                            <p className="text-xs text-text-secondary">{sec.description}</p>
                          </div>
                          <MetallicButton
                            label={sec.relevance}
                            variant={sec.relevance === 'High relevance' ? 'gold' : 'bronze'}
                            onClick={() => setSectionModal(sec.section)}
                            theme={theme}
                          />
                        </div>
                      ))}
                    </div>
                  </GlassCard>

                  {/* Required Documents */}
                  <GlassCard className="!p-4">
                    <h3 className="text-sm font-semibold text-text-primary mb-3">📁 Required Documents</h3>
                    <div className="space-y-2">
                      {displayData.requiredDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-2.5 bg-bg-elevated rounded-lg">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <input type="checkbox" defaultChecked={doc.checked} className="w-3.5 h-3.5 rounded accent-accent-primary shrink-0" />
                            <span className="text-xs text-text-secondary">{doc.description}</span>
                          </div>
                          <MetallicButton
                            label="Create"
                            variant="bronze"
                            onClick={() => setDocModal(doc.id)}
                            theme={theme}
                          />
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </>
              )}
            </div>

            {/* RIGHT COLUMN (~38%) */}
            <div className="md:col-span-5 space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-10 h-10 text-accent-primary animate-spin" />
                  <p className="text-text-secondary text-sm">Processing results...</p>
                </div>
              ) : !displayData ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Search className="w-10 h-10 text-text-muted opacity-30" />
                  <p className="text-text-muted text-xs text-center">Analysis results will appear here</p>
                </div>
              ) : (
                <>
                  {/* Similar Historical Cases */}
                  <GlassCard className="!p-4">
                    <h3 className="text-sm font-semibold text-text-primary mb-3">Similar Historical Cases</h3>
                    <div className="space-y-2">
                      {displayData.similarCases.length > 0 ? (
                        displayData.similarCases.map((sc, i) => (
                          <button key={i} onClick={() => setSimilarCaseModal(sc.citation)}
                            className="w-full flex items-center justify-between p-2.5 bg-bg-elevated rounded-lg hover:bg-bg-elevated/80 transition-colors text-left">
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-semibold text-text-primary">{sc.citation}</h4>
                              <p className="text-xs text-text-secondary">{sc.outcome}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-md text-xs font-bold shrink-0 ml-2 border ${
                              sc.badge === 'WIN' ? 'border-green-400 text-green-400 bg-green-400/10'
                                : sc.badge === 'LOSS' ? 'border-red-400 text-red-400 bg-red-400/10'
                                : 'border-yellow-400 text-yellow-400 bg-yellow-400/10'
                            }`}>
                              {sc.badge === 'WIN' ? '✓ ' : sc.badge === 'LOSS' ? '✗ ' : '⚠ '}{sc.badge}
                            </span>
                          </button>
                        ))
                      ) : (
                        <p className="text-xs text-text-muted italic">No similar cases found for this analysis.</p>
                      )}
                    </div>
                  </GlassCard>

                  {/* Outcome Prediction + Key Winning Points + Risk Factors */}
                  <GlassCard className="!p-4">
                    <h3 className="text-sm font-semibold text-text-primary mb-3">Outcome Prediction</h3>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-44 h-44 relative">
                        <MetallicPieChart
                          winningPct={displayData.outcomePrediction.winningPct}
                          losingPct={displayData.outcomePrediction.losingPct}
                          theme={theme}
                        />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <h4 className="text-xs font-bold text-text-primary mb-1">Key Winning Points:</h4>
                          <ul className="space-y-1">
                            {displayData.keyWinningPoints.map((point, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-xs text-text-secondary">
                                <span className="text-success mt-0.5">•</span>{point}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-text-primary mb-1">Risk Factors:</h4>
                          <ul className="space-y-1">
                            {displayData.riskFactors.map((risk, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-xs text-text-secondary">
                                <span className="text-danger mt-0.5">•</span>{risk}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="flex items-center gap-2 pt-3 border-t border-border">
                      <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 border border-success/30">
                        <span className="w-2 h-2 rounded-full bg-success" />
                        <span className="text-sm text-white font-semibold">{displayData.outcomePrediction.winningPct}% - Winning</span>
                      </div>
                      <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-danger/10 border border-danger/30">
                        <span className="w-2 h-2 rounded-full bg-danger" />
                        <span className="text-sm text-white font-semibold">{displayData.outcomePrediction.losingPct}% - Losing</span>
                      </div>
                      <button className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-text-secondary hover:text-text-primary transition-colors">
                        Explore
                      </button>
                    </div>
                  </GlassCard>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* ─── MODALS ─── */}

      {/* Case Type Modal */}
      <Modal
        isOpen={!!caseTypeModal}
        onClose={() => setCaseTypeModal(null)}
        title={caseTypeModal ?? ''}
      >
        <p className="text-sm text-text-secondary">
          {caseTypeModal === 'Criminal'
            ? 'Criminal cases involve offenses against the state or public, including theft, assault, fraud, and other violations of criminal law. These cases are prosecuted by the government.'
            : 'Financial fraud cases involve deception for monetary gain, including embezzlement, securities fraud, Ponzi schemes, and other forms of financial misconduct.'}
        </p>
      </Modal>

      {/* Section Modal */}
      <Modal
        isOpen={!!sectionModal}
        onClose={() => setSectionModal(null)}
        title={sectionModal ?? ''}
      >
        <p className="text-sm text-text-secondary">
          {sectionModal === 'Section 420 IPC'
            ? 'Section 420 of the Indian Penal Code deals with cheating and dishonestly inducing delivery of property. Punishment includes imprisonment up to 7 years and fine.'
            : sectionModal === 'Criminal 406 IPC'
            ? 'Section 406 IPC deals with criminal breach of trust. Whoever commits criminal breach of trust shall be punished with imprisonment up to 3 years, or with fine, or both.'
            : 'Section 66D of the IT Act deals with punishment for cheating by personation using computer resources. Punishment includes imprisonment up to 3 years and fine up to one lakh rupees.'}
        </p>
      </Modal>

      {/* Document Creation Modal */}
      <Modal
        isOpen={!!docModal}
        onClose={() => {
          setDocModal(null);
          setDocTitle('');
          setDocContent('');
        }}
        title="Create Document"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Title</label>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="Document title..."
              className="w-full bg-bg-elevated border border-border rounded-xl px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Content</label>
            <textarea
              value={docContent}
              onChange={(e) => setDocContent(e.target.value)}
              placeholder="Document content..."
              className="w-full h-32 bg-bg-elevated border border-border rounded-xl p-4 text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
            />
          </div>
          <button
            onClick={() => {
              alert('Document created successfully!');
              setDocModal(null);
              setDocTitle('');
              setDocContent('');
            }}
            className="gradient-btn w-full py-2.5 text-center font-medium text-white"
          >
            Save Document
          </button>
        </div>
      </Modal>

      {/* Similar Case Modal */}
      <Modal
        isOpen={!!similarCaseModal}
        onClose={() => setSimilarCaseModal(null)}
        title={similarCaseModal ?? ''}
      >
        {(() => {
          const selectedCase = displayData?.similarCases?.find((c) => c.citation === similarCaseModal);
          if (!selectedCase) return null;
          return (
            <div className="space-y-3">
              <p className="text-sm text-text-secondary">
                <strong className="text-text-primary">Citation:</strong> {selectedCase.citation}
              </p>
              <p className="text-sm text-text-secondary">
                <strong className="text-text-primary">Outcome:</strong> {selectedCase.outcome}
              </p>
              <p className="text-sm text-text-secondary">
                <strong className="text-text-primary">Result:</strong>{' '}
                <span className={`badge ${
                  selectedCase.badge === 'WIN' ? 'badge-success'
                    : selectedCase.badge === 'LOSS' ? 'badge-danger' : 'badge-warning'
                }`}>
                  {selectedCase.badge}
                </span>
              </p>
              <p className="text-sm text-text-secondary">
                This case shares similar legal issues and factual circumstances with your current case.
                The precedent set here may be relevant to your legal strategy.
              </p>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}