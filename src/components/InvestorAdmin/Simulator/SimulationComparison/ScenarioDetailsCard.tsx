"use client";

import React from "react";

type ScenarioDetails = {
  investment: string;
  preMoney: string;
  ownership: string;
  breakevenValuation: string;
  fundPartialValuation: string;
};

const scenarioDetails: Record<number, ScenarioDetails> = {
  1: {
    investment: "$10,000,000",
    preMoney: "$40,000,000",
    ownership: "20%",
    breakevenValuation: "$53,090,000",
    fundPartialValuation: "$13,890,000",
  },
  2: {
    investment: "$12,000,000",
    preMoney: "$45,000,000",
    ownership: "21%",
    breakevenValuation: "$58,500,000",
    fundPartialValuation: "$15,300,000",
  },
};

const ScenarioDetailsCard = ({ id }: { id: number }) => {
  const details = scenarioDetails[id] ?? scenarioDetails[2];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm transition-all overflow-hidden w-full">
      <div className="flex justify-between items-center p-5 border-b border-gray-100">
        <h3 className="text-[15px] font-semibold text-[#1e293b]">Scenario {id} Details</h3>
      </div>

      <div className="px-5 py-5 space-y-4">
        <div className="flex justify-between items-center text-[13px]">
          <span className="text-gray-500 font-medium">Investment Amount</span>
          <span className="font-semibold text-[#1e293b]">{details.investment}</span>
        </div>

        <div className="flex justify-between items-center text-[13px]">
          <span className="text-gray-500 font-medium">Pre-Money Valuation</span>
          <span className="font-semibold text-[#1e293b]">{details.preMoney}</span>
        </div>

        <div className="flex justify-between items-center text-[13px]">
          <span className="text-gray-500 font-medium">Ownership %</span>
          <span className="font-semibold text-[#1e293b]">{details.ownership}</span>
        </div>

        <div className="flex justify-between items-center text-[13px]">
          <span className="text-gray-500 font-medium">Breakeven Valuation</span>
          <span className="font-semibold text-[#1e293b]">{details.breakevenValuation}</span>
        </div>

        <div className="flex justify-between items-center text-[13px]">
          <span className="text-gray-500 font-medium">Fund&apos;s Partial Valuation</span>
          <span className="font-semibold text-[#1e293b]">{details.fundPartialValuation}</span>
        </div>
      </div>
    </div>
  );
};

export default ScenarioDetailsCard;
