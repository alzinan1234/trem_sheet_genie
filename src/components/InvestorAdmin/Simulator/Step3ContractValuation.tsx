"use client";

import React, { useState } from 'react';

interface Step3Props {
  data: any;
  onContinue: (data: any) => void;
  onStepBack: () => void;
}

const Step3ContractValuation: React.FC<Step3Props> = ({ data, onContinue, onStepBack }) => {
  const [formData, setFormData] = useState({
    expectedTimeToExit: data?.expectedTimeToExit || 0,
    volatilityHoldingPeriod: data?.volatilityHoldingPeriod || 0,
    subjectivePostMoneyValuation: data?.subjectivePostMoneyValuation || 0,
    volatility: data?.volatility || "90%",
    riskFreeRate: data?.riskFreeRate || 4.3,
  });

  const [showAdvanced, setShowAdvanced] = useState(true);

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  // Reusable Tooltip Component to maintain design consistency
  const Tooltip = ({ text }: { text: string }) => (
    <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-[#2D2D2D] text-white text-[11px] rounded shadow-lg z-50">
      {text}
      {/* Tooltip Arrow */}
      <div className="absolute top-full left-2 -mt-1 border-4 border-transparent border-t-[#2D2D2D]"></div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] p-8 font-sans">
      {/* Top Checkbox */}
      <div className="flex items-center gap-2 mb-6">
        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600" id="default-inputs" />
        <label htmlFor="default-inputs" className="text-xs text-gray-600">
          Use default inputs for contract valuation
        </label>
      </div>

      <h1 className="text-2xl text-[#1e293b] font-medium mb-2">Contract Valuation Inputs</h1>
      <p className="text-sm text-gray-500 mb-8 max-w-5xl leading-relaxed">
        Understanding your valuation of the company as it currently stands and view of market conditions for this kind of investment will permit Term Sheet Genie to calculate the value of your investment contracts.
      </p>

      {/* Main Container */}
      <div className="space-y-6">
        {/* Top Row: Exit Time and Volatility */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 flex items-center justify-between relative">
          <div className="flex-1">
            <label className="block text-sm font-medium text-[#334155] mb-2 flex items-center gap-1">
              Expected Time to Exit (Yrs): 
              <div className="relative group inline-block">
                <span className="text-gray-400 cursor-help">ⓘ</span>
                <Tooltip text="Estimated number of years until a liquidity event or exit occurs." />
              </div>
            </label>
            <input
              type="number"
              value={formData.expectedTimeToExit}
              onChange={(e) => handleChange('expectedTimeToExit', e.target.value)}
              className="w-full bg-[#f1f5f9] border-none rounded-lg py-3 px-4 text-gray-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="px-6 text-2xl font-light text-gray-400 mt-4">+/-</div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-[#334155] mb-2 flex items-center gap-1">
              Volatility Around Holding Period (Yrs): 
              <div className="relative group inline-block">
                <span className="text-gray-400 cursor-help">ⓘ</span>
                <Tooltip text="Variation in the expected timing of the exit event." />
              </div>
            </label>
            <input
              type="number"
              value={formData.volatilityHoldingPeriod}
              onChange={(e) => handleChange('volatilityHoldingPeriod', e.target.value)}
              className="w-full bg-[#f1f5f9] border-none rounded-lg py-3 px-4 text-gray-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Advanced Options Section */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-[#475569] font-medium text-sm mb-6"
          >
            Advanced Options <span className={`transition-transform ${showAdvanced ? '' : '-rotate-90'}`}>▼</span>
          </button>

          {showAdvanced && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#334155] mb-2 flex items-center gap-1">
                  Subjective Post Money Valuation ($M) After All Funding 
                  <div className="relative group inline-block">
                    <span className="text-gray-400 cursor-help">ⓘ</span>
                    <Tooltip text="The subjective current value of the company (in millions) as determined by your analysis." />
                  </div>
                </label>
                <input
                  type="number"
                  value={formData.subjectivePostMoneyValuation}
                  onChange={(e) => handleChange('subjectivePostMoneyValuation', e.target.value)}
                  className="w-full bg-[#f1f5f9] border-none rounded-lg py-3 px-4 text-gray-700 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-12">
                <div>
                  <label className="block text-sm font-medium text-[#334155] mb-2 flex items-center gap-1">
                    Volatility (%): 
                    <div className="relative group inline-block">
                      <span className="text-gray-400 cursor-help">ⓘ</span>
                      <Tooltip text="The standard deviation of the company's value returns." />
                    </div>
                  </label>
                  <input
                    type="text"
                    value={formData.volatility}
                    onChange={(e) => handleChange('volatility', e.target.value)}
                    className="w-full bg-[#f1f5f9] border-none rounded-lg py-3 px-4 text-gray-700 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#334155] mb-2 flex items-center gap-1">
                    Risk Free Rate (%): 
                    <div className="relative group inline-block">
                      <span className="text-gray-400 cursor-help">ⓘ</span>
                      <Tooltip text="The theoretical rate of return of an investment with zero risk." />
                    </div>
                  </label>
                  <input
                    type="number"
                    value={formData.riskFreeRate}
                    onChange={(e) => handleChange('riskFreeRate', e.target.value)}
                    className="w-full bg-[#f1f5f9] border-none rounded-lg py-3 px-4 text-gray-700 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
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
            onClick={() => onContinue(formData)}
            className="px-8 py-2.5 bg-[#3b66ff] text-white rounded-full hover:bg-blue-700 transition-all font-medium flex items-center gap-2"
          >
            Continue 
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step3ContractValuation;
