import { useState } from 'react';
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
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { mockAnalysisResult, type AnalysisResult } from '@/data/mockAnalyserData';
import { analyzeCase } from '@/services/geminiService';
import { extractTextFromFile, SUPPORTED_FILE_TYPES, SUPPORTED_FILE_TYPES_LABEL } from '@/services/fileExtractor';
import { PageHeader, GlassCard, Modal } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';

const INPUT_TABS = ['Text Entry', 'Copy-Paste', 'Upload Doc'] as const;

export function AnalyserPage() {
  const { theme } = useTheme();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [caseText, setCaseText] = useState('');
  const [activeInputTab, setActiveInputTab] = useState<string>('Text Entry');
  const [recommendations, setRecommendations] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{ pages: number; wordCount: number } | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  // Modal states
  const [caseTypeModal, setCaseTypeModal] = useState<string | null>(null);
  const [sectionModal, setSectionModal] = useState<string | null>(null);
  const [docModal, setDocModal] = useState<string | null>(null);
  const [similarCaseModal, setSimilarCaseModal] = useState<string | null>(null);
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setIsExtracting(true);
    setAnalysisError(null);
    try {
      const { text, pages, wordCount } = await extractTextFromFile(file);
      setCaseText(text);
      setFileInfo({ pages, wordCount });
      setActiveInputTab('Upload Doc');
    } catch (error) {
      setAnalysisError(
        `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAnalyze = async () => {
    if (!caseText.trim()) return;
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const rawResponse = await analyzeCase(caseText, recommendations);
      const cleanedResponse = rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanedResponse);
      
      // Normalize/validate the response - ensure all fields exist with defaults
      const normalized: AnalysisResult = {
        caseSummary: {
          legalIssue: parsed.caseSummary?.legalIssue || 'Analysis completed.',
          keyPoints: parsed.caseSummary?.keyPoints || [],
          successProbability: parsed.caseSummary?.successProbability ?? 50,
        },
        relevantCaseLaws: parsed.relevantCaseLaws || [],
        statutoryProvisions: parsed.statutoryProvisions || [],
        caseTypes: parsed.caseTypes || ['General'],
        jurisdiction: parsed.jurisdiction || 'India',
        applicableSections: parsed.applicableSections || [],
        requiredDocuments: (parsed.requiredDocuments || []).map((doc: Record<string, unknown>, i: number) => ({
          id: doc.id || `doc-${i + 1}`,
          description: doc.description || '',
          checked: doc.checked ?? false,
        })),
        similarCases: (parsed.similarCases || []).map((sc: Record<string, unknown>) => ({
          citation: sc.citation || 'Unknown Case',
          outcome: sc.outcome || 'Outcome: Unknown',
          badge: (['WIN', 'LOSS', 'Partial'].includes(sc.badge as string) ? sc.badge : 'Partial') as 'WIN' | 'LOSS' | 'Partial',
        })),
        outcomePrediction: {
          winningPct: Math.max(5, Math.min(95, parsed.outcomePrediction?.winningPct ?? 50)),
          losingPct: Math.max(5, Math.min(95, parsed.outcomePrediction?.losingPct ?? 50)),
        },
        keyWinningPoints: parsed.keyWinningPoints || [],
        riskFactors: parsed.riskFactors || [],
        strengths: parsed.strengths || [],
        challenges: parsed.challenges || [],
        strategy: parsed.strategy || [],
        expertRecommendation: parsed.expertRecommendation || 'Please consult with a qualified advocate for specific legal advice.',
      };
      
      // Ensure winning + losing = 100
      const total = normalized.outcomePrediction.winningPct + normalized.outcomePrediction.losingPct;
      if (total !== 100) {
        normalized.outcomePrediction.losingPct = 100 - normalized.outcomePrediction.winningPct;
      }
      
      setAnalysisResult(normalized);
    } catch (error) {
      console.error('AI Analysis failed:', error);
      setAnalysisError(error instanceof Error ? error.message : 'Analysis failed.');
      setAnalysisResult(mockAnalysisResult);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExport = (type: string) => {
    if (!analysisResult) return;
    const data = analysisResult;
    const analysisText = `LEGAL CASE ANALYSIS REPORT\n${'='.repeat(40)}\n\nCase Summary:\n${data.caseSummary.legalIssue}\n\nSuccess Probability: ${data.caseSummary.successProbability}%\n\nKey Points:\n${data.caseSummary.keyPoints.map(p => '• ' + p).join('\n')}\n\nApplicable Sections:\n${data.applicableSections.map(s => '• ' + s.section + ' - ' + s.description).join('\n')}\n\nKey Winning Points:\n${data.keyWinningPoints.map(p => '✓ ' + p).join('\n')}\n\nRisk Factors:\n${data.riskFactors.map(r => '⚠ ' + r).join('\n')}\n\nExpert Recommendation:\n${data.expertRecommendation}`;

    if (type === 'Download PDF Report' || type === 'Export to Word' || type === 'Print Analysis') {
      const blob = new Blob([analysisText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `case-analysis-report.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (type === 'Save to Case File') {
      localStorage.setItem('juryfy_saved_analysis', analysisText);
      alert('Analysis saved to case file!');
    } else if (type === 'Email Report') {
      window.open(`mailto:?subject=Case Analysis Report&body=${encodeURIComponent(analysisText.substring(0, 2000))}`);
    }
  };

  const displayData = analysisResult;

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
      {analysisResult && !analysisError && (
        <div className="px-4 py-2 bg-success/10 border border-success/30 rounded-xl text-sm text-success">
          ✓ Analysis powered by Gemini Flash AI
        </div>
      )}

      {/* 3-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN - Input Panel (~25%) */}
        <div className="lg:col-span-3 space-y-4">
          <GlassCard className="!p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">More Inputs to Your Case</h3>

            {/* Tabs */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {INPUT_TABS.map((tab) => {
                const icon = tab === 'Text Entry' ? '📄' : tab === 'Copy-Paste' ? '📋' : '✉️';
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveInputTab(tab)}
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
                    ) : uploadedFile ? (
                      <>
                        <FileText className="w-6 h-6 text-success mb-1" />
                        <p className="text-xs font-medium text-text-primary truncate max-w-full px-2">{uploadedFile.name}</p>
                        <p className="text-xs text-text-secondary mt-0.5">
                          {fileInfo ? `${fileInfo.pages} pages • ${fileInfo.wordCount.toLocaleString()} words` : 'Processing...'}
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
                    onChange={handleFileUpload}
                  />
                </label>
                {caseText && fileInfo && (
                  <div className="mt-2 p-2 bg-bg-elevated rounded-lg">
                    <p className="text-xs text-text-secondary line-clamp-2">{caseText.substring(0, 150)}...</p>
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
              disabled={isAnalyzing || !caseText.trim()}
              className="gradient-btn w-full py-3 text-center font-bold text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Analyze Case
                </>
              )}
            </button>
          </GlassCard>

          {/* Export buttons */}
          {analysisResult && (
            <GlassCard className="!p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Export</h3>
              <div className="space-y-2">
                <button onClick={() => handleExport('Download PDF Report')} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors">
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </button>
                <button onClick={() => handleExport('Export to Word')} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors">
                  <FileText className="w-3.5 h-3.5" /> Export Word
                </button>
                <button onClick={() => handleExport('Save to Case File')} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors">
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
                <button onClick={() => handleExport('Email Report')} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors">
                  <Mail className="w-3.5 h-3.5" /> Email
                </button>
                <button onClick={() => handleExport('Print Analysis')} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors">
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
              </div>
            </GlassCard>
          )}
        </div>

        {/* MIDDLE COLUMN (~37%) */}
        <div className="lg:col-span-4 space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-10 h-10 text-accent-primary animate-spin" />
              <p className="text-text-secondary text-sm">Analyzing case...</p>
            </div>
          ) : !displayData ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Brain className="w-10 h-10 text-text-muted opacity-30" />
              <p className="text-text-muted text-xs text-center">Upload a case file or paste case details and click "Analyze Case" to see results here</p>
            </div>
          ) : (
            <>
              {/* Case Type & Jurisdiction */}
              <GlassCard className="!p-4">
                <h3 className="text-sm font-semibold text-text-primary mb-3">Case Type &amp; Jurisdiction</h3>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {displayData.caseTypes.map((ct) => (
                    <button
                      key={ct}
                      onClick={() => setCaseTypeModal(ct)}
                      className="px-3 py-1 rounded-full cursor-pointer hover:opacity-80 transition-opacity text-xs font-medium border border-accent-primary text-accent-primary bg-accent-primary/10"
                    >
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
                      <button
                        onClick={() => setSectionModal(sec.section)}
                        className={`px-3 py-1 rounded-full cursor-pointer hover:opacity-80 transition-opacity text-xs font-medium shrink-0 ml-2 border ${
                          sec.relevance === 'High relevance'
                            ? 'border-red-400 text-red-400 bg-red-400/10'
                            : 'border-blue-400 text-blue-400 bg-blue-400/10'
                        }`}
                      >
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
                        <input
                          type="checkbox"
                          defaultChecked={doc.checked}
                          className="w-3.5 h-3.5 rounded accent-accent-primary shrink-0"
                        />
                        <span className="text-xs text-text-secondary truncate">{doc.description}</span>
                      </div>
                      <button
                        onClick={() => setDocModal(doc.id)}
                        className="px-3 py-1 rounded-full text-xs font-medium border border-accent-primary text-accent-primary hover:bg-accent-primary/10 transition-colors shrink-0 ml-2"
                      >
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
        <div className="lg:col-span-5 space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
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
                      <button
                        key={i}
                        onClick={() => setSimilarCaseModal(sc.citation)}
                        className="w-full flex items-center justify-between p-2.5 bg-bg-elevated rounded-lg hover:bg-bg-elevated/80 transition-colors text-left"
                      >
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-semibold text-text-primary">{sc.citation}</h4>
                          <p className="text-xs text-text-secondary">{sc.outcome}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ml-2 border ${
                            sc.badge === 'WIN'
                              ? 'border-green-400 text-green-400 bg-green-400/10'
                              : sc.badge === 'LOSS'
                              ? 'border-red-400 text-red-400 bg-red-400/10'
                              : 'border-yellow-400 text-yellow-400 bg-yellow-400/10'
                          }`}
                        >
                          {sc.badge === 'WIN' ? '✓ ' : sc.badge === 'LOSS' ? '✗ ' : '⚠ '}{sc.badge}
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-text-muted italic">No similar cases found for this analysis.</p>
                  )}
                </div>
              </GlassCard>

              {/* Outcome Prediction + Key Winning Points + Risk Factors (combined card) */}
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
                            <span className="text-success mt-0.5">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text-primary mb-1">Risk Factors:</h4>
                      <ul className="space-y-1">
                        {displayData.riskFactors.map((risk, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-text-secondary">
                            <span className="text-danger mt-0.5">•</span>
                            {risk}
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
                <span
                  className={`badge ${
                    selectedCase.badge === 'WIN'
                      ? 'badge-success'
                      : selectedCase.badge === 'LOSS'
                      ? 'badge-danger'
                      : 'badge-warning'
                  }`}
                >
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
