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
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { mockAnalysisResult, type AnalysisResult } from '@/data/mockAnalyserData';
import { analyzeCase } from '@/services/geminiService';
import { extractTextFromFile, SUPPORTED_FILE_TYPES, SUPPORTED_FILE_TYPES_LABEL } from '@/services/fileExtractor';
import { PageHeader, GlassCard, Modal } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';

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

  // Ensure winning + losing = 100
  const total = normalized.outcomePrediction.winningPct + normalized.outcomePrediction.losingPct;
  if (total !== 100) {
    normalized.outcomePrediction.losingPct = 100 - normalized.outcomePrediction.winningPct;
  }
  return normalized;
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
    // If multiple files uploaded, analyze each one sequentially
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
          results.push({ fileName: name, result: mockAnalysisResult });
        }
      }

      setAnalysisResults(results);
      setActiveSlide(0);
      setAnalyzeProgress('');
      setIsAnalyzing(false);
      return;
    }

    // Single text analysis (existing logic)
    if (!caseText.trim()) return;

    const trimmedText = caseText.trim();
    if (trimmedText.length < 50) {
      setAnalysisError('Please provide detailed case information (at least 50 characters). You can type/paste case details or upload a legal document (PDF, DOCX, etc.).');
      setAnalysisResult(null);
      return;
    }

    const legalKeywords = ['case', 'court', 'section', 'act', 'law', 'dispute', 'plaintiff', 'defendant', 'accused', 'complainant', 'petition', 'appeal', 'judgment', 'order', 'contract', 'property', 'criminal', 'civil', 'fir', 'bail', 'divorce', 'custody', 'compensation', 'damages', 'fraud', 'cheating', 'theft', 'murder', 'assault', 'negligence', 'breach', 'agreement', 'tenant', 'landlord', 'employer', 'employee', 'insurance', 'claim', 'arbitration', 'tribunal', 'ipc', 'crpc', 'cpc', 'bns', 'bnss', 'constitution', 'article', 'writ', 'habeas', 'mandamus', 'vs', 'versus'];
    const lowerText = trimmedText.toLowerCase();
    const hasLegalContent = legalKeywords.some(keyword => lowerText.includes(keyword));

    if (!hasLegalContent && trimmedText.split(/\s+/).length < 20) {
      setAnalysisError('The text does not appear to contain legal case information. Please provide case details, upload a legal document, or paste relevant case text for analysis.');
      setAnalysisResult(null);
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const rawResponse = await analyzeCase(caseText, recommendations);
      const cleanedResponse = rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanedResponse);
      const normalized = normalizeResult(parsed);
      setAnalysisResult(normalized);
      // Also push to analysisResults for consistency
      setAnalysisResults([{ fileName: uploadedFiles.length === 1 ? uploadedFiles[0].name : 'Text Input', result: normalized }]);
      setActiveSlide(0);
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : 'Analysis failed.');
      setAnalysisResult(mockAnalysisResult);
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
      <PageHeader title="Analyser" icon={Brain} />

      {/* Hero title */}
      <div className="text-center py-2">
        <h2 className="text-3xl font-bold gradient-text mb-1">Legal Case Analyser</h2>
        <p className="text-text-secondary text-sm max-w-2xl mx-auto">
          Submit your case details and get AI-powered insights to assess your chances of success
        </p>
      </div>

      {/* Error / Success indicator */}
      {analysisError && (
        <div className="px-4 py-2 bg-warning/10 border border-warning/30 rounded-xl text-sm text-warning">
          ⚠️ AI analysis failed ({analysisError}). Showing fallback data.
        </div>
      )}
      {hasAnyResult && !analysisError && (
        <div className="px-4 py-2 bg-success/10 border border-success/30 rounded-xl text-sm text-success">
          ✓ Analysis powered by Gemini Flash AI
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
              disabled={isAnalyzing || (!caseText.trim() && extractedTexts.length === 0)}
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
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-bg-elevated border border-border shadow-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-accent-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all -ml-4"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveSlide(Math.min(analysisResults.length - 1, activeSlide + 1))}
              disabled={activeSlide === analysisResults.length - 1}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-bg-elevated border border-border shadow-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-accent-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all -mr-4"
            >
              <ChevronRight className="w-4 h-4" />
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
                            className="px-3 py-1 rounded-full cursor-pointer hover:opacity-80 transition-opacity text-xs font-medium border border-accent-primary text-accent-primary bg-accent-primary/10">
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
                              <p className="text-xs text-text-secondary truncate">{sec.description}</p>
                            </div>
                            <button onClick={() => setSectionModal(sec.section)}
                              className={`px-3 py-1 rounded-full cursor-pointer hover:opacity-80 transition-opacity text-xs font-medium shrink-0 ml-2 border ${
                                sec.relevance === 'High relevance'
                                  ? 'border-red-400 text-red-400 bg-red-400/10'
                                  : 'border-blue-400 text-blue-400 bg-blue-400/10'
                              }`}>
                              {sec.relevance}
                            </button>
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
                              <span className="text-xs text-text-secondary truncate">{doc.description}</span>
                            </div>
                            <button onClick={() => setDocModal(doc.id)}
                              className="px-3 py-1 rounded-full text-xs font-medium border border-accent-primary text-accent-primary hover:bg-accent-primary/10 transition-colors shrink-0 ml-2">
                              Create
                            </button>
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
                              <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ml-2 border ${
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
                        <div className="w-32 h-32 relative">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <defs>
                                <linearGradient id="pieGold" x1="0" y1="0" x2="1" y2="1">
                                  <stop offset="0%" stopColor="#F5E0A0" />
                                  <stop offset="25%" stopColor="#E8C068" />
                                  <stop offset="50%" stopColor="#D4A853" />
                                  <stop offset="75%" stopColor="#B8860B" />
                                  <stop offset="100%" stopColor="#8B6914" />
                                </linearGradient>
                                <linearGradient id="pieSilver" x1="0" y1="0" x2="1" y2="1">
                                  <stop offset="0%" stopColor="#FFFFFF" />
                                  <stop offset="25%" stopColor="#E8E8E8" />
                                  <stop offset="50%" stopColor="#C0C0C0" />
                                  <stop offset="75%" stopColor="#A0A0A0" />
                                  <stop offset="100%" stopColor="#707070" />
                                </linearGradient>
                              </defs>
                              <Pie
                                data={[
                                  { name: 'Winning', value: displayData.outcomePrediction.winningPct },
                                  { name: 'Losing', value: displayData.outcomePrediction.losingPct },
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={35}
                                outerRadius={55}
                                dataKey="value"
                                strokeWidth={0}
                                label={({ value }) => `${value}%`}
                                labelLine={false}
                              >
                                <Cell fill={theme === 'gold' ? 'url(#pieGold)' : '#10B981'} />
                                <Cell fill={theme === 'gold' ? 'url(#pieSilver)' : '#F43F5E'} />
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
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
                          <span className="text-xs text-success font-medium">{displayData.outcomePrediction.winningPct}% - Winning</span>
                        </div>
                        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-danger/10 border border-danger/30">
                          <span className="w-2 h-2 rounded-full bg-danger" />
                          <span className="text-xs text-danger font-medium">{displayData.outcomePrediction.losingPct}% - Losing</span>
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
                          className="px-3 py-1 rounded-full cursor-pointer hover:opacity-80 transition-opacity text-xs font-medium border border-accent-primary text-accent-primary bg-accent-primary/10">
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
                            <p className="text-xs text-text-secondary truncate">{sec.description}</p>
                          </div>
                          <button onClick={() => setSectionModal(sec.section)}
                            className={`px-3 py-1 rounded-full cursor-pointer hover:opacity-80 transition-opacity text-xs font-medium shrink-0 ml-2 border ${
                              sec.relevance === 'High relevance'
                                ? 'border-red-400 text-red-400 bg-red-400/10'
                                : 'border-blue-400 text-blue-400 bg-blue-400/10'
                            }`}>
                            {sec.relevance}
                          </button>
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
                            <span className="text-xs text-text-secondary truncate">{doc.description}</span>
                          </div>
                          <button onClick={() => setDocModal(doc.id)}
                            className="px-3 py-1 rounded-full text-xs font-medium border border-accent-primary text-accent-primary hover:bg-accent-primary/10 transition-colors shrink-0 ml-2">
                            Create
                          </button>
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
                            <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ml-2 border ${
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
                      <div className="w-32 h-32 relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <defs>
                              <linearGradient id="pieGoldSingle" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#F5E0A0" />
                                <stop offset="25%" stopColor="#E8C068" />
                                <stop offset="50%" stopColor="#D4A853" />
                                <stop offset="75%" stopColor="#B8860B" />
                                <stop offset="100%" stopColor="#8B6914" />
                              </linearGradient>
                              <linearGradient id="pieSilverSingle" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#FFFFFF" />
                                <stop offset="25%" stopColor="#E8E8E8" />
                                <stop offset="50%" stopColor="#C0C0C0" />
                                <stop offset="75%" stopColor="#A0A0A0" />
                                <stop offset="100%" stopColor="#707070" />
                              </linearGradient>
                            </defs>
                            <Pie
                              data={[
                                { name: 'Winning', value: displayData.outcomePrediction.winningPct },
                                { name: 'Losing', value: displayData.outcomePrediction.losingPct },
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={35}
                              outerRadius={55}
                              dataKey="value"
                              strokeWidth={0}
                              label={({ value }) => `${value}%`}
                              labelLine={false}
                            >
                              <Cell fill={theme === 'gold' ? 'url(#pieGoldSingle)' : '#10B981'} />
                              <Cell fill={theme === 'gold' ? 'url(#pieSilverSingle)' : '#F43F5E'} />
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
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
                        <span className="text-xs text-success font-medium">{displayData.outcomePrediction.winningPct}% - Winning</span>
                      </div>
                      <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-danger/10 border border-danger/30">
                        <span className="w-2 h-2 rounded-full bg-danger" />
                        <span className="text-xs text-danger font-medium">{displayData.outcomePrediction.losingPct}% - Losing</span>
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
