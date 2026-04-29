import type {
  Case, Client, Hearing, Deadline, Invoice, Expense,
  Task, ComplianceItem, FIRRecord, Notification, Communication, User,
} from '@/types';

// ─── Cases (Req 2 AC8) ───

export const mockCases: Case[] = [
  {
    id: 'case-1',
    caseNumber: 'CC/2345/2025',
    clientId: 'client-1',
    clientName: 'Rajesh Kumar',
    practiceArea: 'Civil',
    court: 'High Court',
    courtName: 'Delhi High Court',
    status: 'Active',
    stage: 'Evidence',
    description: 'Property Dispute',
    nextHearing: '2026-02-12',
    createdAt: '2025-06-15',
  },
  {
    id: 'case-2',
    caseNumber: 'CR/789/2025',
    clientId: 'client-2',
    clientName: 'Amit Singh',
    practiceArea: 'Criminal',
    court: 'District Court',
    courtName: 'District Court',
    status: 'Active',
    stage: 'Arguments',
    description: 'Bail Application',
    nextHearing: '2026-02-12',
    createdAt: '2025-07-20',
  },
  {
    id: 'case-3',
    caseNumber: 'FC/1892/2025',
    clientId: 'client-3',
    clientName: 'Priya Sharma',
    practiceArea: 'Family',
    court: 'District Court',
    courtName: 'Tis Hazari Court',
    status: 'Active',
    stage: 'Admission',
    description: 'Divorce Proceedings',
    nextHearing: '2026-02-12',
    createdAt: '2025-08-10',
  },
  {
    id: 'case-4',
    caseNumber: 'CP/4567/2025',
    clientId: 'client-4',
    clientName: 'TechCorp Ltd',
    practiceArea: 'Corporate',
    court: 'Tribunal',
    courtName: 'NCLT Delhi',
    status: 'Active',
    stage: 'Arguments',
    description: 'Corporate Litigation',
    nextHearing: '2026-02-14',
    createdAt: '2025-05-01',
  },
  {
    id: 'case-5',
    caseNumber: 'CC/1234/2025',
    clientId: 'client-5',
    clientName: 'Sunita Verma',
    practiceArea: 'Civil',
    court: 'High Court',
    courtName: 'Delhi High Court',
    status: 'Active',
    stage: 'Evidence',
    description: 'Contract Dispute',
    nextHearing: '2026-02-15',
    createdAt: '2025-04-12',
  },
  {
    id: 'case-6',
    caseNumber: 'IP/901/2025',
    clientId: 'client-7',
    clientName: 'InnoTech Pvt Ltd',
    practiceArea: 'IPR',
    court: 'High Court',
    courtName: 'Delhi High Court',
    status: 'Active',
    stage: 'Admission',
    description: 'Patent Infringement',
    nextHearing: '2026-02-18',
    createdAt: '2025-09-05',
  },
  {
    id: 'case-7',
    caseNumber: 'CC/890/2025',
    clientId: 'client-6',
    clientName: 'Vikram Malhotra',
    practiceArea: 'Civil',
    court: 'Supreme Court',
    courtName: 'Supreme Court',
    status: 'Won',
    stage: 'Judgment Awaited',
    description: 'Land Acquisition',
    createdAt: '2024-11-20',
  },
  {
    id: 'case-8',
    caseNumber: 'CR/456/2025',
    clientId: 'client-8',
    clientName: 'Rohit Kapoor',
    practiceArea: 'Criminal',
    court: 'District Court',
    courtName: 'District Court',
    status: 'Settled',
    stage: 'Arguments',
    description: 'Criminal Defense',
    createdAt: '2024-12-01',
  },
];

// ─── Clients (Req 3 AC7) ───

