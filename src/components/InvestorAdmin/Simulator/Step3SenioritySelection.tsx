"use client";

import React, { useState, useEffect } from 'react';

interface Step3Props {
  data: any;
  onContinue: (data: any) => void;
  onStepBack: () => void;
}

const Step3SenioritySelection: React.FC<Step3Props> = ({ data, onContinue, onStepBack }) => {
  const [debtSeniority, setDebtSeniority] = useState<string[][]>([]);
  const [equitySeniority, setEquitySeniority] = useState<string[][]>([]);
  const [debtInstruments, setDebtInstruments] = useState<string[]>([]);
  const [equityInstruments, setEquityInstruments] = useState<string[]>([]);

  useEffect(() => {
    // Build real instrument lists from data
    const pricedRoundNames: string[] = (data?.pricedRounds || []).map((r: any) => r.roundName || r.name || '').filter(Boolean);
    const debtRoundNames: string[] = (data?.debtRounds || []).map((d: any) => d.roundName || d.name || '').filter(Boolean);

    // Debt seniority — each debt round starts as its own level
    const initialDebt: string[][] = Array.isArray(data?.debt) && Array.isArray(data?.debt[0])
      ? data.debt
      : debtRoundNames.length > 0
        ? debtRoundNames.map(n => [n])
        : [];

    // Equity seniority — each priced round starts as its own level
    const initialEquity: string[][] = Array.isArray(data?.equity) && Array.isArray(data?.equity[0])
      ? data.equity
      : pricedRoundNames.length > 0
        ? pricedRoundNames.map(n => [n])
        : [];

    setDebtSeniority(initialDebt);
    setEquitySeniority(initialEquity);
    setDebtInstruments(initialDebt.flat());
    setEquityInstruments(initialEquity.flat());
  }, [data]);

  // --- Validation Functions ---
  const validateSeniority = (items: string[][], maxLevels: number, type: string): { isValid: boolean; error?: string } => {
    // Check 1: Minimum 1 level
    if (items.length === 0) {
      return { isValid: false, error: `At least one level is required for ${type}.` };
    }
    
    // Check 2: All rows must have at least one item (no gaps)
    for (let i = 0; i < items.length; i++) {
      if (items[i].length === 0) {
        return { isValid: false, error: `Gap detected at seniority level ${i + 1}. All levels must have at least one item.` };
      }
    }
    
    // Check 3: Cannot exceed max levels (equal to instrument count)
    if (items.length > maxLevels) {
      return { isValid: false, error: `Maximum ${maxLevels} levels allowed for ${type} (number of instruments).` };
    }
    
    return { isValid: true };
  };

  // --- Drag and Drop Logic ---
  const handleDragStart = (e: React.DragEvent, type: 'debt' | 'equity', rowIndex: number, itemIndex: number) => {
    e.dataTransfer.setData('type', type);
    e.dataTransfer.setData('sourceRowIndex', rowIndex.toString());
    e.dataTransfer.setData('sourceItemIndex', itemIndex.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnRow = (e: React.DragEvent, targetType: 'debt' | 'equity', targetRowIndex: number) => {
    e.preventDefault();
    const sourceType = e.dataTransfer.getData('type');
    const sourceRowIndex = parseInt(e.dataTransfer.getData('sourceRowIndex'));
    const sourceItemIndex = parseInt(e.dataTransfer.getData('sourceItemIndex'));

    if (sourceType !== targetType) return;

    if (targetType === 'debt') {
      const newDebt = debtSeniority.map(row => [...row]);
      
      // Remove item from source
      const [movedItem] = newDebt[sourceRowIndex].splice(sourceItemIndex, 1);
      
      // Add item to target row (pari passu)
      newDebt[targetRowIndex].push(movedItem);

      // Remove empty rows (if source becomes empty after move)
      const filteredDebt = newDebt.filter(row => row.length > 0);

      // Validate after reordering
      const validation = validateSeniority(filteredDebt, debtInstruments.length, 'Debt');
      if (validation.isValid) {
        setDebtSeniority(filteredDebt);
      } else {
        alert(validation.error);
      }
    } else {
      const newEquity = equitySeniority.map(row => [...row]);
      
      // Remove item from source
      const [movedItem] = newEquity[sourceRowIndex].splice(sourceItemIndex, 1);
      
      // Add item to target row (pari passu)
      newEquity[targetRowIndex].push(movedItem);

      // Remove empty rows (if source becomes empty after move)
      const filteredEquity = newEquity.filter(row => row.length > 0);

      // Validate after reordering
      const validation = validateSeniority(filteredEquity, equityInstruments.length, 'Equity');
      if (validation.isValid) {
        setEquitySeniority(filteredEquity);
      } else {
        alert(validation.error);
      }
    }
  };

  const handleDropOnEmpty = (e: React.DragEvent, targetType: 'debt' | 'equity') => {
    e.preventDefault();
    const sourceType = e.dataTransfer.getData('type');
    const sourceRowIndex = parseInt(e.dataTransfer.getData('sourceRowIndex'));
    const sourceItemIndex = parseInt(e.dataTransfer.getData('sourceItemIndex'));

    if (sourceType !== targetType) return;

    if (targetType === 'debt') {
      // Check if we can create a new level (max = instrument count)
      if (debtSeniority.length >= debtInstruments.length) {
        alert(`Maximum ${debtInstruments.length} levels allowed for Debt (number of instruments).`);
        return;
      }

      const newDebt = debtSeniority.map(row => [...row]);
      
      // Remove item from source
      const [movedItem] = newDebt[sourceRowIndex].splice(sourceItemIndex, 1);
      
      // Create new level with the moved item
      const newLevel = [movedItem];
      newDebt.push(newLevel);

      // Remove empty rows (if source becomes empty after move)
      const filteredDebt = newDebt.filter(row => row.length > 0);

      // Validate after reordering
      const validation = validateSeniority(filteredDebt, debtInstruments.length, 'Debt');
      if (validation.isValid) {
        setDebtSeniority(filteredDebt);
      } else {
        alert(validation.error);
      }
    } else {
      // Check if we can create a new level (max = instrument count)
      if (equitySeniority.length >= equityInstruments.length) {
        alert(`Maximum ${equityInstruments.length} levels allowed for Equity (number of instruments).`);
        return;
      }

      const newEquity = equitySeniority.map(row => [...row]);
      
      // Remove item from source
      const [movedItem] = newEquity[sourceRowIndex].splice(sourceItemIndex, 1);
      
      // Create new level with the moved item
      const newLevel = [movedItem];
      newEquity.push(newLevel);

      // Remove empty rows (if source becomes empty after move)
      const filteredEquity = newEquity.filter(row => row.length > 0);

      // Validate after reordering
      const validation = validateSeniority(filteredEquity, equityInstruments.length, 'Equity');
      if (validation.isValid) {
        setEquitySeniority(filteredEquity);
      } else {
        alert(validation.error);
      }
    }
  };


  return (
    <div className="w-full min-h-screen bg-[#f8fafc] p-8 font-sans text-[#1e293b]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold mb-1 text-slate-800">Seniority Selection</h1>
        <p className="text-[11px] text-slate-400">
          Seniority represents the order in which debt is paid off or preferential returns are distributed. Share classes at the same level are considered pari passu.
        </p>
      </div>

      <div className="space-y-6">
        {/* --- Debt Seniority Section --- */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="px-6 py-3 border-b border-slate-50">
            <h2 className="text-[#1e293b] font-semibold text-sm">Debt Seniority</h2>
          </div>
          
          <div className="p-6">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-4 font-bold">Receives First</div>
            
            <div className="space-y-3">
              {debtSeniority.map((row, rowIndex) => (
                <div 
                  key={rowIndex} 
                  className="flex items-center gap-4"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnRow(e, 'debt', rowIndex)}
                >
                  <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-100 shrink-0">
                    {rowIndex + 1}
                  </div>
                  <div className="flex-1 bg-[#fcfdfe] border border-slate-100 rounded-lg p-2.5 flex items-center gap-3 transition-colors min-h-[54px]">
                    <div className="flex flex-col gap-0.5 opacity-20">
                      <div className="flex gap-0.5"><div className="w-0.5 h-0.5 bg-slate-900 rounded-full"></div><div className="w-0.5 h-0.5 bg-slate-900 rounded-full"></div></div>
                      <div className="flex gap-0.5"><div className="w-0.5 h-0.5 bg-slate-900 rounded-full"></div><div className="w-0.5 h-0.5 bg-slate-900 rounded-full"></div></div>
                      <div className="flex gap-0.5"><div className="w-0.5 h-0.5 bg-slate-900 rounded-full"></div><div className="w-0.5 h-0.5 bg-slate-900 rounded-full"></div></div>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      {row.map((item, itemIdx) => (
                        <span 
                          key={itemIdx} 
                          draggable
                          onDragStart={(e) => handleDragStart(e, 'debt', rowIndex, itemIdx)}
                          className="bg-white border border-slate-200 px-3 py-1.5 rounded-md text-[12px] font-medium shadow-sm text-slate-600 cursor-grab active:cursor-grabbing hover:border-blue-400 transition-all"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div 
              onDragOver={handleDragOver}
              onDrop={(e) => handleDropOnEmpty(e, 'debt')}
              className="mt-3 ml-11 border-2 border-dashed border-slate-100 rounded-lg py-3 text-center bg-slate-50/30 transition-all"
            >
              <span className="text-[10px] text-slate-400 font-medium">Drag items here to create new level</span>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 mt-4 font-bold">Receives Last</div>
          </div>
        </div>

        {/* --- Equity Seniority Section --- */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="px-6 py-3 border-b border-slate-50">
            <h2 className="text-[#1e293b] font-semibold text-sm">Equity Seniority</h2>
          </div>
          
          <div className="p-6">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-4 font-bold">Receives First</div>
            
            <div className="space-y-3">
              {equitySeniority.map((row, rowIndex) => (
                <div 
                  key={rowIndex} 
                  className="flex items-center gap-4"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnRow(e, 'equity', rowIndex)}
                >
                  <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-100 shrink-0">
                    {rowIndex + 1}
                  </div>
                  <div className="flex-1 bg-[#fcfdfe] border border-slate-100 rounded-lg p-2.5 flex items-center gap-3 transition-colors min-h-[54px]">
                    <div className="flex flex-col gap-0.5 opacity-20">
                      <div className="flex gap-0.5"><div className="w-0.5 h-0.5 bg-slate-900 rounded-full"></div><div className="w-0.5 h-0.5 bg-slate-900 rounded-full"></div></div>
                      <div className="flex gap-0.5"><div className="w-0.5 h-0.5 bg-slate-900 rounded-full"></div><div className="w-0.5 h-0.5 bg-slate-900 rounded-full"></div></div>
                      <div className="flex gap-0.5"><div className="w-0.5 h-0.5 bg-slate-900 rounded-full"></div><div className="w-0.5 h-0.5 bg-slate-900 rounded-full"></div></div>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      {row.map((item, itemIdx) => (
                        <span 
                          key={itemIdx} 
                          draggable
                          onDragStart={(e) => handleDragStart(e, 'equity', rowIndex, itemIdx)}
                          className="bg-white border border-slate-200 px-3 py-1.5 rounded-md text-[12px] font-medium shadow-sm text-slate-600 cursor-grab active:cursor-grabbing hover:border-blue-400 transition-all"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div 
              onDragOver={handleDragOver}
              onDrop={(e) => handleDropOnEmpty(e, 'equity')}
              className="mt-3 ml-11 border-2 border-dashed border-slate-100 rounded-lg py-3 text-center bg-slate-50/30 transition-all"
            >
              <span className="text-[10px] text-slate-400 font-medium">Drag items here to create new level</span>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 mt-4 font-bold">Receives Last</div>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-between items-center mt-12">
        <button
          onClick={onStepBack}
          className="px-8 py-2.5 border border-blue-200 text-blue-500 rounded-full hover:bg-blue-50 transition-all font-medium"
        >
          Cancel
        </button>

        <div className="flex gap-4">
          <button
            onClick={onStepBack}
            className="px-8 py-2.5 border border-blue-200 text-blue-500 rounded-full hover:bg-blue-50 transition-all font-medium"
          >
            Step back
          </button>
          <button
            onClick={() => onContinue({ debt: debtSeniority, equity: equitySeniority })}
            className="px-8 py-2.5 bg-[#3b66ff] text-white rounded-full hover:bg-blue-700 transition-all font-medium flex items-center gap-2"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step3SenioritySelection;