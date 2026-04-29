// ─── User / Auth ───

export interface User {
  id: string;
  name: string;
  email: string;
  designation?: string;
  barCouncilNo?: string;
  phone?: string;
  officeAddress?: string;
  avatar?: string;
}

// ─── Case ───

export type PracticeArea = 'Civil' | 'Criminal' | 'Family' | 'Corporate' | 'IPR' | 'Tax';
export type CourtLevel = 'District Court' | 'High Court' | 'Tribunal' | 'Supreme Court';
export type CaseStatus = 'Active' | 'Won' | 'Lost' | 'Settled' | 'Closed';
export type CaseStage = 'Admission' | 'Evidence' | 'Arguments' | 'Judgment Awaited' | 'Adjourned' | 'Filing';

export interface Case {
  id: string;
  caseNumber: string;
  clientId: string;
  clientName: string;
  practiceArea: PracticeArea;
  court: CourtLevel;
  courtName: string;
  status: CaseStatus;
  stage: CaseStage;
  description?: string;
  nextHearing?: string;
  createdAt: string;
}

// ─── Client ───

export type PaymentStatus = 'paid' | 'pending' | 'overdue';

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  activeCases: number;
  practiceArea: PracticeArea;
  paymentAmount: number;
  paymentStatus: PaymentStatus;
  npsScore?: number;
}

// ─── Hearing ───

export interface Hearing {
  id: string;
  caseId: string;
  caseNumber: string;
  caseTitle: string;
  date: string;
  time: string;
  courtName: string;
  benchInfo?: string;
  status: 'Scheduled' | 'Completed';
}

// ─── Deadline ───

export interface Deadline {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  caseId?: string;
  isUrgent: boolean;
}

// ─── Invoice ───

export type InvoiceStatus = 'Pending' | 'Paid' | 'Overdue';

export interface Invoice {
  id: string;
  invoiceNo: string;
  clientId: string;
  clientName: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
}

// ─── Expense ───

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
}

// ─── Task ───

export type TaskPriority = 'Urgent' | 'Today' | 'Tomorrow' | 'Upcoming';
export type TaskStatus = 'Pending' | 'Completed';

export interface Task {
  id: string;
  title: string;
  clientName: string;
  caseId?: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
}

// ─── Compliance ───

export interface ComplianceItem {
  id: string;
  title: string;
  details: string;
  status: 'Active' | 'Done' | 'Upcoming' | 'Pending';
}

// ─── FIR Record ───

export interface FIRRecord {
  id: string;
  dateTime: string;
  caseNumber: string;
  policeStation: string;
  areaName: string;
  city: string;
  status: 'Registered' | 'Pending' | 'Closed';
}

// ─── Notification ───

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'hearing' | 'task' | 'invoice' | 'deadline';
  isRead: boolean;
  createdAt: string;
}

// ─── Communication ───

export interface Communication {
  id: string;
  clientId: string;
  clientName: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

// ─── Lawyer (public directory) ───

export interface Lawyer {
  name: string;
  barCouncilNo: string;
  experience: string;
  primaryLocation: string;
  offices: string;
  orgType: string;
  practiceAreas: string;
  court: string;
  lawyerType: string;
  affiliations: string;
  phone: string;
  email: string;
  address: string;
  mapLink: string;
  about: string;
}
