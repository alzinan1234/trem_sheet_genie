"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { Download, ArrowLeft, TrendingUp, DollarSign, Percent, Activity, Info, GitCompare } from 'lucide-react';
import {
  calculateExitBreakdown,
  breakevenSingleInvestmentAmount,
  breakevenSingleLiquidationPreference,
  breakevenSingleVcShares,
  breakevenMultipleInvestmentAmount,
  breakevenMultipleLiquidationPreference,
  breakevenMultipleVcShares,
  buildSingleSimulateRequest,
  buildMultipleSimulateParams,
  buildPricedRound,
  buildDebtRound,
} from '@/services/simulationEngine.service';
import toast from 'react-hot-toast';

interface ResultsProps {
  data: any;
  onStepBack: () => void;
}

const COLORS = ['#2D60FF', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
// ×1,000,000 for display (API values are in $M)
const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format((v || 0) * 1_000_000);
const fmtRaw = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v || 0);
const fmtM = (v: number) => `$${((v || 0)).toFixed(1)}M`;
const fmtX = (v: number) => `${Number(v || 0).toFixed(2)}x`;

// ─── Extract Phase 1 (single investment) results ──────────────────────────────
function extractPhase1(d: any) {
  const inv = d?.investor_portfolio || {};
  const found = d?.founder_portfolio || {};
  return {
    // Multiply ×1M for display
    totalContractValue: inv.partial_value ?? null,
    founderValuation: found.partial_value ?? null,
    lpValue: d?.lp_value ?? null,
    gpValuation: d?.gp_valuation ?? null,
    lpCost: d?.lp_cost ?? null,
    investedCapital: d?.invested_capital ?? null,
    foundSubjectiveValue: d?.found_subjective_current_value ?? null,
    // Payoff curves: [{x, y}] — x,y in $M
    investorPoints: inv.points || [],
    founderPoints: found.points || [],
    // For exit breakdown
    investorPortfolio: inv,
    founderPortfolio: found,
    isPhase1: true,
    investorResults: null,
  };
}

// ─── Extract Phase 2 (multiple investments) results ───────────────────────────
function extractPhase2(d: any) {
  const found = d?.founder_portfolio || {};
  const investorResults = d?.investor_results || {};
  // Find the priced round entry (not debt/safe — has lp_value > 0)
  const pricedKey = Object.keys(investorResults).find(k => (investorResults[k]?.lp_value || 0) > 0) || Object.keys(investorResults)[0] || '';
  const priced = investorResults[pricedKey] || {};
  const inv = priced?.investor_portfolio || {};

  return {
    totalContractValue: inv.partial_value ?? null,
    founderValuation: found.partial_value ?? null,
    lpValue: priced?.lp_value ?? null,
    gpValuation: priced?.gp_valuation ?? null,
    lpCost: priced?.lp_cost ?? null,
    investedCapital: priced?.invested_capital ?? null,
    foundSubjectiveValue: null,
    investorPoints: inv.points || [],
    founderPoints: found.points || [],
    investorPortfolio: inv,
    founderPortfolio: found,
    isPhase1: false,
    investorResults,
    pricedKey,
  };
}

// ─── Build chart data from points [{x,y}] ────────────────────────────────────
function buildChartData(investorPoints: any[], founderPoints: any[]) {
  if (investorPoints.length > 0) {
    return investorPoints.map((pt: any, i: number) => ({
      exit: pt.x ?? pt[0] ?? i,
      lpPayoff: pt.y ?? pt[1] ?? 0,
      founderPayoff: founderPoints[i] ? (founderPoints[i].y ?? founderPoints[i][1] ?? 0) : 0,
    }));
  }
  // Illustrative fallback
  return Array.from({ length: 10 }, (_, i) => ({
    exit: (i + 1) * 5,
    lpPayoff: Math.max(0, (i - 1) * 1.2),
    founderPayoff: Math.max(0, (i - 2) * 2.5),
  }));
}

