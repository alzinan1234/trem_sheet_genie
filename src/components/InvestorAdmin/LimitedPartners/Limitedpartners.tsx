"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { Search, Calendar, X, UserPlus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { getLimitedPartners, createLimitedPartner, deleteLimitedPartner } from '@/services/limitedPartner.service';
import { getFunds } from '@/services/fund.service';
import { LimitedPartner, Fund } from '@/types';

export default function Limitedpartners() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFund, setSelectedFund] = useState('All Funds');
  const [searchTerm, setSearchTerm] = useState('');
  const [partners, setPartners] = useState<LimitedPartner[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    companyName: '', mainPointOfContactName: '', mainPointOfContactRole: '',
    mainPointOfContactEmail: '', mainPointOfContactPhoneNumber: '',
    relationshipSince: '', fundId: '', committedCapital: '',
    capitalCalls: '', managementFees: '', carryPercentage: '', agreementDate: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lpRes, fundRes] = await Promise.all([
          getLimitedPartners({ page: 1, limit: 50 }),
          getFunds({ page: 1, limit: 50 }),
        ]);
        if (lpRes.success) setPartners(lpRes.data);
        if (fundRes.success) setFunds(fundRes.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPartners = useMemo(() => {
    return partners.filter((partner) => {
      const matchesFund = selectedFund === 'All Funds' || partner.fund?.fundName === selectedFund;
      const matchesSearch = partner.companyName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFund && matchesSearch;
    });
  }, [partners, searchTerm, selectedFund]);

  const handleDeleteLP = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (!confirm(`Delete "${name}"? This action cannot be undone.`)) return;
    const toastId = toast.loading('Deleting...');
    try {
      await deleteLimitedPartner(id);
      setPartners(prev => prev.filter(p => p.id !== id));
      toast.success('Limited partner deleted', { id: toastId });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete', { id: toastId });
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const handleCreateLP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.fundId) { setError('Company name and fund are required'); return; }
    setIsCreating(true);
    setError('');
    try {
      const res = await createLimitedPartner({
        companyName: formData.companyName,
        fundId: formData.fundId,
        relationshipSince: formData.relationshipSince || new Date().toISOString(),
        agreementDate: formData.agreementDate || new Date().toISOString(),
        committedCapital: Number(formData.committedCapital) || 0,
        capitalCalls: Number(formData.capitalCalls) || 0,
        managementFees: Number(formData.managementFees) || 0,
        carryPercentage: Number(formData.carryPercentage) || 0,
        mainPointOfContactName: formData.mainPointOfContactName,
        mainPointOfContactRole: formData.mainPointOfContactRole,
        mainPointOfContactEmail: formData.mainPointOfContactEmail,
        mainPointOfContactPhoneNumber: formData.mainPointOfContactPhoneNumber,
      });
      if (res.success) {
        setPartners(prev => [res.data, ...prev]);
        setIsModalOpen(false);
        setFormData({ companyName: '', mainPointOfContactName: '', mainPointOfContactRole: '', mainPointOfContactEmail: '', mainPointOfContactPhoneNumber: '', relationshipSince: '', fundId: '', committedCapital: '', capitalCalls: '', managementFees: '', carryPercentage: '', agreementDate: '' });
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create limited partner');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-8 relative">
      <div className="flex justify-between items-start mb-8">
        <div><h1 className="text-[28px] font-semibold text-[#101828]">Limited Partners</h1></div>
        <button onClick={() => setIsModalOpen(true)}
          className="bg-[#2D5BFF] hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm">
          <UserPlus size={18} /> New Limited Partner
        </button>
      </div>

      <div className="mb-6">
        <div className="flex flex-col gap-4">
          <p className="text-[12px] font-bold text-[#667085] uppercase tracking-wider">Filters</p>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <select value={selectedFund} onChange={(e) => setSelectedFund(e.target.value)}
                className="appearance-none bg-white border border-[#EAECF0] rounded-lg pl-3 pr-10 py-2.5 text-sm font-medium text-[#344054] outline-none min-w-[160px] shadow-sm hover:border-gray-300 transition-all">
                <option>All Funds</option>
                {funds.map(f => <option key={f.id} value={f.fundName}>{f.fundName}</option>)}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
          </div>
          <div className="relative max-w-[320px] mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]" size={18} />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search limited partners..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#EAECF0] rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 transition-all shadow-sm" />
          </div>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}

      <div className="bg-white border border-[#EAECF0] rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-[#EAECF0]">
              <th className="px-6 py-3 text-[12px] font-semibold text-[#475467] uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-[12px] font-semibold text-[#475467] uppercase tracking-wider">Fund</th>
              <th className="px-6 py-3 text-[12px] font-semibold text-[#475467] uppercase tracking-wider">Total Committed Capital</th>
              <th className="px-6 py-3 text-[12px] font-semibold text-[#475467] uppercase tracking-wider">Management Fees</th>
              <th className="px-6 py-3 text-[12px] font-semibold text-[#475467] uppercase tracking-wider">Relationship Since</th>
              <th className="px-6 py-3 text-[12px] font-semibold text-[#475467] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAECF0]">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-[#667085]">Loading...</td></tr>
            ) : filteredPartners.length > 0 ? (
              filteredPartners.map((partner) => (
                <tr key={partner.id} onClick={() => router.push(`/investor-admin/limited-partners/${partner.id}`)}
                  className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#E9EDF5] flex items-center justify-center text-[#2D60FF] font-bold text-sm">
                      {partner.companyName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-[#101828]">{partner.companyName}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#475467]">{partner.fund?.fundName || '—'}</td>
                  <td className="px-6 py-4 text-sm font-medium text-[#101828]">{formatCurrency(partner.committedCapital)}</td>
                  <td className="px-6 py-4 text-sm text-[#475467]">{formatCurrency(partner.managementFees)}</td>
                  <td className="px-6 py-4 text-sm text-[#475467]">{formatDate(partner.relationshipSince)}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={(e) => handleDeleteLP(e, partner.id, partner.companyName)}
                      className="p-1.5 text-[#98A2B3] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-[#667085]">No limited partners found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0c111d]/30 backdrop-blur-[4px]" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-[560px] rounded-[20px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-8 py-6 border-b border-[#F2F4F7]">
              <h2 className="text-[20px] font-bold text-[#101828]">Add a Limited Partner</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#98A2B3] hover:text-[#667085] transition-colors p-1"><X size={22} /></button>
            </div>
            <form className="p-8 space-y-5" onSubmit={handleCreateLP}>
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#344054] uppercase tracking-wider">Fund <span className="text-[#D92D20]">*</span></label>
                <select value={formData.fundId} onChange={(e) => setFormData(p => ({ ...p, fundId: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#EAECF0] rounded-xl outline-none focus:border-[#2D5BFF] transition-all text-[#101828]">
                  <option value="">Select a fund</option>
                  {funds.map(f => <option key={f.id} value={f.id}>{f.fundName}</option>)}
                </select>
              </div>
              {[
                { label: 'Company Name', key: 'companyName', placeholder: 'Summit Capital', required: true },
                { label: 'Main point of contact name', key: 'mainPointOfContactName', placeholder: 'John Doe', required: true },
                { label: 'Main point of contact role', key: 'mainPointOfContactRole', placeholder: 'CFO', required: true },
                { label: 'Main point of contact email', key: 'mainPointOfContactEmail', placeholder: 'john@example.com', required: true, type: 'email' },
                { label: 'Main point of contact phone', key: 'mainPointOfContactPhoneNumber', placeholder: '+1 555 000 0000', required: true },
                { label: 'Committed Capital ($)', key: 'committedCapital', placeholder: '1000000', type: 'number' },
                { label: 'Capital Calls ($)', key: 'capitalCalls', placeholder: '250000', type: 'number' },
                { label: 'Management Fees ($)', key: 'managementFees', placeholder: '20000', type: 'number' },
                { label: 'Carry Percentage (%)', key: 'carryPercentage', placeholder: '15', type: 'number' },
              ].map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#344054] uppercase tracking-wider">
                    {field.label} {field.required && <span className="text-[#D92D20]">*</span>}
                  </label>
                  <input type={field.type || 'text'} placeholder={field.placeholder}
                    value={(formData as any)[field.key]}
                    onChange={(e) => setFormData(p => ({ ...p, [field.key]: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#EAECF0] rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-[#2D5BFF] transition-all text-[#101828] placeholder:text-[#98A2B3]" />
                </div>
              ))}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#344054] uppercase tracking-wider">Relationship since <span className="text-[#D92D20]">*</span></label>
                <div className="relative">
                  <input type="date" value={formData.relationshipSince} onChange={(e) => setFormData(p => ({ ...p, relationshipSince: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#EAECF0] rounded-xl outline-none focus:border-[#2D5BFF] transition-all" />
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-[#98A2B3]" size={18} />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-[#D0D5DD] rounded-xl font-bold text-[#344054] hover:bg-gray-50 transition-all">Cancel</button>
                <button type="submit" disabled={isCreating} className="flex-1 py-3 bg-[#2D5BFF] hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/10 transition-all active:scale-[0.98] disabled:opacity-60">
                  {isCreating ? 'Creating...' : 'Create Limited Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
