import { useState, useMemo } from 'react';
import { FileSearch } from 'lucide-react';
import { PageHeader, GlassCard, SearchInput, FilterBar, DataTable, StatusBadge, Modal } from '@/components/ui';
import { mockFIRRecords } from '@/data/mockData';
import type { FIRRecord } from '@/types';

/* ── Derive unique areas for filter dropdown ── */
const areaOptions = [...new Set(mockFIRRecords.map((r) => r.areaName))];

/* ── Row type compatible with DataTable ── */
type FIRRow = Record<string, unknown> & FIRRecord;

/* ── Table columns ── */
const columns = [
  { key: 'dateTime', label: 'Date & Time', sortable: true },
  { key: 'caseNumber', label: 'Case Number', sortable: true },
  { key: 'policeStation', label: 'Police Station', sortable: true },
  { key: 'areaName', label: 'Area Name', sortable: true },
  { key: 'city', label: 'City', sortable: true },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (row: FIRRow) => {
      const variantMap: Record<string, 'success' | 'warning' | 'neutral'> = {
        Registered: 'success',
        Pending: 'warning',
        Closed: 'neutral',
      };
      return <StatusBadge status={row.status} variant={variantMap[row.status] ?? 'neutral'} />;
    },
  },
  {
    key: '_action',
    label: 'Action',
    render: (_row: FIRRow) => (
      <button className="text-xs text-accent-hover hover:underline">View Details</button>
    ),
  },
];

export function FIRPage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({ area: 'All' });
  const [selectedFIR, setSelectedFIR] = useState<FIRRecord | null>(null);

  const filtered = useMemo(() => {
    let data = mockFIRRecords;
    if (filters.area && filters.area !== 'All') {
      data = data.filter((r) => r.areaName === filters.area);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (r) =>
          r.caseNumber.toLowerCase().includes(q) ||
          r.policeStation.toLowerCase().includes(q) ||
          r.areaName.toLowerCase().includes(q) ||
          r.city.toLowerCase().includes(q) ||
          r.status.toLowerCase().includes(q)
      );
    }
    return data;
  }, [search, filters]);

  return (
    <div className="space-y-6">
      <PageHeader title="FIR Intelligence Hub" icon={FileSearch} />

      <GlassCard>
        <h2 className="text-xl font-bold text-text-primary mb-1">Local Case Intelligence Hub</h2>
        <p className="text-sm text-text-secondary mb-5">
          Search and monitor FIR records across jurisdictions with real-time status tracking
        </p>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-5">
          <div className="flex-1">
            <SearchInput
              placeholder="Search by case number, station, area, city..."
              value={search}
              onChange={setSearch}
            />
          </div>
          <FilterBar
            filters={[{ key: 'area', label: 'Area', options: areaOptions }]}
            values={filters}
            onChange={(k, v) => setFilters((prev) => ({ ...prev, [k]: v }))}
          />
        </div>

        {/* Table */}
        <DataTable<FIRRow>
          columns={columns}
          data={filtered as FIRRow[]}
          pageSize={50}
          onRowClick={(row) => setSelectedFIR(row as FIRRecord)}
        />
      </GlassCard>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedFIR}
        onClose={() => setSelectedFIR(null)}
        title="FIR Details"
        size="lg"
      >
        {selectedFIR && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-text-muted text-xs">Case Number</p>
                <p className="text-text-primary font-medium">{selectedFIR.caseNumber}</p>
              </div>
              <div>
                <p className="text-text-muted text-xs">Date & Time</p>
                <p className="text-text-primary">{selectedFIR.dateTime}</p>
              </div>
              <div>
                <p className="text-text-muted text-xs">Police Station</p>
                <p className="text-text-primary">{selectedFIR.policeStation}</p>
              </div>
              <div>
                <p className="text-text-muted text-xs">Area</p>
                <p className="text-text-primary">{selectedFIR.areaName}</p>
              </div>
              <div>
                <p className="text-text-muted text-xs">City</p>
                <p className="text-text-primary">{selectedFIR.city}</p>
              </div>
              <div>
                <p className="text-text-muted text-xs">Status</p>
                <StatusBadge status={selectedFIR.status} />
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="text-text-primary font-medium mb-2">Sections Applied</h4>
              <p className="text-text-secondary text-xs">
                IPC Section 420 (Cheating), Section 406 (Criminal Breach of Trust), Section 34 (Common Intention)
              </p>
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="text-text-primary font-medium mb-2">Complainant Information</h4>
              <p className="text-text-secondary text-xs">
                Name: Ramesh Gupta &bull; Contact: +91 98765 43210 &bull; Address: 45, MG Road, {selectedFIR.city}
              </p>
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="text-text-primary font-medium mb-2">Case Description</h4>
              <p className="text-text-secondary text-xs leading-relaxed">
                The complainant alleges that the accused entered into a business agreement on 10 Jan 2026 and received an advance payment of ₹5,00,000 for supply of goods. The accused failed to deliver the goods within the stipulated time and has been avoiding communication. The complainant seeks legal action under the applicable sections of the Indian Penal Code.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
