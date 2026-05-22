"use client";
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  simulateSingleInvestment,
  simulateSingleInvestmentWithValuation,
} from '@/services/simulationEngine.service';
import toast from 'react-hot-toast';

const TermSheetGenieValuation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState<any>(null);

  // All inputs are in human-readable units (raw $, raw shares, %)
  // Conversion to API units ($M, decimals) happens at call time per API doc
  const [investmentAmount, setInvestmentAmount] = useState(10000000);   // $
  const [founderShares, setFounderShares]     = useState(9000000);      // raw count
  const [vcShares, setVcShares]               = useState(1000000);      // raw count
  const [committedCapital, setCommittedCapital] = useState(100000000);  // $
  const [holdingPeriod, setHoldingPeriod]     = useState(5);            // years
  const [volatilityPct, setVolatilityPct]     = useState(80);           // %  (e.g. 80 = 80%)
  const [riskFreeRatePct, setRiskFreeRatePct] = useState(5);            // %  (e.g. 5 = 5%)
  const [moic, setMoic]                       = useState(2.5);
  const [performanceFeePct, setPerformanceFeePct] = useState(20);       // %
  const [subjectiveValueM, setSubjectiveValueM]   = useState(0);        // already in $M

  const fmt  = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v || 0);
  const fmtM = (v: number) => fmt((v || 0) * 1_000_000); // API returns in $M

  const handleCalculate = async () => {
    setIsCalculating(true);
    const toastId = toast.loading('Calculating valuation...');
    try {
      // Per API doc: all monetary values ÷ 1,000,000, rates ÷ 100
      // antidilution must be object
      const investment_round: any = {
        id: 'series-a',
        investment_type: 'convertible preferred',
        investment_amount: investmentAmount / 1_000_000,       // ÷1M
        vc_shares: vcShares / 1_000_000,                       // ÷1M
        liquidation_preference_multiple: 1.0,
        dividend_type: 'none',
        annual_dividend_rate: 0,
        antidilution: {
          has_antidilution: false,
          includes_preferred_shares: false,
          includes_common_shares: false,
          includes_unpriced_round_conversions: false,
        },
        investment_date: new Date().toISOString().split('T')[0],
        seniority: 1,
        // Fund params — all per API doc
        committed_capital: committedCapital / 1_000_000,       // ÷1M
        commitment_period: 10,
        commitment_period_mgmt_fee: 0.02,
        post_commitment_period_mgmt_fee: 0.015,
        performance_fee: performanceFeePct > 1 ? performanceFeePct / 100 : performanceFeePct,
        moic,
        fund_lifetime: 10,
      };

      const body: any = {
        investment_round,
        founder_shares: founderShares / 1_000_000,             // ÷1M
        committed_options_before_round: 0,
        uncommitted_options_before_round: 0,
        holding_period: holdingPeriod,
        volatility_around_holding_period: holdingPeriod * 0.2,
        volatility: volatilityPct / 100,                       // ÷100
        risk_free_rate: riskFreeRatePct / 100,                 // ÷100
      };

      if (subjectiveValueM > 0) {
        // subjective_current_value already in $M per API doc — no conversion
        body.subjective_current_value = subjectiveValueM;
      }

      console.log('[TSGValuation Request]', JSON.stringify(body, null, 2));
      const res = subjectiveValueM > 0
        ? await simulateSingleInvestmentWithValuation(body)
        : await simulateSingleInvestment(body);

      console.log('[TSGValuation Response]', res);

      if (res?.success && res?.data) {
        setResults(res.data);
        toast.success('Valuation calculated!', { id: toastId });
      } else {
        toast.dismiss(toastId);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || 'Calculation failed';
      toast.error(msg, { id: toastId });
      console.error('[TSGValuation Error]', err?.response?.data || err);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm font-sans overflow-hidden">
      <div
        className="px-6 py-4 border-b border-gray-50 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-[16px] font-semibold text-[#000000]">Term Sheet Genie Valuation</h3>
        <div className="text-[#667085]">{isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
      </div>

      {isOpen && (
        <div className="w-full bg-[#f8fafc] p-6 space-y-4 text-[#1e293b]">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h4 className="text-sm font-bold text-gray-700 mb-4">Quick Valuation Inputs</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {[
                { label: 'Investment Amount ($)', val: investmentAmount,   set: setInvestmentAmount },
                { label: 'Founder Shares',         val: founderShares,     set: setFounderShares },
                { label: 'VC Shares',              val: vcShares,          set: setVcShares },
                { label: 'Fund Committed Capital ($)', val: committedCapital, set: setCommittedCapital },
                { label: 'Holding Period (Yrs)',   val: holdingPeriod,     set: setHoldingPeriod },
                { label: 'Volatility (%)',          val: volatilityPct,    set: setVolatilityPct },
                { label: 'Risk Free Rate (%)',      val: riskFreeRatePct,  set: setRiskFreeRatePct },
                { label: 'Performance Fee (%)',     val: performanceFeePct,set: setPerformanceFeePct },
                { label: 'MOIC',                   val: moic,             set: setMoic },
              ].map(({ label, val, set }) => (
                <div key={label} className="space-y-1">
                  <label className="text-[11px] font-medium text-gray-500">{label}</label>
                  <input
                    type="number"
                    value={val}
                    onChange={e => set(Number(e.target.value) as any)}
                    className="w-full bg-[#f1f5f9] border-none rounded-lg p-2.5 text-[13px] text-slate-600 focus:ring-2 focus:ring-blue-100 outline-none"
                  />
                </div>
              ))}
            </div>
            <div className="space-y-1 mb-4">
              <label className="text-[11px] font-medium text-gray-500">Subjective Post-Money Valuation ($M) — optional</label>
              <input
                type="number"
                value={subjectiveValueM}
                onChange={e => setSubjectiveValueM(Number(e.target.value))}
                placeholder="e.g. 50 for $50M"
                className="w-full max-w-xs bg-[#f1f5f9] border-none rounded-lg p-2.5 text-[13px] text-slate-600 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
            <button
              onClick={handleCalculate}
              disabled={isCalculating}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2"
            >
              {isCalculating
                ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Calculating...</>
                : 'Calculate'
              }
            </button>
          </div>

          {results && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
              <div className="grid grid-cols-2 gap-12">
                {/* Investor Results */}
                <div className="space-y-3">
                  <h3 className="text-[14px] font-semibold text-black mb-4">Investor Results</h3>
                  {[
                    // Per API doc response: lp_cost, lp_value, gp_valuation — all in $M → ×1M to display
                    { label: 'LP Cost',            val: results.lp_cost != null ? fmtM(results.lp_cost) : null },
                    { label: 'LP Value',           val: results.lp_value != null ? fmtM(results.lp_value) : null },
                    { label: 'GP Valuation',       val: results.gp_valuation != null ? fmtM(results.gp_valuation) : null },
                    { label: 'Invested Capital',   val: results.invested_capital != null ? fmtM(results.invested_capital) : null },
                    { label: 'Contract Value',     val: results.investor_portfolio?.partial_value != null ? fmtM(results.investor_portfolio.partial_value) : null },
                  ].filter(r => r.val != null).map(({ label, val }) => (
                    <div key={label} className="flex justify-between text-[12px] pb-1 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">{label}</span>
                      <span className="font-bold">{val}</span>
                    </div>
                  ))}
                </div>
                {/* Founder Results */}
                <div className="space-y-3">
                  <h3 className="text-[14px] font-semibold text-black mb-4">Founder Results</h3>
                  {[
                    { label: 'Founder Valuation',  val: results.founder_portfolio?.partial_value != null ? fmtM(results.founder_portfolio.partial_value) : null },
                    { label: 'Subjective Value',   val: results.found_subjective_current_value != null ? fmtM(results.found_subjective_current_value) : null },
                  ].filter(r => r.val != null).map(({ label, val }) => (
                    <div key={label} className="flex justify-between text-[12px] pb-1 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">{label}</span>
                      <span className="font-bold text-blue-900">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

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
