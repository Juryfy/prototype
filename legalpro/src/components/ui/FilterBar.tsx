interface FilterDef {
  key: string;
  label: string;
  options: string[];
  multi?: boolean;
}

interface FilterBarProps {
  filters: FilterDef[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export function FilterBar({ filters, values, onChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {filters.map((filter) => (
        <div key={filter.key} className="flex flex-col gap-1">
          <label className="text-xs text-text-muted">{filter.label}</label>
          <select
            value={values[filter.key] ?? 'All'}
            onChange={(e) => onChange(filter.key, e.target.value)}
            className="px-3 py-2 rounded-lg bg-bg-card border border-border text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary appearance-none cursor-pointer min-w-[140px]"
          >
            <option value="All">All</option>
            {filter.options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
