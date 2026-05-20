"use client";

import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

const InvestorDetailsModal = ({ isOpen, onClose, rowData }: any) => {
  const [activeTab, setActiveTab] = useState(rowData?.name || 'Founders');
  const [investors, setInvestors] = useState([
    { id: 1, name: 'Activest III', shares: 50000 },
    { id: 2, name: 'Sequoia', shares: 50000 },
  ]);

  const addInvestor = () => {
    const newInvestor = { id: Date.now(), name: '', shares: 0 };
    setInvestors([...investors, newInvestor]);
  };

  const removeInvestor = (id: number) => {
    setInvestors(investors.filter(inv => inv.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-[#F9FAFB]">
          <div>
            <h2 className="text-xl font-bold text-[#101828]">Add Investor Details</h2>
            <p className="text-sm text-[#667085]">Managing details for {rowData?.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X size={24} />
          </button>
        </div>

        {/* Tabs - Interactive */}
        <div className="flex border-b px-6 bg-white overflow-x-auto">
          {['Founders', 'Unallocated Options', 'Series A', 'Series B'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-6 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {investors.map((investor, index) => (
            <div key={investor.id} className="p-5 border border-[#EAECF0] rounded-xl bg-[#F9FAFB] relative group">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-[#667085] uppercase tracking-wider">Investor Name</label>
                  <input 
                    type="text" 
                    defaultValue={investor.name}
                    placeholder="e.g. Accel Partners"
                    className="w-full p-3 border border-[#D0D5DD] rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-[#667085] uppercase tracking-wider">Shares Amount</label>
                  <input 
                    type="number" 
                    defaultValue={investor.shares}
                    placeholder="0"
                    className="w-full p-3 border border-[#D0D5DD] rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                  />
                </div>
              </div>
              
              <button 
                onClick={() => removeInvestor(investor.id)}
                className="absolute -right-3 -top-3 bg-white border border-red-100 p-1.5 rounded-full text-red-500 shadow-sm hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {/* Add Another Button */}
          <button 
            onClick={addInvestor}
            className="w-full py-4 border-2 border-dashed border-[#D0D5DD] rounded-xl text-[#475467] font-bold hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add Another Investor
          </button>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-white flex gap-4">
          <button onClick={onClose} className="flex-1 py-3 font-bold text-[#344054] border border-[#D0D5DD] rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button className="flex-1 py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-shadow shadow-lg shadow-blue-100">
            Save Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvestorDetailsModal;