import React from 'react';
import { ChevronUp } from 'lucide-react';

const CalculateExit: React.FC = () => {
  const tableData = [
    { name: 'Series A', exitValue: '$12,500,000', ownership: '25.00%', price: '$2.50', lpValue: '$11,250,000', gpValue: '$1,250,000' },
    { name: 'Series B', exitValue: '$17,500,000', ownership: '35.00%', price: '$3.50', lpValue: '$15,750,000', gpValue: '$1,750,000' },
    { name: 'Founders', exitValue: '$20,000,000', ownership: '40.00%', price: '$4.00', lpValue: '-', gpValue: '-' },
  ];

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm font-sans overflow-hidden">
      {/* Header */}
      {/* <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-[14px] font-medium text-[#1e293b]">Calculate Exit Breakdown</h2>
        <ChevronUp size={18} className="text-gray-400 cursor-pointer" />
      </div> */}

      <div className="p-6">
        {/* Input Controls */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-[11px] text-gray-500 font-medium">Exit Value</label>
            <input 
              type="text" 
              defaultValue="$50,000,000" 
              className="w-full bg-[#f1f5f9] border-none rounded-lg p-3 text-[13px] text-slate-600 focus:ring-2 focus:ring-blue-100 outline-none" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] text-gray-500 font-medium">Exit Timing (years)</label>
            <input 
              type="text" 
              defaultValue="5" 
              className="w-full bg-[#f1f5f9] border-none rounded-lg p-3 text-[13px] text-slate-600 focus:ring-2 focus:ring-blue-100 outline-none" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] text-gray-500 font-medium">Exit Type</label>
            <select className="w-full bg-[#f1f5f9] border-none rounded-lg p-3 text-[13px] text-slate-400 focus:ring-2 focus:ring-blue-100 outline-none appearance-none">
              <option>Select</option>
              <option>M&A</option>
              <option>IPO</option>
            </select>
          </div>
        </div>

        <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-[13px] font-semibold hover:bg-blue-700 transition-colors mb-8">
          Calculate
        </button>

        {/* Breakdown Table */}
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
    </div>
  );
};

export default CalculateExit;