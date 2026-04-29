import { useState } from 'react';
import { CreditCard, Plus, Clock, FileText, IndianRupee, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { PageHeader, GlassCard, KPICard, ChartCard, DataTable, Modal, StatusBadge } from '@/components/ui';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { mockInvoices, STORAGE_KEYS } from '@/data/mockData';
import type { Invoice } from '@/types';

const revenueData = [
  { month: 'Sep', revenue: 2.8 },
  { month: 'Oct', revenue: 3.2 },
  { month: 'Nov', revenue: 3.0 },
  { month: 'Dec', revenue: 3.5 },
  { month: 'Jan', revenue: 3.3 },
  { month: 'Feb', revenue: 3.8 },
];

const expenseItems = [
  { label: 'Court Fees', amount: 45000 },
  { label: 'Stamp Duty', amount: 28000 },
  { label: 'Travel & Transportation', amount: 18000 },
  { label: 'Office Rent', amount: 25000 },
  { label: 'Staff Salary', amount: 60000 },
  { label: 'Research & Books', amount: 12000 },
];

const totalExpenses = expenseItems.reduce((s, e) => s + e.amount, 0);

export function BillingPage() {
  const [invoices, { add: addInvoice }] = useLocalStorage<Invoice>(STORAGE_KEYS.invoices, mockInvoices);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ clientName: '', amount: '', issueDate: '', dueDate: '' });

  function handleCreate() {
    if (!form.clientName || !form.amount || !form.issueDate || !form.dueDate) return;
    const inv: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNo: `INV-2026-${String(invoices.length + 46).padStart(3, '0')}`,
      clientId: `client-new-${Date.now()}`,
      clientName: form.clientName,
      amount: Number(form.amount),
      issueDate: form.issueDate,
      dueDate: form.dueDate,
      status: 'Pending',
    };
    addInvoice(inv);
    setForm({ clientName: '', amount: '', issueDate: '', dueDate: '' });
    setShowCreate(false);
  }

  function ageDays(issueDate: string) {
    const diff = Date.now() - new Date(issueDate).getTime();
    return Math.max(0, Math.floor(diff / 86400000));
  }

  const invoiceColumns = [
    { key: 'invoiceNo', label: 'Invoice #', sortable: true },
    { key: 'clientName', label: 'Client', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true, render: (r: Record<string, unknown>) => `₹${Number(r.amount).toLocaleString('en-IN')}` },
    { key: 'issueDate', label: 'Issue Date', sortable: true },
    { key: 'dueDate', label: 'Due Date', sortable: true },
    { key: 'age', label: 'Age (days)', render: (r: Record<string, unknown>) => ageDays(String(r.issueDate)) },
    { key: 'status', label: 'Status', render: (r: Record<string, unknown>) => <StatusBadge status={String(r.status)} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Billing" icon={CreditCard} />

      {/* Header card */}
      <GlassCard>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Billing &amp; Finances</h2>
            <p className="text-sm text-text-secondary mt-1">Manage invoices, track revenue, and monitor expenses</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="gradient-btn flex items-center gap-2 px-4 py-2 text-sm font-medium">
            <Plus className="w-4 h-4" /> Create Invoice
          </button>
        </div>
      </GlassCard>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Daily Billable Hours" value="6.5" subtitle="Target: 8 hours" icon={Clock} />
        <KPICard title="Monthly Billable Hours" value="142" trend="↑ +15 from January" trendUp icon={TrendingUp} />
        <KPICard title="Outstanding Invoices" value="₹2.4L" subtitle="8 pending" icon={FileText} />
        <KPICard title="Fees Collected" value="₹3.8L" trend="↑ +22%" trendUp icon={IndianRupee} />
      </div>

      {/* Revenue Chart */}
      <ChartCard title="Monthly Revenue Trend" description="Revenue over the last 6 months (in Lakhs)">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
            <YAxis stroke="#94A3B8" fontSize={12} tickFormatter={(v: number) => `₹${v}L`} />
            <Tooltip
              contentStyle={{ background: '#111827', border: '1px solid #1E293B', borderRadius: 12, color: '#F8FAFC' }}
              formatter={(value) => [`₹${value}L`, 'Revenue']}
            />
            <Bar dataKey="revenue" fill="#6366F1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Outstanding Invoices Table */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Outstanding Invoices</h3>
        <DataTable columns={invoiceColumns} data={invoices as unknown as Record<string, unknown>[]} pageSize={10} />
      </GlassCard>

      {/* Monthly Expenses */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Monthly Expenses</h3>
        <div className="space-y-3">
          {expenseItems.map((e) => (
            <div key={e.label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <span className="text-text-secondary">{e.label}</span>
              <span className="text-text-primary font-medium">₹{e.amount.toLocaleString('en-IN')}</span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-text-primary font-semibold">Total Expenses</span>
            <span className="text-danger font-bold text-lg">₹{totalExpenses.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </GlassCard>

      {/* Create Invoice Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Invoice" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Client Name</label>
            <input value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border text-text-primary text-sm focus:outline-none focus:border-accent-primary" placeholder="Enter client name" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Amount (₹)</label>
            <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border text-text-primary text-sm focus:outline-none focus:border-accent-primary" placeholder="Enter amount" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Issue Date</label>
              <input type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border text-text-primary text-sm focus:outline-none focus:border-accent-primary" />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Due Date</label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border text-text-primary text-sm focus:outline-none focus:border-accent-primary" />
            </div>
          </div>
          <button onClick={handleCreate} className="gradient-btn w-full py-2 text-sm font-medium mt-2">Create Invoice</button>
        </div>
      </Modal>
    </div>
  );
}