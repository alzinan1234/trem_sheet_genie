"use client";
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { createFund } from "@/services/fund.service";

interface CreateNewFundProps {
  onCancel: () => void;
  onEditLPs: () => void;
  onSuccess?: () => void;
}

export default function CreateNewFund({ onCancel, onEditLPs, onSuccess }: CreateNewFundProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fundName: 'TSG Growth', description: 'Fund focused on growth stage investments...',
    inceptionDate: new Date().toISOString().split('T')[0],
    status: 'OPEN', leadGP: '', committedCapital: '100000000',
    initialClosingDate: new Date().toISOString().split('T')[0],
    term: '10', commitmentPeriod: '5', maximalExtension: '2',
    commitmentPeriodManagementFee: '2', postCommitmentPeriodManagementFee: '1.5',
    carryType: 'AGGREGATE', carryPercentage: '20',
  });

  const handleChange = (key: string, value: string) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!formData.fundName || !formData.leadGP) { setError('Fund name and Lead GP are required'); return; }
    setIsLoading(true);
    setError('');
    try {
      const res = await createFund({
        fundName: formData.fundName,
        description: formData.description,
        inceptionDate: new Date(formData.inceptionDate).toISOString(),
        status: formData.status,
        leadGP: formData.leadGP,
        committedCapital: Number(formData.committedCapital),
        initialClosingDate: new Date(formData.initialClosingDate).toISOString(),
        term: Number(formData.term),
        commitmentPeriod: Number(formData.commitmentPeriod),
        maximalExtension: Number(formData.maximalExtension),
        commitmentPeriodManagementFee: Number(formData.commitmentPeriodManagementFee),
        postCommitmentPeriodManagementFee: Number(formData.postCommitmentPeriodManagementFee),
        carryType: formData.carryType,
        carryPercentage: Number(formData.carryPercentage),
      });
      if (res.success) {
        onSuccess?.();
        onCancel();
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create fund');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-[#F9FAFB] min-h-screen">
      <div className="mx-auto">
        <h1 className="text-2xl font-bold text-[#1A2B49] mb-6">Creating a New Fund</h1>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Fund Name</label>
                <input className="w-full bg-gray-100 p-2.5 rounded-lg text-gray-700 font-medium border-none focus:ring-2 focus:ring-[#2D60FF] mt-0.5" value={formData.fundName} onChange={e => handleChange('fundName', e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Description</label>
                <textarea className="w-full bg-gray-100 p-2.5 rounded-lg text-sm text-gray-600 border-none mt-0.5" rows={2} value={formData.description} onChange={e => handleChange('description', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Inception Date</label>
                  <input type="date" className="w-full bg-gray-100 p-2 rounded-lg text-sm border-none outline-none" value={formData.inceptionDate} onChange={e => handleChange('inceptionDate', e.target.value)} />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Status</label>
                  <div className="relative">
                    <select className="w-full bg-gray-100 p-2 rounded-lg text-sm border-none outline-none appearance-none pr-8" value={formData.status} onChange={e => handleChange('status', e.target.value)}>
                      {['OPEN','CLOSED','FULLY_INVESTED','LIQUIDATED','EVERGREEN'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Lead GP</label>
                  <input className="w-full bg-gray-100 p-2 rounded-lg text-sm border-none focus:ring-1 focus:ring-blue-200 outline-none" value={formData.leadGP} onChange={e => handleChange('leadGP', e.target.value)} placeholder="Lead GP name" />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Committed Capital ($)</label>
                  <input type="number" className="w-full bg-gray-100 p-2 rounded-lg text-sm border-none focus:ring-1 focus:ring-blue-200 outline-none" value={formData.committedCapital} onChange={e => handleChange('committedCapital', e.target.value)} />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Initial Closing Date</label>
                  <input type="date" className="w-full bg-gray-100 p-2 rounded-lg text-sm border-none outline-none" value={formData.initialClosingDate} onChange={e => handleChange('initialClosingDate', e.target.value)} />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-0.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Term</label>
                    <input type="number" className="w-full bg-gray-100 p-2 rounded-lg text-sm border-none outline-none" value={formData.term} onChange={e => handleChange('term', e.target.value)} />
                  </div>
                  <span className="mb-2.5 text-xs text-gray-500 font-medium">Years</span>
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-0.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Commitment Period</label>
                    <input type="number" className="w-full bg-gray-100 p-2 rounded-lg text-sm border-none outline-none" value={formData.commitmentPeriod} onChange={e => handleChange('commitmentPeriod', e.target.value)} />
                  </div>
                  <span className="mb-2.5 text-xs text-gray-500 font-medium">Years</span>
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-0.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Maximal Extension</label>
                    <input type="number" className="w-full bg-gray-100 p-2 rounded-lg text-sm border-none outline-none" value={formData.maximalExtension} onChange={e => handleChange('maximalExtension', e.target.value)} />
                  </div>
                  <span className="mb-2.5 text-xs text-gray-500 font-medium">Years</span>
                </div>
              </div>
              <div className="border border-gray-100 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-bold text-gray-800 border-b border-gray-50 pb-2">Standard LP Terms</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 text-xs font-medium">Commitment Period Management Fee</span>
                    <div className="flex items-center gap-2">
                      <input className="w-16 bg-gray-100 px-2 py-1 rounded text-right text-gray-700 outline-none" value={formData.commitmentPeriodManagementFee} onChange={e => handleChange('commitmentPeriodManagementFee', e.target.value)} />
                      <span className="text-gray-400">%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 text-xs font-medium">Post Commitment Period Management Fee</span>
                    <div className="flex items-center gap-2">
                      <input className="w-16 bg-gray-100 px-2 py-1 rounded text-right text-gray-700 outline-none" value={formData.postCommitmentPeriodManagementFee} onChange={e => handleChange('postCommitmentPeriodManagementFee', e.target.value)} />
                      <span className="text-gray-400">%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-2">
                    <span className="text-gray-500 text-xs font-medium">Carry</span>
                    <div className="flex gap-2">
                      <select className="bg-gray-100 px-2 py-1 rounded text-xs outline-none cursor-pointer" value={formData.carryType} onChange={e => handleChange('carryType', e.target.value)}>
                        <option value="AGGREGATE">Aggregate</option>
                        <option value="DEAL_BY_DEAL">Deal by Deal</option>
                      </select>
                      <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                        <input type="number" className="w-10 bg-transparent text-xs font-bold text-gray-700 outline-none text-right" value={formData.carryPercentage} onChange={e => handleChange('carryPercentage', e.target.value)} />
                        <span className="text-xs text-gray-400">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-sm text-gray-800">Limited Partners</h2>
                <button onClick={onEditLPs} className="text-[10px] font-bold text-[#2D60FF] bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">Edit or Add LPs</button>
              </div>
              <p className="text-xs text-gray-400">Save the fund first, then add Limited Partners from the LP section.</p>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
          <button onClick={onCancel} className="px-8 py-2 rounded-full border border-gray-200 text-gray-500 text-sm font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={isLoading} className="px-8 py-2 rounded-xl bg-[#2D60FF] text-white text-sm font-semibold hover:bg-[#1a4bd6] shadow-lg shadow-blue-100 transition-all disabled:opacity-60">
            {isLoading ? 'Creating...' : 'Create New Fund'}
          </button>
        </div>
      </div>
    </div>
  );
}
