// @ts-nocheck
import * as XLSX from 'xlsx';
import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const excelPath = resolve(__dirname, '../../prototype/Lawyers Near You Data.xlsx');
const outputPath = resolve(__dirname, '../src/data/lawyers.json');

// Ensure output directory exists
mkdirSync(dirname(outputPath), { recursive: true });

const buffer = readFileSync(excelPath);
const workbook = XLSX.read(buffer);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet);

console.log(`Read ${rows.length} rows from sheet "${sheetName}"`);
console.log('Column headers:', Object.keys(rows[0] ?? {}));

const columnMap: Record<string, string> = {
  'Advocate Name': 'name',
  'Bar Council Reg No.': 'barCouncilNo',
  'Experience': 'experience',
  'Primary Location': 'primaryLocation',
  'Offices': 'offices',
  'Type of Organisation': 'orgType',
  'Practice Areas': 'practiceAreas',
  'Court': 'court',
  'Type of Lawyer': 'lawyerType',
  'Professional Affiliations': 'affiliations',
  'Office Phone Nos': 'phone',
  'Official Email ID': 'email',
  'Address': 'address',
  'Google Map link': 'mapLink',
  'About me / Organisation': 'about',
};

const lawyers = rows.map((row) => {
  const lawyer: Record<string, string> = {};
  for (const [excelCol, jsonKey] of Object.entries(columnMap)) {
    lawyer[jsonKey] = String(row[excelCol] ?? '').trim();
  }
  return lawyer;
});

writeFileSync(outputPath, JSON.stringify(lawyers, null, 2), 'utf-8');
console.log(`\n✅ Wrote ${lawyers.length} lawyers to ${outputPath}`);
