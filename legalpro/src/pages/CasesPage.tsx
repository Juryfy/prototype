import { useState, useMemo } from 'react';
import { Briefcase, Plus, Eye, FileText, Scale, Gavel, Clock, PauseCircle, FolderOpen, Download } from 'lucide-react';
import { PageHeader, GlassCard, TabBar, DataTable, StatusBadge, Modal } from '@/components/ui';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { STORAGE_KEYS, mockCases } from '@/data/mockData';
import { exportToCSV } from '@/utils/export';
import type { Case, PracticeArea, CourtLevel, CaseStage } from '@/types';

const PRACTICE_AREAS: PracticeArea[] = ['Civil', 'Criminal', 'Family', 'Corporate', 'IPR', 'Tax'];
const COURT_LEVELS: CourtLevel[] = ['District Court', 'High Court', 'Tribunal', 'Supreme Court'];

const STAGE_CARDS: { stage: CaseStage; label: string; description: string; icon: typeof Briefcase }[] = [
  { stage: 'Admission', label: 'Admission Stage', description: 'Newly filed cases', icon: FileText },
  { stage: 'Evidence', label: 'Evidence Stage', description: 'Document submission', icon: Scale },
  { stage: 'Arguments', label: 'Arguments Stage', description: 'Final hearings', icon: Gavel },
  { stage: 'Judgment Awaited', label: 'Judgment Awaited', description: 'Reserved cases', icon: Clock },
  { stage: 'Adjourned', label: 'Adjourned', description: 'Next date pending', icon: PauseCircle },
  { stage: 'Filing', label: 'Filing Stage', description: 'Being prepared', icon: FolderOpen },
];

export function CasesPage() {
  const [cases, { add }] = useLocalStorage<Case>(STORAGE_KEYS.cases, mockCases);
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewCase, setViewCase] = useState<Case | null>(null);

  // Tab counts
  const counts = useMemo(() => ({
    all: cases.length,
    active: cases.filter((c) => c.status === 'Active').length,
    closed: cases.filter((c) => c.status === 'Closed' || c.status === 'Won' || c.status === 'Lost').length,
    settled: cases.filter((c) => c.status === 'Settled').length,
  }), [cases]);

  const tabs = [
    { key: 'all', label: 'All Cases', count: counts.all },
    { key: 'active', label: 'Active', count: counts.active },
    { key: 'closed', label: 'Closed', count: counts.closed },
    { key: 'settled', label: 'Settled', count: counts.settled },
  ];

  // Filtered cases based on active tab
  const filteredCases = useMemo(() => {
    switch (activeTab) {
      case 'active': return cases.filter((c) => c.status === 'Active');
      case 'closed': return cases.filter((c) => c.status === 'Closed' || c.status === 'Won' || c.status === 'Lost');
      case 'settled': return cases.filter((c) => c.status === 'Settled');
      default: return cases;
    }
  }, [cases, activeTab]);

  // Stage counts
  const stageCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of cases) {
      map[c.stage] = (map[c.stage] || 0) + 1;
    }
    return map;
  }, [cases]);

  // Table columns
  const columns = [
    { key: 'caseNumber', label: 'Case Number', sortable: true },
    { key: 'clientName', label: 'Client Name', sortable: true },
    { key: 'practiceArea', label: 'Practice Area', sortable: true },
    { key: 'court', label: 'Court', sortable: true },
    {
      key: 'nextHearing',
      label: 'Next Hearing',
      sortable: true,
      render: (row: Case) => row.nextHearing
        ? new Date(row.nextHearing).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : '—',
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: Case) => <StatusBadge status={row.status} />,
    },
    {
      key: 'action',
      label: 'Action',
      render: (row: Case) => (
        <button
          onClick={(e) => { e.stopPropagation(); setViewCase(row); }}
          className="flex items-center gap-1 text-accent-primary hover:text-accent-secondary text-xs font-medium"
        >
          <Eye className="w-3.5 h-3.5" /> View
        </button>
      ),
    },
  ];

  // Create case handler
  function handleCreateCase(data: Omit<Case, 'id' | 'status' | 'stage' | 'createdAt'>) {
    const newCase: Case = {
      ...data,
      id: `case-${Date.now()}`,
      status: 'Active',
      stage: 'Filing',
      createdAt: new Date().toISOString().split('T')[0],
    };
    add(newCase);
    setShowCreateModal(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Cases" icon={Briefcase} showNewCase />

      {/* Case Table Section */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Case Management</h2>
            <p className="text-sm text-text-secondary">Complete case lifecycle management with status tracking and court details</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportToCSV(filteredCases as unknown as Record<string, unknown>[], 'cases-export')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-border text-text-secondary hover:bg-bg-elevated transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Export
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="gradient-btn flex items-center gap-2 px-4 py-2 text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> New Case
            </button>
          </div>
        </div>

        <div className="mb-4">
          <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        <DataTable
          columns={columns as unknown as { key: string; label: string; sortable?: boolean; render?: (row: Record<string, unknown>) => React.ReactNode }[]}
          data={filteredCases as unknown as Record<string, unknown>[]}
          pageSize={10}
        />
      </GlassCard>

      {/* Case Stage Summary */}
      <GlassCard>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Case Stage Summary</h2>
          <p className="text-sm text-text-secondary">Track cases by procedural stage from admission to judgment</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {STAGE_CARDS.map(({ stage, label, description, icon: Icon }) => (
            <div key={stage} className="glass-card p-4 text-center">
              <Icon className="w-6 h-6 text-accent-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-text-primary">{stageCounts[stage] || 0}</p>
              <p className="text-sm font-medium text-text-primary mt-1">{label}</p>
              <p className="text-xs text-text-muted">{description}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Create Case Modal */}
      <CreateCaseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateCase}
      />

      {/* View Case Modal */}
      <Modal isOpen={!!viewCase} onClose={() => setViewCase(null)} title="Case Details" size="lg">
        {viewCase && <CaseDetails caseData={viewCase} />}
      </Modal>
    </div>
  );
}


/* ─── Create Case Modal ─── */

interface CreateCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: Omit<Case, 'id' | 'status' | 'stage' | 'createdAt'>) => void;
}

