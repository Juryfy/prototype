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
  Maximize2,
  Minimize2,
} from 'lucide-react';
// Recharts removed — using custom SVG metallic pie chart
import { type AnalysisResult } from '@/data/mockAnalyserData';
import { analyzeCase } from '@/services/claudeService';
import { extractTextFromFile, SUPPORTED_FILE_TYPES, SUPPORTED_FILE_TYPES_LABEL } from '@/services/fileExtractor';
import { PageHeader, GlassCard, Modal } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';

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

// Simple flat donut chart colors per theme
const PIE_FLAT_COLORS = {
  light: { winning: '#008000', losing: '#FF0000' },
  dark: { winning: '#22c55e', losing: '#ef4444' },
  gold: { winning: '#D4A853', losing: '#8a8a8a' },
};

function MetallicPieChart({ winningPct, losingPct, theme }: { winningPct: number; losingPct: number; theme: 'light' | 'dark' | 'gold' }) {
  const colors = PIE_FLAT_COLORS[theme];
  const cx = 150, cy = 150, r = 120;

  // Losing slice angle (starts from top, clockwise)
  const angleDeg = (losingPct / 100) * 360;
  const angleRad = angleDeg * (Math.PI / 180);

  const endX = cx + r * Math.sin(angleRad);
  const endY = cy - r * Math.cos(angleRad);

  const largeArc = angleDeg > 180 ? 1 : 0;

  // Losing slice path (pie wedge from center)
  const losingPath = [
    `M${cx} ${cy}`,
    `L${cx} ${cy - r}`,
    `A${r} ${r} 0 ${largeArc} 1 ${endX.toFixed(1)} ${endY.toFixed(1)}`,
    'Z',
  ].join(' ');

  // Winning slice path (remaining pie wedge)
  const winLargeArc = (360 - angleDeg) > 180 ? 1 : 0;
  const winningPath = [
    `M${cx} ${cy}`,
    `L${endX.toFixed(1)} ${endY.toFixed(1)}`,
    `A${r} ${r} 0 ${winLargeArc} 1 ${cx} ${cy - r}`,
    'Z',
  ].join(' ');

  // Label positions (2/3 from center to edge)
  const labelR = r * 0.6;
  const losingMidAngle = (angleDeg / 2) * (Math.PI / 180);
  const losingLabelX = cx + labelR * Math.sin(losingMidAngle);
  const losingLabelY = cy - labelR * Math.cos(losingMidAngle);

  const winningMidAngle = (angleDeg + (360 - angleDeg) / 2) * (Math.PI / 180);
  const winningLabelX = cx + labelR * Math.sin(winningMidAngle);
  const winningLabelY = cy - labelR * Math.cos(winningMidAngle);

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      {/* Winning slice */}
      <path d={winningPath} fill={colors.winning} />
      {/* Losing slice */}
      <path d={losingPath} fill={colors.losing} />

      {/* Labels */}
      <text x={losingLabelX} y={losingLabelY} textAnchor="middle" dominantBaseline="central" fontSize="22" fontWeight="700" fill="#ffffff">
        {losingPct}%
      </text>
      <text x={winningLabelX} y={winningLabelY} textAnchor="middle" dominantBaseline="central" fontSize="22" fontWeight="700" fill="#ffffff">
        {winningPct}%
      </text>
    </svg>
  );
}

const INPUT_TABS = ['Text Entry', 'Copy-Paste', 'Upload Doc'] as const;

/** Normalize raw parsed JSON into a valid AnalysisResult with defaults */
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

