import { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, Table as DocxTable, TableRow, TableCell, TextRun, WidthType, HeadingLevel, BorderStyle, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

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

  // Flatten data: convert any nested objects/arrays to strings for Excel compatibility
  const flatData = data.map((row) => {
    const flat: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row)) {
      if (value !== null && typeof value === 'object') {
        flat[key] = JSON.stringify(value);
      } else {
        flat[key] = value;
      }
    }
    return flat;
  });

  const ws = XLSX.utils.json_to_sheet(flatData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  // Wrap in Uint8Array to ensure proper binary blob creation
  const blob = new Blob([new Uint8Array(wbout)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
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

  // Use blob output + triggerDownload for reliable cross-browser PDF download
  const pdfBlob = doc.output('blob');
  triggerDownload(pdfBlob, `${filename}.pdf`);
}

function downloadAsDOCX(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);

  // Build header row
  const headerRow = new TableRow({
    children: headers.map((h) => new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: 'FFFFFF', size: 18 })] })],
      shading: { fill: '6366F1' },
    })),
  });

  // Build data rows
  const dataRows = data.map((row) => new TableRow({
    children: headers.map((h) => new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: String(row[h] ?? ''), size: 18 })] })],
    })),
  }));

  const table = new DocxTable({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
      left: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
      right: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' },
    },
  });

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: filename.replace(/-/g, ' ').toUpperCase(), color: '6366F1' })],
        }),
        new Paragraph({
          alignment: AlignmentType.LEFT,
          children: [new TextRun({ text: `Generated: ${new Date().toLocaleDateString()} | Total Records: ${data.length}`, color: '666666', size: 18 })],
        }),
        new Paragraph({ children: [] }), // spacer
        table,
      ],
    }],
  });

  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, `${filename}.docx`);
  });
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
