"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Plus, Edit2, Trash2, X, MoreVertical } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Bar, Line } from 'recharts';
import { getLimitedPartnerById, updateLimitedPartner } from '@/services/limitedPartner.service';
import { getContacts, createContact, updateContact, deleteContact } from '@/services/contact.service';
import { LimitedPartner, Contact } from '@/types';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import toast from 'react-hot-toast';

const CAPITAL_FLOW_DATA = [
  { name: 'Q1', calls: -2.5, returns: 1.2, fees: -0.2, flow: -1.5 },
  { name: 'Q2', calls: -1.0, returns: 2.2, fees: -0.2, flow: 1.0 },
  { name: 'Q3', calls: -3.2, returns: 1.5, fees: -0.2, flow: -2.0 },
  { name: 'Q4', calls: -2.1, returns: 3.8, fees: -0.2, flow: 1.5 },
];

const SECTOR_DATA = [
  { name: 'Technology', value: 30, color: '#6366F1' },
  { name: 'Finance', value: 25, color: '#22C55E' },
  { name: 'Healthcare', value: 25, color: '#EF4444' },
  { name: 'Energy', value: 20, color: '#F97316' },
];

export default function PartnerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [partner, setPartner] = useState<LimitedPartner | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'funds'>('overview');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', role: '', email: '', phoneNumber: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lpRes, contactRes] = await Promise.all([
          getLimitedPartnerById(id),
          getContacts({ limitedPartnerId: id }),
        ]);
        if (lpRes.success) setPartner(lpRes.data);
        if (contactRes.success) setContacts(Array.isArray(contactRes.data) ? contactRes.data : []);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const openAddContact = () => {
    setEditingContact(null);
    setContactForm({ name: '', role: '', email: '', phoneNumber: '' });
    setIsContactModalOpen(true);
  };

  const openEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setContactForm({ name: contact.name, role: contact.role, email: contact.email, phoneNumber: contact.phoneNumber });
    setIsContactModalOpen(true);
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email) { toast.error('Name and email are required'); return; }
    setIsSaving(true);
    try {
      if (editingContact) {
        const res = await updateContact(editingContact.id, contactForm);
        if (res.success) {
          setContacts(prev => prev.map(c => c.id === editingContact.id ? res.data : c));
          toast.success('Contact updated!');
        }
      } else {
        const res = await createContact({ ...contactForm, limitedPartnerId: id });
        if (res.success) {
          setContacts(prev => [...prev, res.data]);
          toast.success('Contact added!');
        }
      }
      setIsContactModalOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save contact');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('Delete this contact?')) return;
    try {
      await deleteContact(contactId);
      setContacts(prev => prev.filter(c => c.id !== contactId));
      toast.success('Contact deleted');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete');
    }
  };

  if (isLoading) return <PageLoader text="Loading partner details..." />;
  if (!partner) return <div className="p-8 text-center text-gray-500">Partner not found.</div>;

  const stats = [
    { label: 'Total Committed Capital', value: formatCurrency(partner.committedCapital) },
    { label: 'Capital Calls', value: formatCurrency(partner.capitalCalls) },
    { label: 'Management Fees', value: formatCurrency(partner.managementFees) },
    { label: 'Carry Percentage', value: `${partner.carryPercentage}%` },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-8">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-[#667085] hover:text-[#101828] mb-6 transition-colors">
        <div className="p-1 border border-[#EAECF0] rounded-md"><ArrowLeft size={14} /></div>
        <span className="text-sm font-medium">Go back</span>
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-[#E9EDF5] flex items-center justify-center text-[#2D60FF] font-bold text-lg">
          {partner.companyName.charAt(0)}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#101828]">{partner.companyName}</h1>
          <p className="text-sm text-[#667085]">{partner.fund?.fundName}</p>
        </div>
        <span className="ml-2 px-2.5 py-0.5 bg-[#ECFDF3] text-[#027A48] text-xs font-medium rounded-full flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-[#12B76A] rounded-full" />Active
        </span>
      </div>

      <div className="flex border-b border-[#EAECF0] mb-8">
        {(['overview', 'funds'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium transition-all relative capitalize ${activeTab === tab ? 'text-[#2D5BFF]' : 'text-[#667085]'}`}>
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2D5BFF]" />}
          </button>
        ))}
      </div>

      {activeTab === 'overview' ? (
        <div className="space-y-8">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-6">
              <h3 className="text-lg font-bold text-[#101828] mb-6">Basic information</h3>
              <div className="grid grid-cols-2 gap-y-6">
                <InfoItem label="Company Name" value={partner.companyName} />
                <InfoItem label="Fund" value={partner.fund?.fundName || '—'} />
                <InfoItem label="Relationship Since" value={formatDate(partner.relationshipSince)} />
                <InfoItem label="Agreement Date" value={formatDate(partner.agreementDate)} />
                <InfoItem label="Main Contact" value={partner.mainPointOfContactName} />
                <InfoItem label="Contact Role" value={partner.mainPointOfContactRole} />
                <InfoItem label="Contact Email" value={partner.mainPointOfContactEmail} />
                <InfoItem label="Contact Phone" value={partner.mainPointOfContactPhoneNumber} />
              </div>
            </div>
            <div className="col-span-12 lg:col-span-6 grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-[#EAECF0] shadow-sm">
                  <p className="text-2xl font-bold text-[#101828] mb-1">{stat.value}</p>
                  <p className="text-xs font-medium text-[#667085]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-6 bg-white p-6 rounded-xl border border-[#EAECF0] shadow-sm">
              <h3 className="text-lg font-bold text-[#101828] mb-1">Capital Flow</h3>
              <div className="h-[220px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={CAPITAL_FLOW_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F4F7" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#667085' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#667085' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="calls" fill="#EF4444" radius={[2,2,0,0]} barSize={12} />
                    <Bar dataKey="returns" fill="#22C55E" radius={[2,2,0,0]} barSize={12} />
                    <Line type="monotone" dataKey="flow" stroke="#2D5BFF" strokeWidth={2} dot={{ r: 3, fill: '#2D5BFF', strokeWidth: 0 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-6 bg-white p-6 rounded-xl border border-[#EAECF0] shadow-sm">
              <h3 className="text-lg font-bold text-[#101828] mb-4">Sector Allocation</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={SECTOR_DATA} innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none">
                      {SECTOR_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {SECTOR_DATA.map(item => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-[#475467]">{item.name} {item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contacts */}
          <div className="bg-white rounded-xl border border-[#EAECF0] shadow-sm overflow-hidden">
            <div className="p-6 flex justify-between items-center border-b border-[#EAECF0]">
              <h3 className="text-lg font-bold text-[#101828]">Contact List</h3>
              <button onClick={openAddContact} className="bg-[#2D5BFF] hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all">
                <Plus size={16} /> Add Contact
              </button>
            </div>
            <table className="w-full text-left">
              <thead className="bg-[#F9FAFB] border-b border-[#EAECF0]">
                <tr>
                  {['Name','Role','Email','Phone',''].map((h, i) => (
                    <th key={i} className="px-6 py-3 text-[11px] font-bold text-[#667085] uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAECF0]">
                {contacts.length > 0 ? contacts.map(contact => (
                  <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E9EDF5] flex items-center justify-center text-[#2D5BFF] font-bold text-xs">
                        {contact.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-[#101828]">{contact.name}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#475467]">{contact.role}</td>
                    <td className="px-6 py-4 text-sm text-[#475467]">{contact.email}</td>
                    <td className="px-6 py-4 text-sm text-[#475467]">{contact.phoneNumber}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => openEditContact(contact)} className="text-[#98A2B3] hover:text-[#2D5BFF] transition-colors"><Edit2 size={15}/></button>
                      <button onClick={() => handleDeleteContact(contact.id)} className="text-[#98A2B3] hover:text-red-500 transition-colors"><Trash2 size={15}/></button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-[#667085]">No contacts yet. Add the first one!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#EAECF0] shadow-sm p-8 text-center text-gray-400">
          Fund details will be available soon.
        </div>
      )}

      {/* Contact Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0c111d]/30 backdrop-blur-[4px]" onClick={() => setIsContactModalOpen(false)} />
          <div className="relative bg-white w-full max-w-[480px] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-6 py-5 border-b border-[#F2F4F7]">
              <h2 className="text-lg font-bold text-[#101828]">{editingContact ? 'Edit Contact' : 'Add New Contact'}</h2>
              <button onClick={() => setIsContactModalOpen(false)} className="text-[#98A2B3] hover:text-[#667085]"><X size={20}/></button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSaveContact}>
              {[
                { label: 'Name', key: 'name', required: true, placeholder: 'John Doe' },
                { label: 'Role', key: 'role', required: true, placeholder: 'CFO' },
                { label: 'Email', key: 'email', required: true, placeholder: 'john@example.com', type: 'email' },
                { label: 'Phone Number', key: 'phoneNumber', placeholder: '+1 555 000 0000' },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs font-bold text-[#344054] uppercase tracking-wider block mb-1.5">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <input type={field.type || 'text'} placeholder={field.placeholder}
                    value={(contactForm as any)[field.key]}
                    onChange={e => setContactForm(p => ({ ...p, [field.key]: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#EAECF0] rounded-xl outline-none focus:border-[#2D5BFF] transition-all text-sm" />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsContactModalOpen(false)} className="flex-1 py-3 border border-[#D0D5DD] rounded-xl font-bold text-[#344054] hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex-1 py-3 bg-[#2D5BFF] hover:bg-blue-700 text-white rounded-xl font-bold disabled:opacity-60">
                  {isSaving ? 'Saving...' : editingContact ? 'Update' : 'Add Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-[#667085] uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm text-[#101828] font-medium">{value}</p>
    </div>
  );
}
