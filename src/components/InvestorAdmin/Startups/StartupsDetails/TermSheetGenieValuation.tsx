"use client";
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  simulateSingleInvestment,
  simulateSingleInvestmentWithValuation,
  mapEquityRoundToInvestmentRound,
} from '@/services/simulationEngine.service';
import toast from 'react-hot-toast';

const TermSheetGenieValuation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isSeriesAExpanded, setIsSeriesAExpanded] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Inputs
  const [investmentAmount, setInvestmentAmount] = useState(10000000);
  const [founderShares, setFounderShares] = useState(9000000);
  const [vcShares, setVcShares] = useState(1000000);
  const [holdingPeriod, setHoldingPeriod] = useState(5);
  const [volatility, setVolatility] = useState(0.8);
  const [riskFreeRate, setRiskFreeRate] = useState(0.05);
  const [subjectiveValue, setSubjectiveValue] = useState(0);

  const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v || 0);
  const fmtPct = (v: number) => `${(v * 100).toFixed(2)}%`;

  const handleCalculate = async () => {
    setIsCalculating(true);
    const toastId = toast.loading('Calculating valuation...');
    try {
      const investment_round = {
        id: 'series-a',
        investment_type: 'convertible preferred' as const,
        investment_amount: investmentAmount,
        vc_shares: vcShares,
        liquidation_preference_multiple: 1.0,
        dividend_type: 'simple' as const,
        investment_date: new Date().toISOString().split('T')[0],
        seniority: 1,
        moic: 2.5,
        commitment_period: 10,
        commitment_period_mgmt_fee: 0.02,
        committed_capital: 100000000,
        fund_lifetime: 10,
        performance_fee: 0.2,
        post_commitment_period_mgmt_fee: 0.015,
      };

      const params = {
        investment_round,
        founder_shares: founderShares,
        holding_period: holdingPeriod,
        volatility,
        risk_free_rate: riskFreeRate,
        volatility_around_holding_period: holdingPeriod * 0.2,
        committed_options_before_round: 0,
        uncommitted_options_before_round: 0,
        ...(subjectiveValue > 0 && { subjective_current_value: subjectiveValue }),
      };

      const res = subjectiveValue > 0
        ? await simulateSingleInvestmentWithValuation(params)
        : await simulateSingleInvestment(params);

      if (res?.success && res?.data) {
        setResults(res.data);
        toast.success('Valuation calculated!', { id: toastId });
      } else {
        toast.dismiss(toastId);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Calculation failed', { id: toastId });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm font-sans overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setIsOpen(!isOpen)}>
        <h3 className="text-[16px] font-semibold text-[#000000]">Term Sheet Genie Valuation</h3>
        <div className="text-[#667085]">{isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
      </div>

      {isOpen && (
        <div className="w-full bg-[#f8fafc] p-6 space-y-4 text-[#1e293b]">
          {/* Quick Inputs */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h4 className="text-sm font-bold text-gray-700 mb-4">Quick Valuation Inputs</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {[
                { label: 'Investment Amount ($)', val: investmentAmount, set: setInvestmentAmount, type: 'number' },
                { label: 'Founder Shares', val: founderShares, set: setFounderShares, type: 'number' },
                { label: 'VC Shares', val: vcShares, set: setVcShares, type: 'number' },
                { label: 'Holding Period (Yrs)', val: holdingPeriod, set: setHoldingPeriod, type: 'number' },
                { label: 'Volatility (0-1)', val: volatility, set: setVolatility, type: 'number' },
                { label: 'Risk Free Rate (0-1)', val: riskFreeRate, set: setRiskFreeRate, type: 'number' },
              ].map(({ label, val, set, type }) => (
                <div key={label} className="space-y-1">
                  <label className="text-[11px] font-medium text-gray-500">{label}</label>
                  <input type={type} value={val} onChange={e => set(Number(e.target.value) as any)}
                    className="w-full bg-[#f1f5f9] border-none rounded-lg p-2.5 text-[13px] text-slate-600 focus:ring-2 focus:ring-blue-100 outline-none" />
                </div>
              ))}
            </div>
            <div className="space-y-1 mb-4">
              <label className="text-[11px] font-medium text-gray-500">Subjective Value ($) — optional</label>
              <input type="number" value={subjectiveValue} onChange={e => setSubjectiveValue(Number(e.target.value))}
                className="w-full max-w-xs bg-[#f1f5f9] border-none rounded-lg p-2.5 text-[13px] text-slate-600 focus:ring-2 focus:ring-blue-100 outline-none" />
            </div>
            <button onClick={handleCalculate} disabled={isCalculating}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2">
              {isCalculating ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Calculating...</> : 'Calculate'}
            </button>
          </div>

          {/* Results */}
          {results && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
              <div className="grid grid-cols-2 gap-20">
                <div className="space-y-3">
                  <h3 className="text-[14px] font-semibold text-black mb-4">Simulation Results</h3>
                  {[
                    ['LP Cost', results.lp_cost ?? results.lpCost],
                    ['LP Value', results.lp_value ?? results.lpValue],
                    ['MOIC', results.moic ? `${Number(results.moic).toFixed(2)}x` : null],
                    ['IRR', results.irr ? fmtPct(results.irr) : null],
                  ].filter(([, v]) => v != null).map(([label, val]) => (
                    <div key={String(label)} className="flex justify-between text-[12px] pb-1 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">{label}</span>
                      <span className="font-bold">{typeof val === 'number' ? fmt(val) : val}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <h3 className="text-[14px] font-semibold text-black mb-4">Breakeven Metrics</h3>
                  {[
                    ['Contract Value', results.contract_value ?? results.contractValue],
                    ['Breakeven Exit Value', results.breakeven_exit_value ?? results.breakevenExitValue],
                  ].filter(([, v]) => v != null).map(([label, val]) => (
                    <div key={String(label)} className="flex justify-between text-[12px] pb-1 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">{label}</span>
                      <span className="font-bold text-blue-900">{typeof val === 'number' ? fmt(val) : val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Static sample if no results yet */}
          {!results && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
              <p className="text-sm text-gray-400 text-center">Enter inputs above and click Calculate to see valuation results</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TermSheetGenieValuation;