export const mockClients: Client[] = [
  { id: 'client-1', name: 'Rajesh Kumar', email: 'rajesh@email.com', phone: '+91 98765 43210', activeCases: 2, practiceArea: 'Civil', paymentAmount: 85000, paymentStatus: 'paid' },
  { id: 'client-2', name: 'Amit Singh', email: 'amit@email.com', phone: '+91 98765 43211', activeCases: 1, practiceArea: 'Criminal', paymentAmount: 25000, paymentStatus: 'pending' },
  { id: 'client-3', name: 'Priya Sharma', email: 'priya@email.com', phone: '+91 98765 43212', activeCases: 1, practiceArea: 'Family', paymentAmount: 60000, paymentStatus: 'paid' },
  { id: 'client-4', name: 'TechCorp Ltd', email: 'legal@techcorp.com', phone: '+91 11 2345 6789', activeCases: 3, practiceArea: 'Corporate', paymentAmount: 120000, paymentStatus: 'pending' },
  { id: 'client-5', name: 'Sunita Verma', email: 'sunita@email.com', phone: '+91 98765 43214', activeCases: 1, practiceArea: 'Civil', paymentAmount: 45000, paymentStatus: 'paid' },
  { id: 'client-6', name: 'Vikram Malhotra', email: 'vikram@email.com', phone: '+91 98765 43215', activeCases: 0, practiceArea: 'Civil', paymentAmount: 250000, paymentStatus: 'paid' },
  { id: 'client-7', name: 'InnoTech Pvt Ltd', email: 'legal@innotech.com', phone: '+91 11 9876 5432', activeCases: 2, practiceArea: 'IPR', paymentAmount: 175000, paymentStatus: 'paid' },
  { id: 'client-8', name: 'Rohit Kapoor', email: 'rohit@email.com', phone: '+91 98765 43217', activeCases: 0, practiceArea: 'Criminal', paymentAmount: 90000, paymentStatus: 'paid' },
  { id: 'client-9', name: 'Anjali Nair', email: 'anjali@email.com', phone: '+91 98765 43218', activeCases: 2, practiceArea: 'Family', paymentAmount: 30000, paymentStatus: 'pending' },
  { id: 'client-10', name: 'Manish Gupta', email: 'manish@email.com', phone: '+91 98765 43219', activeCases: 1, practiceArea: 'Tax', paymentAmount: 110000, paymentStatus: 'paid' },
  { id: 'client-11', name: 'Pooja Joshi', email: 'pooja@email.com', phone: '+91 98765 43220', activeCases: 1, practiceArea: 'Civil', paymentAmount: 15000, paymentStatus: 'pending' },
  { id: 'client-12', name: 'Suresh Kumar', email: 'suresh@email.com', phone: '+91 98765 43221', activeCases: 2, practiceArea: 'Criminal', paymentAmount: 75000, paymentStatus: 'paid' },
];

// ─── Hearings (Req 4 AC7) ───

export const mockHearings: Hearing[] = [
  {
    id: 'hearing-1',
    caseId: 'case-1',
    caseNumber: 'CC/2345/2025',
    caseTitle: 'Property Dispute',
    date: '2026-02-12',
    time: '10:30 AM',
    courtName: 'Delhi High Court',
    benchInfo: 'Justice K.K. Sharma',
    status: 'Scheduled',
  },
  {
    id: 'hearing-2',
    caseId: 'case-2',
    caseNumber: 'CR/789/2025',
    caseTitle: 'Bail Application',
    date: '2026-02-12',
    time: '2:00 PM',
    courtName: 'District Court',
    benchInfo: 'Judge R.S. Verma',
    status: 'Scheduled',
  },
  {
    id: 'hearing-3',
    caseId: 'case-4',
    caseNumber: 'CP/4567/2025',
    caseTitle: 'Corporate Litigation',
    date: '2026-02-14',
    time: '11:00 AM',
    courtName: 'NCLT Delhi',
    benchInfo: 'Member A.K. Gupta',
    status: 'Scheduled',
  },
  {
    id: 'hearing-4',
    caseId: 'case-5',
    caseNumber: 'CC/1234/2025',
    caseTitle: 'Contract Dispute',
    date: '2026-02-15',
    time: '3:00 PM',
    courtName: 'Delhi High Court',
    benchInfo: 'Justice M.L. Singh',
    status: 'Scheduled',
  },
  {
    id: 'hearing-5',
    caseId: 'case-6',
    caseNumber: 'IP/901/2025',
    caseTitle: 'Patent Infringement',
    date: '2026-02-18',
    time: '10:00 AM',
    courtName: 'Delhi High Court',
    benchInfo: 'Justice P.N. Rao',
    status: 'Scheduled',
  },
];

// ─── Deadlines (Req 4 AC10) ───

export const mockDeadlines: Deadline[] = [
  {
    id: 'deadline-1',
    title: 'Appeal Window Closing - CC/890/2025',
    description: 'Limitation period expires: Feb 20, 2026',
    dueDate: '2026-02-20',
    caseId: 'case-7',
    isUrgent: true,
  },
  {
    id: 'deadline-2',
    title: 'Vakalatname Renewal - Supreme Court',
    description: 'Due date: Feb 28, 2026',
    dueDate: '2026-02-28',
    isUrgent: false,
  },
  {
    id: 'deadline-3',
    title: 'Written Statement Filing - CC/2345/2025',
    description: 'Last date: Feb 25, 2026',
    dueDate: '2026-02-25',
    caseId: 'case-1',
    isUrgent: false,
  },
];

