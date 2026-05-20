import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const BreakevenAnalysisComponent: React.FC = () => {
  const [isSeriesAExpanded, setIsSeriesAExpanded] = useState(true);

  return (
    <div className="w-full bg-[#f8fafc] p-6 space-y-4 font-sans text-[#1e293b]">
      {/* Top Valuation Summary Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        {/* <div className="flex justify-between items-start mb-6">
          <h2 className="text-[14px] font-medium text-blue-900/70">Term Sheet Genie Valuation</h2>
          <ChevronUp size={18} className="text-gray-400" />
        </div> */}

        <div className="grid grid-cols-2 gap-20">
          {/* Left Column - Round Details */}
          <div className="space-y-3">
            <h3 className="text-[14px] font-semibold text-blue-800 mb-4">Round C</h3>
            <div className="flex justify-between text-[12px] pb-1 border-b border-gray-100">
              <span className="text-gray-600 font-medium">Total Contract Value</span>
              <span className="font-bold">$13.89M</span>
            </div>
            <div className="flex justify-between text-[12px] pb-1 border-b border-gray-100">
              <span className="text-gray-600 font-medium">Founder Valuation</span>
              <span className="font-bold">$4.50M</span>
            </div>
            <div className="flex justify-between text-[12px] pt-2">
              <span className="text-gray-800 font-bold">Breakeven Valuation</span>
              <span className="font-bold text-blue-900">$53.09M</span>
            </div>
          </div>

          {/* Right Column - Fund Specifics */}
          <div className="space-y-3">
            <h3 className="text-[14px] font-semibold text-blue-800 mb-4">XYZ Growth Fund</h3>
            <div className="flex justify-between text-[12px] font-medium text-gray-500 mb-2">
               <span>Total Contract Value</span>
            </div>
            <div className="flex justify-between text-[12px] pb-1 border-b border-gray-100">
              <span className="text-gray-600">Partial Value</span>
              <span className="font-bold">$13.89M</span>
            </div>
            <div className="flex justify-between text-[12px] pb-1 border-b border-gray-100">
              <span className="text-gray-600">LP Valuation</span>
              <span className="font-bold">$12.50M</span>
            </div>
            <div className="flex justify-between text-[12px] pb-1 border-b border-gray-100">
              <span className="text-gray-600">GP Valuation</span>
              <span className="font-bold">$1.39M</span>
            </div>
            <div className="flex justify-between text-[12px] pt-2">
              <span className="text-gray-800 font-bold">Breakeven Valuation</span>
              <span className="font-bold text-blue-900">$53.09M</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Analysis Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-[14px] font-medium text-blue-900/70 mb-6">Breakeven Analysis</h2>
        
        {/* Filters */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 space-y-1.5">
            <label className="text-[11px] font-medium text-gray-500">Series</label>
            <div className="relative">
              <select className="w-full bg-[#f1f5f9] border-none rounded-lg p-2.5 text-[12px] appearance-none focus:ring-1 ring-blue-200 outline-none">
                <option>Series A</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="text-[11px] font-medium text-gray-500">Breakeven Variable</label>
            <div className="relative">
              <select className="w-full bg-[#f1f5f9] border-none rounded-lg p-2.5 text-[12px] appearance-none focus:ring-1 ring-blue-200 outline-none">
                <option>Investor Shares</option>
                <option>Investment Amount</option>
                <option>Liquidation Preference Multiple</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="flex items-end">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-full text-[12px] font-semibold hover:bg-blue-700 transition-colors h-[38px]">
              Calculate
            </button>
          </div>
        </div>
        {/* The Analysis Table */}
        <div className="border border-gray-100 rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[#94a3b8] text-[11px] font-medium border-b border-gray-50">
                <th className="py-4 px-4 font-normal">Name</th>
                <th className="py-4 px-2 font-normal">Ownership</th>
                <th className="py-4 px-2 font-normal">Investment Amount</th>
                <th className="py-4 px-2 font-normal">Liquidation Pref</th>
                <th className="py-4 px-2 font-normal">Participation</th>
                <th className="py-4 px-2 font-normal">Seniority</th>
                <th className="py-4 px-2 font-normal">Breakeven Val</th>
              </tr>
            </thead>
            <tbody className="text-[12px] text-gray-600">
              {/* Parent Row */}
              <tr className="hover:bg-gray-50/50 cursor-pointer" onClick={() => setIsSeriesAExpanded(!isSeriesAExpanded)}>
                <td className="py-5 px-4 flex items-center gap-2 font-medium text-gray-800">
                  {isSeriesAExpanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                  Series A
                </td>
                <td className="py-5 px-2">100,000,000</td>
                <td className="py-5 px-2">$5,000,000</td>
                <td className="py-5 px-2">1x</td>
                <td className="py-5 px-2">Non-Participating</td>
                <td className="py-5 px-2">Senior</td>
                <td className="py-5 px-2 font-semibold text-gray-800">$25.00M</td>
              </tr>

              {/* Nested Row */}
              {isSeriesAExpanded && (
                <tr className="bg-gray-50/30 border-t border-gray-50">
                  <td className="py-4 px-12 text-gray-500 font-normal">Investor 1</td>
                  <td className="py-4 px-2 text-gray-500">50,000,000</td>
                  <td className="py-4 px-2 text-gray-500">$2,500,000</td>
                  <td className="py-4 px-2 text-gray-500">1x</td>
                  <td className="py-4 px-2 text-gray-500">Non-Participating</td>
                  <td className="py-4 px-2 text-gray-500">Senior</td>
                  <td className="py-4 px-2 font-medium text-gray-800">$12.50M</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ChevronRight = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export default BreakevenAnalysisComponent;
