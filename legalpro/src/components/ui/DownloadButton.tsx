import { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown } from 'lucide-react';

type DownloadFormat = 'xlsx' | 'csv' | 'pdf' | 'docx';

interface DownloadButtonProps {
  data: Record<string, unknown>[];
  filename: string;
  label?: string;
}

function downloadAsCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((h) => {
        const val = row[h];
        const str = val == null ? '' : String(val);
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      }).join(',')
    ),
  ];
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `${filename}.csv`);
}

function downloadAsXLSX(data: Record<string, unknown>[], filename: string) {
  // For prototype: generate a TSV file with .xlsx extension (opens in Excel)
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const tsvRows = [
    headers.join('\t'),
    ...data.map((row) => headers.map((h) => String(row[h] ?? '')).join('\t')),
  ];
  const blob = new Blob([tsvRows.join('\n')], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  triggerDownload(blob, `${filename}.xlsx`);
}

function downloadAsPDF(data: Record<string, unknown>[], filename: string) {
  // For prototype: generate a formatted text file with .pdf extension
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const lines = [
    filename.toUpperCase().replace(/-/g, ' '),
    '='.repeat(50),
    '',
    ...data.map((row, i) =>
      `Record ${i + 1}:\n` + headers.map((h) => `  ${h}: ${row[h] ?? ''}`).join('\n')
    ),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'application/pdf' });
  triggerDownload(blob, `${filename}.pdf`);
}

function downloadAsDOCX(data: Record<string, unknown>[], filename: string) {
  // For prototype: generate a formatted text file with .docx extension
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const lines = [
    filename.toUpperCase().replace(/-/g, ' '),
    '='.repeat(50),
    `Generated: ${new Date().toLocaleDateString()}`,
    `Total Records: ${data.length}`,
    '',
    headers.join(' | '),
    '-'.repeat(headers.join(' | ').length),
    ...data.map((row) => headers.map((h) => String(row[h] ?? '')).join(' | ')),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  triggerDownload(blob, `${filename}.docx`);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const FORMAT_OPTIONS: { value: DownloadFormat; label: string }[] = [
  { value: 'xlsx', label: 'Excel (.xlsx)' },
  { value: 'csv', label: 'CSV (.csv)' },
  { value: 'pdf', label: 'PDF (.pdf)' },
  { value: 'docx', label: 'Word (.docx)' },
];

export function DownloadButton({ data, filename, label = 'Download' }: DownloadButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleDownload(format: DownloadFormat) {
    switch (format) {
      case 'csv': downloadAsCSV(data, filename); break;
      case 'xlsx': downloadAsXLSX(data, filename); break;
      case 'pdf': downloadAsPDF(data, filename); break;
      case 'docx': downloadAsDOCX(data, filename); break;
    }
    setIsOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-border text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        {label}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 right-0 z-50 glass-card p-1 min-w-[160px]">
          {FORMAT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleDownload(opt.value)}
              className="w-full text-left px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-bg-elevated rounded-lg transition-colors"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