// ─── Case Type Detail Data ───
const CASE_TYPE_DETAILS: Record<string, { title: string; intro: string; rows: { label: string; content: string }[] }> = {
  'Criminal Case': {
    title: '1. CRIMINAL CASE (as opposed to Civil Case)',
    intro: "In India's criminal justice system, every case is classified into a specific 'case type' that determines the procedure to be followed, which court will hear it, the rights of the accused, and the powers of the police. The case type is determined primarily by the nature of the offence charged.",
    rows: [
      { label: 'Category', content: 'Criminal Case' },
      { label: 'Definition', content: 'A criminal case is one where the State (Government) prosecutes an individual for committing an act that is prohibited by law and harmful to society at large. The State acts as the complainant/prosecutor on behalf of society. The accused faces punishment — imprisonment, fine, or both — if convicted.' },
      { label: 'Distinguished From', content: 'A civil case involves a dispute between two private parties (e.g., property disputes, contract breaches, divorce). In a civil case, the remedy is usually compensation or an injunction — not imprisonment.' },
      { label: 'Why This Case is Criminal', content: 'Hemant Desai was accused of theft — an act criminalised by the State under the Indian Penal Code. The case title "State of Maharashtra v. Hemant Pramod Desai" itself shows the State prosecuting on behalf of the victim and society. The remedy sought was imprisonment and fine — characteristic of criminal proceedings. No civil claim was made in this case.' },
    ],
  },
  'Cognizable Offence': {
    title: '2. COGNIZABLE OFFENCE',
    intro: "In India's criminal justice system, every case is classified into a specific 'case type' that determines the procedure to be followed, which court will hear it, the rights of the accused, and the powers of the police. The case type is determined primarily by the nature of the offence charged.",
    rows: [
      { label: 'Category', content: 'Cognizable Offence' },
      { label: 'Definition', content: 'A cognizable offence is one where the police have the authority to arrest a suspect WITHOUT obtaining a warrant from a magistrate first, register an FIR, and begin investigation on their own motion. These are generally serious offences where immediate police action is required. Defined under the First Schedule to the CrPC 1973 / BNSS 2023.' },
      { label: 'Legal Basis', content: 'Section 2(c), Code of Criminal Procedure 1973 | Now: Section 2(1)(f), Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023.' },
      { label: 'Sections 379 & 380 IPC — Are They Cognizable?', content: 'YES. Both Section 379 (theft) and Section 380 (theft in dwelling/shop) are listed as COGNIZABLE offences in the First Schedule to the CrPC. Police can arrest the accused without a warrant and register an FIR immediately.' },
      { label: 'How This Applied', content: 'When Shoaib Jahagirdar went to Ratnagiri City Police Station and reported the theft, the police were legally obligated to register the FIR (Crime No. 52/2021) immediately. They could — and did — arrest Hemant Desai on 16.03.2021 without requiring a magistrate\'s arrest warrant. The Supreme Court in Lalita Kumari v. State of UP [(2014) 2 SCC 1] has held that police MUST register an FIR for every cognizable offence reported to them — they cannot refuse or conduct a preliminary inquiry first.' },
      { label: 'BNS/BNSS 2023', content: 'Under BNSS 2023, Section 303 BNS (theft) remains a cognizable offence. The First Schedule to BNSS continues to classify it as cognizable and non-bailable.' },
    ],
  },
  'Non-Bailable Offence': {
    title: '3. NON-BAILABLE OFFENCE',
    intro: "In India's criminal justice system, every case is classified into a specific 'case type' that determines the procedure to be followed, which court will hear it, the rights of the accused, and the powers of the police. The case type is determined primarily by the nature of the offence charged.",
    rows: [
      { label: 'Category', content: 'Non-Bailable Offence' },
      { label: 'Definition', content: 'A non-bailable offence is one where the accused does NOT have an automatic right to be released on bail. Bail must be applied for before a court (not a police officer) and the court has discretion to grant or refuse bail, depending on the facts, flight risk, criminal history, and gravity of the offence.' },
      { label: 'Distinguished From', content: 'In a bailable offence, the accused is entitled to bail as a matter of right — the police or court must release the accused on bail if he offers sufficient surety. There is no judicial discretion to refuse.' },
      { label: 'Sections 379 & 380 IPC — Bailable or Non-Bailable?', content: 'Section 379 IPC (ordinary theft) — NON-BAILABLE. Section 380 IPC (theft in dwelling/shop) — NON-BAILABLE. Both are listed as non-bailable in the First Schedule to the CrPC.' },
      { label: 'How This Applied', content: 'After Hemant Desai was arrested on 16.03.2021, he was produced before the JMFC and remanded to judicial custody. He could not be automatically released at the police station. His defence advocate Adv. Sachin Parkar had to file a formal Bail Application under Section 437 CrPC before the JMFC. Hemant remained in judicial custody from 16.03.2021 to 17.06.2021 — a period of approximately 3 months — before being released. This detention was later set off against his final 1-year sentence.' },
      { label: 'BNS/BNSS 2023', content: 'Under BNSS 2023, both BNS Section 303(2) (theft) and BNS Section 305 (theft in building/shop) remain non-bailable. Additionally, BNSS Section 479 now gives undertrial prisoners the right to bail if they have served half the maximum sentence for the offence — a new right not available under the old CrPC.' },
    ],
  },
  'Warrant Case': {
    title: '4. WARRANT CASE (Trial Type)',
    intro: "In India's criminal justice system, every case is classified into a specific 'case type' that determines the procedure to be followed, which court will hear it, the rights of the accused, and the powers of the police. The case type is determined primarily by the nature of the offence charged.",
    rows: [
      { label: 'Category', content: 'Warrant Case' },
      { label: 'Definition', content: 'A warrant case is a criminal case where the offence is punishable with imprisonment exceeding 2 years — or with death, life imprisonment, or rigorous imprisonment. Warrant cases are tried by a more thorough procedure: charges are formally framed, witnesses are cross-examined in detail, and the accused has full opportunity to lead defence evidence. Defined under Section 2(x) CrPC / Section 2(1)(v) BNSS.' },
      { label: 'Distinguished From', content: 'A summons case involves offences punishable with up to 2 years. It follows a simpler, faster procedure without formal charge-framing.' },
      { label: 'Sections 379 & 380 IPC — Warrant or Summons?', content: 'Section 379 IPC — punishable up to 3 years. This crosses the 2-year threshold, making it a WARRANT CASE. Section 380 IPC — punishable up to 7 years. This is clearly a WARRANT CASE.' },
      { label: 'How This Applied', content: 'Since this was a warrant case, the JMFC followed the full warrant case trial procedure under Chapter XIX of the CrPC (Sections 238–250). This meant: (1) the charge-sheet was examined for prima facie case; (2) formal charges were framed and read to the accused (Section 380 IPC and Section 379 IPC); (3) the accused was asked to plead guilty or not guilty; (4) prosecution witnesses were examined and cross-examined; (5) the accused was examined under Section 313 CrPC; (6) the accused was given the opportunity to lead defence evidence (he declined); (7) arguments were heard; and (8) the judgment was pronounced. The conviction was recorded under Section 248(2) CrPC — the specific provision for conviction in a warrant case tried by a Magistrate.' },
      { label: 'BNS/BNSS 2023', content: 'Under BNSS 2023, the warrant case procedure is now under Chapter XX (Sections 262–280 BNSS). The conviction in a warrant case Magistrate trial is now under Section 280(2) BNSS — the direct equivalent of Section 248(2) CrPC.' },
    ],
  },
};

