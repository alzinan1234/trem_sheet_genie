"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Lightbulb, ChevronDown, Copy, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getStartups, createStartup, duplicateStartup, deleteStartup } from '@/services/startup.service';
import toast from 'react-hot-toast';
import { getFunds } from '@/services/fund.service';
import { uploadTempMedia } from '@/services/tempMedia.service';
import { Startup, Fund } from '@/types';

export default function Startups() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFund, setSelectedFund] = useState('All Funds');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [startups, setStartups] = useState<Startup[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '', fundId: '', website: '', description: '', status: 'ACTIVE',
    investmentAmount: '', growthPercentage: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [startupRes, fundRes] = await Promise.all([
          getStartups({ page: 1, limit: 50 }),
          getFunds({ page: 1, limit: 50 }),
        ]);
        if (startupRes.success) setStartups(startupRes.data);
        if (fundRes.success) setFunds(fundRes.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredStartups = useMemo(() => {
    return startups.filter((startup) => {
      const matchesSearch = startup.name.toLowerCase().includes(searchTerm.toLowerCase()) || startup.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFund = selectedFund === 'All Funds' || startup.fund?.fundName === selectedFund;
      const matchesStatus = selectedStatus === 'All Statuses' || startup.status === selectedStatus;
      return matchesSearch && matchesFund && matchesStatus;
    });
  }, [searchTerm, selectedFund, selectedStatus, startups]);

  const handleCreateStartup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.fundId) { setError('Name and fund are required'); return; }
    setIsCreating(true);
    setError('');
    try {
      let tempMediaId: string | undefined;
      if (logoFile) {
        const mediaRes = await uploadTempMedia(logoFile, 'avatar');
        if (mediaRes.success) tempMediaId = mediaRes.data.tempMediaId;
      }
      const res = await createStartup({
        name: formData.name,
        fundId: formData.fundId,
        website: formData.website,
        description: formData.description,
        status: formData.status,
        investmentAmount: Number(formData.investmentAmount) || 0,
        growthPercentage: Number(formData.growthPercentage) || 0,
        ...(tempMediaId && { tempMediaId }),
      });
      if (res.success) {
        setStartups(prev => [res.data, ...prev]);
        setIsModalOpen(false);
        setFormData({ name: '', fundId: '', website: '', description: '', status: 'ACTIVE', investmentAmount: '', growthPercentage: '' });
        setLogoFile(null);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create startup');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDuplicate = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const res = await duplicateStartup(id);
      if (res.success) setStartups(prev => [res.data, ...prev]);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to duplicate startup');
    }
  };

  const handleDeleteStartup = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const toastId = toast.loading('Deleting...');
    try {
      await deleteStartup(id);
      setStartups(prev => prev.filter(s => s.id !== id));
      toast.success('Startup deleted', { id: toastId });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete startup', { id: toastId });
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-8 relative font-sans">
      <div className="flex justify-between items-start mb-8">
        <h1 className="text-[28px] font-semibold text-[#101828]">Startups</h1>
        <button onClick={() => setIsModalOpen(true)}
          className="bg-[#2D5BFF] hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm">
          <Lightbulb size={18} /> Add New Startup
        </button>
      </div>

      <div className="mb-6">
        <div className="flex flex-col gap-4">
          <p className="text-[12px] font-bold text-[#667085] uppercase tracking-wider">Filters</p>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <select value={selectedFund} onChange={(e) => setSelectedFund(e.target.value)}
                className="appearance-none bg-white border border-[#EAECF0] rounded-lg pl-3 pr-10 py-2.5 text-sm font-medium text-[#344054] outline-none min-w-[160px] shadow-sm hover:border-gray-300 transition-all">
                <option>All Funds</option>
                {funds.map(f => <option key={f.id} value={f.fundName}>{f.fundName}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] pointer-events-none" />
            </div>
            <div className="relative">
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none bg-white border border-[#EAECF0] rounded-lg pl-3 pr-10 py-2.5 text-sm font-medium text-[#344054] outline-none min-w-[160px] shadow-sm hover:border-gray-300 transition-all">
                <option>All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="CLOSED">Closed</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] pointer-events-none" />
            </div>
          </div>
          <div className="relative max-w-[320px] mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]" size={18} />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search startups by name or description..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#EAECF0] rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 transition-all shadow-sm" />
          </div>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}

      <div className="bg-white border border-[#EAECF0] rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-[#EAECF0]">
              <th className="px-6 py-4 text-[12px] font-semibold text-[#475467] uppercase tracking-wider">Company</th>
              <th className="px-6 py-4 text-[12px] font-semibold text-[#475467] uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-[12px] font-semibold text-[#475467] uppercase tracking-wider">Description</th>
              <th className="px-6 py-4 text-[12px] font-semibold text-[#475467] uppercase tracking-wider">Investment Amount</th>
              <th className="px-6 py-4 text-[12px] font-semibold text-[#475467] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAECF0]">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-[#667085]">Loading startups...</td></tr>
            ) : filteredStartups.length > 0 ? (
              filteredStartups.map((item) => (
                <tr key={item.id} onClick={() => router.push(`/investor-admin/startups/${item.id}?name=${encodeURIComponent(item.name)}`)}
                  className="hover:bg-blue-50/40 transition-colors cursor-pointer group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#F9FAFB] border border-[#EAECF0] flex items-center justify-center text-lg shadow-sm overflow-hidden">
                        {item.logo ? <img src={item.logo} alt={item.name} className="w-full h-full object-cover" /> : item.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#101828] group-hover:text-blue-600 transition-colors">{item.name}</div>
                        <div className="text-xs text-[#667085]">{item.website}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      item.status === 'ACTIVE' ? 'bg-[#ECFDF3] text-[#027A48] border-[#ABEFC6]' : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'ACTIVE' ? 'bg-[#12B76A]' : 'bg-gray-400'}`} />
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#475467]">{item.description}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#101828]">{formatCurrency(item.investmentAmount)}</span>
                      <span className="text-[11px] font-bold text-[#027A48] bg-[#ECFDF3] px-1.5 py-0.5 rounded flex items-center">↑ {item.growthPercentage}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3 text-[#98A2B3]" onClick={(e) => e.stopPropagation()}>
                      <button onClick={(e) => handleDuplicate(e, item.id)} className="hover:text-[#2D5BFF] transition-colors"><Copy size={18}/></button>
                      <button onClick={(e) => { e.stopPropagation(); router.push(`/investor-admin/startups/${item.id}?edit=true`); }} className="hover:text-[#2D5BFF] transition-colors"><Pencil size={18}/></button>
                      <button onClick={(e) => handleDeleteStartup(e, item.id, item.name)} className="hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-[#667085]">No startups found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0c111d]/30 backdrop-blur-[4px]" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-[520px] rounded-[20px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-8 py-6 border-b border-[#F2F4F7]">
              <h2 className="text-[20px] font-bold text-[#101828]">Add New Startup</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#98A2B3] hover:text-[#667085] p-1"><X size={22} /></button>
            </div>
            <form className="p-8 space-y-5" onSubmit={handleCreateStartup}>
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
                { label: 'Startup Name', key: 'name', placeholder: 'Catalog', required: true },
                { label: 'Website', key: 'website', placeholder: 'https://example.com' },
                { label: 'Description', key: 'description', placeholder: 'B2B platform for...' },
                { label: 'Investment Amount ($)', key: 'investmentAmount', placeholder: '50000', type: 'number' },
                { label: 'Growth Percentage (%)', key: 'growthPercentage', placeholder: '12', type: 'number' },
              ].map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#344054] uppercase tracking-wider">
                    {field.label} {field.required && <span className="text-[#D92D20]">*</span>}
                  </label>
                  <input type={field.type || 'text'} placeholder={field.placeholder}
                    value={(formData as any)[field.key]}
                    onChange={(e) => setFormData(p => ({ ...p, [field.key]: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#EAECF0] rounded-xl outline-none focus:border-[#2D5BFF] transition-all text-[#101828] placeholder:text-[#98A2B3]" />
                </div>
              ))}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#344054] uppercase tracking-wider">Status</label>
                <select value={formData.status} onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#EAECF0] rounded-xl outline-none focus:border-[#2D5BFF] transition-all text-[#101828]">
                  <option value="ACTIVE">Active</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#344054] uppercase tracking-wider">Logo (optional)</label>
                <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#EAECF0] rounded-xl outline-none text-[#101828] text-sm" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-[#D0D5DD] rounded-xl font-bold text-[#344054] hover:bg-gray-50 transition-all">Cancel</button>
                <button type="submit" disabled={isCreating} className="flex-1 py-3 bg-[#2D5BFF] hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/10 transition-all active:scale-[0.98] disabled:opacity-60">
                  {isCreating ? 'Creating...' : 'Add Startup'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
