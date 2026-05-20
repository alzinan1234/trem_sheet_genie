import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

const PreSimCapTable = () => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({ 
    founders: true, 
    seriesA: true 
  });

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm font-sans text-[#64748b]">
      {/* Table Header Title */}
      {/* <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-[14px] font-medium text-[#475569]">Pre Simulation Cap Table</h2>
        <ChevronDown size={18} className="text-gray-400" />
      </div> */}

      <div className="overflow-x-auto">
        <table className="w-full text-[12px] border-collapse">
          <thead>
            <tr className="text-gray-400 border-b border-gray-100">
              <th className="py-3 px-4 text-left font-normal">Name</th>
              <th className="py-3 px-2 text-left font-normal">Investors</th>
              <th className="py-3 px-2 text-left font-normal text-slate-400">Common Stock</th>
              <th className="py-3 px-2 text-left font-normal text-slate-400">Stock Options</th>
              <th className="py-3 px-2 text-left font-normal text-slate-400">Series A Preferred</th>
              <th className="py-3 px-2 text-left font-normal text-slate-400">Series B Preferred</th>
              <th className="py-3 px-2 text-left font-normal text-slate-400">Fully Diluted Share</th>
              <th className="py-3 px-2 text-left font-normal text-slate-400">Nominal Ownership</th>
              <th className="py-3 px-2 text-left font-normal text-slate-400">Price/Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {/* FOUNDERS GROUP */}
            <tr className="hover:bg-gray-50/50">
              <td className="py-4 px-4 flex items-center gap-2 cursor-pointer" onClick={() => toggleRow('founders')}>
                {expandedRows.founders ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span>Founders</span>
              </td>
              <td className="py-4 px-2">3 Founders</td>
              <td className="py-4 px-2">100,000</td>
              <td className="py-4 px-2">10,000</td>
              <td className="py-4 px-2"></td>
              <td className="py-4 px-2"></td>
              <td className="py-4 px-2">110,000</td>
              <td className="py-4 px-2">10.8%</td>
              <td className="py-4 px-2">10.8</td>
            </tr>
            {expandedRows.founders && (
              <>
                <SubRow name="John Doe" common="40,000" options="5,000" total="45,000" own="4.4%" price="4.4" />
                <SubRow name="Jane Smith" common="35,000" options="3,000" total="38,000" own="3.7%" price="3.7" />
                <SubRow name="Bob Johnson" common="25,000" options="2,000" total="27,000" own="2.6%" price="2.6" />
              </>
            )}

            {/* UNALLOCATED OPTIONS */}
            <tr>
              <td className="py-4 px-4 pl-10">Unallocated Options</td>
              <td className="py-4 px-2">-</td>
              <td className="py-4 px-2"></td>
              <td className="py-4 px-2">10,000</td>
              <td className="py-4 px-2"></td>
              <td className="py-4 px-2"></td>
              <td className="py-4 px-2">10,000</td>
              <td className="py-4 px-2">1.0%</td>
              <td className="py-4 px-2">1.0</td>
            </tr>

            {/* SERIES A GROUP */}
            <tr className="hover:bg-gray-50/50">
              <td className="py-4 px-4 flex items-center gap-2 cursor-pointer" onClick={() => toggleRow('seriesA')}>
                {expandedRows.seriesA ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span>Series A</span>
              </td>
              <td className="py-4 px-2">2 Investors</td>
              <td className="py-4 px-2"></td>
              <td className="py-4 px-2"></td>
              <td className="py-4 px-2">500,000</td>
              <td className="py-4 px-2"></td>
              <td className="py-4 px-2">500,000</td>
              <td className="py-4 px-2">49.0%</td>
              <td className="py-4 px-2">49.0</td>
            </tr>
            {expandedRows.seriesA && (
              <>
                <SubRow name="Sequoia Capital" aPref="300,000" total="300,000" own="29.4%" price="29.4" />
                <SubRow name="Andreessen Horowitz" aPref="200,000" total="200,000" own="19.6%" price="19.6" />
              </>
            )}

            {/* SERIES B */}
            <tr>
              <td className="py-4 px-4 pl-10">Series B</td>
              <td className="py-4 px-2">Accel Partners</td>
              <td className="py-4 px-2"></td>
              <td className="py-4 px-2"></td>
              <td className="py-4 px-2"></td>
              <td className="py-4 px-2">400,000</td>
              <td className="py-4 px-2">400,000</td>
              <td className="py-4 px-2">39.2%</td>
              <td className="py-4 px-2">39.2</td>
            </tr>

            {/* TOTAL ROW */}
            <tr className="font-medium text-slate-900 border-t border-gray-200">
              <td className="py-5 px-4">Total</td>
              <td className="py-5 px-2">-</td>
              <td className="py-5 px-2">100,000</td>
              <td className="py-5 px-2">20,000</td>
              <td className="py-5 px-2">500,000</td>
              <td className="py-5 px-2">400,000</td>
              <td className="py-5 px-2">1,020,000</td>
              <td className="py-5 px-2">100.0%</td>
              <td className="py-5 px-2">100.0</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Helper component for child rows to keep code clean
const SubRow = ({ name, common = "", options = "", aPref = "", total = "", own = "", price = "" }: any) => (
  <tr className="text-slate-400">
    <td className="py-3 px-4 pl-12">{name}</td>
    <td className="py-3 px-2">-</td>
    <td className="py-3 px-2">{common}</td>
    <td className="py-3 px-2">{options}</td>
    <td className="py-3 px-2">{aPref}</td>
    <td className="py-3 px-2"></td>
    <td className="py-3 px-2">{total}</td>
    <td className="py-3 px-2">{own}</td>
    <td className="py-3 px-2">{price}</td>
  </tr>
);

export default PreSimCapTable;