// Section icon button (shown when another section is maximized)
function SectionIcon({ id, icon, title, onClick }: { id: string; icon: string; title: string; onClick: (id: string) => void }) {
  return (
    <button
      onClick={() => onClick(id)}
      className="w-9 h-9 rounded-lg bg-bg-elevated border border-border flex items-center justify-center hover:bg-accent-primary/10 hover:border-accent-primary transition-colors"
      title={title}
    >
      <span className="text-sm">{icon}</span>
    </button>
  );
}

export function AnalyserPage() {
  const { theme } = useTheme();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [caseText, setCaseText] = useState('');
  const [activeInputTab, setActiveInputTab] = useState<string>('Text Entry');
  const [recommendations, setRecommendations] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
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
  const [sectionDetailModal, setSectionDetailModal] = useState<number | null>(null);
  const [docModal, setDocModal] = useState<string | null>(null);
  const [similarCaseModal, setSimilarCaseModal] = useState<string | null>(null);
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [showExport, setShowExport] = useState(false);

  // Maximize/Minimize state: null = normal view, string = ID of maximized section
  const [maximizedSection, setMaximizedSection] = useState<string | null>(null);

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
    // Multiple files — analyze each with Claude
    if (extractedTexts.length > 1) {
      setIsAnalyzing(true);
      setAnalysisError(null);
      setAnalysisResult(null);
      const results: Array<{ fileName: string; result: AnalysisResult }> = [];

      for (let i = 0; i < extractedTexts.length; i++) {
        const { name, text } = extractedTexts[i];
        if (!text.trim() || text.length < 50) continue;
        setAnalyzeProgress(`Analyzing file ${i + 1} of ${extractedTexts.length}: ${name}`);

        try {
          const rawResponse = await analyzeCase(text, recommendations);
          const cleanedResponse = rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const parsed = JSON.parse(cleanedResponse);
          const normalized = normalizeResult(parsed);
          results.push({ fileName: name, result: normalized });
        } catch (error) {
          // Skip files that fail
          console.error(`Failed to analyze ${name}:`, error);
        }
      }

      setAnalysisResults(results);
      setActiveSlide(0);
      setAnalyzeProgress('');
      setIsAnalyzing(false);
      return;
    }

    // Single text/file analysis
    const textToAnalyze = caseText.trim() || (extractedTexts.length === 1 ? extractedTexts[0].text.trim() : '');
    if (!textToAnalyze) return;

    if (textToAnalyze.length < 50) {
      setAnalysisError('Please provide detailed case information (at least 50 characters).');
      setAnalysisResult(null);
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const rawResponse = await analyzeCase(textToAnalyze, recommendations);
      const cleanedResponse = rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanedResponse);
      const normalized = normalizeResult(parsed);
      setAnalysisResult(normalized);
      setAnalysisResults([{ fileName: uploadedFiles.length === 1 ? uploadedFiles[0].name : 'Text Input', result: normalized }]);
      setActiveSlide(0);
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
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
      <PageHeader title="AI Analyser" icon={Brain} />

      {/* Hero title */}
      <div className="text-center py-2">
        <h2 className="text-3xl font-bold gradient-text mb-1">AI Legal Case Analyser</h2>
        <p className="text-text-secondary text-sm max-w-2xl mx-auto">
          Submit your case details and get AI-powered insights to assess your chances of success
        </p>
      </div>

      {/* Error / Success indicator */}
      {/* Error indicator */}
      {analysisError && (
        <div className="px-4 py-2 bg-danger/10 border border-danger/30 rounded-xl text-sm text-danger">
          ⚠️ {analysisError}
        </div>
      )}
      {/* Success indicator */}
      {hasAnyResult && !analysisError && (
        <div className="px-4 py-2 bg-success/10 border border-success/30 rounded-xl text-sm text-success">
          ✓ Analysis powered by Claude AI
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
                className="w-full h-32 bg-white/10 border border-accent-primary/30 rounded-xl p-3 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary/50 mb-3"
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
              className="w-full h-20 bg-white/10 border border-accent-primary/30 rounded-xl p-3 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary/50 mb-4"
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
                    <GlassCard className="!p-4 flex-[2] min-h-0 overflow-y-auto">
                      <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold text-text-primary">Case Type &amp; Jurisdiction</h3><button onClick={() => setMaximizedSection('caseType')} className="p-1 rounded hover:bg-bg-elevated transition-colors text-text-muted hover:text-text-primary" title="Maximize"><Maximize2 className="w-3.5 h-3.5" /></button></div>
                      <div className="p-2.5 rounded-lg analyser-inner-card mb-2">
                        <div className="flex flex-wrap gap-1.5">
                          {displayData.caseTypes.map((ct) => (
                            <button key={ct} onClick={() => setCaseTypeModal(ct)}
                              className="px-2.5 py-1 rounded-lg cursor-pointer hover:opacity-80 transition-opacity text-[10px] font-medium analyser-teal-btn">
                              {ct}
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-text-secondary">Jurisdiction: {displayData.jurisdiction}</p>
                    </GlassCard>

                    {/* Applicable Legal Sections */}
                    <GlassCard className="!p-4 flex-[4] min-h-0 overflow-y-auto">
                      <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold text-text-primary">Applicable Legal Sections</h3><button onClick={() => setMaximizedSection('sections')} className="p-1 rounded hover:bg-bg-elevated transition-colors text-text-muted hover:text-text-primary" title="Maximize"><Maximize2 className="w-3.5 h-3.5" /></button></div>
                      <div className="space-y-2">
                        {displayData.applicableSections.map((sec, i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 rounded-lg analyser-inner-card">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-semibold text-text-primary">{sec.section}</h4>
                              <p className="text-xs text-text-secondary">{sec.description}</p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {sec.detail && (
                                <button onClick={() => setSectionDetailModal(i)} className="px-2.5 py-1 rounded-md gradient-btn text-xs font-medium text-white">View</button>
                              )}
                              <MetallicButton
                                label={sec.relevance}
                                variant={sec.relevance === 'High relevance' ? 'gold' : 'bronze'}
                                onClick={() => setSectionDetailModal(i)}
                                theme={theme}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </GlassCard>

                    {/* Required Documents */}
                    <GlassCard className="!p-4 flex-[4] min-h-0 overflow-y-auto">
                      <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold text-text-primary">📁 Required Documents</h3><button onClick={() => setMaximizedSection('documents')} className="p-1 rounded hover:bg-bg-elevated transition-colors text-text-muted hover:text-text-primary" title="Maximize"><Maximize2 className="w-3.5 h-3.5" /></button></div>
                      <div className="space-y-2">
                        {displayData.requiredDocuments.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-2.5 rounded-lg analyser-inner-card">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              
                              <span className="text-xs text-text-secondary truncate">{doc.description}</span>
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
                    <GlassCard className="!p-4 flex-[3] min-h-0 overflow-y-auto">
                      <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold text-text-primary">Similar Historical Cases</h3><button onClick={() => setMaximizedSection('similar')} className="p-1 rounded hover:bg-bg-elevated transition-colors text-text-muted hover:text-text-primary" title="Maximize"><Maximize2 className="w-3.5 h-3.5" /></button></div>
                      <div className="space-y-2">
                        {displayData.similarCases.length > 0 ? (
                          displayData.similarCases.map((sc, i) => (
                            <div key={i} className="flex items-center justify-between p-2.5 rounded-lg analyser-inner-card">
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-semibold text-text-primary">{sc.citation}</h4>
                                <p className="text-xs text-text-secondary">{sc.outcome}</p>
                              </div>
                              <button onClick={() => sc.pdfUrl ? window.open(sc.pdfUrl, '_blank') : setSimilarCaseModal(sc.citation)}
                                className="px-2.5 py-1 rounded-lg cursor-pointer hover:opacity-80 transition-opacity text-[10px] font-medium analyser-teal-btn shrink-0 ml-2">
                                {sc.badge === 'WIN' ? '✓ ' : sc.badge === 'LOSS' ? '✗ ' : '⚠ '}{sc.badge}
                              </button>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-text-muted italic">No similar cases found for this analysis.</p>
                        )}
                      </div>
                    </GlassCard>

                    {/* Outcome Prediction + Key Winning Points + Risk Factors */}
                    <GlassCard className="!p-4 flex-[7] min-h-0 overflow-y-auto">
                      <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold text-text-primary">Outcome Prediction</h3><button onClick={() => setMaximizedSection('outcome')} className="p-1 rounded hover:bg-bg-elevated transition-colors text-text-muted hover:text-text-primary" title="Maximize"><Maximize2 className="w-3.5 h-3.5" /></button></div>
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-36 h-36 relative shrink-0">
                          <MetallicPieChart
                            winningPct={displayData.outcomePrediction.winningPct}
                            losingPct={displayData.outcomePrediction.losingPct}
                            theme={theme}
                          />
                        </div>
                        <div className="flex-1 space-y-3 p-3 rounded-lg analyser-inner-card">
                          <div>
                            <h4 className="text-xs font-bold mb-1" style={{ color: '#008000' }}>Key Winning Points:</h4>
                            <ul className="space-y-1">
                              {displayData.keyWinningPoints.map((point, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-xs text-text-secondary">
                                  <span className="text-success mt-0.5">•</span>{point}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold mb-1" style={{ color: '#FF0000' }}>Risk Factors:</h4>
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
                          <span className="text-sm text-text-primary font-semibold">{displayData.outcomePrediction.winningPct}% - Winning</span>
                        </div>
                        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-danger/10 border border-danger/30">
                          <span className="w-2 h-2 rounded-full bg-danger" />
                          <span className="text-sm text-text-primary font-semibold">{displayData.outcomePrediction.losingPct}% - Losing</span>
                        </div>
                        <a href="https://docs.juryfyai.com/Explore_Predictive_Analysis_RCC_146_2021.pdf" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg gradient-btn text-xs font-medium text-white">Explore</a>
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
            {/* Standard single-result layout: MIDDLE + RIGHT with maximize support */}
            {maximizedSection ? (
              <>
                {/* Maximized view: one section fills the space, icons on the side */}
                <div className="md:col-span-8 flex gap-2 max-h-[calc(100vh-180px)]">
                  {/* Icon bar */}
                  <div className="flex flex-col gap-2 shrink-0">
                    {[
                      { id: 'caseType', icon: '⚖️', title: 'Case Type & Jurisdiction' },
                      { id: 'sections', icon: '📜', title: 'Applicable Legal Sections' },
                      { id: 'documents', icon: '📁', title: 'Required Documents' },
                      { id: 'similar', icon: '📊', title: 'Similar Historical Cases' },
                      { id: 'outcome', icon: '🎯', title: 'Outcome Prediction' },
                    ].filter(s => s.id !== maximizedSection).map(s => (
                      <SectionIcon key={s.id} id={s.id} icon={s.icon} title={s.title} onClick={setMaximizedSection} />
                    ))}
                  </div>
                  {/* Maximized content */}
                  <div className="flex-1 min-w-0 overflow-y-auto glass-card !p-4">
                    <div className="flex items-center justify-between mb-3 sticky top-0 z-10">
                      <h3 className="text-sm font-semibold text-text-primary">
                        {maximizedSection === 'caseType' && '⚖️ Case Type & Jurisdiction'}
                        {maximizedSection === 'sections' && '📜 Applicable Legal Sections'}
                        {maximizedSection === 'documents' && '📁 Required Documents'}
                        {maximizedSection === 'similar' && '📊 Similar Historical Cases'}
                        {maximizedSection === 'outcome' && '🎯 Outcome Prediction'}
                      </h3>
                      <button onClick={() => setMaximizedSection(null)} className="p-1 rounded hover:bg-bg-elevated transition-colors text-text-muted hover:text-text-primary" title="Minimize">
                        <Minimize2 className="w-4 h-4" />
                      </button>
                    </div>
                    {displayData && maximizedSection === 'caseType' && (
                      <div>
                        <div className="p-2.5 rounded-lg analyser-inner-card mb-2">
                          <div className="flex flex-wrap gap-1.5">
                            {displayData.caseTypes.map((ct) => (
                              <button key={ct} onClick={() => setCaseTypeModal(ct)} className="px-2.5 py-1 rounded-lg cursor-pointer hover:opacity-80 transition-opacity text-[10px] font-medium analyser-teal-btn">{ct}</button>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-text-secondary">Jurisdiction: {displayData.jurisdiction}</p>
                      </div>
                    )}
                    {displayData && maximizedSection === 'sections' && (
                      <div className="space-y-2">
                        {displayData.applicableSections.map((sec, i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 rounded-lg analyser-inner-card">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-semibold text-text-primary">{sec.section}</h4>
                              <p className="text-xs text-text-secondary">{sec.description}</p>
                            </div>
                            <MetallicButton label={sec.relevance} variant={sec.relevance === 'High relevance' ? 'gold' : 'bronze'} onClick={() => setSectionDetailModal(i)} theme={theme} />
                          </div>
                        ))}
                      </div>
                    )}
                    {displayData && maximizedSection === 'documents' && (
                      <div className="space-y-2">
                        {displayData.requiredDocuments.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-2.5 rounded-lg analyser-inner-card">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              
                              <span className="text-xs text-text-secondary truncate">{doc.description}</span>
                            </div>
                            <MetallicButton label="Create" variant="bronze" onClick={() => setDocModal(doc.id)} theme={theme} />
                          </div>
                        ))}
                      </div>
                    )}
                    {displayData && maximizedSection === 'similar' && (
                      <div className="space-y-2">
                        {displayData.similarCases.map((sc, i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 rounded-lg analyser-inner-card">
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-semibold text-text-primary">{sc.citation}</h4>
                              <p className="text-xs text-text-secondary">{sc.outcome}</p>
                            </div>
                            <button onClick={() => sc.pdfUrl ? window.open(sc.pdfUrl, '_blank') : setSimilarCaseModal(sc.citation)}
                              className="px-2.5 py-1 rounded-lg cursor-pointer hover:opacity-80 transition-opacity text-[10px] font-medium analyser-teal-btn shrink-0 ml-2">
                              {sc.badge === 'WIN' ? '✓ ' : sc.badge === 'LOSS' ? '✗ ' : '⚠ '}{sc.badge}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {displayData && maximizedSection === 'outcome' && (
                      <div>
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-44 h-44 relative shrink-0">
                            <MetallicPieChart winningPct={displayData.outcomePrediction.winningPct} losingPct={displayData.outcomePrediction.losingPct} theme={theme} />
                          </div>
                          <div className="flex-1 min-w-0 p-3 rounded-lg analyser-inner-card">
                            <h4 className="text-xs font-bold mb-1" style={{ color: '#008000' }}>Key Winning Points:</h4>
                            <ul className="space-y-1 mb-3">
                              {displayData.keyWinningPoints.map((p, i) => (
                                <li key={i} className="text-xs text-text-secondary flex items-start gap-1"><span style={{ color: '#008000' }}>•</span> {p}</li>
                              ))}
                            </ul>
                            <h4 className="text-xs font-bold mb-1" style={{ color: '#FF0000' }}>Risk Factors:</h4>
                            <ul className="space-y-1">
                              {displayData.riskFactors.map((r, i) => (
                                <li key={i} className="text-xs text-text-secondary flex items-start gap-1"><span style={{ color: '#FF0000' }}>•</span> {r}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex-1 px-3 py-2.5 rounded-lg text-white text-xs font-bold text-center" style={{ backgroundColor: '#008000' }}>● {displayData.outcomePrediction.winningPct}% – Winning</span>
                          <span className="flex-1 px-3 py-2.5 rounded-lg text-white text-xs font-bold text-center" style={{ backgroundColor: '#FF0000' }}>● {displayData.outcomePrediction.losingPct}% – Losing</span>
                          <a href="https://docs.juryfyai.com/Explore_Predictive_Analysis_RCC_146_2021.pdf" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg gradient-btn text-xs font-medium text-white">Explore</a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
            {/* Normal layout: MIDDLE COLUMN (~37%) */}
            <div className="md:col-span-4 flex flex-col gap-4 max-h-[calc(100vh-180px)]">
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
                  <GlassCard className="!p-4 flex-[2] min-h-0 overflow-y-auto">
                    <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold text-text-primary">Case Type &amp; Jurisdiction</h3><button onClick={() => setMaximizedSection('caseType')} className="p-1 rounded hover:bg-bg-elevated transition-colors text-text-muted hover:text-text-primary" title="Maximize"><Maximize2 className="w-3.5 h-3.5" /></button></div>
                    <div className="p-2.5 rounded-lg analyser-inner-card mb-2">
                      <div className="flex flex-wrap gap-1.5">
                        {displayData.caseTypes.map((ct) => (
                          <button key={ct} onClick={() => setCaseTypeModal(ct)}
                            className="px-2.5 py-1 rounded-lg cursor-pointer hover:opacity-80 transition-opacity text-[10px] font-medium analyser-teal-btn">
                            {ct}
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary">Jurisdiction: {displayData.jurisdiction}</p>
                  </GlassCard>

                  {/* Applicable Legal Sections */}
                  <GlassCard className="!p-4 flex-[4] min-h-0 overflow-y-auto">
                    <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold text-text-primary">Applicable Legal Sections</h3><button onClick={() => setMaximizedSection('sections')} className="p-1 rounded hover:bg-bg-elevated transition-colors text-text-muted hover:text-text-primary" title="Maximize"><Maximize2 className="w-3.5 h-3.5" /></button></div>
                    <div className="space-y-2">
                      {displayData.applicableSections.map((sec, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 rounded-lg analyser-inner-card">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-text-primary">{sec.section}</h4>
                            <p className="text-xs text-text-secondary">{sec.description}</p>
                          </div>
                          <MetallicButton
                            label={sec.relevance}
                            variant={sec.relevance === 'High relevance' ? 'gold' : 'bronze'}
                            onClick={() => setSectionDetailModal(i)}
                            theme={theme}
                          />
                        </div>
                      ))}
                    </div>
                  </GlassCard>

                  {/* Required Documents */}
                  <GlassCard className="!p-4 flex-[4] min-h-0 overflow-y-auto">
                    <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold text-text-primary">📁 Required Documents</h3><button onClick={() => setMaximizedSection('documents')} className="p-1 rounded hover:bg-bg-elevated transition-colors text-text-muted hover:text-text-primary" title="Maximize"><Maximize2 className="w-3.5 h-3.5" /></button></div>
                    <div className="space-y-2">
                      {displayData.requiredDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-2.5 rounded-lg analyser-inner-card">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            
                            <span className="text-xs text-text-secondary truncate">{doc.description}</span>
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
            <div className="md:col-span-5 flex flex-col gap-4 max-h-[calc(100vh-180px)]">
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
                  <GlassCard className="!p-4 flex-[3] min-h-0 overflow-y-auto">
                    <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold text-text-primary">Similar Historical Cases</h3><button onClick={() => setMaximizedSection('similar')} className="p-1 rounded hover:bg-bg-elevated transition-colors text-text-muted hover:text-text-primary" title="Maximize"><Maximize2 className="w-3.5 h-3.5" /></button></div>
                    <div className="space-y-2">
                      {displayData.similarCases.length > 0 ? (
                        displayData.similarCases.map((sc, i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 rounded-lg analyser-inner-card">
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-semibold text-text-primary">{sc.citation}</h4>
                              <p className="text-xs text-text-secondary">{sc.outcome}</p>
                            </div>
                            <button onClick={() => sc.pdfUrl ? window.open(sc.pdfUrl, '_blank') : setSimilarCaseModal(sc.citation)}
                              className="px-2.5 py-1 rounded-lg cursor-pointer hover:opacity-80 transition-opacity text-[10px] font-medium analyser-teal-btn shrink-0 ml-2">
                              {sc.badge === 'WIN' ? '✓ ' : sc.badge === 'LOSS' ? '✗ ' : '⚠ '}{sc.badge}
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-text-muted italic">No similar cases found for this analysis.</p>
                      )}
                    </div>
                  </GlassCard>

                  {/* Outcome Prediction + Key Winning Points + Risk Factors */}
                  <GlassCard className="!p-4 flex-[7] min-h-0 overflow-y-auto">
                    <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold text-text-primary">Outcome Prediction</h3><button onClick={() => setMaximizedSection('outcome')} className="p-1 rounded hover:bg-bg-elevated transition-colors text-text-muted hover:text-text-primary" title="Maximize"><Maximize2 className="w-3.5 h-3.5" /></button></div>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-36 h-36 relative shrink-0">
                        <MetallicPieChart
                          winningPct={displayData.outcomePrediction.winningPct}
                          losingPct={displayData.outcomePrediction.losingPct}
                          theme={theme}
                        />
                      </div>
                      <div className="flex-1 space-y-3 p-3 rounded-lg analyser-inner-card">
                        <div>
                          <h4 className="text-xs font-bold mb-1" style={{ color: '#008000' }}>Key Winning Points:</h4>
                          <ul className="space-y-1">
                            {displayData.keyWinningPoints.map((point, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-xs text-text-secondary">
                                <span className="text-success mt-0.5">•</span>{point}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold mb-1" style={{ color: '#FF0000' }}>Risk Factors:</h4>
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
                        <span className="text-sm text-text-primary font-semibold">{displayData.outcomePrediction.winningPct}% - Winning</span>
                      </div>
                      <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-danger/10 border border-danger/30">
                        <span className="w-2 h-2 rounded-full bg-danger" />
                        <span className="text-sm text-text-primary font-semibold">{displayData.outcomePrediction.losingPct}% - Losing</span>
                      </div>
                      <a href="https://docs.juryfyai.com/Explore_Predictive_Analysis_RCC_146_2021.pdf" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg gradient-btn text-xs font-medium text-white">Explore</a>
                    </div>
                  </GlassCard>
                </>
              )}
            </div>
              </>
            )}
          </>
        )}
      </div>

      {/* ─── MODALS ─── */}

      {/* Section Detail Modal */}
      <Modal
        isOpen={sectionDetailModal !== null}
        onClose={() => setSectionDetailModal(null)}
        title={displayData?.applicableSections[sectionDetailModal ?? 0]?.section ?? 'Section Detail'}
        size="3xl"
      >
        {sectionDetailModal !== null && displayData?.applicableSections[sectionDetailModal]?.detail && (() => {
          const sec = displayData.applicableSections[sectionDetailModal];
          const detail = sec.detail!;
          return (
            <div className="space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Header with logo */}
              <div className="flex items-start gap-4 p-4 rounded-xl" style={{ backgroundColor: '#f6f2eb' }}>
                <img src="/logo/JuryfyAIlogo.png" alt="Juryfy AI" className="w-16 h-16 shrink-0" />
                <div>
                  <h3 className="text-base font-bold" style={{ color: '#cc0000' }}>{detail.sectionTitle || sec.section}</h3>
                  <p className="text-sm mt-1"><strong>Old Law (Used in Case):</strong> {detail.oldLaw}</p>
                  <p className="text-sm"><strong>New Law (BNS):</strong> {detail.newLaw}</p>
                  <p className="text-sm"><strong style={{ color: '#cc0000' }}>Type of Provision:</strong> {detail.typeOfProvision}</p>
                </div>
              </div>

              {/* Application heading */}
              {detail.caseApplication && (
                <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: '#1a3a5c' }}>
                  <h4 className="text-sm font-bold text-white uppercase">{detail.caseApplication}</h4>
                </div>
              )}

              {/* Paragraphs */}
              {detail.paragraphs && detail.paragraphs.length > 0 && (
                <div className="space-y-3 px-1">
                  {detail.paragraphs.map((p, idx) => (
                    <p key={idx} className="text-sm leading-relaxed" style={{ color: '#212120' }}>{p}</p>
                  ))}
                </div>
              )}

              {/* Ingredients table */}
              {detail.ingredients && detail.ingredients.length > 0 && (
                <div className="overflow-x-auto rounded-lg border" style={{ borderColor: '#d4d1ca' }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ backgroundColor: '#1a3a5c' }}>
                        <th className="px-4 py-3 text-left text-white font-bold w-[160px]">Ingredient</th>
                        <th className="px-4 py-3 text-left text-white font-bold">What It Means in Plain Language</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.ingredients.map((ing, idx) => (
                        <tr key={idx} className="border-t" style={{ borderColor: '#d4d1ca', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f6f2eb' }}>
                          <td className="px-4 py-3 font-semibold align-top" style={{ color: '#28251D' }}>{ing.name}</td>
                          <td className="px-4 py-3" style={{ color: '#212120' }}>{ing.explanation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Sub-sections */}
              {detail.subSections && detail.subSections.length > 0 && (
                <div className="space-y-4">
                  {detail.subSections.map((sub, idx) => (
                    <div key={idx}>
                      <div className="px-4 py-2 rounded-lg mb-2" style={{ backgroundColor: '#f6f2eb', borderLeft: '4px solid #cc0000' }}>
                        <h4 className="text-sm font-bold" style={{ color: '#cc0000' }}>{sub.heading}</h4>
                      </div>
                      <p className="text-sm leading-relaxed px-1 mb-2" style={{ color: '#212120' }}>{sub.content}</p>
                      {sub.bullets && sub.bullets.length > 0 && (
                        <ul className="space-y-1.5 px-1">
                          {sub.bullets.map((b, bi) => (
                            <li key={bi} className="text-sm flex items-start gap-2" style={{ color: '#212120' }}>
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#1a3a5c' }} />
                              {b}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </Modal>

      {/* Case Type Modal */}
      <Modal
        isOpen={!!caseTypeModal}
        onClose={() => setCaseTypeModal(null)}
        title={caseTypeModal ?? ''}
        size="3xl"
      >
        {caseTypeModal && CASE_TYPE_DETAILS[caseTypeModal] ? (() => {
          const detail = CASE_TYPE_DETAILS[caseTypeModal];
          return (
            <div className="space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Header with logo */}
              <div className="flex items-start gap-4 p-4 rounded-xl" style={{ backgroundColor: '#f6f2eb' }}>
                <img src="/logo/JuryfyAIlogo.png" alt="Juryfy AI" className="w-16 h-16 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold mb-2" style={{ color: '#1a3a5c' }}>WHAT IS &apos;CASE TYPE&apos;?</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#212120' }}>{detail.intro}</p>
                </div>
              </div>

              {/* Section title */}
              <h4 className="text-base font-bold px-1" style={{ color: '#cc0000' }}>{detail.title}</h4>

              {/* Table */}
              <div className="overflow-x-auto rounded-lg border" style={{ borderColor: '#d4d1ca' }}>
                <table className="w-full text-sm">
                  <tbody>
                    {detail.rows.map((row, idx) => (
                      <tr key={idx} className="border-t" style={{ borderColor: '#d4d1ca', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f6f2eb' }}>
                        <td className="px-4 py-3 font-semibold align-top w-[160px]" style={{ color: '#28251D' }}>{row.label}</td>
                        <td className="px-4 py-3" style={{ color: '#212120' }}>{row.content}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })() : (
          <p className="text-sm text-text-secondary">Details not available for this case type.</p>
        )}
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