// ─── Tasks (Req 1 AC7) ───

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Draft Pleading - Civil Case #2345',
    clientName: 'Rajesh Kumar',
    caseId: 'case-1',
    dueDate: '2026-02-12T17:00:00',
    priority: 'Urgent',
    status: 'Pending',
  },
  {
    id: 'task-2',
    title: 'Client Pleading - Family Case #1892',
    clientName: 'Priya Sharma',
    caseId: 'case-3',
    dueDate: '2026-02-12T14:30:00',
    priority: 'Today',
    status: 'Completed',
  },
  {
    id: 'task-3',
    title: 'Client Meeting - Corporate Litigation',
    clientName: 'TechCorp Ltd',
    caseId: 'case-4',
    dueDate: '2026-02-13T10:00:00',
    priority: 'Tomorrow',
    status: 'Pending',
  },
  {
    id: 'task-4',
    title: 'File Application - NCLT Case #567',
    clientName: 'ABC Industries',
    dueDate: '2026-02-14T12:00:00',
    priority: 'Upcoming',
    status: 'Pending',
  },
];

// ─── Invoices (sample) ───

export const mockInvoices: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNo: 'INV-2026-045',
    clientId: 'client-1',
    clientName: 'Rajesh Kumar',
    amount: 120000,
    issueDate: '2026-01-15',
    dueDate: '2026-02-15',
    status: 'Pending',
  },
  {
    id: 'inv-2',
    invoiceNo: 'INV-2026-038',
    clientId: 'client-4',
    clientName: 'TechCorp Ltd',
    amount: 25000,
    issueDate: '2026-01-10',
    dueDate: '2026-02-10',
    status: 'Overdue',
  },
];

// ─── Expenses (Req 7 AC10) ───

export const mockExpenses: Expense[] = [
  { id: 'exp-1', category: 'Court Fees', amount: 45000, date: '2026-02-01' },
  { id: 'exp-2', category: 'Stamp Duty', amount: 28000, date: '2026-02-01' },
  { id: 'exp-3', category: 'Travel & Transportation', amount: 18000, date: '2026-02-01' },
  { id: 'exp-4', category: 'Office Rent', amount: 25000, date: '2026-02-01' },
  { id: 'exp-5', category: 'Staff Salary', amount: 60000, date: '2026-02-01' },
  { id: 'exp-6', category: 'Research & Books', amount: 12000, date: '2026-02-01' },
];

// ─── Compliance Items (Req 9 AC5) ───

export const mockComplianceItems: ComplianceItem[] = [
  { id: 'comp-1', title: 'Bar Council Annual Enrollment Renewal', details: 'Completed: Sep 2025 • Next due: Sep 2026', status: 'Active' },
  { id: 'comp-2', title: 'GST Return Filing - January 2026', details: 'Completed: Feb 10, 2026', status: 'Done' },
  { id: 'comp-3', title: 'Income Tax Advance Payment - Q4', details: 'Due: Mar 15, 2026', status: 'Upcoming' },
  { id: 'comp-4', title: 'Complete CLE Requirement (2 hours pending)', details: 'Due: Mar 31, 2026', status: 'Pending' },
  { id: 'comp-5', title: 'Professional Ethics Training 2025', details: 'Completed: Nov 2025', status: 'Done' },
];

// ─── FIR Records (Req 24 AC5) ───

export const mockFIRRecords: FIRRecord[] = [
  { id: 'fir-1', dateTime: '14 Feb 2026, 10:30 AM', caseNumber: 'FIR-2026-1042', policeStation: 'Indiranagar PS', areaName: 'Bangalore North', city: 'Bengaluru', status: 'Registered' },
  { id: 'fir-2', dateTime: '14 Feb 2026, 10:30 AM', caseNumber: 'FIR-2026-1042', policeStation: 'Indiranagar PS', areaName: 'Mumbai Suburban', city: 'Mumbai', status: 'Pending' },
  { id: 'fir-3', dateTime: '14 Feb 2026, 10:30 AM', caseNumber: 'FIR-2026-1043', policeStation: 'Andheri East', areaName: 'Mumbai Suburban', city: 'New Delhi', status: 'Closed' },
  { id: 'fir-4', dateTime: '14 Feb 2026, 10:30 AM', caseNumber: 'FIR-2026-1043', policeStation: 'Connaught Place', areaName: 'Central Delhi', city: 'New Delhi', status: 'Registered' },
  { id: 'fir-5', dateTime: '14 Feb 2026, 10:30 AM', caseNumber: 'FIR-2026-1043', policeStation: 'Connaught Place', areaName: 'Central Delhi', city: 'New Delhi', status: 'Pending' },
  { id: 'fir-6', dateTime: '14 Feb 2026, 10:30 AM', caseNumber: 'FIR-2026-1043', policeStation: 'Bangalore North', areaName: 'Indian', city: 'Bengaluru', status: 'Closed' },
  { id: 'fir-7', dateTime: '14 Feb 2026, 10:30 AM', caseNumber: 'FIR-2026-1043', policeStation: 'Bangalore North', areaName: 'Indian', city: 'Bengaluru', status: 'Closed' },
];

