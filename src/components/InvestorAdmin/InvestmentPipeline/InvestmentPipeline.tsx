"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, Plus, X } from 'lucide-react';
import { getInvestmentPipelines, createInvestmentPipeline, updateInvestmentPipeline, deleteInvestmentPipeline } from '@/services/pipeline.service';
import { getFunds } from '@/services/fund.service';
import { InvestmentPipeline, Fund, CompanyStatus, DecisionStatus } from '@/types';

const COMPANY_STATUSES: CompanyStatus[] = ['CURRENTLY_FUNDRAISING','MID_CYCLE','NOT_RAISING','CLOSED'];
const DECISION_STATUSES: DecisionStatus[] = ['UNDER_REVIEW','INVESTMENT_COMMITTEE','TERM_SHEET','DUE_DILIGENCE','INVESTED','PASSED'];

const statusLabel = (s: string) => s.replace(/_/g, ' ');

const getBadgeStyle = (status: string) => {
  const map: Record<string, string> = {
    CURRENTLY_FUNDRAISING: 'bg-[#ECFDF3] text-[#027A48] border-[#ABEFC6]',
    MID_CYCLE: 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]',
    NOT_RAISING: 'bg-gray-100 text-gray-600 border-gray-200',
    CLOSED: 'bg-red-50 text-red-600 border-red-100',
    UNDER_REVIEW: 'bg-[#EFF8FF] text-[#175CD3] border-[#B2DDFF]',
    INVESTMENT_COMMITTEE: 'bg-[#F6FEF9] text-[#087443] border-[#B8F3D1]',
    TERM_SHEET: 'bg-purple-50 text-purple-600 border-purple-100',
    DUE_DILIGENCE: 'bg-orange-50 text-orange-600 border-orange-100',
    INVESTED: 'bg-green-50 text-green-700 border-green-100',
    PASSED: 'bg-red-50 text-red-600 border-red-100',
  };
  return map[status] || 'bg-gray-50 text-gray-600 border-gray-200';
};

