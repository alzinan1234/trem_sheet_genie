"use client";

import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import ValuationAnalysis from '../ValuationAnalysis';

const ScenarioCapTable = ({ id, selectedShareholders }: { id: number; selectedShareholders: string[] }) => {
  // ড্রপডাউন স্টেট
  const [isFoundersOpen, setIsFoundersOpen] = useState(false);
  const [isSeriesAOpen, setIsSeriesAOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Top Section: Chart and Valuations */}
      <ValuationAnalysis
        selectedShareholders={selectedShareholders}
        nominalValue={id === 1 ? 5.0 : 4.8}
        contractValue={id === 1 ? 5.0 : 4.6}
      />

      {/* Dynamic Table Section */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-[13px] text-left border-collapse">
          <thead className="bg-[#f8fafc] text-gray-500 font-semibold text-[11px] border-b border-gray-100">
            <tr>
              <th className="px-4 py-4 font-bold">Name</th>
              <th className="px-4 py-4">Investors</th>
              <th className="px-4 py-4">Common Stock</th>
              <th className="px-4 py-4">Stock Options</th>
              <th className="px-4 py-4">Series A Preferred</th>
              <th className="px-4 py-4">Series B Preferred</th>
              <th className="px-4 py-4">Fully Diluted Share</th>
              <th className="px-4 py-4">Nominal Ownership</th>
              <th className="px-4 py-4">Price/Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            
            {/* --- FOUNDERS PARENT ROW --- */}
            <tr 
              className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
              onClick={() => setIsFoundersOpen(!isFoundersOpen)}
            >
              <td className="px-4 py-4 font-bold text-gray-800 flex items-center gap-2">
                {isFoundersOpen ? <ChevronDown size={14} className="text-gray-600" /> : <ChevronRight size={14} className="text-gray-400" />} founders
              </td>
              <td className="px-4 py-4 text-gray-500 italic text-xs">3 founders</td>
              <td className="px-4 py-4">100,000</td>
              <td className="px-4 py-4">10,000</td>
              <td className="px-4 py-4">-</td>
              <td className="px-4 py-4">-</td>
              <td className="px-4 py-4 font-medium">110,000</td>
              <td className="px-4 py-4 text-blue-600 font-medium">10.8%</td>
              <td className="px-4 py-4">10.8</td>
            </tr>

            {/* FOUNDERS CHILD ROWS */}
            {isFoundersOpen && (
              <>
                <tr className="bg-gray-50/20 text-xs">
                  <td className="px-12 py-3 text-gray-600 italic">John Doe</td>
                  <td className="px-4 py-3 text-gray-400">-</td>
                  <td className="px-4 py-3">40,000</td>
                  <td className="px-4 py-3">5,000</td>
                  <td className="px-4 py-3">-</td>
                  <td className="px-4 py-3">-</td>
                  <td className="px-4 py-3">45,000</td>
                  <td className="px-4 py-3">4.4%</td>
                  <td className="px-4 py-3">4.4</td>
                </tr>
                <tr className="bg-gray-50/20 text-xs">
                  <td className="px-12 py-3 text-gray-600 italic">Jane Smith</td>
                  <td className="px-4 py-3 text-gray-400">-</td>
                  <td className="px-4 py-3">35,000</td>
                  <td className="px-4 py-3">3,000</td>
                  <td className="px-4 py-3">-</td>
                  <td className="px-4 py-3">-</td>
                  <td className="px-4 py-3">38,000</td>
                  <td className="px-4 py-3">3.7%</td>
                  <td className="px-4 py-3">3.7</td>
                </tr>
                <tr className="bg-gray-50/20 text-xs">
                  <td className="px-12 py-3 text-gray-600 italic">Bob Johnson</td>
                  <td className="px-4 py-3 text-gray-400">-</td>
                  <td className="px-4 py-3">25,000</td>
                  <td className="px-4 py-3">2,000</td>
                  <td className="px-4 py-3">-</td>
                  <td className="px-4 py-3">-</td>
                  <td className="px-4 py-3">27,000</td>
                  <td className="px-4 py-3">2.6%</td>
                  <td className="px-4 py-3">2.6</td>
                </tr>
              </>
            )}
            
            {/* --- UNALLOCATED OPTIONS ROW --- */}
            <tr className="bg-white">
              <td className="px-12 py-4 text-gray-500">unallocated options</td>
              <td className="px-4 py-4 text-gray-400">-</td>
              <td className="px-4 py-4">-</td>
              <td className="px-4 py-4">10,000</td>
              <td className="px-4 py-4">-</td>
              <td className="px-4 py-4">-</td>
              <td className="px-4 py-4 text-gray-600">10,000</td>
              <td className="px-4 py-4">1.0%</td>
              <td className="px-4 py-4 text-gray-400">1.0</td>
            </tr>

            {/* --- SERIES A PARENT ROW --- */}
            <tr 
              className="hover:bg-gray-50/50 transition-colors cursor-pointer"
              onClick={() => setIsSeriesAOpen(!isSeriesAOpen)}
            >
              <td className="px-4 py-4 font-bold text-gray-800 flex items-center gap-2">
                {isSeriesAOpen ? <ChevronDown size={14} className="text-gray-600" /> : <ChevronRight size={14} className="text-gray-400" />} series A
              </td>
              <td className="px-4 py-4 text-gray-500 italic text-xs">2 investors</td>
              <td className="px-4 py-4">-</td>
              <td className="px-4 py-4">-</td>
              <td className="px-4 py-4">500,000</td>
              <td className="px-4 py-4">-</td>
              <td className="px-4 py-4 font-medium">500,000</td>
              <td className="px-4 py-4 text-blue-600 font-medium">49.0%</td>
              <td className="px-4 py-4">49.0</td>
            </tr>

            {/* SERIES A CHILD ROWS */}
            {isSeriesAOpen && (
              <>
                <tr className="bg-gray-50/20 text-xs">
                  <td className="px-12 py-3 text-gray-600 italic">Sequoia Capital</td>
                  <td className="px-4 py-3 text-gray-400">-</td>
                  <td className="px-4 py-3">-</td>
                  <td className="px-4 py-3">-</td>
                  <td className="px-4 py-3">300,000</td>
                  <td className="px-4 py-3">-</td>
                  <td className="px-4 py-3">300,000</td>
                  <td className="px-4 py-3">29.4%</td>
                  <td className="px-4 py-3">29.4</td>
                </tr>
                <tr className="bg-gray-50/20 text-xs">
                  <td className="px-12 py-3 text-gray-600 italic">Andreessen Horowitz</td>
                  <td className="px-4 py-3 text-gray-400">-</td>
                  <td className="px-4 py-3">-</td>
                  <td className="px-4 py-3">-</td>
                  <td className="px-4 py-3">200,000</td>
                  <td className="px-4 py-3">-</td>
                  <td className="px-4 py-3">200,000</td>
                  <td className="px-4 py-3">19.6%</td>
                  <td className="px-4 py-3">19.6</td>
                </tr>
              </>
            )}

            {/* --- SERIES B ROW --- */}
            <tr className="hover:bg-gray-50/50">
              <td className="px-4 py-4 font-bold text-gray-800">series B</td>
              <td className="px-4 py-4 text-gray-500 italic text-xs">Accel Partners</td>
              <td className="px-4 py-4">-</td>
              <td className="px-4 py-4">-</td>
              <td className="px-4 py-4">-</td>
              <td className="px-4 py-4">400,000</td>
              <td className="px-4 py-4 font-medium">400,000</td>
              <td className="px-4 py-4 text-blue-600 font-medium">39.2%</td>
              <td className="px-4 py-4">39.2</td>
            </tr>

            {/* --- TOTAL ROW --- */}
            <tr className="bg-gray-50/50 text-gray-900 font-bold border-t-2 border-gray-100">
              <td className="px-4 py-4 flex items-center gap-2">
                total
              </td>
              <td className="px-4 py-4">-</td>
              <td className="px-4 py-4">100,000</td>
              <td className="px-4 py-4">20,000</td>
              <td className="px-4 py-4">500,000</td>
              <td className="px-4 py-4">400,000</td>
              <td className="px-4 py-4">1,020,000</td>
              <td className="px-4 py-4 text-blue-700">100.0%</td>
              <td className="px-4 py-4">100.0</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScenarioCapTable;
