import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { MapPin, Briefcase, Building2, Clock, Users, Sun, Moon, Sparkles } from 'lucide-react';
import { GlassCard, FilterBar, DataTable, Modal } from '@/components/ui';
import { useTheme, type Theme } from '@/contexts/ThemeContext';
import type { Lawyer } from '@/types';
import lawyersData from '@/data/lawyers.json';

// Extract unique filter options from data
function getUnique(data: Lawyer[], key: keyof Lawyer, splitComma = false): string[] {
  const set = new Set<string>();
  for (const l of data) {
    const val = l[key];
    if (!val) continue;
    if (splitComma) {
      val.split(',').forEach((v) => {
        const trimmed = v.trim();
        if (trimmed) set.add(trimmed);
      });
    } else {
      set.add(val.trim());
    }
  }
  return Array.from(set).sort();
}

function parseExperience(exp: string): number {
  const match = exp.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function matchesExperienceRange(exp: string, range: string): boolean {
  const years = parseExperience(exp);
  switch (range) {
    case '0-5 years': return years >= 0 && years <= 5;
    case '5-10 years': return years > 5 && years <= 10;
    case '10-20 years': return years > 10 && years <= 20;
    case '20+ years': return years > 20;
    default: return true;
  }
}

export function HomePage() {
  const [lawyers] = useState<Lawyer[]>(lawyersData as Lawyer[]);
  const [filters, setFilters] = useState<Record<string, string>>({
    location: 'All',
    practiceArea: 'All',
    court: 'All',
    experience: 'All',
    lawyerType: 'All',
  });
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
  const { theme, setTheme } = useTheme();

  const experienceRanges = ['0-5 years', '5-10 years', '10-20 years', '20+ years'];

  const filterDefs = useMemo(() => [
    { key: 'location', label: 'Location', options: getUnique(lawyers, 'primaryLocation') },
    { key: 'practiceArea', label: 'Practice Area', options: getUnique(lawyers, 'practiceAreas', true) },
    { key: 'court', label: 'Court Level', options: getUnique(lawyers, 'court', true) },
    { key: 'experience', label: 'Experience', options: experienceRanges },
    { key: 'lawyerType', label: 'Lawyer Type', options: getUnique(lawyers, 'lawyerType') },
  ], [lawyers]);

  const themeIcons: Record<Theme, typeof Sun> = { light: Sun, dark: Moon, gold: Sparkles };
  const themeOrder: Theme[] = ['light', 'dark', 'gold'];

  function cycleTheme() {
    const idx = themeOrder.indexOf(theme);
    setTheme(themeOrder[(idx + 1) % themeOrder.length]);
  }

  const ThemeIcon = themeIcons[theme];

  // Gold theme button classes
  const btnClass = theme === 'gold'
    ? 'gradient-btn px-3 py-1.5 text-xs font-medium'
    : 'px-3 py-1.5 rounded-lg bg-accent-primary/20 text-accent-primary hover:bg-accent-primary hover:text-white text-xs font-medium transition-colors';

  const loginBtnClass = theme === 'gold'
    ? 'gradient-btn px-5 py-2 text-sm font-medium'
    : 'px-5 py-2 rounded-lg bg-accent-primary/20 text-accent-primary hover:bg-accent-primary hover:text-white text-sm font-medium transition-colors';

  const filteredLawyers = useMemo(() => {
    return lawyers.filter((l) => {
      if (filters.location !== 'All' && l.primaryLocation !== filters.location) return false;
      if (filters.practiceArea !== 'All' && !l.practiceAreas.includes(filters.practiceArea)) return false;
      if (filters.court !== 'All' && !l.court.includes(filters.court)) return false;
      if (filters.experience !== 'All' && !matchesExperienceRange(l.experience, filters.experience)) return false;
      if (filters.lawyerType !== 'All' && l.lawyerType !== filters.lawyerType) return false;
      return true;
    });
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const columns = [
    { key: 'name', label: 'Advocate Name', sortable: true },
    { key: 'barCouncilNo', label: 'Bar Council No' },
    { key: 'experience', label: 'Experience', sortable: true },
    { key: 'primaryLocation', label: 'Location', sortable: true },
    {
      key: 'practiceAreas',
      label: 'Primary Practice Area',
      render: (row: Record<string, unknown>) => {
        const areas = String(row.practiceAreas ?? '');
        return areas.split(',')[0]?.trim() || areas;
      },
    },
    { key: 'court', label: 'Court' },
    {
      key: 'action',
      label: 'Action',
      render: (row: Record<string, unknown>) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedLawyer(row as unknown as Lawyer);
          }}
          className={btnClass}
        >
          View
        </button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      {/* Header — single row: logo+name | title+subtitle | login */}
      <header className="flex items-center justify-between px-4 py-3 md:px-8 gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <img src="/logo.png" alt="Juryfy" className="w-14 h-14 md:w-[72px] md:h-[72px] brightness-150 contrast-125 drop-shadow-[0_0_6px_rgba(99,102,241,0.4)]" />
          <span className="text-2xl md:text-3xl font-bold gradient-text">Juryfy</span>
        </div>
        <div className="flex-1 text-center hidden sm:block">
          <h1 className="text-xl md:text-3xl font-bold gradient-text">Find Trusted Lawyers Near You</h1>
          <p className="text-text-secondary text-sm md:text-base">
            From criminal to corporate, quickly find nearby India lawyers who fit needs, and start private chat to explain case.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={cycleTheme}
            className={`p-2 rounded-lg transition-all ${theme === 'gold' ? 'gradient-btn' : 'bg-accent-primary/20 text-accent-primary hover:bg-accent-primary hover:text-white'}`}
            title={`Theme: ${theme} (click to switch)`}
            aria-label="Switch theme"
          >
            <ThemeIcon className="w-5 h-5" />
          </button>
          <Link
            to="/app/login"
            className={loginBtnClass}
          >
            Log In
          </Link>
        </div>
      </header>
      {/* Mobile title */}
      <div className="sm:hidden text-center px-4 pb-2">
        <h1 className="text-lg font-bold gradient-text">Find Trusted Lawyers Near You</h1>
        <p className="text-text-secondary text-xs">
          From criminal to corporate, quickly find nearby India lawyers who fit needs, and start private chat to explain case.
        </p>
      </div>

      {/* Filter + Table */}
      <section className="px-4 md:px-8 pb-6">
        <GlassCard className="overflow-hidden">
          <div className="p-3 md:p-4 border-b border-border">
            <FilterBar filters={filterDefs} values={filters} onChange={handleFilterChange} />
            <p className="text-xs text-text-muted mt-2">
              {lawyers.length === 0 ? 'No lawyers found.' : `Showing ${filteredLawyers.length} of ${lawyers.length} lawyers`}
            </p>
          </div>
          <DataTable
            columns={columns}
            data={filteredLawyers as unknown as Record<string, unknown>[]}
            pageSize={20}
          />
        </GlassCard>
      </section>

      {/* Lawyer Profile Modal */}
      <Modal
        isOpen={!!selectedLawyer}
        onClose={() => setSelectedLawyer(null)}
        title={selectedLawyer?.name ?? 'Lawyer Profile'}
        size="xl"
      >
        {selectedLawyer && <LawyerProfile lawyer={selectedLawyer} />}
      </Modal>
    </div>
  );
}

function LawyerProfile({ lawyer }: { lawyer: Lawyer }) {
  return (
    <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
      {/* Basic Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoItem icon={<Users className="w-4 h-4" />} label="Name" value={lawyer.name} />
        <InfoItem icon={<Briefcase className="w-4 h-4" />} label="Bar Council No" value={lawyer.barCouncilNo} />
        <InfoItem icon={<Clock className="w-4 h-4" />} label="Experience" value={lawyer.experience} />
        <InfoItem icon={<MapPin className="w-4 h-4" />} label="Location" value={lawyer.primaryLocation} />
      </div>

      {/* Practice Areas */}
      <div>
        <h4 className="text-xs text-text-muted mb-2 uppercase tracking-wide">Practice Areas</h4>
        <div className="flex flex-wrap gap-2">
          {lawyer.practiceAreas.split(',').map((area) => (
            <span key={area.trim()} className="px-2.5 py-1 rounded-full bg-accent-primary/15 text-accent-primary text-xs font-medium">
              {area.trim()}
            </span>
          ))}
        </div>
      </div>

      {/* Courts */}
      <div>
        <h4 className="text-xs text-text-muted mb-2 uppercase tracking-wide">Courts</h4>
        <div className="flex flex-wrap gap-2">
          {lawyer.court.split(',').map((c) => (
            <span key={c.trim()} className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-medium">
              {c.trim()}
            </span>
          ))}
        </div>
      </div>

      {/* Organisation & Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoItem icon={<Building2 className="w-4 h-4" />} label="Type of Organisation" value={lawyer.orgType} />
        <InfoItem icon={<Briefcase className="w-4 h-4" />} label="Type of Lawyer" value={lawyer.lawyerType} />
      </div>

      {/* Contact */}
      <div>
        <h4 className="text-xs text-text-muted mb-2 uppercase tracking-wide">Contact</h4>
        <div className="space-y-1 text-sm">
          {lawyer.phone && <p><span className="text-text-muted">Phone:</span> <span className="text-text-primary">{lawyer.phone}</span></p>}
          {lawyer.email && <p><span className="text-text-muted">Email:</span> <span className="text-text-primary">{lawyer.email}</span></p>}
        </div>
      </div>

      {/* Address */}
      {lawyer.address && (
        <div>
          <h4 className="text-xs text-text-muted mb-2 uppercase tracking-wide">Address</h4>
          <p className="text-sm text-text-primary">{lawyer.address}</p>
          {lawyer.mapLink && (
            <a
              href={lawyer.mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-1 text-xs text-accent-primary hover:underline"
            >
              <MapPin className="w-3 h-3" /> View on Google Maps
            </a>
          )}
        </div>
      )}

      {/* About */}
      {lawyer.about && (
        <div>
          <h4 className="text-xs text-text-muted mb-2 uppercase tracking-wide">About</h4>
          <p className="text-sm text-text-secondary whitespace-pre-line">{lawyer.about}</p>
        </div>
      )}
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-text-muted mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-sm text-text-primary">{value}</p>
      </div>
    </div>
  );
}