export default function InvestmentPipelineComponent() {
  const [selectedFund, setSelectedFund] = useState('All Funds');
  const [selectedCompanyStatus, setSelectedCompanyStatus] = useState('All');
  const [selectedDecisionStatus, setSelectedDecisionStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [pipelines, setPipelines] = useState<InvestmentPipeline[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ companyName: '', companyWebsite: '', fundId: '', companyStatus: 'CURRENTLY_FUNDRAISING' as CompanyStatus, decisionStatus: 'UNDER_REVIEW' as DecisionStatus });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, fRes] = await Promise.all([
          getInvestmentPipelines({ page: 1, limit: 50 }),
          getFunds({ page: 1, limit: 50 }),
        ]);
        if (pRes.success) setPipelines(pRes.data);
        if (fRes.success) setFunds(fRes.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return pipelines.filter(item => {
      const matchesFund = selectedFund === 'All Funds' || item.fund?.fundName === selectedFund;
      const matchesCS = selectedCompanyStatus === 'All' || item.companyStatus === selectedCompanyStatus;
      const matchesDS = selectedDecisionStatus === 'All' || item.decisionStatus === selectedDecisionStatus;
      const matchesSearch = item.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || item.companyWebsite?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFund && matchesCS && matchesDS && matchesSearch;
    });
  }, [selectedFund, selectedCompanyStatus, selectedDecisionStatus, searchTerm, pipelines]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName || !form.fundId) { setError('Company name and fund are required'); return; }
    setIsCreating(true);
    setError('');
    try {
      const res = await createInvestmentPipeline({ companyName: form.companyName, companyWebsite: form.companyWebsite, fundId: form.fundId, companyStatus: form.companyStatus, decisionStatus: form.decisionStatus });
      if (res.success) {
        setPipelines(prev => [res.data, ...prev]);
        setShowModal(false);
        setForm({ companyName: '', companyWebsite: '', fundId: '', companyStatus: 'CURRENTLY_FUNDRAISING', decisionStatus: 'UNDER_REVIEW' });
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create pipeline entry');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDecisionChange = async (id: string, decisionStatus: DecisionStatus) => {
    try {
      const res = await updateInvestmentPipeline(id, { decisionStatus });
      if (res.success) setPipelines(prev => prev.map(p => p.id === id ? res.data : p));
    } catch {}
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteInvestmentPipeline(id);
      setPipelines(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-8 relative font-sans">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-[28px] font-semibold text-[#101828]">Investment Pipeline</h1>
        <button onClick={() => setShowModal(true)} className="bg-[#2D5BFF] hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm">
          <Plus size={18} /> Add Company
        </button>
      </div>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}
      <div className="mb-6 flex flex-col gap-4">
        <p className="text-[12px] font-bold text-[#667085] uppercase tracking-wider">Filters</p>
        <div className="flex flex-wrap gap-3 items-center">
          {[
            { val: selectedFund, set: setSelectedFund, opts: ['All Funds', ...funds.map(f => f.fundName)] },
            { val: selectedCompanyStatus, set: setSelectedCompanyStatus, opts: ['All', ...COMPANY_STATUSES] },
            { val: selectedDecisionStatus, set: setSelectedDecisionStatus, opts: ['All', ...DECISION_STATUSES] },
          ].map((filter, idx) => (
            <div key={idx} className="relative">
              <select value={filter.val} onChange={e => filter.set(e.target.value)} className="appearance-none bg-white border border-[#EAECF0] rounded-lg pl-3 pr-10 py-2.5 text-sm font-medium text-[#344054] outline-none min-w-[160px] shadow-sm">
                {filter.opts.map(o => <option key={o} value={o}>{statusLabel(o)}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] pointer-events-none" />
            </div>
          ))}
          <div className="relative max-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]" size={18} />
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search companies..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#EAECF0] rounded-lg text-sm outline-none shadow-sm" />
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#EAECF0] rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-[#EAECF0]">
              <th className="px-6 py-3 text-[12px] font-semibold text-[#475467] uppercase tracking-wider">Company</th>
              <th className="px-6 py-3 text-[12px] font-semibold text-[#475467] uppercase tracking-wider">Fund</th>
              <th className="px-6 py-3 text-[12px] font-semibold text-[#475467] uppercase tracking-wider">Company Status</th>
              <th className="px-6 py-3 text-[12px] font-semibold text-[#475467] uppercase tracking-wider">Decision Status</th>
              <th className="px-6 py-3 text-[12px] font-semibold text-[#475467] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAECF0]">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-[#667085]">Loading...</td></tr>
            ) : filteredData.length > 0 ? filteredData.map(item => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#F9FAFB] border border-[#EAECF0] flex items-center justify-center font-bold text-[#2D5BFF]">{item.companyName.charAt(0)}</div>
                    <div>
                      <div className="text-sm font-bold text-[#101828]">{item.companyName}</div>
                      <div className="text-xs text-[#667085]">{item.companyWebsite}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-[#475467]">{item.fund?.fundName || '—'}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyle(item.companyStatus)}`}>
                    {statusLabel(item.companyStatus)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <select value={item.decisionStatus} onChange={e => handleDecisionChange(item.id, e.target.value as DecisionStatus)}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium border outline-none cursor-pointer ${getBadgeStyle(item.decisionStatus)}`}>
                    {DECISION_STATUSES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
                  </select>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(item.id)} className="text-[#98A2B3] hover:text-red-500 transition-colors p-1"><X size={16}/></button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-[#667085]">No pipeline entries found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0c111d]/30 backdrop-blur-[4px]" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-full max-w-[480px] rounded-[20px] shadow-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#101828]">Add to Pipeline</h2>
              <button onClick={() => setShowModal(false)} className="text-[#98A2B3] hover:text-[#667085]"><X size={22}/></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}
              <div>
                <label className="text-[11px] font-bold text-[#344054] uppercase tracking-wider">Fund <span className="text-red-500">*</span></label>
                <select value={form.fundId} onChange={e => setForm(p => ({ ...p, fundId: e.target.value }))} className="w-full mt-1 px-4 py-3 bg-[#F9FAFB] border border-[#EAECF0] rounded-xl text-sm text-[#101828] outline-none">
                  <option value="">Select fund</option>
                  {funds.map(f => <option key={f.id} value={f.id}>{f.fundName}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#344054] uppercase tracking-wider">Company Name <span className="text-red-500">*</span></label>
                <input type="text" value={form.companyName} onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))} placeholder="Catalog" className="w-full mt-1 px-4 py-3 bg-[#F9FAFB] border border-[#EAECF0] rounded-xl text-sm text-[#101828] outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#344054] uppercase tracking-wider">Website</label>
                <input type="text" value={form.companyWebsite} onChange={e => setForm(p => ({ ...p, companyWebsite: e.target.value }))} placeholder="https://example.com" className="w-full mt-1 px-4 py-3 bg-[#F9FAFB] border border-[#EAECF0] rounded-xl text-sm text-[#101828] outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#344054] uppercase tracking-wider">Company Status</label>
                <select value={form.companyStatus} onChange={e => setForm(p => ({ ...p, companyStatus: e.target.value as CompanyStatus }))} className="w-full mt-1 px-4 py-3 bg-[#F9FAFB] border border-[#EAECF0] rounded-xl text-sm text-[#101828] outline-none">
                  {COMPANY_STATUSES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#344054] uppercase tracking-wider">Decision Status</label>
                <select value={form.decisionStatus} onChange={e => setForm(p => ({ ...p, decisionStatus: e.target.value as DecisionStatus }))} className="w-full mt-1 px-4 py-3 bg-[#F9FAFB] border border-[#EAECF0] rounded-xl text-sm text-[#101828] outline-none">
                  {DECISION_STATUSES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border border-[#D0D5DD] rounded-xl font-bold text-[#344054] hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={isCreating} className="flex-1 py-3 bg-[#2D5BFF] hover:bg-blue-700 text-white rounded-xl font-bold disabled:opacity-60">
                  {isCreating ? 'Adding...' : 'Add to Pipeline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