// ─── Build cap table display rows (per API doc response mapping) ──────────────
// /api/create-cap-table response:
//   data.founder_shares × 1,000,000
//   data.uncommitted_options_at_round_end × 1,000,000
//   data.committed_options_at_round_end × 1,000,000
//   data.round_to_investment_class.<round_key>.share_class_investment_rounds[0].vc_shares × 1,000,000
//   data.round_to_investment_class.<round_key>.price_per_share × 1,000,000
function extractCapTableRows(capRes: any) {
  if (!capRes) {
    console.log('[CapTable] No capRes');
    return [];
  }
  
  const d = capRes?.data ?? capRes;
  if (!d || Object.keys(d).length === 0) {
    console.log('[CapTable] Empty data');
    return [];
  }

  const founderShares = Math.round((d?.founder_shares ?? 0) * 1_000_000);
  const uncommitted = Math.round((d?.uncommitted_options_at_round_end ?? 0) * 1_000_000);
  const committed = Math.round((d?.committed_options_at_round_end ?? 0) * 1_000_000);
  const roundToInv = d?.round_to_investment_class || {};

  const rows: any[] = [];
  
  if (founderShares > 0) {
    rows.push({ name: 'Founders', shares: founderShares, type: 'Common Stock', pricePerShare: null });
  }
  if (uncommitted > 0) {
    rows.push({ name: 'Unallocated Options', shares: uncommitted, type: 'Options', pricePerShare: null });
  }
  if (committed > 0) {
    rows.push({ name: 'Allocated Options', shares: committed, type: 'Options', pricePerShare: null });
  }

  // Process each round - take ONLY share_class_investment_rounds[0]
  Object.entries(roundToInv).forEach(([roundId, roundData]: [string, any]) => {
    const shareClasses = roundData?.share_class_investment_rounds || [];
    const pricePerShare = (roundData?.price_per_share ?? 0) * 1_000_000;
    
    if (shareClasses.length > 0) {
      const sc = shareClasses[0];
      const vcShares = Math.round((sc?.vc_shares ?? 0) * 1_000_000);
      const investmentId = sc?.id || '';
      
      if (vcShares > 0 && vcShares < 1_000_000_000) {
        let displayName = roundId;
        if (investmentId === 'Round A') displayName = 'Series A';
        else if (investmentId === 'Round B') displayName = 'Series B';
        else if (investmentId === 'Round C') displayName = 'Series C';
        else if (!roundId.includes('-')) {
          displayName = roundId.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
        }
        
        rows.push({ 
          name: displayName, 
          shares: vcShares, 
          type: 'Preferred', 
          pricePerShare: pricePerShare > 0 ? pricePerShare : null 
        });
      }
    }
  });

  const totalShares = rows.reduce((sum, row) => sum + row.shares, 0);
  rows.forEach(row => {
    row.ownership = totalShares > 0 ? ((row.shares / totalShares) * 100).toFixed(2) + '%' : '0%';
  });

  return rows;
}

