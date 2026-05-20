"use client";

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react';
import ExitDiagramChart from './ExitDiagramChart';
import ScenarioCapTable from './ScenarioCapTable';
import ScenarioDetailsCard from './ScenarioDetailsCard';
import { ScenarioDropdown, FilterDropdown, ViewModeDropdown } from './ComparisonFilters';

const SimulationComparison = ({ onBack }: { onBack: () => void }) => {
  // ১ থেকে ৪ পর্যন্ত সিনারিও সিলেক্ট করার স্টেট
  const [selectedScenarios, setSelectedScenarios] = useState([1, 2]);
  const [viewMode, setMode] = useState<'Side-by-Side' | 'Overlay'>('Side-by-Side');
  const [isExitDiagramOpen, setIsExitDiagramOpen] = useState(true);
  const [isCapTableOpen, setIsCapTableOpen] = useState(true);
  const [isScenarioAnalysisOpen, setIsScenarioAnalysisOpen] = useState(true);
  
  // Shareholder selection state - all selected by default
  const [selectedShareholders, setSelectedShareholders] = useState([
    'seriesA', 'seriesB', 'seriesC', 'founders', 'employeePool'
  ]);

  // সিনারিও সংখ্যা অনুযায়ী গ্রিড লেআউট নির্ধারণ
  const gridLayout = useMemo(() => {
    const count = selectedScenarios.length;
    if (count === 1) return "grid-cols-1 mx-auto";
    return "grid-cols-1 lg:grid-cols-2"; 
  }, [selectedScenarios]);

  return (
    <div className="min-h-screen text-[#1e293b] animate-in fade-in duration-500">
      {/* Header */}
      <div className="sticky top-0 z-20 px-8 py-5 flex justify-between items-center">
        <h1 className="text-xl font-bold text-[#0f172a]">Series Calculator Simulation</h1>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[#4f46e5] text-sm hover:bg-indigo-50 px-5 py-2.5 rounded-full transition-all border border-indigo-100"
        >
          <ChevronLeft size={18} /> Back to Result Page
        </button>
      </div>

      {/* Top Navigation Filters */}
      <div className="px-8 py-4 flex flex-wrap gap-4 items-center border-gray-200/50">
        <span className="text-xs font-bold text-gray-400 tracking-wider mr-2">Filters</span>
        <ScenarioDropdown selected={selectedScenarios} setSelected={setSelectedScenarios} />
        <FilterDropdown 
          selectedShareholders={selectedShareholders} 
          setSelectedShareholders={setSelectedShareholders} 
        />
        <ViewModeDropdown mode={viewMode} setMode={setMode} />
      </div>

      <div className="p-8 space-y-10">
        {/* 1. Exit Diagram Comparison Section */}
        <section className="rounded-2xl border border-gray-200 overflow-hidden">
          <div
            className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center cursor-pointer"
            onClick={() => setIsExitDiagramOpen((prev) => !prev)}
          >
            <h2 className="font-bold text-gray-700">
              Exit Diagram Comparison {viewMode === 'Overlay' ? '(Overlay)' : ''}
            </h2>
            {isExitDiagramOpen ? (
              <ChevronUp size={20} className="text-gray-400" />
            ) : (
              <ChevronDown size={20} className="text-gray-400" />
            )}
          </div>

          {isExitDiagramOpen && (
            <>
              {/* Overlay Mode - Single Chart */}
              {viewMode === 'Overlay' ? (
                <div className="p-8">
                  <div className="h-[520px] w-full bg-white">
                    <ExitDiagramChart selectedShareholders={selectedShareholders} />
                  </div>
                </div>
              ) : (
                /* Side-by-Side Mode - Multiple Charts */
                <div className={`p-8 grid ${gridLayout} gap-12`}>
                  {selectedScenarios.map(id => (
                    <div key={id} className="space-y-4">
                      <p className="text-xs font-black text-blue-500 tracking-widest">Scenario {id}</p>
                      <div className="h-[430px] w-full bg-white">
                        <ExitDiagramChart selectedShareholders={selectedShareholders} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        {/* 2. Cap Table Comparison Section */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div
            className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center cursor-pointer"
            onClick={() => setIsCapTableOpen((prev) => !prev)}
          >
            <h2 className="font-bold text-gray-700">Cap Table Comparison</h2>
            {isCapTableOpen ? (
              <ChevronUp size={20} className="text-gray-400" />
            ) : (
              <ChevronDown size={20} className="text-gray-400" />
            )}
          </div>
          {isCapTableOpen && (
            <div className={`p-8 grid ${gridLayout} gap-12`}>
              {selectedScenarios.map(id => (
                <ScenarioCapTable 
                  key={id} 
                  id={id} 
                  selectedShareholders={selectedShareholders}
                />
              ))}
            </div>
          )}
        </section>

        {/* 3. Scenario Analysis Section */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div
            className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center cursor-pointer"
            onClick={() => setIsScenarioAnalysisOpen((prev) => !prev)}
          >
            <h2 className="font-bold text-gray-700">Scenario Analysis</h2>
            {isScenarioAnalysisOpen ? (
              <ChevronUp size={20} className="text-gray-400" />
            ) : (
              <ChevronDown size={20} className="text-gray-400" />
            )}
          </div>
          {isScenarioAnalysisOpen && (
            <div className={`p-8 grid ${gridLayout} gap-8`}>
              {selectedScenarios.map(id => (
                <ScenarioDetailsCard key={id} id={id} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SimulationComparison;
