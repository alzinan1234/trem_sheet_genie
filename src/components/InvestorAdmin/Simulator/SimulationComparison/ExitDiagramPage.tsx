"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronDown } from 'lucide-react';
import { FilterDropdown } from './ComparisonFilters';
import ExitDiagramChart from './ExitDiagramChart';


const ExitDiagramPage = ({ onBack }: { onBack?: () => void }) => {
  // Shareholder selection state - all selected by default
  const [selectedShareholders, setSelectedShareholders] = useState([
    'seriesA', 'seriesB', 'seriesC', 'founders', 'employeePool'
  ]);

  return (
    <div className="min-h-screen text-[#1e293b] animate-in fade-in duration-500">
      {/* Header */}
      <div className="sticky top-0 z-20 px-8 py-5 flex justify-between items-center">
        <h1 className="text-xl font-bold text-[#0f172a]">Exit Diagram</h1>
        {onBack && (
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-[#4f46e5] text-sm hover:bg-indigo-50 px-5 py-2.5 rounded-full transition-all border border-indigo-100"
          >
            <ChevronLeft size={18} /> Back to Result Page
          </button>
        )}
      </div>

      {/* Shareholder Filter - ONLY this filter, matching SimulationComparison design */}
      <div className="px-8 py-4 flex flex-wrap gap-4 items-center border-gray-200/50">
        <span className="text-xs font-bold text-gray-400 tracking-wider mr-2">Filters</span>
        <FilterDropdown 
          selectedShareholders={selectedShareholders} 
          setSelectedShareholders={setSelectedShareholders} 
        />
      </div>

      {/* Exit Diagram Chart - matching SimulationComparison design exactly */}
      <div className="p-8 space-y-10">
        <section className="rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-gray-700">Exit Diagram Comparison (Overlay)</h2>
            <ChevronDown size={20} className="text-gray-400" />
          </div>
          <div className="p-8">
            <div className="h-[450px] w-full bg-white">
              <ExitDiagramChart selectedShareholders={selectedShareholders} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ExitDiagramPage;