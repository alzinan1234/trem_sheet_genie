"use client";

import React from 'react';

const StatsGrid = () => {
  const stats = [
    { value: '$10M', label: 'Total Raised' },
    { value: '$40M', label: 'Post-Money Valuation' },
    { value: 20 + '%', label: 'Your Ownership' }, // Rendered as 20%
    { value: 'Series B', label: 'Latest Round' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4  bg-[#F9FAFB]">
      {stats.map((s, i) => (
        <div 
          key={i} 
          className="bg-white px-5 py-8 rounded-lg border border-[#EAECF0] shadow-sm flex flex-col justify-center min-h-[140px]"
        >
          {/* Main Value */}
          <h3 className="text-[32px] font-bold text-[#030303] leading-tight mb-1">
            {s.value}
          </h3>
          
          {/* Label - No Uppercase strictly following image */}
          <p className="text-[14px] text-[#98A2B3] font-medium leading-none">
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;