"use client";
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getMyProfile, updateMyProfile } from '@/services/user.service';
import { getNotificationSettings, updateNotificationSettings } from '@/services/notification.service';
import { changePassword, logout, logoutAllDevices, toggle2FA } from '@/services/auth.service';
import { User, NotificationSettings } from '@/types';
import { useRouter } from 'next/navigation';

const MySettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'User' | 'Team'>('User');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  return (
    <div className="min-h-screen p-6 md:p-12 font-sans text-[#1A1C21]">
      <div className="mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Settings</h1>
          <p className="text-gray-500 text-sm">Manage your account and team settings</p>
        </header>
        <div className="flex bg-[#E9EDF5] w-fit p-1 rounded-lg mb-8">
          {(['User','Team'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === tab ? 'bg-white text-[#4F46E5] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{tab} Settings</button>
          ))}
        </div>
        {activeTab === 'User' ? <UserSettingsView /> : <TeamSettingsView onOpenInvite={() => setIsInviteModalOpen(true)} />}
      </div>
      {isInviteModalOpen && <InviteUserModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />}
    </div>
  );
};

const UserSettingsView = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<NotificationSettings | null>(null);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactInfo, setContactInfo] = useState({ email: '', phone: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [pwData, setPwData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, notifRes] = await Promise.all([getMyProfile(), getNotificationSettings()]);
        if (profileRes.success) {
          setUser(profileRes.data);
          setContactInfo({ email: profileRes.data.email, phone: profileRes.data.phoneNumber || '' });
        }
        if (notifRes.success) setNotifications(notifRes.data);
      } catch {}
    };
    fetchData();
  }, []);

  const handleSaveContact = async () => {
    setIsSaving(true); setError(''); setSuccess('');
    try {
      const res = await updateMyProfile({ data: { phoneNumber: contactInfo.phone } });
      if (res.success) { setUser(res.data); setIsEditingContact(false); setSuccess('Contact updated!'); }
    } catch (err: any) { setError(err?.response?.data?.message || 'Update failed'); }
    finally { setIsSaving(false); }
  };

  const handleToggleNotification = async (key: keyof Pick<NotificationSettings, 'fundActivity' | 'capitalCall' | 'distribution'>) => {
    if (!notifications) return;
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    try { await updateNotificationSettings({ [key]: updated[key] }); } catch {}
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (pwData.newPassword !== pwData.confirmPassword) { setError('Passwords do not match'); return; }
    setIsSaving(true);
    try {
      const res = await changePassword(pwData);
      if (res.success) { setSuccess('Password changed!'); setPwData({ oldPassword: '', newPassword: '', confirmPassword: '' }); setIsChangingPassword(false); }
    } catch (err: any) { setError(err?.response?.data?.message || 'Failed to change password'); }
    finally { setIsSaving(false); }
  };

  const handleToggle2FA = async () => {
    try {
      const res = await toggle2FA();
      if (res.success && user) setUser({ ...user, isTwoFactorEnabled: res.data.isTwoFactorEnabled });
    } catch {}
  };

  const handleLogoutAll = async () => {
    if (!confirm('Sign out of all devices?')) return;
    try { await logoutAllDevices(); router.push('/login'); } catch {}
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}
      {success && <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm">{success}</div>}

      <section className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
        <h2 className="text-lg font-bold mb-6">Profile Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ReadOnlyInput label="FIRST NAME" value={user?.firstName || '—'} />
          <ReadOnlyInput label="LAST NAME" value={user?.lastName || '—'} />
          <ReadOnlyInput label="USERNAME" value={user?.username || '—'} />
          <ReadOnlyInput label="ROLE" value={user?.role || '—'} />
          <div className="md:col-span-2"><ReadOnlyInput label="STATUS" value={user?.status || '—'} /></div>
        </div>
      </section>

      <section className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold">Contact Information</h2>
          {!isEditingContact ? (
            <button onClick={() => setIsEditingContact(true)} className="text-[#4F46E5] text-sm font-medium flex items-center gap-1 hover:underline"><span className="text-xs">✎</span> Edit</button>
          ) : (
            <div className="flex gap-4">
              <button onClick={() => setIsEditingContact(false)} className="text-gray-400 text-sm font-medium hover:text-gray-600">Cancel</button>
              <button onClick={handleSaveContact} disabled={isSaving} className="text-[#4F46E5] text-sm font-bold hover:underline disabled:opacity-50">{isSaving ? 'Saving...' : 'Save'}</button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
            <div className="p-3 bg-gray-50/50 border border-gray-200 rounded-lg text-gray-600 text-sm">{contactInfo.email}</div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</label>
            {isEditingContact ? (
              <input type="text" value={contactInfo.phone} onChange={e => setContactInfo({ ...contactInfo, phone: e.target.value })} className="w-full p-3 bg-white border border-[#4F46E5] rounded-lg text-gray-800 text-sm outline-none focus:ring-2 focus:ring-[#4F46E5]/10" />
            ) : (
              <div className="p-3 bg-gray-50/50 border border-gray-200 rounded-lg text-gray-600 text-sm">{contactInfo.phone || '—'}</div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
        <h2 className="text-lg font-bold mb-6">Security</h2>
        <div className="space-y-6">
          <div className="flex justify-between items-center py-4 border-b border-gray-50">
            <div><p className="font-semibold text-sm">Change Password</p><p className="text-xs text-gray-400 mt-1">Update your account password</p></div>
            <button onClick={() => setIsChangingPassword(!isChangingPassword)} className="text-[#2D60FF] font-bold text-sm">Change</button>
          </div>
          {isChangingPassword && (
            <form onSubmit={handleChangePassword} className="space-y-3 pb-4 border-b border-gray-50">
              {['oldPassword','newPassword','confirmPassword'].map(field => (
                <div key={field} className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{field.replace(/([A-Z])/g, ' $1')}</label>
                  <input type="password" value={(pwData as any)[field]} onChange={e => setPwData(p => ({ ...p, [field]: e.target.value }))} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#4F46E5]" />
                </div>
              ))}
              <button type="submit" disabled={isSaving} className="px-6 py-2 bg-[#2D60FF] text-white rounded-lg font-bold text-sm disabled:opacity-50">{isSaving ? 'Saving...' : 'Update Password'}</button>
            </form>
          )}
          <div className="flex justify-between items-center py-4 border-b border-gray-50">
            <div>
              <p className="font-semibold text-sm">Two-Factor Authentication</p>
              <span className={`inline-block mt-1 px-2 py-0.5 text-[9px] font-bold rounded ${user?.isTwoFactorEnabled ? 'bg-[#ECFDF3] text-[#027A48]' : 'bg-gray-100 text-gray-500'}`}>{user?.isTwoFactorEnabled ? 'ENABLED' : 'DISABLED'}</span>
            </div>
            <button onClick={handleToggle2FA} className="text-[#2D60FF] font-bold text-sm">{user?.isTwoFactorEnabled ? 'Disable' : 'Enable'}</button>
          </div>
          <div className="flex justify-between items-center pt-2">
            <div><p className="font-semibold text-sm">Active Sessions</p><p className="text-xs text-gray-400">Sign out of all devices</p></div>
            <button onClick={handleLogoutAll} className="text-[#D92D20] font-bold text-sm">Sign Out All</button>
          </div>
        </div>
      </section>

      <section className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
        <h2 className="text-lg font-bold mb-6">Notifications</h2>
        <div className="space-y-6">
          {notifications && (
            <>
              <NotificationRow title="Fund Activity Updates" desc="Receive updates on fund performance and changes" isActive={notifications.fundActivity} onToggle={() => handleToggleNotification('fundActivity')} />
              <NotificationRow title="Capital Calls / Distributions" desc="Notifications for capital calls and distributions" isActive={notifications.capitalCall} onToggle={() => handleToggleNotification('capitalCall')} />
              <NotificationRow title="Distribution" desc="Distribution notifications" isActive={notifications.distribution} onToggle={() => handleToggleNotification('distribution')} />
              <NotificationRow title="Security Alerts" desc="Critical security notifications (always enabled)" isActive={notifications.securityAlert} isLocked />
            </>
          )}
        </div>
      </section>
    </div>
  );
};

const TeamSettingsView = ({ onOpenInvite }: { onOpenInvite: () => void }) => {
  const [companyData, setCompanyData] = useState({ name: 'Acme Fund Group', type: 'Venture Capital' });
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <section className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
        <h2 className="text-lg font-bold mb-6">Company Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mb-8">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Company Name</label>
            <input type="text" value={companyData.name} onChange={e => setCompanyData({ ...companyData, name: e.target.value })} className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#4F46E5]/10 focus:border-[#4F46E5] text-sm font-medium" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Company Type</label>
            <select value={companyData.type} onChange={e => setCompanyData({ ...companyData, type: e.target.value })} className="w-full p-3 border border-gray-200 rounded-lg bg-white outline-none text-sm appearance-none font-medium">
              <option>Venture Capital</option><option>Private Equity</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end items-center gap-6 pt-2">
          <button className="text-sm font-medium text-gray-400 hover:text-gray-600">Cancel</button>
          <button className="px-6 py-2.5 bg-[#2D60FF] text-white rounded-lg font-bold text-sm shadow-sm hover:opacity-90">Save Changes</button>
        </div>
      </section>
      <section className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="p-8 flex justify-between items-center">
          <h2 className="text-lg font-bold">Users & Permissions</h2>
          <button onClick={onOpenInvite} className="bg-[#2D60FF] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:opacity-90">Invite New User</button>
        </div>
      </section>
    </div>
  );
};

const InviteUserModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [form, setForm] = useState({ email: '', role: '', type: 'Internal', permissions: 'Edit' });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.role) { alert('Please fill in all required fields'); return; }
    alert(`Invitation sent to ${form.email}`);
    setForm({ email: '', role: '', type: 'Internal', permissions: 'Edit' });
    onClose();
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-[440px] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="p-8 pb-6 flex justify-between items-start border-b border-gray-100">
          <div><h2 className="text-2xl font-bold text-[#1A1C21] leading-tight">Invite New User</h2><p className="text-sm text-gray-400 mt-2">Add a new team member to your organization</p></div>
          <button onClick={onClose} className="p-1.5 border border-gray-200 rounded-full text-gray-400 hover:bg-gray-50"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {[{ label: 'Email Address *', key: 'email', type: 'email', placeholder: 'user@example.com' }, { label: 'Role/Title *', key: 'role', type: 'text', placeholder: 'e.g. Investment Manager' }].map(f => (
            <div key={f.key} className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{f.label}</label>
              <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm outline-none focus:border-[#2D60FF] font-medium" />
            </div>
          ))}
          <div className="flex gap-3 pt-6">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg font-bold text-sm">Cancel</button>
            <button type="submit" className="flex-1 py-3 text-white bg-[#2D60FF] hover:bg-blue-700 rounded-lg font-bold text-sm shadow-lg shadow-blue-100">Send Invitation</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ReadOnlyInput = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</label>
    <div className="relative"><input disabled value={value} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 font-medium cursor-not-allowed text-sm" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 text-sm">🔒</span></div>
  </div>
);

const NotificationRow = ({ title, desc, isLocked, isActive, onToggle }: any) => (
  <div className="flex justify-between items-center py-2">
    <div className="max-w-md">
      <div className="flex items-center gap-2"><p className="font-semibold text-sm">{title}</p>{isLocked && <span className="text-gray-300 text-xs">🔒</span>}</div>
      <p className="text-xs text-gray-400 mt-1">{desc}</p>
    </div>
    <div onClick={!isLocked ? onToggle : undefined} className={`w-10 h-5 rounded-full relative transition-all ${isActive ? 'bg-[#2D60FF]' : 'bg-gray-200'} ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-all shadow-sm ${isActive ? 'right-1' : 'left-1'}`} />
    </div>
  </div>
);

export default MySettings;
