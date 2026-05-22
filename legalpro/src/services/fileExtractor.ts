/**
 * File Text Extraction Service
 * Extracts text from PDF, DOCX, PPTX, XLSX, CSV, and TXT files in the browser
 */

import * as pdfjsLib from 'pdfjs-dist';
import * as XLSX from 'xlsx';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Set PDF.js worker using Vite's ?url import
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Extract text from a PDF file
 */
async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const textParts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    textParts.push(pageText);
  }

  return textParts.join('\n\n');
}

/**
 * Extract text from a DOCX file
 */
async function extractDocxText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const { extractRawText } = await import('./docxParser');
  return extractRawText(arrayBuffer);
}

/**
 * Extract text from a PPTX file
 * PPTX is a ZIP containing XML slide files (ppt/slides/slide1.xml, etc.)
 */
async function extractPptxText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const { extractPptxText: parsePptx } = await import('./pptxParser');
  return parsePptx(arrayBuffer);
}

/**
 * Extract text from an Excel file (XLSX/XLS) or CSV
 */
async function extractSpreadsheetText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const textParts: string[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    // Convert sheet to CSV-like text
    const csv = XLSX.utils.sheet_to_csv(sheet, { blankrows: false });
    if (csv.trim()) {
      textParts.push(`--- Sheet: ${sheetName} ---\n${csv}`);
    }
  }

  return textParts.join('\n\n');
}

/**
 * Extract text from a CSV file
 */
async function extractCsvText(file: File): Promise<string> {
  const text = await file.text();
  // Parse CSV using xlsx for consistent handling
  const workbook = XLSX.read(text, { type: 'string' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_csv(sheet, { blankrows: false });
}

/**
 * Extract text from a plain text file
 */
async function extractTxtText(file: File): Promise<string> {
  return file.text();
}

/**
 * Main extraction function - detects file type and extracts text
 */
export async function extractTextFromFile(file: File): Promise<{ text: string; pages: number; wordCount: number }> {
  const fileName = file.name.toLowerCase();
  let text = '';

  if (fileName.endsWith('.pdf')) {
    text = await extractPdfText(file);
  } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    text = await extractDocxText(file);
  } else if (fileName.endsWith('.pptx') || fileName.endsWith('.ppt')) {
    text = await extractPptxText(file);
  } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    text = await extractSpreadsheetText(file);
  } else if (fileName.endsWith('.csv')) {
    text = await extractCsvText(file);
  } else if (fileName.endsWith('.txt') || fileName.endsWith('.rtf')) {
    text = await extractTxtText(file);
  } else {
    throw new Error(`Unsupported file type: ${fileName.split('.').pop()}`);
  }

  // Clean up extracted text
  text = text.replace(/\s+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

  const wordCount = text.split(/\s+/).length;
  // Estimate pages (250 words per page average)
  const pages = Math.ceil(wordCount / 250);

  return { text, pages, wordCount };
}

/**
 * Supported file types
 */
export const SUPPORTED_FILE_TYPES = '.pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.csv,.txt';
export const SUPPORTED_FILE_TYPES_LABEL = 'PDF, Word, PowerPoint, Excel, CSV, TXT';
