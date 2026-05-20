"use client";

import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function CompanyInfoAccordion() {
  const [isOpen, setIsOpen] = useState(true);

  const infoData = {
    foundedDate: "March 12, 2019",
    status: "Active",
    ceo: "Sarah Chen",
    industry: "Enterprise SaaS",
    headquarters: "San Francisco, CA",
    employees: "45",
    website: "techstartup.io",
    description: "AI-powered analytics platform for enterprise data"
  };

  return (
    <div className="bg-white rounded-xl border border-[#EAECF0] shadow-sm overflow-hidden transition-all">
      {/* Accordion Header - Moved to right corner */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-end gap-2 px-6 py-4 bg-white hover:bg-gray-50 transition-colors border-b border-[#F2F4F7]"
      >
        {/* Updated: Same font, size, and color as Catalog title */}
        <span className="text-lg font-semibold text-[#101828] mr-auto">Basic Company Information</span>
        {isOpen ? (
          <ChevronUp size={18} className="text-[#667085]" />
        ) : (
          <ChevronDown size={18} className="text-[#667085]" />
        )}
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 animate-in fade-in duration-300">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <label className="text-[12px] font-medium text-[#667085] block mb-1">Founded Date</label>
              <p className="text-[14px] font-semibold text-[#101828]">{infoData.foundedDate}</p>
            </div>
            <div>
              <label className="text-[12px] font-medium text-[#667085] block mb-1">Status</label>
              <p className="text-[14px] font-semibold text-[#101828]">{infoData.status}</p>
            </div>
            <div>
              <label className="text-[12px] font-medium text-[#667085] block mb-1">CEO</label>
              <p className="text-[14px] font-semibold text-[#101828]">{infoData.ceo}</p>
            </div>
            <div>
              <label className="text-[12px] font-medium text-[#667085] block mb-1">Industry</label>
              <p className="text-[14px] font-semibold text-[#101828]">{infoData.industry}</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <label className="text-[12px] font-medium text-[#667085] block mb-1">Headquarters</label>
              <p className="text-[14px] font-semibold text-[#101828]">{infoData.headquarters}</p>
            </div>
            <div>
              <label className="text-[12px] font-medium text-[#667085] block mb-1">Employees</label>
              <p className="text-[14px] font-semibold text-[#101828]">{infoData.employees}</p>
            </div>
            <div>
              <label className="text-[12px] font-medium text-[#667085] block mb-1">Website</label>
              <a href={`https://${infoData.website}`} target="_blank" className="text-[14px] font-semibold text-black hover:underline">
                {infoData.website}
              </a>
            </div>
            <div>
              <label className="text-[12px] font-medium text-[#667085] block mb-1">Description</label>
              <p className="text-[14px] font-medium text-[#475467] leading-relaxed">
                {infoData.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}