const SimulationResults: React.FC<ResultsProps> = ({ data, onStepBack }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'capTable' | 'breakeven' | 'exit'>('overview');
  const [exitValue, setExitValue] = useState<number>(50);
  const [exitBreakdownResult, setExitBreakdownResult] = useState<any>(null);
  const [isCalcExit, setIsCalcExit] = useState(false);
  const [breakevenVar, setBreakevenVar] = useState('investment-amount');
  const [breakevenResult, setBreakevenResult] = useState<any>(null);
  const [isCalcBreakeven, setIsCalcBreakeven] = useState(false);
  const [subjectivePmv, setSubjectivePmv] = useState('');

  const simRes = data?.simResult;
  const capTableResult = data?.capTableResult;
  const cv = data?.contractValuation || {};
  const pricedRounds = data?.pricedRounds || [];
  const debtRounds = data?.debtRounds || [];
  const safeNotes = data?.safeNotes || [];
  const hasDebtOrSafe = debtRounds.length > 0 || safeNotes.length > 0;

  const rawData = simRes?.data ?? simRes ?? {};
  const parsed = hasDebtOrSafe ? extractPhase2(rawData) : extractPhase1(rawData);
  const chartData = buildChartData(parsed.investorPoints, parsed.founderPoints);
  const capRows = extractCapTableRows(capTableResult);

  const simName = data?.name || 'Simulation Results';
  const fundName = data?.fundName || '—';
  const portfolio = data?.portfolioCompany || '—';
  const hasRealData = parsed.lpCost !== null;

  // Build simulate request for breakeven calls
  const buildSimulateBody = () => {
    // data.fund is the full fund object (loaded from sessionStorage/localStorage with fund params)
    // data itself may be the fund if loaded from older storage format — check committedCapital
    const fund = (data?.fund && Number(data.fund?.committedCapital) > 0)
      ? data.fund
      : (Number(data?.committedCapital) > 0 ? data : null);

    if (!fund || !Number(fund?.committedCapital)) {
      toast.error('Fund data missing — please go back and re-run the simulation from Step 1.');
      return null;
    }
    const currentPricedRound = pricedRounds.length > 0
      ? buildPricedRound(pricedRounds[pricedRounds.length - 1], 1, fund)
      : null;
    if (!currentPricedRound) return null;
    const builtDebtRounds = debtRounds.map((d: any, i: number) => buildDebtRound(d, i + 1));
    const pmv = Number(subjectivePmv || cv.subjectivePostMoneyValuation || 0);
    const cvWithPmv = { ...cv, subjectivePostMoneyValuation: pmv };

    if (!hasDebtOrSafe) {
      return { type: 'single', body: { ...buildSingleSimulateRequest(data, currentPricedRound, cvWithPmv), subjective_current_value: pmv } };
    } else {
      const params = buildMultipleSimulateParams(data, currentPricedRound, builtDebtRounds, safeNotes, cvWithPmv);
      return { type: 'multiple', params: { ...params, subjectiveCurrentValue: pmv } };
    }
  };

// ── Exit Breakdown ──────────────────────────────────────────────────────────
const handleExitBreakdown = async () => {
  setIsCalcExit(true);
  const toastId = toast.loading('Calculating exit breakdown...');
  try {
    // Convert [{x,y}] → [[x,y]] with strictly ascending x deduplication
    const toArray = (pts: any[]): [number, number][] => {
      const arr = pts.map((p: any) => [+(p.x ?? p[0] ?? 0), +(p.y ?? p[1] ?? 0)] as [number, number]);
      const deduped: [number, number][] = [];
      let lastX = -Infinity;
      for (const pt of arr) {
        if (pt[0] > lastX) {
          deduped.push(pt);
          lastX = pt[0];
        }
      }
      return deduped;
    };
    let investorExitDetails: any[] = [];

    if (!hasDebtOrSafe) {
      // Phase 1
      investorExitDetails = [{
        name: pricedRounds[0]?.roundName || 'series-a',
        investmentAmount: Number(pricedRounds[0]?.investmentAmount || 0) / 1_000_000,
        performanceFee: Number(data?.carryPercentage || data?.fund?.carryPercentage || 20) / 100,
        investorPoints: toArray(parsed.investorPoints),
      }];
    } else {
      // Phase 2 — one entry per investor_results key
      investorExitDetails = Object.entries(rawData.investor_results || {}).map(([id, r]: [string, any]) => ({
        name: id,
        investmentAmount: id.startsWith('debt') || id.startsWith('safe')
          ? Number(safeNotes.find((s: any) => s.id === id)?.amount || debtRounds.find((d: any) => d.id === id)?.principalAmount || 0) / 1_000_000
          : Number(pricedRounds[pricedRounds.length - 1]?.investmentAmount || 0) / 1_000_000,
        performanceFee: id.startsWith('debt') || id.startsWith('safe') ? 0 : Number(data?.fund?.carryPercentage || 20) / 100,
        investorPoints: toArray(r?.investor_portfolio?.points || []),
      }));
    }

    // ✅ FIX: exitValue ÷ 1,000,000 (API expects $M)
    const res = await calculateExitBreakdown({
      exitValue: exitValue / 1_000_000,
      investorExitDetails,
      founderPoints: toArray(parsed.founderPoints),
    });
    setExitBreakdownResult(res?.data ?? res);
    toast.success('Exit breakdown calculated!', { id: toastId });
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Exit breakdown failed', { id: toastId });
  } finally {
    setIsCalcExit(false);
  }
};

  // ── Breakeven ───────────────────────────────────────────────────────────────
  const handleBreakeven = async () => {
    const pmv = Number(subjectivePmv || cv.subjectivePostMoneyValuation || 0);
    if (!pmv) {
      toast.error('Please enter a Subjective Post Money Valuation ($M) to calculate breakeven');
      return;
    }
    setIsCalcBreakeven(true);
    const toastId = toast.loading('Calculating breakeven...');
    try {
      const built = buildSimulateBody();
      if (!built) { toast.error('No priced round data', { id: toastId }); setIsCalcBreakeven(false); return; }

      let res: any;
      if (built.type === 'single') {
        if (breakevenVar === 'investment-amount') res = await breakevenSingleInvestmentAmount(built.body);
        else if (breakevenVar === 'liquidation-preference-multiple') res = await breakevenSingleLiquidationPreference(built.body);
        else res = await breakevenSingleVcShares(built.body);
      } else {
        if (breakevenVar === 'investment-amount') res = await breakevenMultipleInvestmentAmount(built.params);
        else if (breakevenVar === 'liquidation-preference-multiple') res = await breakevenMultipleLiquidationPreference(built.params);
        else res = await breakevenMultipleVcShares(built.params);
      }
      setBreakevenResult(res?.data ?? res);
      toast.success('Breakeven calculated!', { id: toastId });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.response?.data?.error?.message || 'Breakeven failed', { id: toastId });
    } finally {
      setIsCalcBreakeven(false);
    }
  };

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'capTable', label: 'Cap Table' },
    { key: 'breakeven', label: 'Breakeven Analysis' },
    { key: 'exit', label: 'Exit Breakdown' },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onStepBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"><ArrowLeft size={20} /></button>
          <div>
            <h1 className="text-xl font-bold text-[#101828]">{simName}</h1>
            <p className="text-sm text-[#667085]">{fundName} · {portfolio} · {hasDebtOrSafe ? 'Phase 2 (Multiple Investments)' : 'Phase 1 (Single Investment)'}</p>
          </div>
          {!hasRealData && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full text-xs font-medium">
              <Info size={12} /> Complete steps 1–4 for real results
            </div>
          )}
          {hasRealData && (
            <div className="px-3 py-1 bg-green-50 text-green-700 border border-green-100 rounded-full text-xs font-medium">✓ Live results</div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/investor-admin/simulation-comparison')}
            className="flex items-center gap-2 bg-white border border-[#2D60FF] text-[#2D60FF] px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-50 transition-all active:scale-95"
          >
            <GitCompare size={16} /> Compare Scenarios
          </button>
          <button className="flex items-center gap-2 bg-[#2D60FF] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all active:scale-95">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 px-8">
        <div className="flex">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`px-5 py-4 text-sm font-medium transition-all relative ${activeTab === tab.key ? 'text-[#2D60FF]' : 'text-[#667085] hover:text-[#344054]'}`}>
              {tab.label}
              {activeTab === tab.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2D60FF] rounded-t" />}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8 space-y-8">

        {/* ── OVERVIEW ─────────────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics — API values in $M, multiply ×1M for display */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <MetricCard icon={<DollarSign size={20} className="text-blue-600" />} label="LP Cost" value={parsed.lpCost !== null ? fmt(parsed.lpCost) : '—'} color="blue" />
              <MetricCard icon={<TrendingUp size={20} className="text-green-600" />} label="LP Value" value={parsed.lpValue !== null ? fmt(parsed.lpValue) : '—'} color="green" />
              <MetricCard icon={<Activity size={20} className="text-purple-600" />} label="Total Contract Value" value={parsed.totalContractValue !== null ? fmt(parsed.totalContractValue) : '—'} color="purple" />
              <MetricCard icon={<Percent size={20} className="text-orange-600" />} label="GP Valuation" value={parsed.gpValuation !== null ? fmt(parsed.gpValuation) : '—'} color="orange" />
            </div>

            {/* Secondary metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {parsed.founderValuation !== null && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-xs font-bold text-[#667085] uppercase tracking-wider mb-1">Founder Valuation</p>
                  <p className="text-2xl font-bold text-[#101828]">{fmt(parsed.founderValuation)}</p>
                </div>
              )}
              {parsed.investedCapital !== null && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-xs font-bold text-[#667085] uppercase tracking-wider mb-1">Invested Capital</p>
                  <p className="text-2xl font-bold text-[#101828]">{fmt(parsed.investedCapital)}</p>
                </div>
              )}
              {parsed.foundSubjectiveValue !== null && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-xs font-bold text-[#667085] uppercase tracking-wider mb-1">Subjective Current Value</p>
                  <p className="text-2xl font-bold text-[#101828]">{fmt(parsed.foundSubjectiveValue)}</p>
                </div>
              )}
            </div>

            {/* Payoff Curve */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-[#101828]">Exit Waterfall Distribution</h3>
                  <p className="text-sm text-[#667085] mt-0.5">Investor vs Founder payoff across exit values</p>
                </div>
                {!hasRealData && <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-100">Illustrative</span>}
              </div>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="lpGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2D60FF" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#2D60FF" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="fGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F4F7" />
                    <XAxis dataKey="exit" tickFormatter={v => fmtM(v)} tick={{ fontSize: 11, fill: '#667085' }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v => fmtM(v)} tick={{ fontSize: 11, fill: '#667085' }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v: any, name: any) => [fmt(v), String(name || '')]} labelFormatter={v => `Exit: ${fmtM(v)}`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: '13px' }} />
                    <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '16px' }} />
                    <Area type="monotone" dataKey="lpPayoff" name="Investor Payoff" stroke="#2D60FF" fill="url(#lpGrad)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                    <Area type="monotone" dataKey="founderPayoff" name="Founder Payoff" stroke="#22C55E" fill="url(#fGrad)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Simulation Inputs Summary */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-[#101828] mb-4">Simulation Inputs</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  ['Type', hasDebtOrSafe ? 'Multiple Investments' : 'Single Investment'],
                  ['Holding Period', `${cv.expectedTimeToExit || '—'} Years`],
                  ['Volatility', cv.volatility || '—'],
                  ['Risk Free Rate', `${cv.riskFreeRate || '—'}%`],
                  ['Vol. Around Holding Period', `${cv.volatilityHoldingPeriod || '—'} Years`],
                  ['Subjective PMV', cv.subjectivePostMoneyValuation > 0 ? `$${cv.subjectivePostMoneyValuation}M` : 'Not provided'],
                ].map(([label, value]) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-[#667085] mb-1">{label}</p>
                    <p className="text-sm font-bold text-[#101828]">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CAP TABLE ────────────────────────────────────────────────────── */}
        {activeTab === 'capTable' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50">
                <h3 className="text-lg font-bold text-[#101828]">Pre-Simulation Cap Table</h3>
                <p className="text-sm text-[#667085]">Source: /api/create-cap-table</p>
              </div>
              {capRows.length > 0 ? (
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-[11px] text-[#667085] uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3">Shareholder</th>
                      <th className="px-6 py-3 text-right">Shares</th>
                      <th className="px-6 py-3 text-right">Ownership %</th>
                      <th className="px-6 py-3 text-right">Type</th>
                      <th className="px-6 py-3 text-right">Price/Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {capRows.map((row: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-[#101828]">{row.name}</td>
                        <td className="px-6 py-4 text-right text-[#475467]">{Number(row.shares || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 text-right font-bold text-[#101828]">{row.ownership}</td>
                        <td className="px-6 py-4 text-right text-[#475467]">{row.type}</td>
                        <td className="px-6 py-4 text-right text-[#475467]">{row.pricePerShare ? fmtRaw(row.pricePerShare) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center text-gray-400">
                  Cap table data will appear here after completing the simulation steps with investment round data.
                </div>
              )}
            </div>

            {/* Phase 2: investor_results per round */}
            {!parsed.isPhase1 && parsed.investorResults && Object.keys(parsed.investorResults).length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50">
                  <h3 className="text-lg font-bold text-[#101828]">Investor Results by Round</h3>
                </div>
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-[11px] text-[#667085] uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3">Round</th>
                      <th className="px-6 py-3 text-right">Partial Value</th>
                      <th className="px-6 py-3 text-right">LP Value</th>
                      <th className="px-6 py-3 text-right">GP Value</th>
                      <th className="px-6 py-3 text-right">LP Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {Object.entries(parsed.investorResults).map(([id, r]: [string, any]) => (
                      <tr key={id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-[#101828]">{id}</td>
                        <td className="px-6 py-4 text-right text-[#475467]">{fmt(r?.investor_portfolio?.partial_value)}</td>
                        <td className="px-6 py-4 text-right text-[#475467]">{fmt(r?.lp_value)}</td>
                        <td className="px-6 py-4 text-right text-[#475467]">{fmt(r?.gp_valuation)}</td>
                        <td className="px-6 py-4 text-right text-[#475467]">{fmt(r?.lp_cost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── BREAKEVEN ────────────────────────────────────────────────────── */}
        {activeTab === 'breakeven' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-[#101828] mb-4">Breakeven Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="text-xs font-bold text-[#344054] uppercase tracking-wider block mb-2">Breakeven Variable</label>
                  <select value={breakevenVar} onChange={e => setBreakevenVar(e.target.value)}
                    className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#EAECF0] rounded-xl text-sm outline-none focus:border-[#2D60FF]">
                    <option value="investment-amount">Investment Amount</option>
                    <option value="liquidation-preference-multiple">Liquidation Preference Multiple</option>
                    <option value="vc-shares">Investor Shares</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#344054] uppercase tracking-wider block mb-2">Subjective PMV ($M) *required</label>
                  <input type="number" value={subjectivePmv} onChange={e => setSubjectivePmv(e.target.value)}
                    placeholder={String(cv.subjectivePostMoneyValuation || '50')}
                    className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#EAECF0] rounded-xl text-sm outline-none focus:border-[#2D60FF]" />
                </div>
                <div className="flex items-end">
                  <button onClick={handleBreakeven} disabled={isCalcBreakeven}
                    className="w-full px-6 py-3 bg-[#2D60FF] hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                    {isCalcBreakeven ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Calculating...</> : 'Calculate Breakeven'}
                  </button>
                </div>
              </div>

              {/* Summary from sim response */}
              {hasRealData && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                  {[
                    ['Total Contract Value', parsed.totalContractValue !== null ? fmt(parsed.totalContractValue) : '—'],
                    ['Founder Valuation', parsed.founderValuation !== null ? fmt(parsed.founderValuation) : '—'],
                    ['LP Valuation', parsed.lpValue !== null ? fmt(parsed.lpValue) : '—'],
                    ['GP Valuation', parsed.gpValuation !== null ? fmt(parsed.gpValuation) : '—'],
                    ['LP Cost', parsed.lpCost !== null ? fmt(parsed.lpCost) : '—'],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-xs text-[#667085] mb-0.5">{label}</p>
                      <p className="text-sm font-bold text-[#101828]">{value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Breakeven Result */}
              {breakevenResult && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                  <h4 className="text-sm font-bold text-blue-800 mb-3">Breakeven Result</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {breakevenResult.breakeven_vc_shares != null && (
                      <div>
                        <p className="text-xs text-blue-600 mb-1">Breakeven Investor Shares</p>
                        <p className="text-xl font-bold text-blue-900">{(breakevenResult.breakeven_vc_shares * 1_000_000).toLocaleString()}</p>
                      </div>
                    )}
                    {breakevenResult.breakeven_investment_amount != null && (
                      <div>
                        <p className="text-xs text-blue-600 mb-1">Breakeven Investment Amount</p>
                        <p className="text-xl font-bold text-blue-900">{fmt(breakevenResult.breakeven_investment_amount)}</p>
                      </div>
                    )}
                    {breakevenResult.breakeven_liquidation_preference_multiple != null && (
                      <div>
                        <p className="text-xs text-blue-600 mb-1">Breakeven Liq. Preference</p>
                        <p className="text-xl font-bold text-blue-900">{Number(breakevenResult.breakeven_liquidation_preference_multiple).toFixed(2)}x</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Breakeven table */}
              {pricedRounds.length > 0 && (
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-sm text-left border border-gray-100 rounded-xl overflow-hidden">
                    <thead className="bg-gray-50 text-[11px] text-[#667085] uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Round</th>
                        <th className="px-4 py-3 text-right">Ownership</th>
                        <th className="px-4 py-3 text-right">Investment Amount</th>
                        <th className="px-4 py-3 text-right">Liq. Pref</th>
                        <th className="px-4 py-3 text-right">Participation</th>
                        <th className="px-4 py-3 text-right">Seniority</th>
                        <th className="px-4 py-3 text-right">Breakeven Val</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {pricedRounds.map((round: any, i: number) => {
                        const bkVal = breakevenResult?.breakeven_investment_amount ?? breakevenResult?.breakeven_vc_shares ?? breakevenResult?.breakeven_liquidation_preference_multiple;
                        return (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-[#101828]">{round.roundName || round.name || `Round ${i + 1}`}</td>
                            <td className="px-4 py-3 text-right text-[#475467]">{Number(round.vcShares || round.ownership || 0).toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-[#475467]">{fmtRaw(Number(round.investmentAmount || 0))}</td>
                            <td className="px-4 py-3 text-right text-[#475467]">{Number(round.liquidationPreference || 1).toFixed(1)}x</td>
                            <td className="px-4 py-3 text-right text-[#475467]">{(round.participation || round.participationType || 'Converting').includes('Convert') ? 'Non-Participating' : 'Participating'}</td>
                            <td className="px-4 py-3 text-right text-[#475467]">Senior</td>
                            <td className="px-4 py-3 text-right font-bold text-[#2D60FF]">{bkVal != null ? fmt(bkVal) : '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── EXIT BREAKDOWN ───────────────────────────────────────────────── */}
        {activeTab === 'exit' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-[#101828] mb-4">Exit Breakdown</h3>
              <div className="flex items-end gap-4 mb-6">
                <div className="flex-1">
                  <label className="text-xs font-bold text-[#344054] uppercase tracking-wider block mb-2">Exit Value ($M)</label>
                  <input type="number" value={exitValue} onChange={e => setExitValue(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#EAECF0] rounded-xl text-sm outline-none focus:border-[#2D60FF]" />
                </div>
                <button onClick={handleExitBreakdown} disabled={isCalcExit || !hasRealData}
                  className="px-6 py-3 bg-[#2D60FF] hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-60 flex items-center gap-2">
                  {isCalcExit ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Calculating...</> : 'Calculate'}
                </button>
              </div>

              {/* Waterfall bar chart */}
              <div className="h-[280px] mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.slice(0, 10)} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F4F7" />
                    <XAxis dataKey="exit" tickFormatter={v => fmtM(v)} tick={{ fontSize: 11, fill: '#667085' }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v => fmtM(v)} tick={{ fontSize: 11, fill: '#667085' }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v: any, name: any) => [fmt(v), String(name || '')]} labelFormatter={v => `Exit: ${fmtM(v)}`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: '13px' }} />
                    <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '16px' }} />
                    <Bar dataKey="lpPayoff" name="Investor Payoff" fill="#2D60FF" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="founderPayoff" name="Founder Payoff" fill="#22C55E" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {exitBreakdownResult && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border border-gray-100 rounded-xl overflow-hidden">
                    <thead className="bg-gray-50 text-[11px] text-[#667085] uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-3">Party</th>
                        <th className="px-6 py-3 text-right">Exit Value</th>
                        <th className="px-6 py-3 text-right">LP Share</th>
                        <th className="px-6 py-3 text-right">GP Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-[#101828]">Founders</td>
                        <td className="px-6 py-4 text-right">{exitBreakdownResult.founderExitValue != null ? fmt(exitBreakdownResult.founderExitValue) : '—'}</td>
                        <td className="px-6 py-4 text-right text-[#475467]">—</td>
                        <td className="px-6 py-4 text-right text-[#475467]">—</td>
                      </tr>
                      {Object.entries(exitBreakdownResult.investors || {}).map(([id, inv]: [string, any]) => (
                        <tr key={id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-[#101828]">{id}</td>
                          <td className="px-6 py-4 text-right">{inv.investorExitValue != null ? fmt(inv.investorExitValue) : '—'}</td>
                          <td className="px-6 py-4 text-right text-[#475467]">{inv.lpShare != null ? fmt(inv.lpShare) : '—'}</td>
                          <td className="px-6 py-4 text-right text-[#475467]">{inv.gpShare != null ? fmt(inv.gpShare) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!exitBreakdownResult && hasRealData && (
                <p className="text-sm text-gray-400 text-center py-6">Select an exit value and click Calculate to see the breakdown</p>
              )}
              {!hasRealData && (
                <p className="text-sm text-gray-400 text-center py-6">Complete the simulation steps to enable exit breakdown</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
// ── MetricCard ──────────────────────────────────────────────────────────────
const MetricCard = ({ icon, label, value, color }: any) => {
  const bg: Record<string, string> = { blue: 'bg-blue-50', green: 'bg-green-50', purple: 'bg-purple-50', orange: 'bg-orange-50' };
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 ${bg[color]} rounded-xl flex items-center justify-center mb-4`}>{icon}</div>
      <p className="text-2xl font-bold text-[#101828] mb-1">{value}</p>
      <p className="text-xs font-semibold text-[#667085] uppercase tracking-wider">{label}</p>
    </div>
  );
};

export default SimulationResults;