function CreateCaseModal({ isOpen, onClose, onCreate }: CreateCaseModalProps) {
  const [form, setForm] = useState({
    caseNumber: '',
    clientName: '',
    practiceArea: 'Civil' as PracticeArea,
    court: 'District Court' as CourtLevel,
    courtName: '',
    description: '',
    nextHearing: '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onCreate({
      caseNumber: form.caseNumber,
      clientId: `client-${Date.now()}`,
      clientName: form.clientName,
      practiceArea: form.practiceArea,
      court: form.court,
      courtName: form.courtName,
      description: form.description,
      nextHearing: form.nextHearing || undefined,
    });
    setForm({ caseNumber: '', clientName: '', practiceArea: 'Civil', court: 'District Court', courtName: '', description: '', nextHearing: '' });
  }

  const inputClass = 'w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border text-text-primary text-sm focus:outline-none focus:border-accent-primary';
  const labelClass = 'block text-sm font-medium text-text-secondary mb-1';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Case" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Case Number</label>
            <input
              className={inputClass}
              placeholder="XX/NNNN/YYYY"
              value={form.caseNumber}
              onChange={(e) => setForm({ ...form, caseNumber: e.target.value })}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Client Name</label>
            <input
              className={inputClass}
              placeholder="Enter client name"
              value={form.clientName}
              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Practice Area</label>
            <select
              className={inputClass}
              value={form.practiceArea}
              onChange={(e) => setForm({ ...form, practiceArea: e.target.value as PracticeArea })}
            >
              {PRACTICE_AREAS.map((pa) => <option key={pa} value={pa}>{pa}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Court</label>
            <select
              className={inputClass}
              value={form.court}
              onChange={(e) => setForm({ ...form, court: e.target.value as CourtLevel })}
            >
              {COURT_LEVELS.map((cl) => <option key={cl} value={cl}>{cl}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Court Name</label>
            <input
              className={inputClass}
              placeholder="e.g. Delhi High Court"
              value={form.courtName}
              onChange={(e) => setForm({ ...form, courtName: e.target.value })}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Next Hearing Date</label>
            <input
              type="date"
              className={inputClass}
              value={form.nextHearing}
              onChange={(e) => setForm({ ...form, nextHearing: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <input
            className={inputClass}
            placeholder="Brief case description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-text-secondary hover:bg-bg-elevated transition-colors">
            Cancel
          </button>
          <button type="submit" className="gradient-btn px-4 py-2 text-sm font-medium">
            Create Case
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ─── View Case Details ─── */

function CaseDetails({ caseData }: { caseData: Case }) {
  const fields: { label: string; value: string }[] = [
    { label: 'Case Number', value: caseData.caseNumber },
    { label: 'Client Name', value: caseData.clientName },
    { label: 'Practice Area', value: caseData.practiceArea },
    { label: 'Court Level', value: caseData.court },
    { label: 'Court Name', value: caseData.courtName },
    { label: 'Status', value: caseData.status },
    { label: 'Stage', value: caseData.stage },
    { label: 'Description', value: caseData.description || '—' },
    { label: 'Next Hearing', value: caseData.nextHearing ? new Date(caseData.nextHearing).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
    { label: 'Created', value: new Date(caseData.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {fields.map(({ label, value }) => (
        <div key={label}>
          <p className="text-xs text-text-muted mb-0.5">{label}</p>
          <p className="text-sm text-text-primary font-medium">{value}</p>
        </div>
      ))}
    </div>
  );
}
