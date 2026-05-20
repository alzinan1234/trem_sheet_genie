"use client";

import React, { useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';

interface Investor {
  id: number;
  company: string;
  fund: string;
  amount: string;
  isLead: boolean;
  type?: string;
  committedCapital?: string;
  mgmtFees?: string;
  carry?: string;
  hurdleRate?: string;
}

const AddInvestorsPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const returnStep = searchParams.get('returnStep') === 'step2' ? 'step2' : 'step1';
  const rawReturnTo = searchParams.get('returnTo');
  const returnTo =
    rawReturnTo === '/investor-admin/new-portfolio-company'
      ? '/investor-admin/new-portfolio-company'
      : '/investor-admin/simulator';
  const [activeTab, setActiveTab] = useState(id || 'Founders');

  const [investors, setInvestors] = useState<Investor[]>([
    {
      id: 1,
      company: 'Sequoia',
      fund: 'Sequoia Industrials III',
      amount: '1,000,000',
      isLead: false,
    }
  ]);

  const addAnotherInvestor = () => {
    const newId = investors.length + 1;
    setInvestors([...investors, {
      id: newId,
      company: '',
      fund: '',
      amount: '0',
      isLead: false,
      committedCapital: '100,000,000',
      mgmtFees: '2%',
      carry: '20%',
      hurdleRate: '8%'
    }]);
  };

  const toggleLeadInvestor = (investorId: number) => {
    setInvestors((prevInvestors) =>
      prevInvestors.map((investor) =>
        investor.id === investorId
          ? { ...investor, isLead: !investor.isLead }
          : investor
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header & Tabs */}
        <div className="flex items-center gap-12 border-b border-gray-100 mb-8">
          <div className="flex items-center gap-2 pb-5">
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <svg className="w-5 h-5 text-[#2D60FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <h1 className="text-xl  text-[#1e293b]">Add investors</h1>
          </div>

          <nav className="flex gap-8 pb-5 text-sm ">
            {['Founders', 'Series A', 'Seriers B'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`transition-all ${activeTab === tab ? "text-[#2D60FF] border-b-2 border-[#2D60FF] -mb-[21px] pb-5" : "text-gray-400 hover:text-gray-600"}`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Left Side: Forms */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-lg font-bold text-[#1e293b]">{activeTab}</h2>
            
            {investors.map((inv, idx) => (
              <div 
                key={inv.id} 
                className="bg-white border border-gray-100 shadow-sm flex flex-col gap-[16px] items-start pb-[24px] pt-[16px] px-[16px] relative rounded-[16px] shrink-0 w-full max-w-[331px] md:max-w-full"
              >
                <p className="text-[12px] font-semibold text-[#2D60FF]">Investor #{inv.id}</p>
                <h3 className="text-[16px] font-bold text-[#1e293b]">Basic Investment Information</h3>

                <div className="w-full space-y-[16px]">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#2D60FF]" />
                    <label className="text-[14px] text-gray-500 font-medium">Not invested in this round</label>
                  </div>

                  <div className="grid grid-cols-[140px_1fr] items-center gap-3">
                    <label className="text-[13px] text-gray-500">Investment Company</label>
                    <input type="text" defaultValue={inv.company} className="w-full p-2.5 rounded-lg border border-gray-100 text-[13px] outline-none" />
                    
                    <label className="text-[13px] text-gray-500">Investment Fund</label>
                    <input type="text" defaultValue={inv.fund} className="w-full p-2.5 rounded-lg border border-gray-100 text-[13px] outline-none" />
                    
                    <label className="text-[13px] text-gray-500">Investment in Round</label>
                    <input type="text" defaultValue={`$${inv.amount}`} className="w-full p-2.5 rounded-lg border-none text-[13px] bg-[#F0F4FF] font-bold text-[#1e293b]" />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      id={`lead-investor-${inv.id}`}
                      type="checkbox"
                      checked={inv.isLead}
                      onChange={() => toggleLeadInvestor(inv.id)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <label
                      htmlFor={`lead-investor-${inv.id}`}
                      className="text-[13px] text-[#1e293b] cursor-pointer"
                    >
                      Lead Investor?
                    </label>
                  </div>

                  {/* Nested Fund Details - image_f164a4 specifications */}
                  {idx > 0 && (
                    <div className="w-full p-[16px] bg-[#F8FAFF] rounded-[16px] border border-[#E0E7FF] flex flex-col gap-[16px]">
                      <div className="flex justify-between items-center">
                        <span className="text-[14px]  text-[#1e293b]">Basic Fund Information</span>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="w-3.5 h-3.5" />
                          <span className="text-[12px] text-gray-400">Unknown</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-[140px_1fr] items-center gap-3">
                        <label className="text-[12px] text-gray-400">Total Committed Capital</label>
                        <input type="text" defaultValue={`$${inv.committedCapital}`} className="w-full p-2 bg-white border border-gray-100 rounded text-[12px] text-gray-400" />
                        
                        <label className="text-[12px] text-gray-400">Management Fees</label>
                        <input type="text" defaultValue={inv.mgmtFees} className="w-full p-2 bg-white border border-gray-100 rounded text-[12px] text-gray-400" />
                        
                        <label className="text-[12px] text-gray-400">Carry</label>
                        <div className="flex gap-2">
                          <select className="flex-1 p-2 bg-white border border-gray-100 rounded text-[12px] text-gray-400">
                            <option>Select</option>
                          </select>
                          <input type="text" defaultValue={inv.carry} className="w-16 p-2 bg-white border border-gray-100 rounded text-[12px] text-gray-400 text-center" />
                        </div>

                        <label className="text-[12px] text-gray-400">Hurdle Rate</label>
                        <input type="text" defaultValue={inv.hurdleRate} className="w-full p-2 bg-white border border-gray-100 rounded text-[12px] text-gray-400" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <button 
              onClick={addAnotherInvestor}
              className="w-full max-w-[331px] md:max-w-full py-4 bg-[#2D60FF] text-white rounded-[16px] font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
            >
              <div className="bg-white rounded-full p-0.5">
                <svg className="w-4 h-4 text-[#2D60FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/>
                </svg>
              </div>
              Add another investor
            </button>

            {/* Other Investors Section */}
            <div className="bg-white rounded-[16px] p-[16px] border border-gray-50 shadow-sm max-w-[331px] md:max-w-full">
              <h3 className="text-[16px] font-bold mb-4 text-[#1e293b]">Other Investors</h3>
              <div className="grid grid-cols-[140px_1fr] items-center gap-3">
                <label className="text-[13px] text-gray-500">Remaining Investment</label>
                <input readOnly value="$4,000,000" className="w-full p-2.5 rounded-lg border-none text-[13px] bg-[#F0F4FF] font-bold text-[#1e293b]" />
              </div>
            </div>
          </div>

          {/* Right Side: Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[16px] p-10 border border-gray-50 shadow-sm sticky top-8">
              <h3 className="text-[20px]  text-[#1e293b] mb-8">{activeTab}</h3>
              <div className="space-y-6">
                {[
                  { label: 'Share Class', value: 'Series A Preferred', color: 'text-[#1e293b]' },
                  { label: 'Total Funding', value: '$5,000,000', color: 'text-[#1e293b]' },
                  { label: 'Allocated to Investors', value: '$4,000,000', color: 'text-[#1e293b]' },
                  { label: 'My Investment in this Round', value: '$1,000,000', color: 'text-[#2D60FF]' },
                  { label: 'Remaining Unallocated', value: '$1,000,000', color: 'text-[#1e293b]' },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <span className="text-gray-400 text-[14px] ">{item.label}</span>
                    <span className={`text-[16px]  ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-16 flex justify-between items-center">
          <button 
            onClick={() => router.push(`${returnTo}?step=${returnStep}`)}
            className="px-8 py-2.5 border border-blue-200 text-blue-500 rounded-full hover:bg-blue-50 transition-all font-medium"
          >
            Back to Cap Table Summary
          </button>
          <button className="px-8 py-2.5 bg-[#3b66ff] text-white rounded-full hover:bg-blue-700 transition-all font-medium flex items-center gap-2">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddInvestorsPage;
