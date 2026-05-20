"use client";

import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import ExitWaterfall from '@/components/InvestorAdmin/Simulator/ExitWaterfall';

export default function ReturnsAnalysis() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm font-sans overflow-hidden">
      <div
        className="px-6 py-4 border-b border-gray-50 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-[16px] font-semibold text-[#000000]">Exit Waterfall Breakdown</h3>
        <div className="text-[#667085]">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {isOpen && (
        <div className="p-2">
          <ExitWaterfall />
        </div>
      )}
    </div>
  );
}
