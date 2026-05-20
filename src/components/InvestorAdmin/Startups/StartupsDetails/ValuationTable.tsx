'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface ValuationData {
  round: string;
  investmentAmount: string;
  preMoneyValuation: string;
  postMoneyValuation: string;
  ownership: string;
  date: string;
}

const valuationData: ValuationData[] = [
  {
    round: "Series A",
    investmentAmount: "$5,000,000",
    preMoneyValuation: "$15,000,000",
    postMoneyValuation: "$20,000,000",
    ownership: "25%",
    date: "Jan 15, 2023",
  },
  {
    round: "Series B",
    investmentAmount: "$10,000,000",
    preMoneyValuation: "$30,000,000",
    postMoneyValuation: "$40,000,000",
    ownership: "25%",
    date: "Aug 20, 2024",
  }
];

export default function TermSheetValuations() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    /* Removed max-w to ensure it is truly w-full */
    <div className="w-full font-sans mt-8">
      
      {/* Label above the card as seen in the screenshot */}
    

      <div className="bg-white w-full rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Clickable Header Section */}
        <div 
          className="flex items-center justify-between px-6 py-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <h2 className="text-[#131313] font-semibold text-[16px]">Term Sheet Valuations</h2>
          <button className="text-[#111111]">
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {/* Collapsible Content Section */}
        <div 
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          {/* Using gap-x-24 or higher to push columns to the edges like the screenshot */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-32 gap-y-10">
            {valuationData.map((data, index) => (
              <div key={index} className="space-y-4">
                <h3 className="text-[#000000] font-medium mb-6 text-base">{data.round}</h3>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Investment Amount:</span>
                  <span className="text-gray-900 font-medium">{data.investmentAmount}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Pre-Money Valuation:</span>
                  <span className="text-gray-900 font-medium">{data.preMoneyValuation}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Post-Money Valuation:</span>
                  <span className="text-gray-900 font-medium">{data.postMoneyValuation}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Ownership:</span>
                  <span className="text-gray-900 font-medium">{data.ownership}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Date:</span>
                  <span className="text-gray-900 font-medium">{data.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}