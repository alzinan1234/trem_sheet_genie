"use client";
import React from "react";

interface SimulationResultsWrapperProps {
  data: any;
  onStepBack: () => void;
  children: React.ReactNode;
}

/**
 * Full Screen Wrapper for SimulationResults
 * Takes over entire screen when open
 */
export const SimulationResultsWrapper: React.FC<SimulationResultsWrapperProps> = ({
  data,
  onStepBack,
  children,
}) => {
  return (
    <div className="fixed inset-0 z-[9999] w-full h-screen bg-white overflow-auto">
      {children}
    </div>
  );
};

export default SimulationResultsWrapper;