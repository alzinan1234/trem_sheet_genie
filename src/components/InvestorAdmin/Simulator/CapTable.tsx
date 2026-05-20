import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ChevronUp } from 'lucide-react';

interface RowData {
  name: string;
  investors: string;
  common: string;
  options: string;
  aPref: string;
  bPref: string;
  fullyDiluted: string;
  ownership: string;
  price: string;
  subRows?: RowData[];
}

const capTableData: RowData[] = [
  {
    name: 'Founders',
    investors: '3 Founders',
    common: '100,000',
    options: '10,000',
    aPref: '',
    bPref: '',
    fullyDiluted: '110,000',
    ownership: '10.8%',
    price: '10.8',
    subRows: [
      { name: 'John Doe', investors: '-', common: '40,000', options: '5,000', aPref: '', bPref: '', fullyDiluted: '45,000', ownership: '4.4%', price: '4.4' },
      { name: 'Jane Smith', investors: '-', common: '35,000', options: '3,000', aPref: '', bPref: '', fullyDiluted: '38,000', ownership: '3.7%', price: '3.7' },
      { name: 'Bob Johnson', investors: '-', common: '25,000', options: '2,000', aPref: '', bPref: '', fullyDiluted: '27,000', ownership: '2.6%', price: '2.6' },
    ]
  },
  {
    name: 'Unallocated Options',
    investors: '-',
    common: '',
    options: '10,000',
    aPref: '',
    bPref: '',
    fullyDiluted: '10,000',
    ownership: '1.0%',
    price: '1.0'
  },
  {
    name: 'Series A',
    investors: '2 Investors',
    common: '',
    options: '',
    aPref: '500,000',
    bPref: '',
    fullyDiluted: '500,000',
    ownership: '49.0%',
    price: '49.0',
    subRows: [
      { name: 'Sequoia Capital', investors: '-', common: '', options: '', aPref: '300,000', bPref: '', fullyDiluted: '300,000', ownership: '29.4%', price: '29.4' },
      { name: 'Andreessen Horowitz', investors: '-', common: '', options: '', aPref: '200,000', bPref: '', fullyDiluted: '200,000', ownership: '19.6%', price: '19.6' },
    ]
  },
  {
    name: 'Series B',
    investors: 'Accel Partners',
    common: '',
    options: '',
    aPref: '',
    bPref: '400,000',
    fullyDiluted: '400,000',
    ownership: '39.2%',
    price: '39.2'
  }
];

const CapTable: React.FC = () => {
  const [expandedRows, setExpandedRows] = useState<string[]>(['Founders', 'Series A']);

  const toggleRow = (name: string) => {
    setExpandedRows(prev => 
      prev.includes(name) ? prev.filter(r => r !== name) : [...prev, name]
    );
  };

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden font-sans">
   

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-[11px]">
          <thead>
            <tr className="text-[#94a3b8] font-medium border-b border-gray-50">
              <th className="py-4 px-4 font-normal whitespace-nowrap">Name</th>
              <th className="py-4 px-2 font-normal whitespace-nowrap">Investors</th>
              <th className="py-4 px-2 font-normal whitespace-nowrap">Common Stock</th>
              <th className="py-4 px-2 font-normal whitespace-nowrap">Stock Options</th>
              <th className="py-4 px-2 font-normal whitespace-nowrap">Series A Preferred</th>
              <th className="py-4 px-2 font-normal whitespace-nowrap">Series B Preferred</th>
              <th className="py-4 px-2 font-normal whitespace-nowrap">Fully Diluted Share</th>
              <th className="py-4 px-2 font-normal whitespace-nowrap">Nominal Ownership</th>
              <th className="py-4 px-2 font-normal whitespace-nowrap">Price/Share</th>
            </tr>
          </thead>
          <tbody className="text-[#475569]">
            {capTableData.map((row) => (
              <React.Fragment key={row.name}>
                <tr 
                  className="hover:bg-gray-50/50 cursor-pointer border-b border-gray-50"
                  onClick={() => row.subRows && toggleRow(row.name)}
                >
                  <td className="py-4 px-4 flex items-center gap-2 font-medium text-[#1e293b]">
                    {row.subRows ? (
                      expandedRows.includes(row.name) ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />
                    ) : <div className="w-[14px]" />}
                    {row.name}
                  </td>
                  <td className="py-4 px-2">{row.investors}</td>
                  <td className="py-4 px-2">{row.common}</td>
                  <td className="py-4 px-2">{row.options}</td>
                  <td className="py-4 px-2">{row.aPref}</td>
                  <td className="py-4 px-2">{row.bPref}</td>
                  <td className="py-4 px-2 font-medium">{row.fullyDiluted}</td>
                  <td className="py-4 px-2">{row.ownership}</td>
                  <td className="py-4 px-2">{row.price}</td>
                </tr>

                {/* Sub-rows for stakeholders */}
                {row.subRows && expandedRows.includes(row.name) && row.subRows.map((sub) => (
                  <tr key={sub.name} className="bg-gray-50/30 text-[#64748b] border-b border-gray-50">
                    <td className="py-3 px-12 font-normal">{sub.name}</td>
                    <td className="py-3 px-2">{sub.investors}</td>
                    <td className="py-3 px-2">{sub.common}</td>
                    <td className="py-3 px-2">{sub.options}</td>
                    <td className="py-3 px-2">{sub.aPref}</td>
                    <td className="py-3 px-2">{sub.bPref}</td>
                    <td className="py-3 px-2">{sub.fullyDiluted}</td>
                    <td className="py-3 px-2">{sub.ownership}</td>
                    <td className="py-3 px-2">{sub.price}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}

            {/* Total Row */}
            <tr className="bg-white font-bold text-[#1e293b]">
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

export default CapTable;