"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

// ১. সিনারিও ড্রপডাউন (image_e9d05d.png অনুযায়ী)
export const ScenarioDropdown = ({ selected, setSelected }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const options = [1, 2, 3, 4];

  const toggleScenario = (id: number) => {
    if (selected.includes(id)) {
      if (selected.length > 1) setSelected(selected.filter((s: number) => s !== id));
    } else {
      setSelected([...selected, id].sort());
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-[150px] px-3 py-1.5 bg-white border ${isOpen ? 'border-blue-500 ring-1 ring-blue-50' : 'border-gray-200'} rounded-lg text-[13px] text-gray-700 transition-all`}
      >
        <span className="lowercase">{selected.length} scenario{selected.length > 1 ? 's' : ''}</span>
        {isOpen ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-100 shadow-xl rounded-lg py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
            {options.map((id) => (
              <label key={id} className="flex items-center px-3 py-1.5 hover:bg-gray-50 cursor-pointer group">
                <div className={`w-3.5 h-3.5 border rounded flex items-center justify-center transition-all ${selected.includes(id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-400'}`}>
                  {selected.includes(id) && <Check size={10} className="text-white" strokeWidth={4} />}
                </div>
                <span className="ml-2.5 text-[12px] text-gray-600 lowercase">scenario {id}</span>
                <input type="checkbox" className="hidden" checked={selected.includes(id)} onChange={() => toggleScenario(id)} />
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ২. শেয়ারহোল্ডার ফিল্টার (image_e9d078.png অনুযায়ী) - NOW FUNCTIONAL
export const FilterDropdown = ({ selectedShareholders, setSelectedShareholders }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const options = [
    { id: 'seriesA', label: 'Series A Investors' },
    { id: 'seriesB', label: 'Series B Investors' },
    { id: 'seriesC', label: 'Series C Investors' },
    { id: 'founders', label: 'Founders' },
    { id: 'employeePool', label: 'Employee Pool' }
  ];

  const allSelected = selectedShareholders.length === options.length;

  const toggleAll = () => {
    if (allSelected) {
      // Don't allow deselecting all
      return;
    } else {
      setSelectedShareholders(options.map((opt: any) => opt.id));
    }
  };

  const toggleOption = (id: string) => {
    if (selectedShareholders.includes(id)) {
      // Keep at least one selected
      if (selectedShareholders.length > 1) {
        setSelectedShareholders(selectedShareholders.filter((s: string) => s !== id));
      }
    } else {
      setSelectedShareholders([...selectedShareholders, id]);
    }
  };

  const getDisplayText = () => {
    if (allSelected) return 'all shareholders';
    if (selectedShareholders.length === 1) {
      const selected = options.find((opt: any) => opt.id === selectedShareholders[0]);
      return selected?.label.toLowerCase() || 'select shareholders';
    }
    return `${selectedShareholders.length} selected`;
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-[170px] px-3 py-1.5 bg-white border ${isOpen ? 'border-blue-500 ring-1 ring-blue-50' : 'border-gray-200'} rounded-lg text-[13px] text-gray-700`}
      >
        <span className="truncate lowercase">{getDisplayText()}</span>
        {isOpen ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-[200px] bg-white border border-gray-100 shadow-xl rounded-lg py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
            <label 
              className="flex items-center px-3 py-1.5 hover:bg-gray-50 cursor-pointer"
              onClick={toggleAll}
            >
              <div className={`w-3.5 h-3.5 border rounded flex items-center justify-center transition-all ${allSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                {allSelected && <Check size={10} className="text-white" strokeWidth={4} />}
              </div>
              <span className="ml-2.5 text-[12px] text-gray-600 lowercase">all shareholders</span>
            </label>
            {options.map((opt) => (
              <label 
                key={opt.id} 
                className="flex items-center px-3 py-1.5 hover:bg-gray-50 cursor-pointer group"
                onClick={() => toggleOption(opt.id)}
              >
                <div className={`w-3.5 h-3.5 border rounded flex items-center justify-center transition-all ${selectedShareholders.includes(opt.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-400'}`}>
                  {selectedShareholders.includes(opt.id) && <Check size={10} className="text-white" strokeWidth={4} />}
                </div>
                <span className="ml-2.5 text-[12px] text-gray-600 lowercase">{opt.label.toLowerCase()}</span>
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ৩. ভিউ মোড ড্রপডাউন (image_e9d07b.png অনুযায়ী)
export const ViewModeDropdown = ({ mode, setMode }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-[140px] px-3 py-1.5 bg-white border ${isOpen ? 'border-blue-500 ring-1 ring-blue-50' : 'border-gray-200'} rounded-lg text-[13px] text-gray-700 transition-all`}
      >
        <span className="lowercase">{mode}</span>
        {isOpen ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-100 shadow-xl rounded-lg py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
            {['Side-by-Side', 'Overlay'].map((m) => (
              <div 
                key={m}
                onClick={() => { setMode(m); setIsOpen(false); }}
                className="flex items-center px-3 py-1.5 hover:bg-gray-50 cursor-pointer group"
              >
                <div className={`w-3.5 h-3.5 border rounded-full flex items-center justify-center transition-all ${mode === m ? 'border-blue-600' : 'border-gray-300 group-hover:border-blue-400'}`}>
                  {mode === m && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />}
                </div>
                <span className={`ml-2.5 text-[12px] lowercase ${mode === m ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                  {m}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};