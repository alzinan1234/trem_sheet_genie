import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

const LatestCapTableView = ({ formData, formatNumber }: any) => {
  return (
    <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
      <div className="p-8 border-b border-slate-50 flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-800">Outstanding Debt</h3>
        <button className="flex items-center gap-2 text-[#2d60ff] font-bold text-sm">
          <Plus size={18} /> Add Debt
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Round Name</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Principal</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Interest Rate</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {(formData?.debtRounds || []).map((debt: any) => (
              <tr key={debt.id} className="hover:bg-slate-50/30 transition-colors">
                <td className="px-8 py-5 font-bold text-slate-700">{debt.roundName}</td>
                <td className="px-8 py-5 text-slate-600">${formatNumber(debt.principalAmount)}</td>
                <td className="px-8 py-5 text-slate-600">{debt.interestRate}%</td>
                <td className="px-8 py-5 text-slate-600">
                  <button className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LatestCapTableView;