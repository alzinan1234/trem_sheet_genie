import React, { useState } from 'react';
import { ChevronUp, PlusCircle, MinusCircle } from 'lucide-react';

interface Round {
  id: number;
  seriesName: string;
  investmentDate: string;
  investmentAmount: string;
  liqPref: string;
  ownership: string;
  participation: 'Participating' | 'Converting';
  dividends: string;
  antiDilution: string;
  comments: string;
}

const SimulatedFutureRounds: React.FC = () => {
  const [rounds, setRounds] = useState<Round[]>([
    {
      id: 1,
      seriesName: 'Series A',
      investmentDate: '07/08/2025',
      investmentAmount: '$1,000,000',
      liqPref: '1.2x',
      ownership: '500000',
      participation: 'Participating',
      dividends: 'Simple',
      antiDilution: 'None',
      comments: 'A 16Z Lead Investor'
    }
  ]);

  const addRound = () => {
    const nextChar = String.fromCharCode(65 + rounds.length);
    setRounds([...rounds, {
      ...rounds[0],
      id: Date.now(),
      seriesName: `Series ${nextChar}`,
    }]);
  };

  const removeLastRound = () => {
    if (rounds.length > 1) {
      setRounds(rounds.slice(0, -1));
    }
  };

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm font-sans text-[#64748b]">
      {/* Header */}
      {/* <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-[14px] font-medium text-[#1e293b]">Simulated Future Round Details</h2>
        <ChevronUp size={18} className="text-gray-400" />
      </div> */}

      <div className="p-6 overflow-x-auto">
        <div className="flex gap-6 min-w-max pb-4">
          {rounds.map((round) => (
            <div key={round.id} className="w-[280px] space-y-4">
              
              {/* SERIES CARD */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-center font-semibold text-gray-700 mb-6">{round.seriesName}</h3>
                
                <Field label="Investment Date">
                  <input type="text" defaultValue={round.investmentDate} className="input-field" />
                </Field>

                <Field label="Investment Amount">
                  <input type="text" defaultValue={round.investmentAmount} className="input-field" />
                </Field>

                <Field label="Liquidation Preference">
                  <input type="text" defaultValue={round.liqPref} className="input-field" />
                </Field>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-gray-500">Ownership</label>
                  <div className="flex gap-1">
                    <div className="w-10 bg-[#f8fafc] border border-gray-100 rounded-md flex items-center justify-center text-blue-600 font-bold">#</div>
                    <input type="text" defaultValue={round.ownership} className="input-field flex-1" />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-[11px] font-medium text-gray-500">Common Stock Participation</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name={`part-${round.id}`} defaultChecked={round.participation === 'Participating'} className="accent-blue-600" />
                      <span className="text-[11px]">Participating</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name={`part-${round.id}`} className="accent-blue-600" />
                      <span className="text-[11px]">Converting</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                   <input type="checkbox" className="rounded border-gray-300" />
                   <span className="text-[11px]">QPO Threshold</span>
                </div>

                <div className="flex items-center gap-2">
                   <input type="checkbox" className="rounded border-gray-300" />
                   <span className="text-[11px] mr-4">Cap</span>
                   <div className="h-8 bg-[#f8fafc] border border-gray-100 rounded flex-1"></div>
                </div>

                <div className="space-y-1 pt-2">
                  <label className="text-[11px] font-medium text-gray-500">Dividends</label>
                  <div className="flex gap-1">
                    <button className="flex-1 py-1.5 text-[11px] bg-blue-50 text-blue-600 border border-blue-100 rounded-md font-medium">Simple</button>
                    <button className="flex-1 py-1.5 text-[11px] bg-[#f8fafc] text-gray-500 border border-gray-100 rounded-md">Annual</button>
                    <button className="w-10 py-1.5 text-[11px] bg-[#f8fafc] text-gray-500 border border-gray-100 rounded-md">8%</button>
                  </div>
                </div>

                <Field label="Antidilution Provision">
                  <input type="text" defaultValue={round.antiDilution} className="input-field" />
                </Field>

                <Field label="Comments">
                  <input type="text" defaultValue={round.comments} className="input-field" />
                </Field>
              </div>

              {/* OPTION POOL CARD */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-center font-bold text-[13px] text-black">Option Pools {round.seriesName}</h3>
                
                <Field label="Allocated Options Immediately prior to round">
                  <input type="text" defaultValue="5,000" className="input-field" />
                </Field>

                <Field label="Unallocated Options Immediately prior to round">
                  <input type="text" defaultValue="7,500" className="input-field" />
                </Field>

                <Field label="Requested Available Option Pool Post-Round">
                  <input type="text" defaultValue="10%" className="input-field" />
                </Field>
              </div>

              {/* MY FUND CARD */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-2">
                <label className="text-[11px] font-medium text-gray-500 italic">My Fund's Investment in This Round</label>
                <input type="text" defaultValue="$500,000" className="input-field" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-50 flex justify-between items-center">
        <button className="flex items-center gap-2 text-blue-600 text-[12px] font-medium hover:opacity-80">
          <PlusCircle size={16} /> Save this scenario
        </button>
        <div className="flex gap-3">
          <button onClick={addRound} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-[12px] font-medium border border-blue-100 hover:bg-blue-100 transition-colors">
            Add Round
          </button>
          <button onClick={removeLastRound} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-[12px] font-medium border border-blue-100 hover:bg-blue-100 transition-colors">
            Remove Last Round
          </button>
        </div>
      </div>

      <style>{`
        .input-field {
          width: 100%;
          background-color: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 12px;
          color: #475569;
          outline: none;
        }
        .input-field:focus {
          border-color: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <label className="text-[11px] font-medium text-gray-500">{label}</label>
    {children}
  </div>
);

export default SimulatedFutureRounds;