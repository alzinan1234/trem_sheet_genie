"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { getFunds } from '@/services/fund.service';
import { getStartups } from '@/services/startup.service';

export type NewSimulationModalMode = 'simulation' | 'newPortfolioCompany';

export interface NewSimulationModalData {
  name: string;
  description: string;
  fundName: string;
  portfolioCompany: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewSimulationModalData) => void;
  mode?: NewSimulationModalMode;
  fundOptions?: string[];
  portfolioCompanyOptions?: string[];
  defaultFundName?: string;
  defaultPortfolioCompany?: string;
  showFundSelector?: boolean;
  lockFundSelection?: boolean;
  lockPortfolioCompanySelection?: boolean;
}

const NewSimulationModal: React.FC<ModalProps> = ({
  isOpen, onSubmit, onClose,
  mode = 'simulation',
  fundOptions: propFundOptions,
  portfolioCompanyOptions: propStartupOptions,
  defaultFundName = '',
  defaultPortfolioCompany = '',
  showFundSelector = true,
  lockFundSelection = false,
  lockPortfolioCompanySelection = false,
}) => {
  const [formData, setFormData] = useState<NewSimulationModalData>({ name: '', description: '', fundName: defaultFundName, portfolioCompany: defaultPortfolioCompany });
  const [isVisible, setIsVisible] = useState(false);
  const [fundOptions, setFundOptions] = useState<string[]>(propFundOptions || []);
  const [startupOptions, setStartupOptions] = useState<string[]>(propStartupOptions || []);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  const isSimulationMode = mode === 'simulation';

  // Load real funds and startups if not provided via props
  useEffect(() => {
    if (!isOpen) return;
    if (propFundOptions && propFundOptions.length > 0) {
      setFundOptions(propFundOptions);
    } else {
      setIsLoadingOptions(true);
      getFunds({ page: 1, limit: 50 }).then(res => {
        if (res.success) setFundOptions(res.data.map(f => f.fundName));
      }).catch(() => {}).finally(() => setIsLoadingOptions(false));
    }
    if (propStartupOptions && propStartupOptions.length > 0) {
      setStartupOptions(propStartupOptions);
    } else if (isSimulationMode) {
      getStartups({ page: 1, limit: 50 }).then(res => {
        if (res.success) setStartupOptions(res.data.map(s => s.name));
      }).catch(() => {});
    }
  }, [isOpen, propFundOptions, propStartupOptions]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setFormData(prev => ({ ...prev, fundName: prev.fundName || defaultFundName, portfolioCompany: prev.portfolioCompany || defaultPortfolioCompany }));
    } else {
      setIsVisible(false);
      setFormData({ name: '', description: '', fundName: defaultFundName, portfolioCompany: defaultPortfolioCompany });
    }
  }, [isOpen, defaultFundName, defaultPortfolioCompany]);

  // Update options when props change
  useEffect(() => { if (propFundOptions) setFundOptions(propFundOptions); }, [propFundOptions]);
  useEffect(() => { if (propStartupOptions) setStartupOptions(propStartupOptions); }, [propStartupOptions]);

  const resolvedFundOptions = useMemo(() => {
    const trimmed = defaultFundName.trim();
    if (!trimmed) return fundOptions;
    return fundOptions.includes(trimmed) ? fundOptions : [trimmed, ...fundOptions];
  }, [defaultFundName, fundOptions]);

  const resolvedStartupOptions = useMemo(() => {
    const trimmed = defaultPortfolioCompany.trim();
    if (!trimmed) return startupOptions;
    return startupOptions.includes(trimmed) ? startupOptions : [trimmed, ...startupOptions];
  }, [defaultPortfolioCompany, startupOptions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveFund = showFundSelector ? formData.fundName.trim() : (formData.fundName.trim() || defaultFundName.trim());
    const effectiveStartup = isSimulationMode ? (formData.portfolioCompany.trim() || defaultPortfolioCompany.trim()) : formData.portfolioCompany.trim();
    if (!formData.name.trim() || !effectiveFund || (isSimulationMode && !effectiveStartup)) return;
    onSubmit({ ...formData, fundName: effectiveFund, portfolioCompany: effectiveStartup });
  };

  const handleClose = () => { setIsVisible(false); setTimeout(onClose, 300); };
  const isContinueDisabled = !formData.name.trim() || (showFundSelector && !formData.fundName.trim()) || (isSimulationMode && !formData.portfolioCompany.trim());
  const preselectedFundName = (formData.fundName || defaultFundName).trim();

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/20 transition-opacity duration-300 ${isOpen && isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={handleClose}>
      <div className={`relative w-[480px] rounded-xl bg-white p-8 shadow-xl transition-all duration-300 ease-out ${isOpen && isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-95 opacity-0'}`} onClick={e => e.stopPropagation()}>
        <div className="mb-6">
          <h1 className="text-[22px] font-bold text-[#1e293b] mb-1">{isSimulationMode ? 'Create New Simulation' : 'Add New Portfolio Company'}</h1>
          <p className="text-[15px] text-[#64748b]">{isSimulationMode ? 'Name the simulation and choose the fund and startup.' : 'Add the new portfolio company details and choose the target fund.'}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[14px] font-semibold text-[#1e293b]">{isSimulationMode ? 'Simulation Name *' : 'Portfolio Company Name *'}</label>
            <input type="text" placeholder={isSimulationMode ? 'e.g., Series A Scenario' : 'e.g., Acme Robotics'}
              className="w-full rounded-lg border border-[#e2e8f0] bg-white px-4 py-[10px] text-[15px] text-gray-800 placeholder:text-[#cbd5e1] focus:border-[#94a3b8] focus:outline-none"
              value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
          </div>

          {showFundSelector && (
            <div className="space-y-2">
              <label className="text-[14px] font-semibold text-[#1e293b]">Fund *</label>
              <select className={`w-full rounded-lg border border-[#e2e8f0] bg-white px-4 py-[10px] text-[15px] focus:border-[#94a3b8] focus:outline-none disabled:bg-[#f8fafc] ${formData.fundName ? 'text-gray-800' : 'text-[#94a3b8]'}`}
                value={formData.fundName} onChange={e => setFormData({ ...formData, fundName: e.target.value })} required disabled={lockFundSelection}>
                {!lockFundSelection && <option value="">Select a fund</option>}
                {isLoadingOptions ? <option disabled>Loading...</option> : resolvedFundOptions
                  .filter((f, i, arr) => arr.indexOf(f) === i)
                  .map((f, i) => <option key={`${f}-${i}`} value={f}>{f}</option>)}
              </select>
            </div>
          )}
          {!showFundSelector && preselectedFundName && (
            <div className="space-y-2">
              <label className="text-[14px] font-semibold text-[#1e293b]">Fund</label>
              <input type="text" value={preselectedFundName} readOnly className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 py-[10px] text-[15px] text-[#334155]" />
            </div>
          )}

          {isSimulationMode && (
            <div className="space-y-2">
              <label className="text-[14px] font-semibold text-[#1e293b]">Startup *</label>
              <select className={`w-full rounded-lg border border-[#e2e8f0] bg-white px-4 py-[10px] text-[15px] focus:border-[#94a3b8] focus:outline-none disabled:bg-[#f8fafc] ${formData.portfolioCompany ? 'text-gray-800' : 'text-[#94a3b8]'}`}
                value={formData.portfolioCompany} onChange={e => setFormData({ ...formData, portfolioCompany: e.target.value })} required disabled={lockPortfolioCompanySelection}>
                {!lockPortfolioCompanySelection && <option value="">Select a startup</option>}
                {resolvedStartupOptions
                  .filter((s, i, arr) => arr.indexOf(s) === i)
                  .map((s, i) => <option key={`${s}-${i}`} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[14px] font-semibold text-[#1e293b]">Description</label>
            <textarea rows={3} placeholder="Add a description..."
              className="w-full resize-none rounded-lg border border-[#e2e8f0] bg-white px-4 py-[10px] text-[15px] placeholder:text-[#cbd5e1] focus:border-[#94a3b8] focus:outline-none"
              value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
          </div>

          <div className="flex justify-end items-center gap-6 pt-4">
            <button type="button" onClick={handleClose} className="text-[15px] font-medium text-[#64748b] hover:text-[#1e293b]">Cancel</button>
            <button type="submit" disabled={isContinueDisabled}
              className={`rounded-lg px-8 py-[10px] text-[15px] font-bold text-white transition-all ${isContinueDisabled ? 'bg-[#94a3ff] opacity-50 cursor-not-allowed' : 'bg-[#2D60FF] hover:bg-blue-700'}`}>
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewSimulationModal;
