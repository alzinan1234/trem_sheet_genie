"use client";
import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { calculateExitBreakdown } from '@/services/simulationEngine.service';
import toast from 'react-hot-toast';

interface ExitRow {
  name: string;
  exitValue: string;
  ownership: string;
  price: string;
  lpValue: string;
  gpValue: string;
}

const CalculateExitBreakdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [exitValue, setExitValue] = useState(50000000);
  const [exitTiming, setExitTiming] = useState(5);
  const [exitType, setExitType] = useState('M&A');
  const [isCalculating, setIsCalculating] = useState(false);
  const [tableData, setTableData] = useState<ExitRow[]>([
    { name: 'Series A', exitValue: '$12,500,000', ownership: '25.00%', price: '$2.50', lpValue: '$11,250,000', gpValue: '$1,250,000' },
    { name: 'Series B', exitValue: '$17,500,000', ownership: '35.00%', price: '$3.50', lpValue: '$15,750,000', gpValue: '$1,750,000' },
    { name: 'Founders', exitValue: '$20,000,000', ownership: '40.00%', price: '$4.00', lpValue: '-', gpValue: '-' },
  ]);
  const [hasRealData, setHasRealData] = useState(false);

  const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

  const handleCalculate = async () => {
    setIsCalculating(true);
    const toastId = toast.loading('Calculating exit breakdown...');
    try {
      // Build payoff points based on exit value
      const founderPoints: number[][] = [
        [0, 0],
        [exitValue * 0.3, 0],
        [exitValue, exitValue * 0.4],
      ];
      const investorPoints: number[][] = [
        [0, 0],
        [exitValue * 0.3, exitValue * 0.3],
        [exitValue, exitValue * 0.6],
      ];

      const res = await calculateExitBreakdown({
        exitValue,
        founderPoints,
        investorExitDetails: [
          {
            name: 'Series A Investor',
            investmentAmount: exitValue * 0.25,
            performanceFee: 0.2,
            investorPoints,
          },
          {
            name: 'Series B Investor',
            investmentAmount: exitValue * 0.35,
            performanceFee: 0.2,
            investorPoints: investorPoints.map(([x, y]) => [x, y * 1.4]),
          },
        ],
      });

      if (res?.success && res?.data) {
        const data = res.data;
        const breakdown = data.breakdown || data.investors || data.exit_breakdown || [];
        if (breakdown.length > 0) {
          const mapped: ExitRow[] = breakdown.map((item: any) => ({
            name: item.name || item.investor || 'Investor',
            exitValue: fmt(item.proceeds || item.exit_value || item.total || 0),
            ownership: `${((item.ownership || item.ownership_pct || 0) * 100).toFixed(2)}%`,
            price: item.price_per_share ? fmt(item.price_per_share) : '—',
            lpValue: item.lp_value ? fmt(item.lp_value) : fmt(item.proceeds || 0),
            gpValue: item.gp_value ? fmt(item.gp_value) : '—',
          }));
          // Add founders
          mapped.push({
            name: 'Founders',
            exitValue: fmt(data.founder_proceeds || exitValue * 0.4),
            ownership: `${((data.founder_ownership || 0.4) * 100).toFixed(2)}%`,
            price: '—',
            lpValue: '—',
            gpValue: '—',
          });
          setTableData(mapped);
          setHasRealData(true);
        }
        toast.success('Exit breakdown calculated!', { id: toastId });
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
        <h3 className="text-[16px] font-semibold text-[#000000]">Calculate Exit Breakdown</h3>
        <div className="text-[#667085]">{isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
      </div>

      {isOpen && (
        <div className="p-6">
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-[11px] text-gray-500 font-medium">Exit Value ($)</label>
              <input type="number" value={exitValue} onChange={e => setExitValue(Number(e.target.value))}
                className="w-full bg-[#f1f5f9] border-none rounded-lg p-3 text-[13px] text-slate-600 focus:ring-2 focus:ring-blue-100 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] text-gray-500 font-medium">Exit Timing (years)</label>
              <input type="number" value={exitTiming} onChange={e => setExitTiming(Number(e.target.value))}
                className="w-full bg-[#f1f5f9] border-none rounded-lg p-3 text-[13px] text-slate-600 focus:ring-2 focus:ring-blue-100 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] text-gray-500 font-medium">Exit Type</label>
              <select value={exitType} onChange={e => setExitType(e.target.value)}
                className="w-full bg-[#f1f5f9] border-none rounded-lg p-3 text-[13px] text-slate-600 focus:ring-2 focus:ring-blue-100 outline-none appearance-none">
                <option>M&A</option>
                <option>IPO</option>
              </select>
            </div>
          </div>

          <button onClick={handleCalculate} disabled={isCalculating}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-[13px] font-semibold hover:bg-blue-700 transition-colors mb-8 disabled:opacity-60 flex items-center gap-2">
            {isCalculating ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Calculating...</>
            ) : 'Calculate'}
          </button>

          {!hasRealData && (
            <div className="mb-4 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-700">
              Showing sample data — click Calculate to get real exit breakdown from the simulation engine
            </div>
          )}

          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full text-[12px] border-collapse">
              <thead className="bg-white border-b border-gray-100">
                <tr className="text-gray-500 text-left">
                  <th className="px-6 py-4 font-semibold uppercase tracking-tight">Shareholders</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-tight text-right">Total Exit Value</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-tight text-right">Effective Ownership</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-tight text-right">Effective Price/Share</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-tight text-right">LP Exit Value</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-tight text-right">GP Exit Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tableData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5 font-medium text-slate-700">{row.name}</td>
                    <td className="px-6 py-5 text-right text-slate-600">{row.exitValue}</td>
                    <td className="px-6 py-5 text-right text-slate-600">{row.ownership}</td>
                    <td className="px-6 py-5 text-right text-slate-600">{row.price}</td>
                    <td className="px-6 py-5 text-right text-slate-600">{row.lpValue}</td>
                    <td className="px-6 py-5 text-right text-slate-600">{row.gpValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalculateExitBreakdown;