// ─── Communications (Req 3 AC12) ───

export const mockCommunications: Communication[] = [
  { id: 'comm-1', clientId: 'client-1', clientName: 'Rajesh Kumar', message: 'Inquiry about next hearing date', timestamp: '2 hours ago', isRead: false },
  { id: 'comm-2', clientId: 'client-4', clientName: 'TechCorp Ltd', message: 'Document submission confirmation', timestamp: '5 hours ago', isRead: true },
  { id: 'comm-3', clientId: 'client-3', clientName: 'Priya Sharma', message: 'Payment confirmation received', timestamp: 'Yesterday', isRead: true },
];

// ─── Notifications (mock) ───

export const mockNotifications: Notification[] = [
  { id: 'notif-1', title: 'Hearing Reminder', message: 'CC/2345/2025 hearing at Delhi High Court tomorrow at 10:30 AM', type: 'hearing', isRead: false, createdAt: '2026-02-11T18:00:00' },
  { id: 'notif-2', title: 'Task Due', message: 'Draft Pleading for Civil Case #2345 is due today at 5:00 PM', type: 'task', isRead: false, createdAt: '2026-02-12T09:00:00' },
  { id: 'notif-3', title: 'Invoice Overdue', message: 'INV-2026-038 for TechCorp Ltd is overdue by 2 days', type: 'invoice', isRead: false, createdAt: '2026-02-12T08:00:00' },
  { id: 'notif-4', title: 'Deadline Approaching', message: 'Appeal Window for CC/890/2025 closes in 6 days', type: 'deadline', isRead: true, createdAt: '2026-02-12T07:00:00' },
];

// ─── Default User ───

export const defaultUser: User = {
  id: 'user-1',
  name: 'Adv. Arun Kumar',
  email: 'arun.kumar@legalmail.in',
  designation: 'Senior Advocate',
  barCouncilNo: 'D/2345/2010',
  phone: '+91 98765 43210',
  officeAddress: 'Chamber No. 245, Tis Hazari Courts, Delhi 110054',
};

// ─── Seed localStorage ───

const STORAGE_KEYS = {
  cases: 'juryfy_cases',
  clients: 'juryfy_clients',
  hearings: 'juryfy_hearings',
  deadlines: 'juryfy_deadlines',
  tasks: 'juryfy_tasks',
  invoices: 'juryfy_invoices',
  expenses: 'juryfy_expenses',
  compliance: 'juryfy_compliance',
  firRecords: 'juryfy_fir_records',
  communications: 'juryfy_communications',
  notifications: 'juryfy_notifications',
  user: 'juryfy_user',
} as const;

export { STORAGE_KEYS };

export function seedLocalStorage(): void {
  const seedIfEmpty = (key: string, data: unknown) => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  };

  seedIfEmpty(STORAGE_KEYS.cases, mockCases);
  seedIfEmpty(STORAGE_KEYS.clients, mockClients);
  seedIfEmpty(STORAGE_KEYS.hearings, mockHearings);
  seedIfEmpty(STORAGE_KEYS.deadlines, mockDeadlines);
  seedIfEmpty(STORAGE_KEYS.tasks, mockTasks);
  seedIfEmpty(STORAGE_KEYS.invoices, mockInvoices);
  seedIfEmpty(STORAGE_KEYS.expenses, mockExpenses);
  seedIfEmpty(STORAGE_KEYS.compliance, mockComplianceItems);
  seedIfEmpty(STORAGE_KEYS.firRecords, mockFIRRecords);
  seedIfEmpty(STORAGE_KEYS.communications, mockCommunications);
  seedIfEmpty(STORAGE_KEYS.notifications, mockNotifications);
  seedIfEmpty(STORAGE_KEYS.user, defaultUser);
}
