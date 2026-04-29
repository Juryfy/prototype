import { useState } from 'react';
import { Users, Plus, MessageSquare, Download } from 'lucide-react';
import { PageHeader, GlassCard, Modal } from '@/components/ui';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { STORAGE_KEYS, mockClients, mockCommunications } from '@/data/mockData';
import { exportToCSV } from '@/utils/export';
import type { Client, PracticeArea } from '@/types';

const AVATAR_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6', '#06B6D4'];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export function ClientsPage() {
  const [clients, { add }] = useLocalStorage<Client>(STORAGE_KEYS.clients, mockClients);
  const [showAddModal, setShowAddModal] = useState(false);

  function handleAddClient(data: { name: string; email: string; phone: string; address: string }) {
    const newClient: Client = {
      id: `client-${Date.now()}`,
      name: data.name,
      email: data.email || undefined,
      phone: data.phone || undefined,
      address: data.address || undefined,
      activeCases: 0,
      practiceArea: 'Civil' as PracticeArea,
      paymentAmount: 0,
      paymentStatus: 'pending',
    };
    add(newClient);
    setShowAddModal(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Clients" icon={Users} />

      {/* Client Directory */}
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Client Directory</h2>
            <p className="text-sm text-text-secondary">Manage your client relationships and communications</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportToCSV(clients as unknown as Record<string, unknown>[], 'clients-export')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-border text-text-secondary hover:bg-bg-elevated transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Export
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="gradient-btn flex items-center gap-2 px-4 py-2 text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> Add Client
            </button>
          </div>
        </div>

        {/* Responsive Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {clients.map((client, idx) => (
            <div key={client.id} className="glass-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ backgroundColor: getAvatarColor(idx) }}
                >
                  {getInitials(client.name)}
                </div>
                <p className="text-sm font-bold text-text-primary truncate">{client.name}</p>
              </div>
              <p className="text-xs text-text-secondary mb-2">
                {client.activeCases > 0
                  ? `${client.activeCases} Active Case${client.activeCases > 1 ? 's' : ''} • ${client.practiceArea}`
                  : `Case Closed • ${client.practiceArea}`}
              </p>
              <p className={`text-xs font-medium ${client.paymentStatus === 'paid' ? 'text-success' : 'text-warning'}`}>
                ₹{client.paymentAmount.toLocaleString('en-IN')} {client.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Recent Communications */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="w-5 h-5 text-accent-primary" />
          <h2 className="text-lg font-semibold text-text-primary">Recent Communications</h2>
        </div>
        <p className="text-sm text-text-secondary mb-4">Client message log with WhatsApp and email integration</p>

        <div className="space-y-3">
          {mockCommunications.map((comm) => {
            const clientIdx = clients.findIndex((c) => c.id === comm.clientId);
            return (
              <div key={comm.id} className="flex items-center gap-3 p-3 rounded-xl bg-bg-elevated/50">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: getAvatarColor(clientIdx >= 0 ? clientIdx : 0) }}
                >
                  {getInitials(comm.clientName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">{comm.clientName}</p>
                  <p className="text-xs text-text-secondary truncate">{comm.message}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-text-muted">{comm.timestamp}</span>
                  {!comm.isRead && (
                    <span className="badge badge-info">Unread</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Add Client Modal */}
      <AddClientModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSave={handleAddClient} />
    </div>
  );
}

/* ─── Add Client Modal ─── */

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; email: string; phone: string; address: string }) => void;
}

function AddClientModal({ isOpen, onClose, onSave }: AddClientModalProps) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
    setForm({ name: '', email: '', phone: '', address: '' });
  }

  const inputClass = 'w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border text-text-primary text-sm focus:outline-none focus:border-accent-primary';
  const labelClass = 'block text-sm font-medium text-text-secondary mb-1';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Client" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Name *</label>
          <input className={inputClass} placeholder="Client name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input className={inputClass} type="email" placeholder="client@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input className={inputClass} placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Address</label>
          <input className={inputClass} placeholder="Office address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-text-secondary hover:bg-bg-elevated transition-colors">Cancel</button>
          <button type="submit" className="gradient-btn px-4 py-2 text-sm font-medium">Save Client</button>
        </div>
      </form>
    </Modal>
  );
}
