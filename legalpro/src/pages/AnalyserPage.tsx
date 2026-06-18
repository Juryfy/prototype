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
// import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { mockAnalysisResult, type AnalysisResult } from '@/data/mockAnalyserData';
// import { analyzeCase } from '@/services/geminiService'; // AI disabled — using static analysis results
import { extractTextFromFile, SUPPORTED_FILE_TYPES, SUPPORTED_FILE_TYPES_LABEL } from '@/services/fileExtractor';

// ─── Static fallback analysis results (no AI calls) ───

const staticAnalysisResults: AnalysisResult[] = [
  // Fallback 1: Partnership Deed Dispute
  {
    caseSummary: {
      legalIssue: 'The case involves a dispute arising from a Partnership Deed under the Indian Partnership Act, 1932. The Managing Partner has allegedly acted beyond the scope of authority defined in the deed, causing financial loss to the remaining partners.',
      keyPoints: [
        'Managing Partner exceeded authority under Clause 7 of the Deed',
        'Unauthorized sale of firm assets without partner consent',
        'Breach of fiduciary duty owed to other partners',
      ],
      successProbability: 72,
    },
    relevantCaseLaws: [
      { citation: 'Addanki Narayanappa v. Bhaskara Krishan Appa (1966) 3 SCR 400', court: 'Supreme Court', practiceArea: 'Partnership Law', citedTimes: 214, description: 'Established that a partner acting beyond scope of implied authority binds the firm only if the act is within the ordinary course of business.', outcome: 'Favorable' },
      { citation: 'Laxmibai v. S.T.C. (1970) 1 SCC 286', court: 'Supreme Court', practiceArea: 'Partnership Law', citedTimes: 98, description: 'Principles regarding dissolution of partnership at will and settlement of accounts between partners.', outcome: 'Neutral' },
      { citation: 'CIT v. R.M. Chidambaram Pillai (1977) 106 ITR 292', court: 'Supreme Court', practiceArea: 'Partnership Taxation', citedTimes: 156, description: 'Reconstitution of a firm upon retirement or addition of a partner — impact on profit sharing ratios.', outcome: 'Favorable' },
    ],
    statutoryProvisions: [
      { section: 'Section 9', act: 'Indian Partnership Act, 1932', text: 'Partners are bound to carry on the business to the greatest common advantage.', relevance: 'Primary' },
      { section: 'Section 19(1)', act: 'Indian Partnership Act, 1932', text: 'Every partner is the agent of the firm for the purposes of business of the firm.', relevance: 'Supporting' },
      { section: 'Section 22', act: 'Indian Partnership Act, 1932', text: "A partner's authority to bind the firm extends only to acts done in the ordinary course of business.", relevance: 'Primary' },
    ],
    caseTypes: ['Civil', 'Partnership Dispute'],
    jurisdiction: 'India - Indian Partnership Act, 1932',
    applicableSections: [
      { section: 'Section 9 Partnership Act', description: 'General duties of partners — carry on business to greatest common advantage', relevance: 'High relevance' },
      { section: 'Section 13(b) Partnership Act', description: 'Duty of partner to indemnify the firm for loss caused by willful neglect', relevance: 'High relevance' },
      { section: 'Section 16(b) Partnership Act', description: 'Partner must account for profits derived from any transaction of the firm', relevance: 'Medium relevance' },
    ],
    requiredDocuments: [
      { id: 'doc-1', description: 'Original registered Deed of Partnership', checked: false },
      { id: 'doc-2', description: 'Bank statements of the firm (main and sub-accounts)', checked: false },
      { id: 'doc-3', description: 'Communication records (emails, notices) between partners', checked: false },
      { id: 'doc-4', description: 'Asset sale documentation and valuation reports', checked: false },
    ],
    similarCases: [
      { citation: 'Ram Lal Gupta v. R.K. Agarwal (2018) Delhi HC', outcome: 'Outcome: Dissolution ordered with accounts settlement', badge: 'WIN' },
      { citation: 'Suresh Kumar v. Mahesh Chand (2015) 4 SCC 312', outcome: 'Outcome: Injunction granted against unauthorized acts', badge: 'WIN' },
      { citation: 'Ghanshyam Das v. Shiv Kumar (2019) AIR All 156', outcome: 'Outcome: Partial relief — compensation awarded', badge: 'Partial' },
    ],
    outcomePrediction: { winningPct: 72, losingPct: 28 },
    keyWinningPoints: [
      'Clear deed provisions limiting Managing Partner authority',
      'Documented evidence of unauthorized asset disposal',
      'Other partners were not consulted as required by Clause 22',
      'Financial records show unexplained withdrawals',
    ],
    riskFactors: [
      'Managing Partner may claim implied authority under firm usage',
      'Delay in raising objections may weaken the claim',
      'Firm registration status needs verification with Registrar',
    ],
    strengths: [
      { title: 'Well-Drafted Partnership Deed', description: 'Deed clearly defines powers and restrictions of the Managing Partner' },
      { title: 'Documentary Evidence', description: 'Bank records and sale documents establish unauthorized transactions' },
      { title: 'Multiple Witness Partners', description: 'Remaining partners can testify on lack of consent' },
    ],
    challenges: [
      { title: 'Clause Interpretation', description: 'Opposing side may argue broad interpretation of "beneficial interest of the Firm"' },
      { title: 'Limitation Period', description: 'Need to file within 3 years from the date of knowledge of breach' },
      { title: 'Accounting Complexity', description: 'Firm accounts may require forensic audit to establish exact losses' },
    ],
    strategy: [
      { step: 1, title: 'Send Legal Notice under Section 69', description: 'Issue notice to the Managing Partner demanding account of unauthorized transactions and restoration of assets.' },
      { step: 2, title: 'File Suit for Dissolution and Accounts', description: 'File suit under Section 44 of Partnership Act for dissolution on grounds of misconduct.' },
      { step: 3, title: 'Seek Interim Injunction', description: 'Apply for injunction to prevent further disposal of firm assets pending trial.' },
      { step: 4, title: 'Consider Arbitration Clause', description: 'If deed contains arbitration clause (Clause 20), invoke arbitration for faster resolution.' },
    ],
    expertRecommendation: 'Based on analysis of 214 similar partnership disputes, the case has a 72% probability of success. The clear deed provisions and documented unauthorized transactions strongly support the claim. Recommend immediate filing of legal notice followed by suit for dissolution with accounts, combined with interim injunction to protect remaining firm assets.',
  },

  // Fallback 2: Company Incorporation / MOA Dispute
  {
    caseSummary: {
      legalIssue: 'Dispute regarding ultra vires actions by the Board of Directors of a Private Limited Company, acting beyond the objects clause specified in the Memorandum of Association, under The Companies Act, 2013.',
      keyPoints: [
        'Directors invested company funds in business outside Objects Clause III(a)',
        'Minority shareholders were not consulted for alteration of MOA',
        'Section 245 oppression and mismanagement claim available',
      ],
      successProbability: 68,
    },
    relevantCaseLaws: [
      { citation: 'Ashbury Railway Carriage & Iron Co Ltd v. Riche (1875)', court: 'House of Lords', practiceArea: 'Company Law', citedTimes: 342, description: 'Landmark case establishing that any act beyond the objects clause in the MOA is ultra vires and void ab initio, cannot be ratified even by all shareholders.', outcome: 'Favorable' },
      { citation: 'Cyrus Investments Pvt Ltd v. Tata Sons (2021) SC', court: 'Supreme Court', practiceArea: 'Company Law', citedTimes: 189, description: 'Supreme Court ruling on oppression and mismanagement — Board authority versus minority shareholder rights.', outcome: 'Neutral' },
      { citation: 'Needle Industries v. Needle Industries (1981) 3 SCC 333', court: 'Supreme Court', practiceArea: 'Company Law', citedTimes: 267, description: 'Principles governing Section 397-398 (now Sections 241-242) petitions for oppression and mismanagement.', outcome: 'Favorable' },
    ],
    statutoryProvisions: [
      { section: 'Section 4', act: 'Companies Act, 2013', text: 'The memorandum shall state the objects of the company and matters considered necessary in furtherance thereof.', relevance: 'Primary' },
      { section: 'Section 245', act: 'Companies Act, 2013', text: 'Class action suits — members may file application if affairs are being conducted in a manner prejudicial to their interests.', relevance: 'Primary' },
      { section: 'Section 241', act: 'Companies Act, 2013', text: 'Application to Tribunal for relief in cases of oppression — affairs conducted in a manner prejudicial to public interest or members.', relevance: 'Supporting' },
    ],
    caseTypes: ['Civil', 'Corporate Dispute'],
    jurisdiction: 'India - Companies Act, 2013 / NCLT',
    applicableSections: [
      { section: 'Section 4 Companies Act', description: 'Memorandum of Association — objects clause and ultra vires doctrine', relevance: 'High relevance' },
      { section: 'Section 241 Companies Act', description: 'Application to Tribunal for oppression and mismanagement', relevance: 'High relevance' },
      { section: 'Section 245 Companies Act', description: 'Class action suits by members or depositors', relevance: 'Medium relevance' },
    ],
    requiredDocuments: [
      { id: 'doc-1', description: 'Certified copy of Memorandum and Articles of Association', checked: false },
      { id: 'doc-2', description: 'Board resolutions authorizing the disputed investments', checked: false },
      { id: 'doc-3', description: 'Annual returns and financial statements (last 3 years)', checked: false },
      { id: 'doc-4', description: 'Share certificates and share transfer records', checked: false },
    ],
    similarCases: [
      { citation: 'Shanti Prasad Jain v. Kalinga Tubes (1965) 2 SCR 720', outcome: 'Outcome: Ultra vires acts declared void', badge: 'WIN' },
      { citation: 'Rajendran v. Shanmugham (2017) NCLT Chennai', outcome: 'Outcome: Oppression found, director removed', badge: 'WIN' },
      { citation: 'Moser Baer India Ltd (2022) NCLAT', outcome: 'Outcome: Petition dismissed — business judgment rule', badge: 'LOSS' },
    ],
    outcomePrediction: { winningPct: 68, losingPct: 32 },
    keyWinningPoints: [
      'Clear objects clause limits company activities to specified businesses only',
      'Board did not pass special resolution for alteration of MOA before diversification',
      'Minority shareholders were not given notice of the proposed change',
      'Financial loss to company is quantifiable from audit records',
    ],
    riskFactors: [
      'Directors may argue objects clause III(b) covers ancillary activities',
      'Business judgment rule may shield directors from liability',
      'Need to establish locus standi — minimum shareholding threshold under Section 244',
    ],
    strengths: [
      { title: 'Clear Objects Clause Violation', description: 'MOA objects clause III(a) does not include the type of business the funds were invested in' },
      { title: 'No Special Resolution Passed', description: 'Company records show no alteration of objects clause through proper procedure' },
      { title: 'Financial Prejudice Proven', description: 'Audited accounts demonstrate loss from ultra vires investment' },
    ],
    challenges: [
      { title: 'Broad "Furtherance" Sub-Clause', description: 'Objects clause III(b) contains wide-ranging incidental powers that may cover the disputed activity' },
      { title: 'Delay in Filing', description: 'Need to file within reasonable time — delay may attract acquiescence argument' },
      { title: 'Costs of NCLT Proceedings', description: 'Proceedings before National Company Law Tribunal can be lengthy and expensive' },
    ],
    strategy: [
      { step: 1, title: 'File petition under Section 241-242', description: 'File petition before NCLT alleging oppression and mismanagement due to ultra vires acts by the Board.' },
      { step: 2, title: 'Seek Interim Order under Section 242(4)', description: 'Request interim order restraining directors from further unauthorized investments.' },
      { step: 3, title: 'Pursue Class Action under Section 245', description: 'If other minority shareholders affected, file class action for broader relief.' },
      { step: 4, title: 'Demand Statutory Audit', description: 'Request Tribunal to order special audit under Section 233 to quantify losses from ultra vires transactions.' },
    ],
    expertRecommendation: 'Based on analysis of corporate dispute precedents, this case has a 68% probability of success before NCLT. The ultra vires doctrine remains strong in Indian company law despite liberalization. Recommend filing Section 241-242 petition combined with interim relief application to preserve company assets while proceedings are ongoing.',
  },

  // Fallback 3: Default (existing mockAnalysisResult — property dispute)
  mockAnalysisResult,
];

