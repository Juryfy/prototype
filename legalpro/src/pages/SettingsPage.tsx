import { useState, useEffect } from 'react';
import { Settings, CheckCircle2, Shield, User } from 'lucide-react';
import { PageHeader, GlassCard, Modal } from '@/components/ui';
import { defaultUser } from '@/data/mockData';

interface NotifPrefs {
  email: boolean;
  sms: boolean;
  causeList: boolean;
  whatsapp: boolean;
}

const NOTIF_KEY = 'juryfy_notification_prefs';
const USER_KEY = 'juryfy_user';

function loadNotifPrefs(): NotifPrefs {
  try {
    const stored = localStorage.getItem(NOTIF_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return { email: true, sms: false, causeList: true, whatsapp: false };
}

export function SettingsPage() {
  const [profile, setProfile] = useState(defaultUser);
  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>(loadNotifPrefs);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [editForm, setEditForm] = useState({ ...defaultUser });
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      if (stored) {
        const u = JSON.parse(stored);
        setProfile(u);
        setEditForm(u);
      }
    } catch { /* ignore */ }
  }, []);

  function toggleNotif(key: keyof NotifPrefs) {
    const next = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(next);
    localStorage.setItem(NOTIF_KEY, JSON.stringify(next));
  }

  function saveProfile() {
    setProfile(editForm);
    localStorage.setItem(USER_KEY, JSON.stringify(editForm));
    setShowEditProfile(false);
  }

  function handleChangePassword() {
    if (!pwForm.current || !pwForm.newPw || pwForm.newPw !== pwForm.confirm) return;
    setPwForm({ current: '', newPw: '', confirm: '' });
    setShowChangePassword(false);
  }

  const notifItems: { key: keyof NotifPrefs; label: string }[] = [
    { key: 'email', label: 'Email Notifications' },
    { key: 'sms', label: 'SMS Alerts' },
    { key: 'causeList', label: 'Daily Cause List' },
    { key: 'whatsapp', label: 'WhatsApp Integration' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" icon={Settings} />

      {/* Profile Information */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <User className="w-5 h-5 text-accent-primary" /> Profile Information
          </h3>
          <button onClick={() => { setEditForm({ ...profile }); setShowEditProfile(true); }} className="gradient-btn px-4 py-1.5 text-sm font-medium">
            Edit Profile
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Name', value: profile.name },
            { label: 'Bar Council No', value: profile.barCouncilNo },
            { label: 'Email', value: profile.email },
            { label: 'Phone', value: profile.phone },
            { label: 'Office Address', value: profile.officeAddress },
          ].map((f) => (
            <div key={f.label}>
              <p className="text-xs text-text-muted">{f.label}</p>
              <p className="text-sm text-text-primary mt-0.5">{f.value || '—'}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Notification Preferences */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Notification Preferences</h3>
        <div className="space-y-3">
          {notifItems.map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-2">
                {notifPrefs[item.key] && <CheckCircle2 className="w-4 h-4 text-success" />}
                <span className="text-text-primary text-sm">{item.label}</span>
              </div>
              <button
                onClick={() => toggleNotif(item.key)}
                className={`relative w-11 h-6 rounded-full transition-colors ${notifPrefs[item.key] ? 'bg-success' : 'bg-bg-elevated'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${notifPrefs[item.key] ? 'left-5.5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Security */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-accent-primary" /> Security
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-primary">Two-Factor Authentication</p>
              <p className="text-xs text-text-muted">Extra layer of security for your account</p>
            </div>
            <span className="badge badge-success">Enabled</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-primary">Last Backup</p>
              <p className="text-xs text-text-muted">Today, 12:00 PM</p>
            </div>
          </div>
          <button onClick={() => setShowChangePassword(true)} className="gradient-btn px-4 py-1.5 text-sm font-medium">
            Change Password
          </button>
        </div>
      </GlassCard>

      {/* Edit Profile Modal */}
      <Modal isOpen={showEditProfile} onClose={() => setShowEditProfile(false)} title="Edit Profile" size="lg">
        <div className="space-y-4">
          {[
            { label: 'Name', key: 'name' as const },
            { label: 'Bar Council No', key: 'barCouncilNo' as const },
            { label: 'Email', key: 'email' as const },
            { label: 'Phone', key: 'phone' as const },
            { label: 'Office Address', key: 'officeAddress' as const },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-sm text-text-secondary mb-1">{f.label}</label>
              <input
                value={editForm[f.key] || ''}
                onChange={(e) => setEditForm({ ...editForm, [f.key]: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border text-text-primary text-sm focus:outline-none focus:border-accent-primary"
              />
            </div>
          ))}
          <button onClick={saveProfile} className="gradient-btn w-full py-2 text-sm font-medium mt-2">Save Changes</button>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} title="Change Password" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Current Password</label>
            <input type="password" value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border text-text-primary text-sm focus:outline-none focus:border-accent-primary" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">New Password</label>
            <input type="password" value={pwForm.newPw} onChange={(e) => setPwForm({ ...pwForm, newPw: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border text-text-primary text-sm focus:outline-none focus:border-accent-primary" />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Confirm New Password</label>
            <input type="password" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border text-text-primary text-sm focus:outline-none focus:border-accent-primary" />
          </div>
          <button onClick={handleChangePassword} className="gradient-btn w-full py-2 text-sm font-medium mt-2">Update Password</button>
        </div>
      </Modal>
    </div>
  );
}