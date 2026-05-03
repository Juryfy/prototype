import { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type DownloadFormat = 'xlsx' | 'csv' | 'pdf' | 'docx';

interface DownloadButtonProps {
  data: Record<string, unknown>[];
  filename: string;
  label?: string;
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
  if (data.length === 0) return;
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  triggerDownload(blob, `${filename}.xlsx`);
}

function downloadAsPDF(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const doc = new jsPDF({ orientation: headers.length > 6 ? 'landscape' : 'portrait' });
  doc.setFontSize(14);
  doc.text(filename.replace(/-/g, ' ').toUpperCase(), 14, 15);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString()} | Records: ${data.length}`, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [headers],
    body: data.map((row) => headers.map((h) => String(row[h] ?? ''))),
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [99, 102, 241] },
  });

  doc.save(`${filename}.pdf`);
}

function downloadAsDOCX(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);

  // Generate HTML that Word can open natively
  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8"><title>${filename}</title>
    <style>
      body { font-family: Calibri, sans-serif; font-size: 11pt; }
      h1 { color: #6366F1; font-size: 16pt; }
      table { border-collapse: collapse; width: 100%; margin-top: 12pt; }
      th { background-color: #6366F1; color: white; padding: 6pt 8pt; text-align: left; font-size: 9pt; }
      td { border: 1px solid #ddd; padding: 4pt 8pt; font-size: 9pt; }
      tr:nth-child(even) { background-color: #f9f9f9; }
      .meta { color: #666; font-size: 9pt; margin-bottom: 8pt; }
    </style></head>
    <body>
      <h1>${filename.replace(/-/g, ' ').toUpperCase()}</h1>
      <p class="meta">Generated: ${new Date().toLocaleDateString()} | Total Records: ${data.length}</p>
      <table>
        <tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>
        ${data.map((row) => `<tr>${headers.map((h) => `<td>${row[h] ?? ''}</td>`).join('')}</tr>`).join('')}
      </table>
    </body></html>`;

  const blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
  triggerDownload(blob, `${filename}.doc`);
}

const FORMAT_OPTIONS: { value: DownloadFormat; label: string }[] = [
  { value: 'xlsx', label: 'Excel (.xlsx)' },
  { value: 'csv', label: 'CSV (.csv)' },
  { value: 'pdf', label: 'PDF (.pdf)' },
  { value: 'docx', label: 'Word (.doc)' },
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
        className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-accent-primary text-white hover:bg-accent-hover transition-colors shadow-md shadow-accent-primary/20"
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