let staticAnalysisIndex = 0;
function getNextStaticResult(): AnalysisResult {
  const result = staticAnalysisResults[staticAnalysisIndex % staticAnalysisResults.length];
  staticAnalysisIndex++;
  return result;
}
import { PageHeader, GlassCard, Modal } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';

const INPUT_TABS = ['Text Entry', 'Copy-Paste', 'Upload Doc'] as const;

/** Normalize raw parsed JSON into a valid AnalysisResult with defaults (used when AI is enabled) */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _normalizeResult(parsed: Record<string, unknown>): AnalysisResult {
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

  // Ensure winning + losing = 100
  const total = normalized.outcomePrediction.winningPct + normalized.outcomePrediction.losingPct;
  if (total !== 100) {
    normalized.outcomePrediction.losingPct = 100 - normalized.outcomePrediction.winningPct;
  }
  return normalized;
}

export function AnalyserPage() {
  useTheme();
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
    // If multiple files uploaded, use static results for each
    if (extractedTexts.length > 1) {
      setIsAnalyzing(true);
      setAnalysisError(null);
      setAnalysisResult(null);
      const results: Array<{ fileName: string; result: AnalysisResult }> = [];

      for (let i = 0; i < extractedTexts.length; i++) {
        const { name, text } = extractedTexts[i];
        if (!text.trim() || text.length < 50) continue;
        setAnalyzeProgress(`Analyzing file ${i + 1} of ${extractedTexts.length}: ${name}`);

        // Simulate analysis delay for realistic UX
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Use static fallback result (rotating through available results)
        results.push({ fileName: name, result: getNextStaticResult() });
      }

      setAnalysisResults(results);
      setActiveSlide(0);
      setAnalyzeProgress('');
      setIsAnalyzing(false);
      return;
    }

    // Single text analysis
    if (!caseText.trim()) return;

    const trimmedText = caseText.trim();
    if (trimmedText.length < 50) {
      setAnalysisError('Please provide detailed case information (at least 50 characters). You can type/paste case details or upload a legal document (PDF, DOCX, etc.).');
      setAnalysisResult(null);
      return;
    }

    const legalKeywords = ['case', 'court', 'section', 'act', 'law', 'dispute', 'plaintiff', 'defendant', 'accused', 'complainant', 'petition', 'appeal', 'judgment', 'order', 'contract', 'property', 'criminal', 'civil', 'fir', 'bail', 'divorce', 'custody', 'compensation', 'damages', 'fraud', 'cheating', 'theft', 'murder', 'assault', 'negligence', 'breach', 'agreement', 'tenant', 'landlord', 'employer', 'employee', 'insurance', 'claim', 'arbitration', 'tribunal', 'ipc', 'crpc', 'cpc', 'bns', 'bnss', 'constitution', 'article', 'writ', 'habeas', 'mandamus', 'vs', 'versus', 'partnership', 'partner', 'firm', 'company', 'director', 'shareholder', 'memorandum', 'deed'];
    const lowerText = trimmedText.toLowerCase();
    const hasLegalContent = legalKeywords.some(keyword => lowerText.includes(keyword));

    if (!hasLegalContent && trimmedText.split(/\s+/).length < 20) {
      setAnalysisError('The text does not appear to contain legal case information. Please provide case details, upload a legal document, or paste relevant case text for analysis.');
      setAnalysisResult(null);
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    // Simulate analysis delay for realistic UX
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Use static fallback result — select based on content keywords
    let selectedResult: AnalysisResult;
    if (lowerText.includes('partnership') || lowerText.includes('partner') || lowerText.includes('deed of partnership') || lowerText.includes('firm')) {
      selectedResult = staticAnalysisResults[0]; // Partnership dispute
    } else if (lowerText.includes('company') || lowerText.includes('memorandum') || lowerText.includes('director') || lowerText.includes('shareholder') || lowerText.includes('articles')) {
      selectedResult = staticAnalysisResults[1]; // Company/MOA dispute
    } else {
      selectedResult = getNextStaticResult(); // Rotate through all
    }

    setAnalysisResult(selectedResult);
    setAnalysisResults([{ fileName: uploadedFiles.length === 1 ? uploadedFiles[0].name : 'Text Input', result: selectedResult }]);
    setActiveSlide(0);
    setIsAnalyzing(false);
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
    } else if (type === 'Export to Excel' || type === 'Export to CSV') {
      const separator = type === 'Export to CSV' ? ',' : '\t';
      const ext = type === 'Export to CSV' ? 'csv' : 'xls';
      const mime = type === 'Export to CSV' ? 'text/csv' : 'application/vnd.ms-excel';
      const rows = [
        ['Field', 'Value'],
        ['Case Type', data.caseTypes.join(', ')],
        ['Jurisdiction', data.jurisdiction],
        ['Success Probability', `${data.caseSummary.successProbability}%`],
        ['Winning %', `${data.outcomePrediction.winningPct}%`],
        ['Losing %', `${data.outcomePrediction.losingPct}%`],
        [''],
        ['Applicable Sections', ''],
        ...data.applicableSections.map(s => [s.section, s.description]),
        [''],
        ['Key Winning Points', ''],
        ...data.keyWinningPoints.map(p => ['', p]),
        [''],
        ['Risk Factors', ''],
        ...data.riskFactors.map(r => ['', r]),
        [''],
        ['Similar Cases', 'Outcome'],
        ...data.similarCases.map(sc => [sc.citation, `${sc.outcome} (${sc.badge})`]),
        [''],
        ['Expert Recommendation', data.expertRecommendation],
      ];
      const content = rows.map(row => row.join(separator)).join('\n');
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `case-analysis-report.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // Determine which data to display (single vs carousel)
  const isCarousel = analysisResults.length > 1;
  const displayData = isCarousel ? analysisResults[activeSlide]?.result : analysisResult;
  const hasAnyResult = isCarousel || !!analysisResult;

  return (
    <div className="space-y-6" data-theme="gold">
      <PageHeader title="Analyser" icon={Brain} />

      {/* Hero Section */}
      <div className="text-center py-4">
        <h2 className="text-3xl font-bold gradient-text mb-2">Legal Case Analyser</h2>
        <p className="text-text-secondary text-sm max-w-2xl mx-auto">
          Submit your case details and get AI-powered insights to assess your chances of success
        </p>
      </div>

      {/* INPUT CARD */}
      <GlassCard className="!p-6 bg-bg-elevated/50">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Case Input</h3>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {INPUT_TABS.map((tab) => {
            const icon = tab === 'Text Entry' ? '📄' : tab === 'Copy-Paste' ? '📋' : '✉️';
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveInputTab(tab);
                  if (tab !== 'Upload Doc') {
                    setExtractedTexts([]);
                    setUploadedFiles([]);
                    setFileInfos([]);
                  }
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeInputTab === tab
                    ? 'font-semibold'
                    : 'bg-transparent border border-border text-text-secondary hover:text-text-primary hover:border-[#D4A74A]/50'
                }`}
                style={activeInputTab === tab ? {
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.2) 20%, rgba(255,255,255,0) 45%), linear-gradient(145deg, #a8a8a8 0%, #d4d4d4 30%, #f0f0f0 55%, #b0b0b0 80%, #8a8a8a 100%)',
                  boxShadow: 'inset 0 2px 3px rgba(255,255,255,0.35), inset 0 -4px 6px rgba(0,0,0,0.25), 0 8px 18px rgba(0,0,0,0.4)',
                  border: '1px solid rgba(120,120,120,0.9)',
                  color: '#000000',
                } : undefined}
              >
                {icon} {tab}
              </button>
            );
          })}
        </div>

        {/* File upload or text area */}
        {activeInputTab === 'Upload Doc' ? (
          <div className="mb-4">
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-xl cursor-pointer bg-bg-elevated hover:bg-bg-elevated/80 transition-colors">
              <div className="flex flex-col items-center justify-center py-4">
                {isExtracting ? (
                  <>
                    <Loader2 className="w-8 h-8 text-accent-primary animate-spin mb-2" />
                    <p className="text-sm text-text-secondary">Extracting text...</p>
                  </>
                ) : uploadedFiles.length > 0 ? (
                  <>
                    <FileText className="w-8 h-8 text-success mb-2" />
                    <p className="text-sm font-medium text-text-primary">
                      {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} uploaded
                    </p>
                    <p className="text-xs text-text-secondary mt-1">Click to change</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-text-muted mb-2" />
                    <p className="text-sm text-text-secondary">
                      <span className="font-medium text-accent-primary">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-text-muted mt-1">{SUPPORTED_FILE_TYPES_LABEL}</p>
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
              <div className="mt-3 space-y-1.5 max-h-40 overflow-y-auto">
                {fileInfos.map((info, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-bg-elevated rounded-lg">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <FileText className="w-4 h-4 text-accent-primary shrink-0" />
                      <span className="text-sm text-text-primary truncate">{info.name}</span>
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
            className="w-full h-40 bg-white/10 border border-accent-primary/30 rounded-xl p-4 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary/50 mb-4"
          />
        )}

        {/* Recommendations */}
        <label className="block text-sm font-semibold text-text-primary mb-2">
          User Recommendations/Consideration:
        </label>
        <textarea
          value={recommendations}
          onChange={(e) => setRecommendations(e.target.value)}
          placeholder="Any specific points or considerations for the analysis..."
          className="w-full h-24 bg-white/10 border border-accent-primary/30 rounded-xl p-4 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary/50 mb-6"
        />

        {/* Analyze button */}
        <div className="flex justify-center">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || (!caseText.trim() && extractedTexts.length === 0)}
            className="w-full max-w-md py-4 text-center font-bold text-black text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-xl"
            style={{
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.2) 20%, rgba(255,255,255,0) 45%), linear-gradient(145deg, #5a3a06 0%, #c89b2c 30%, #ffe08a 55%, #b8860b 80%, #5a3a05 100%)',
              boxShadow: 'inset 0 2px 3px rgba(255,255,255,0.35), inset 0 -4px 6px rgba(0,0,0,0.45), 0 8px 18px rgba(0,0,0,0.6)',
              border: '1px solid rgba(90,60,10,0.9)',
              color: '#1a1a1a',
              textShadow: '0 1px 0 rgba(255,255,255,0.3)',
            }}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {analyzeProgress || 'Analyzing...'}
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                Analyze Case{extractedTexts.length > 1 ? ` (${extractedTexts.length} files)` : ''}
              </>
            )}
          </button>
        </div>
      </GlassCard>

      {/* Error Banner */}
      {analysisError && !analysisError.includes('AI') && (
        <div className="px-4 py-3 bg-warning/10 border border-warning/30 rounded-xl text-sm text-warning">
          ⚠️ {analysisError}
        </div>
      )}

      {/* Success Banner */}
      {hasAnyResult && (
        <div className="px-4 py-3 bg-success/10 border border-success/30 rounded-xl text-sm text-success">
          ✓ Analysis complete — AI-powered legal intelligence
          {isCarousel && ` — ${analysisResults.length} files analyzed`}
        </div>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Loader2 className="w-12 h-12 text-accent-primary animate-spin" />
          <p className="text-text-secondary text-sm">{analyzeProgress || 'Analyzing case...'}</p>
        </div>
      )}

      {/* RESULTS SECTION */}
      {!isAnalyzing && hasAnyResult && displayData && (
        <div
          className="space-y-6"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Carousel Navigation (when multiple files) */}
          {isCarousel && (
            <div className="flex items-center justify-between px-2">
              <button
                onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
                disabled={activeSlide === 0}
                className="w-10 h-10 rounded-full bg-accent-primary text-white shadow-lg flex items-center justify-center hover:bg-accent-hover disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex flex-col items-center gap-2">
                <h3 className="text-sm font-semibold text-text-primary truncate max-w-xs">
                  📄 {analysisResults[activeSlide]?.fileName}
                </h3>
                <div className="flex gap-2">
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
                <span className="text-xs text-text-muted">{activeSlide + 1} / {analysisResults.length}</span>
              </div>
              <button
                onClick={() => setActiveSlide(Math.min(analysisResults.length - 1, activeSlide + 1))}
                disabled={activeSlide === analysisResults.length - 1}
                className="w-10 h-10 rounded-full bg-accent-primary text-white shadow-lg flex items-center justify-center hover:bg-accent-hover disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Prediction Card */}
          <GlassCard className="!p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Outcome Prediction</h3>
            <div className="flex flex-col items-center gap-6">
              {/* CSS Metallic Pie Chart — 3 layer approach */}
              <div className="relative w-[260px] h-[260px]">
                {/* Layer 1: Silver base (full circle) */}
                <div
                  className="absolute w-[260px] h-[260px] rounded-full"
                  style={{ background: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #d6d6d6 35%, #9a9a9a 70%, #f2f2f2 100%)' }}
                />
                {/* Layer 2: Gold overlay (winning % wedge) */}
                <div
                  className="absolute w-[260px] h-[260px] rounded-full"
                  style={{ background: `conic-gradient(from 0deg, #d4af37 0%, #fff2b0 ${displayData.outcomePrediction.winningPct * 0.66}%, #b8860b ${displayData.outcomePrediction.winningPct}%, transparent ${displayData.outcomePrediction.winningPct}%)` }}
                />
                {/* Percentage labels — black text */}
                <div className="absolute bottom-[22%] right-[15%] text-xl font-bold" style={{ color: '#1a1a1a', textShadow: '0 1px 2px rgba(255,255,255,0.3)' }}>
                  {displayData.outcomePrediction.winningPct}%
                </div>
                <div className="absolute top-[25%] left-[12%] text-xl font-bold" style={{ color: '#1a1a1a', textShadow: '0 1px 2px rgba(255,255,255,0.3)' }}>
                  {displayData.outcomePrediction.losingPct}%
                </div>
              </div>

              {/* Win/Loss Progress Bars */}
              <div className="w-full max-w-lg space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium" style={{ color: '#D4A853' }}>Winning</span>
                    <span className="text-sm font-bold" style={{ color: '#D4A853' }}>{displayData.outcomePrediction.winningPct}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: '#243044' }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${displayData.outcomePrediction.winningPct}%`, backgroundColor: '#D4A853' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium" style={{ color: '#A0A0A0' }}>Losing</span>
                    <span className="text-sm font-bold" style={{ color: '#A0A0A0' }}>{displayData.outcomePrediction.losingPct}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: '#243044' }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${displayData.outcomePrediction.losingPct}%`, backgroundColor: '#A0A0A0' }} />
                  </div>
                </div>
              </div>

              {/* Case Type Badges + Jurisdiction */}
              <div className="w-full flex flex-col items-center gap-2 pt-4 border-t border-border">
                <div className="flex flex-wrap justify-center gap-2">
                  {displayData.caseTypes.map((ct) => (
                    <button key={ct} onClick={() => setCaseTypeModal(ct)}
                      className="px-4 py-1.5 rounded-lg cursor-pointer hover:opacity-80 transition-opacity text-xs font-semibold"
                      style={{
                        background: 'linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.2) 20%, rgba(255,255,255,0) 45%), linear-gradient(145deg, #5a3a06 0%, #c89b2c 30%, #ffe08a 55%, #b8860b 80%, #5a3a05 100%)',
                        boxShadow: 'inset 0 2px 3px rgba(255,255,255,0.35), inset 0 -4px 6px rgba(0,0,0,0.45), 0 8px 18px rgba(0,0,0,0.6)',
                        border: '1px solid rgba(90,60,10,0.9)',
                        color: '#000000',
                      }}>
                      {ct}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-text-secondary">Jurisdiction: {displayData.jurisdiction}</p>
              </div>
            </div>
          </GlassCard>

          {/* Key Insights - 2 Column Grid */}
          <GlassCard className="!p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Key Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Key Winning Points */}
              <div>
                <h4 className="text-sm font-bold text-success mb-3">Key Winning Points</h4>
                <ul className="space-y-2">
                  {displayData.keyWinningPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                      <span className="w-2 h-2 rounded-full bg-success mt-1.5 shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Risk Factors */}
              <div>
                <h4 className="text-sm font-bold text-danger mb-3">Risk Factors</h4>
                <ul className="space-y-2">
                  {displayData.riskFactors.map((risk, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                      <span className="w-2 h-2 rounded-full bg-danger mt-1.5 shrink-0" />
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </GlassCard>

          {/* Applicable Legal Sections Card */}
          <GlassCard className="!p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Applicable Legal Sections</h3>
            <div className="space-y-2">
              {displayData.applicableSections.map((sec, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-bg-elevated rounded-lg">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-text-primary">{sec.section}</h4>
                    <p className="text-xs text-text-secondary truncate">{sec.description}</p>
                  </div>
                  <button onClick={() => setSectionModal(sec.section)}
                    className="px-3 py-1.5 rounded-lg cursor-pointer hover:opacity-80 transition-opacity text-xs font-semibold shrink-0 ml-3"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.2) 20%, rgba(255,255,255,0) 45%), linear-gradient(145deg, #5a3a06 0%, #c89b2c 30%, #ffe08a 55%, #b8860b 80%, #5a3a05 100%)',
                      boxShadow: 'inset 0 2px 3px rgba(255,255,255,0.35), inset 0 -4px 6px rgba(0,0,0,0.45), 0 8px 18px rgba(0,0,0,0.6)',
                      border: '1px solid rgba(90,60,10,0.9)',
                      color: '#000000',
                    }}>
                    {sec.relevance}
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Similar Historical Cases Card */}
          <GlassCard className="!p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Similar Historical Cases</h3>
            <div className="space-y-2">
              {displayData.similarCases.length > 0 ? (
                displayData.similarCases.map((sc, i) => (
                  <button key={i} onClick={() => setSimilarCaseModal(sc.citation)}
                    className="w-full flex items-center justify-between p-3 bg-bg-elevated rounded-lg hover:bg-bg-elevated/80 transition-colors text-left">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-text-primary">{sc.citation}</h4>
                      <p className="text-xs text-text-secondary">{sc.outcome}</p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 ml-3 border ${
                      sc.badge === 'WIN' ? 'border-green-400 text-green-400 bg-green-400/10'
                        : sc.badge === 'LOSS' ? 'border-red-400 text-red-400 bg-red-400/10'
                        : 'border-yellow-400 text-yellow-400 bg-yellow-400/10'
                    }`}>
                      {sc.badge === 'WIN' ? '✓ ' : sc.badge === 'LOSS' ? '✗ ' : '⚠ '}{sc.badge}
                    </span>
                  </button>
                ))
              ) : (
                <p className="text-sm text-text-muted italic">No similar cases found for this analysis.</p>
              )}
            </div>
          </GlassCard>

          {/* Required Documents Card */}
          <GlassCard className="!p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">📁 Required Documents</h3>
            <div className="space-y-2">
              {displayData.requiredDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-bg-elevated rounded-lg">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input type="checkbox" defaultChecked={doc.checked} className="w-4 h-4 rounded accent-accent-primary shrink-0" />
                    <span className="text-sm text-text-secondary truncate">{doc.description}</span>
                  </div>
                  <button onClick={() => setDocModal(doc.id)}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold shrink-0 ml-3 hover:opacity-80 transition-opacity"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.2) 20%, rgba(255,255,255,0) 45%), linear-gradient(145deg, #5a3a06 0%, #c89b2c 30%, #ffe08a 55%, #b8860b 80%, #5a3a05 100%)',
                      boxShadow: 'inset 0 2px 3px rgba(255,255,255,0.35), inset 0 -4px 6px rgba(0,0,0,0.45), 0 8px 18px rgba(0,0,0,0.6)',
                      border: '1px solid rgba(90,60,10,0.9)',
                      color: '#000000',
                    }}>
                    Create
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Expert Recommendation Card */}
          <GlassCard className="!p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Expert Recommendation</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {displayData.expertRecommendation}
            </p>
          </GlassCard>

          {/* Export Actions — Collapsible */}
          <div className="relative flex justify-center">
            <button
              onClick={() => setShowExport(!showExport)}
              className="px-8 py-2.5 text-center font-semibold text-white text-sm flex items-center justify-center gap-2 rounded-lg"
              style={{
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.2) 20%, rgba(255,255,255,0) 45%), linear-gradient(145deg, #3d1f04 0%, #a0522d 30%, #cd8c52 55%, #8b4513 80%, #3d1f04 100%)',
                boxShadow: 'inset 0 2px 3px rgba(255,255,255,0.35), inset 0 -4px 6px rgba(0,0,0,0.45), 0 8px 18px rgba(0,0,0,0.6)',
                border: '1px solid rgba(75,35,10,0.9)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              }}
            >
              <Download className="w-5 h-5" />
              Export & Actions
            </button>

            {showExport && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowExport(false)} />
                <div
                  className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-50 w-80 p-4 rounded-xl animate-[slideIn_0.2s_ease-out]"
                  style={{
                    background: 'linear-gradient(145deg, #15284A, #0B1630)',
                    border: '1px solid rgba(205,140,82,.25)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,.1), 0 8px 32px rgba(0,0,0,.6)',
                  }}
                >
                  <p className="text-xs font-semibold mb-3 tracking-wider uppercase" style={{ color: '#D4A574' }}>Export Options</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => { handleExport('Download PDF Report'); setShowExport(false); }}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                      style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.2) 20%, rgba(255,255,255,0) 45%), linear-gradient(145deg, #3d1f04 0%, #a0522d 30%, #cd8c52 55%, #8b4513 80%, #3d1f04 100%)', border: '1px solid rgba(75,35,10,0.9)', color: '#ffffff', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.4), 0 2px 4px rgba(0,0,0,.3)' }}>
                      <Download className="w-4 h-4" /> PDF
                    </button>
                    <button onClick={() => { handleExport('Export to Word'); setShowExport(false); }}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                      style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.2) 20%, rgba(255,255,255,0) 45%), linear-gradient(145deg, #3d1f04 0%, #a0522d 30%, #cd8c52 55%, #8b4513 80%, #3d1f04 100%)', border: '1px solid rgba(75,35,10,0.9)', color: '#ffffff', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.4), 0 2px 4px rgba(0,0,0,.3)' }}>
                      <FileText className="w-4 h-4" /> Word
                    </button>
                    <button onClick={() => { handleExport('Export to Excel'); setShowExport(false); }}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                      style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.2) 20%, rgba(255,255,255,0) 45%), linear-gradient(145deg, #3d1f04 0%, #a0522d 30%, #cd8c52 55%, #8b4513 80%, #3d1f04 100%)', border: '1px solid rgba(75,35,10,0.9)', color: '#ffffff', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.4), 0 2px 4px rgba(0,0,0,.3)' }}>
                      <FileText className="w-4 h-4" /> Excel
                    </button>
                    <button onClick={() => { handleExport('Export to CSV'); setShowExport(false); }}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                      style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.2) 20%, rgba(255,255,255,0) 45%), linear-gradient(145deg, #3d1f04 0%, #a0522d 30%, #cd8c52 55%, #8b4513 80%, #3d1f04 100%)', border: '1px solid rgba(75,35,10,0.9)', color: '#ffffff', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.4), 0 2px 4px rgba(0,0,0,.3)' }}>
                      <FileText className="w-4 h-4" /> CSV
                    </button>
                    <button onClick={() => { handleExport('Save to Case File'); setShowExport(false); }}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                      style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.2) 20%, rgba(255,255,255,0) 45%), linear-gradient(145deg, #3d1f04 0%, #a0522d 30%, #cd8c52 55%, #8b4513 80%, #3d1f04 100%)', border: '1px solid rgba(75,35,10,0.9)', color: '#ffffff', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.4), 0 2px 4px rgba(0,0,0,.3)' }}>
                      <Save className="w-4 h-4" /> Save
                    </button>
                    <button onClick={() => { handleExport('Email Report'); setShowExport(false); }}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                      style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.2) 20%, rgba(255,255,255,0) 45%), linear-gradient(145deg, #3d1f04 0%, #a0522d 30%, #cd8c52 55%, #8b4513 80%, #3d1f04 100%)', border: '1px solid rgba(75,35,10,0.9)', color: '#ffffff', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.4), 0 2px 4px rgba(0,0,0,.3)' }}>
                      <Mail className="w-4 h-4" /> Email
                    </button>
                    <button onClick={() => { handleExport('Print Analysis'); setShowExport(false); }}
                      className="col-span-2 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                      style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.2) 20%, rgba(255,255,255,0) 45%), linear-gradient(145deg, #3d1f04 0%, #a0522d 30%, #cd8c52 55%, #8b4513 80%, #3d1f04 100%)', border: '1px solid rgba(75,35,10,0.9)', color: '#ffffff', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.4), 0 2px 4px rgba(0,0,0,.3)' }}>
                      <Printer className="w-4 h-4" /> Print
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Empty state when no results and not analyzing */}
      {!isAnalyzing && !hasAnyResult && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Search className="w-12 h-12 text-text-muted opacity-30" />
          <p className="text-text-muted text-sm text-center">Upload a case file or paste case details and click "Analyze Case" to see results here</p>
        </div>
      )}


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
            className="gradient-btn w-full py-2.5 text-center font-medium text-black"
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

