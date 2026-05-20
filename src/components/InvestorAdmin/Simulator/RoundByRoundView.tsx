import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

const RoundByRoundView = ({ formData, updatePricedRound, handleAddPricedRound, formatNumber }: any) => {
  const rounds = formData?.pricedRounds || [];

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-bold text-slate-800">Priced Rounds</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rounds.map((round: any, index: number) => (
          <div key={round.id} className="relative bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm group">
            <button className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 transition-colors">
              <Trash2 size={18} />
            </button>

            <div className="text-center mb-8 pb-4 border-b border-slate-50">
              <h4 className="text-lg font-bold text-slate-800">{round.roundName || `Round ${index + 1}`}</h4>
            </div>

            <div className="space-y-6">
              <InputField label="Investment Date" type="date" value={round.investmentDate} />
              <InputField label="Investment Amount" type="text" prefix="$" value={formatNumber(round.investmentAmount)} />
              
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Ownership" type="text" placeholder="#" value={round.ownership} />
                <InputField label="Value" type="text" placeholder="0" value={round.value} />
              </div>

              <InputField label="Liquidation Preference" type="text" suffix="x" value={round.liquidationPreference || '1.0'} />
            </div>
          </div>
        ))}

        {/* Add Round Placeholder */}
        <button 
          onClick={handleAddPricedRound}
          className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[40px] p-12 min-h-[450px] hover:border-[#2d60ff] hover:bg-blue-50/50 transition-all group"
        >
          <div className="w-14 h-14 rounded-full bg-slate-50 group-hover:bg-blue-100 flex items-center justify-center mb-4 transition-colors">
            <Plus className="text-slate-400 group-hover:text-[#2d60ff]" size={28} />
          </div>
          <span className="text-slate-500 font-bold group-hover:text-[#2d60ff]">Add Priced Round</span>
        </button>
      </div>
    </div>
  );
};

const InputField = ({ label, type, prefix, suffix, placeholder, value }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
    <div className="relative">
      {prefix && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{prefix}</span>}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        className={`w-full bg-slate-50 border-none rounded-2xl py-3.5 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none transition-all ${prefix ? 'pl-8' : 'px-4'} ${suffix ? 'pr-8' : 'px-4'}`}
      />
      {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{suffix}</span>}
    </div>
  </div>
);

export default RoundByRoundView;