import { useState } from 'react';
import {
  Brain,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Download,
  FileText,
  Save,
  Mail,
  Printer,
  Search,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { mockAnalysisResult } from '@/data/mockAnalyserData';
import { PageHeader, GlassCard, Modal } from '@/components/ui';

const INPUT_TABS = ['Text Entry', 'Copy-Paste', 'Upload Doc'] as const;
const ANALYSIS_TYPES = [
  'Case Law Research',
  'Statute Analysis',
  'Precedent Search',
  'Legal Opinion',
  'Document Review',
] as const;

export function AnalyserPage() {
  const [showResults, setShowResults] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [caseText, setCaseText] = useState('');
  const [activeInputTab, setActiveInputTab] = useState<string>('Text Entry');
  const [analysisType, setAnalysisType] = useState<string>('Case Law Research');
  const [recommendations, setRecommendations] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [caseTypeModal, setCaseTypeModal] = useState<string | null>(null);
  const [sectionModal, setSectionModal] = useState<string | null>(null);
  const [docModal, setDocModal] = useState<string | null>(null);
  const [similarCaseModal, setSimilarCaseModal] = useState<string | null>(null);
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setShowResults(true);
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleBack = () => {
    setShowResults(false);
  };

  const handleExport = (type: string) => {
    alert(`${type} — feature coming soon!`);
  };

  if (isAnalyzing) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analyser" icon={Brain} />
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="w-12 h-12 text-accent-primary animate-spin" />
          <p className="text-text-secondary text-lg">Analyzing your case...</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analyser" icon={Brain} />

        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-accent-primary hover:text-accent-hover transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Input
        </button>

        <ResultsView
          data={mockAnalysisResult}
          onExport={handleExport}
          caseTypeModal={caseTypeModal}
          setCaseTypeModal={setCaseTypeModal}
          sectionModal={sectionModal}
          setSectionModal={setSectionModal}
          docModal={docModal}
          setDocModal={setDocModal}
          similarCaseModal={similarCaseModal}
          setSimilarCaseModal={setSimilarCaseModal}
          docTitle={docTitle}
          setDocTitle={setDocTitle}
          docContent={docContent}
          setDocContent={setDocContent}
        />
      </div>
    );
  }

  // ─── Input View ───
  return (
    <div className="space-y-6">
      <PageHeader title="Analyser" icon={Brain} />

      {/* Hero title */}
      <div className="text-center py-4">
        <h2 className="text-3xl font-bold gradient-text mb-2">Legal Case Analyser</h2>
        <p className="text-text-secondary max-w-2xl mx-auto">
          Submit your case details and get valuable insights to help assess your chances of success
        </p>
      </div>

      {/* Main input card */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-text-primary mb-4">More Inputs to Your Case</h3>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {INPUT_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveInputTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeInputTab === tab
                  ? 'bg-accent-primary text-white'
                  : 'bg-bg-elevated text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Case text area */}
        <textarea
          value={caseText}
          onChange={(e) => setCaseText(e.target.value)}
          placeholder="Type or paste the details of your case here..."
          className="w-full h-40 bg-bg-elevated border border-border rounded-xl p-4 text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary/50 mb-4"
        />

        {/* Recommendations */}
        <label className="block text-sm font-medium text-text-secondary mb-2">
          User Recommendations/Consideration:
        </label>
        <textarea
          value={recommendations}
          onChange={(e) => setRecommendations(e.target.value)}
          placeholder="Type or paste the recommendations that you want to have..."
          className="w-full h-28 bg-bg-elevated border border-border rounded-xl p-4 text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary/50 mb-6"
        />

        {/* Analyze button */}
        <button
          onClick={handleAnalyze}
          className="gradient-btn w-full py-3 text-center font-semibold text-white"
        >
          Analyze Case
        </button>
      </GlassCard>

      {/* Case Analyser sub-section */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-1">Case Analyser</h3>
        <p className="text-sm text-text-secondary mb-4">
          AI-powered legal research and case analysis tool
        </p>

        {/* Search bar */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search case law, statutes, precedents..."
              className="w-full bg-bg-elevated border border-border rounded-xl pl-10 pr-4 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
            />
          </div>
          <button className="gradient-btn px-6 py-2.5 font-medium text-white">Analyse</button>
        </div>

        {/* Analysis type pills */}
        <div className="flex flex-wrap gap-2">
          {ANALYSIS_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setAnalysisType(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                analysisType === type
                  ? 'bg-accent-primary text-white'
                  : 'bg-bg-elevated text-text-secondary hover:text-text-primary'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════
   Results View — Tasks 10.2, 10.3, 10.4
   ═══════════════════════════════════════════════════ */

interface ResultsViewProps {
  data: typeof mockAnalysisResult;
  onExport: (type: string) => void;
  caseTypeModal: string | null;
  setCaseTypeModal: (v: string | null) => void;
  sectionModal: string | null;
  setSectionModal: (v: string | null) => void;
  docModal: string | null;
  setDocModal: (v: string | null) => void;
  similarCaseModal: string | null;
  setSimilarCaseModal: (v: string | null) => void;
  docTitle: string;
  setDocTitle: (v: string) => void;
  docContent: string;
  setDocContent: (v: string) => void;
}

function ResultsView({
  data,
  onExport,
  caseTypeModal,
  setCaseTypeModal,
  sectionModal,
  setSectionModal,
  docModal,
  setDocModal,
  similarCaseModal,
  setSimilarCaseModal,
  docTitle,
  setDocTitle,
  docContent,
  setDocContent,
}: ResultsViewProps) {
  const pieData = [
    { name: 'Winning', value: data.outcomePrediction.winningPct },
    { name: 'Losing', value: data.outcomePrediction.losingPct },
  ];
  const PIE_COLORS = ['#10B981', '#F43F5E'];

  const selectedSimilarCase = data.similarCases.find((c) => c.citation === similarCaseModal);

  return (
    <div className="space-y-6">
      {/* Section title */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-1">Analysis Results</h2>
        <p className="text-sm text-text-secondary">
          AI-generated legal analysis based on your case details
        </p>
      </div>

      {/* ── 10.2: Case Summary ── */}
      <GlassCard>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent-primary/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-accent-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Case Summary</h3>
            <p className="text-xs text-text-secondary">Generated analysis based on your query</p>
          </div>
        </div>

        <p className="text-text-secondary mb-4">
          {data.caseSummary.legalIssue.split('Section 9').map((part, i) =>
            i === 0 ? (
              <span key={i}>
                {part}
                {i < data.caseSummary.legalIssue.split('Section 9').length - 1 && (
                  <strong className="text-text-primary">Section 9</strong>
                )}
              </span>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </p>

        <ul className="space-y-2 mb-6">
          {data.caseSummary.keyPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent-primary shrink-0" />
              {point}
            </li>
          ))}
        </ul>

        {/* Success Probability */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-secondary">Success Probability</span>
            <span className="text-sm font-bold text-warning">{data.caseSummary.successProbability}%</span>
          </div>
          <div className="w-full h-3 bg-bg-elevated rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-warning to-accent-primary"
              style={{ width: `${data.caseSummary.successProbability}%` }}
            />
          </div>
        </div>
      </GlassCard>

      {/* ── 10.2: Relevant Case Laws ── */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Relevant Case Laws</h3>
        <div className="space-y-4">
          {data.relevantCaseLaws.map((law, i) => (
            <div key={i} className="p-4 bg-bg-elevated rounded-xl">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h4 className="text-sm font-semibold text-text-primary">{law.citation}</h4>
                <span
                  className={`badge shrink-0 ${
                    law.outcome === 'Favorable' ? 'badge-success' : 'badge-info'
                  }`}
                >
                  {law.outcome}
                </span>
              </div>
              <p className="text-xs text-text-muted mb-2">
                {law.court} • {law.practiceArea} • Cited {law.citedTimes} times
              </p>
              <p className="text-sm text-text-secondary">{law.description}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* ── 10.2: Applicable Statutory Provisions ── */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Applicable Statutory Provisions</h3>
        <div className="space-y-4">
          {data.statutoryProvisions.map((prov, i) => (
            <div key={i} className="p-4 bg-bg-elevated rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-text-primary">
                  {prov.section} — {prov.act}
                </h4>
                <span
                  className={`badge ${
                    prov.relevance === 'Primary' ? 'badge-danger' : 'badge-info'
                  }`}
                >
                  {prov.relevance}
                </span>
              </div>
              <p className="text-sm text-text-secondary italic">"{prov.text}"</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* ── 10.3: Case Type & Jurisdiction ── */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Case Type &amp; Jurisdiction</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {data.caseTypes.map((ct) => (
            <button
              key={ct}
              onClick={() => setCaseTypeModal(ct)}
              className="badge badge-info cursor-pointer hover:opacity-80 transition-opacity"
            >
              {ct}
            </button>
          ))}
        </div>
        <p className="text-sm text-text-secondary">Jurisdiction: {data.jurisdiction}</p>
      </GlassCard>

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

      {/* ── 10.3: Applicable Legal Sections ── */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Applicable Legal Sections</h3>
        <div className="space-y-3">
          {data.applicableSections.map((sec, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-bg-elevated rounded-xl">
              <div>
                <h4 className="text-sm font-semibold text-text-primary">{sec.section}</h4>
                <p className="text-xs text-text-secondary">{sec.description}</p>
              </div>
              <button
                onClick={() => setSectionModal(sec.section)}
                className={`badge cursor-pointer hover:opacity-80 transition-opacity ${
                  sec.relevance === 'High relevance' ? 'badge-danger' : 'badge-info'
                }`}
              >
                {sec.relevance}
              </button>
            </div>
          ))}
        </div>
      </GlassCard>

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

      {/* ── 10.3: Required Documents ── */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Required Documents</h3>
        <div className="space-y-3">
          {data.requiredDocuments.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-3 bg-bg-elevated rounded-xl">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  defaultChecked={doc.checked}
                  className="w-4 h-4 rounded accent-accent-primary"
                />
                <span className="text-sm text-text-secondary">{doc.description}</span>
              </div>
              <button
                onClick={() => setDocModal(doc.id)}
                className="text-xs font-medium text-accent-primary hover:text-accent-hover transition-colors"
              >
                Create
              </button>
            </div>
          ))}
        </div>
      </GlassCard>

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

      {/* ── 10.3: Similar Historical Cases ── */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Similar Historical Cases</h3>
        <div className="space-y-3">
          {data.similarCases.map((sc, i) => (
            <button
              key={i}
              onClick={() => setSimilarCaseModal(sc.citation)}
              className="w-full flex items-center justify-between p-3 bg-bg-elevated rounded-xl hover:bg-bg-elevated/80 transition-colors text-left"
            >
              <div>
                <h4 className="text-sm font-semibold text-text-primary">{sc.citation}</h4>
                <p className="text-xs text-text-secondary">{sc.outcome}</p>
              </div>
              <span
                className={`badge ${
                  sc.badge === 'WIN'
                    ? 'badge-success'
                    : sc.badge === 'LOSS'
                    ? 'badge-danger'
                    : 'badge-warning'
                }`}
              >
                {sc.badge}
              </span>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Similar Case Modal */}
      <Modal
        isOpen={!!similarCaseModal}
        onClose={() => setSimilarCaseModal(null)}
        title={similarCaseModal ?? ''}
      >
        {selectedSimilarCase && (
          <div className="space-y-3">
            <p className="text-sm text-text-secondary">
              <strong className="text-text-primary">Citation:</strong> {selectedSimilarCase.citation}
            </p>
            <p className="text-sm text-text-secondary">
              <strong className="text-text-primary">Outcome:</strong> {selectedSimilarCase.outcome}
            </p>
            <p className="text-sm text-text-secondary">
              <strong className="text-text-primary">Result:</strong>{' '}
              <span
                className={`badge ${
                  selectedSimilarCase.badge === 'WIN'
                    ? 'badge-success'
                    : selectedSimilarCase.badge === 'LOSS'
                    ? 'badge-danger'
                    : 'badge-warning'
                }`}
              >
                {selectedSimilarCase.badge}
              </span>
            </p>
            <p className="text-sm text-text-secondary">
              This case shares similar legal issues and factual circumstances with your current case.
              The precedent set here may be relevant to your legal strategy.
            </p>
          </div>
        )}
      </Modal>

      {/* ── 10.4: Outcome Prediction ── */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Outcome Prediction</h3>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-success" />
              <span className="text-sm text-text-secondary">
                Winning — {data.outcomePrediction.winningPct}%
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-danger" />
              <span className="text-sm text-text-secondary">
                Losing — {data.outcomePrediction.losingPct}%
              </span>
            </div>
            <button className="gradient-btn px-4 py-2 text-sm font-medium text-white mt-2">
              Explore
            </button>
          </div>
        </div>
      </GlassCard>

      {/* ── 10.4: Key Winning Points & Risk Factors ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Key Winning Points</h3>
          <ul className="space-y-3">
            {data.keyWinningPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-success shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Risk Factors</h3>
          <ul className="space-y-3">
            {data.riskFactors.map((risk, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-danger shrink-0" />
                {risk}
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      {/* ── 10.4: Strengths ── */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Strengths</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.strengths.map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-text-primary">{s.title}</h4>
                <p className="text-xs text-text-secondary">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* ── 10.4: Challenges ── */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Challenges</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.challenges.map((c, i) => (
            <div key={i} className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-text-primary">{c.title}</h4>
                <p className="text-xs text-text-secondary">{c.description}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* ── 10.4: Recommended Legal Strategy ── */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Recommended Legal Strategy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.strategy.map((step) => (
            <div key={step.step} className="flex items-start gap-4 p-4 bg-bg-elevated rounded-xl">
              <div className="w-8 h-8 rounded-lg gradient-btn flex items-center justify-center shrink-0 text-sm font-bold">
                {step.step}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text-primary">{step.title}</h4>
                <p className="text-xs text-text-secondary mt-1">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* ── 10.4: Expert Recommendation ── */}
      <GlassCard>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Expert Recommendation</h3>
            <p className="text-sm text-text-secondary">
              {data.expertRecommendation.split(/(\d+%|\d+)/).map((part, i) =>
                /^\d+%?$/.test(part) ? (
                  <strong key={i} className="text-text-primary">{part}</strong>
                ) : (
                  <span key={i}>{part}</span>
                )
              )}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* ── 10.4: Export Analysis ── */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Export Analysis</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onExport('Download PDF Report')}
            className="gradient-btn flex items-center gap-2 px-5 py-2.5 font-medium text-white"
          >
            <Download className="w-4 h-4" />
            Download PDF Report
          </button>
          <button
            onClick={() => onExport('Export to Word')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:border-accent-primary/50 transition-colors font-medium text-sm"
          >
            <FileText className="w-4 h-4" />
            Export to Word
          </button>
          <button
            onClick={() => onExport('Save to Case File')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:border-accent-primary/50 transition-colors font-medium text-sm"
          >
            <Save className="w-4 h-4" />
            Save to Case File
          </button>
          <button
            onClick={() => onExport('Email Report')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:border-accent-primary/50 transition-colors font-medium text-sm"
          >
            <Mail className="w-4 h-4" />
            Email Report
          </button>
          <button
            onClick={() => onExport('Print Analysis')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:border-accent-primary/50 transition-colors font-medium text-sm"
          >
            <Printer className="w-4 h-4" />
            Print Analysis
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
