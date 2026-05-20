"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Step1PriorInvestment from './Step1PriorInvestment';
import Step2CapTable from './Step2CapTable';
import Step3SenioritySelection from './Step3SenioritySelection';
import Step3ContractValuation from './Step3ContractValuation';
import { updateSimulation } from '@/services/simulation.service';
import { simulationStorage } from '@/lib/simulationStorage';
import toast from 'react-hot-toast';

type Step = 'step1' | 'step2' | 'step3' | 'step4';

const getStepFromQuery = (stepParam: string | null): Step => {
  if (stepParam === 'step2') return 'step2';
  if (stepParam === 'step3') return 'step3';
  if (stepParam === 'step4') return 'step4';
  return 'step1';
};

const defaultSimData = {
  name: '', description: '', fundName: '', portfolioCompany: '', simulationId: '',
  foundersShares: 9000000, allocatedOptions: 0, unallocatedOptions: 0,
  safeNotes: [], debtRounds: [], equityRounds: [], pricedRounds: [], capTable: [],
  seniority: { debt: [['Senior Debt'], ['Junior Debt']], equity: [['Series B'], ['Series A']] },
  contractValuation: { expectedTimeToExit: 5, volatilityHoldingPeriod: 1, subjectivePostMoneyValuation: 0, volatility: '80%', riskFreeRate: 4.3 },
};

const Simulator = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepParam = searchParams.get('step');
  const [currentStep, setCurrentStep] = useState<Step>(getStepFromQuery(stepParam));
  const [simulationData, setSimulationData] = useState<any>(defaultSimData);
  const [isHydrated, setIsHydrated] = useState(false);

  // Sync step with URL
  useEffect(() => {
    setCurrentStep(getStepFromQuery(searchParams.get('step')));
  }, [searchParams]);

  // Scroll to top on step change
  useEffect(() => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'auto' });
  }, [currentStep]);

  // Load saved simulation data on mount (persists across refresh)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // First check sessionStorage (new simulation just created)
    const sessionData = sessionStorage.getItem('simulationData');
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        const merged = { ...defaultSimData, ...parsed };
        setSimulationData(merged);
        simulationStorage.saveSimData(merged); // persist to localStorage
        sessionStorage.removeItem('simulationData');
        setIsHydrated(true);
        return;
      } catch {}
    }

    // Then check localStorage (refresh recovery)
    const saved = simulationStorage.loadSimData();
    if (saved) {
      setSimulationData({ ...defaultSimData, ...saved });
    }
    setIsHydrated(true);
  }, []);

  // Auto-save simulation data to localStorage on every change
  useEffect(() => {
    if (!isHydrated) return;
    simulationStorage.saveSimData(simulationData);
  }, [simulationData, isHydrated]);

  // Save step to localStorage on change
  useEffect(() => {
    if (!isHydrated) return;
    simulationStorage.saveStep(currentStep);
  }, [currentStep, isHydrated]);

  const navigateToStep = (step: Step) => {
    setCurrentStep(step);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('step', step);
      window.history.replaceState(null, '', `${url.pathname}${url.search}`);
    }
  };

  const handleStep1Continue = (step1Data: any) => {
    const debtNames = (step1Data.debtRounds || []).map((d: any, i: number) => d.roundName || `Debt Round ${i + 1}`);
    const equityNames = [
      ...(step1Data.equityRounds || []).map((e: any) => e.roundName || 'Equity Round'),
      ...(step1Data.pricedRounds || []).map((p: any) => p.roundName || 'Priced Round'),
    ];
    const debtSeniority = debtNames.length > 0 ? debtNames.map((n: string) => [n]) : [['Senior Debt'], ['Junior Debt']];
    const equitySeniority = equityNames.length > 0 ? [...equityNames].reverse().map((n: string) => [n]) : [['Series B'], ['Series A']];

    setSimulationData((prev: any) => ({
      ...prev, ...step1Data,
      seniority: { debt: debtSeniority, equity: equitySeniority },
    }));
    navigateToStep('step2');
  };

  const handleStep2Continue = (step2Data: any) => {
    setSimulationData((prev: any) => ({ ...prev, ...step2Data }));
    navigateToStep('step3');
  };

  const handleStep3Continue = (step3Data: any) => {
    setSimulationData((prev: any) => ({ ...prev, seniority: step3Data }));
    navigateToStep('step4');
  };

  const handleStep4Continue = async (step4Data: any) => {
    const resultPayload = { ...simulationData, contractValuation: step4Data };
    setSimulationData(resultPayload);

    // Save to both keys so simulation-results page finds it regardless of entry point
    simulationStorage.saveResultsData(resultPayload);
    simulationStorage.saveSimData(resultPayload);  // also save to tsg_simulation_data key

    // Update backend simulation name/desc
    if (simulationData.simulationId) {
      try {
        await updateSimulation(simulationData.simulationId, {
          name: simulationData.name,
          description: simulationData.description,
        });
      } catch {}
    }

    router.push('/investor-admin/simulation-results');
  };

  const handleStepBack = () => {
    if (currentStep === 'step2') navigateToStep('step1');
    else if (currentStep === 'step3') navigateToStep('step2');
    else if (currentStep === 'step4') navigateToStep('step3');
    else router.push('/investor-admin/my-funds');
  };

  const stepLabels = [
    'Step 1: Prior Investment Information',
    'Step 2: Cap Table Summary',
    'Step 3: Seniority Selection',
    'Step 4: Contract Valuation',
  ];
  const steps: Step[] = ['step1', 'step2', 'step3', 'step4'];
  const currentStepIdx = steps.indexOf(currentStep);

  if (!isHydrated) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-2 border-[#2D60FF]/20 border-t-[#2D60FF] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="px-8 py-4 border-b border-gray-100 bg-white sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          {steps.map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${currentStepIdx >= i ? 'bg-[#2D60FF]' : 'bg-gray-100'}`} />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-[#2D60FF]">{stepLabels[currentStepIdx]}</p>
          <div className="flex items-center gap-3">
            {simulationData.name && (
              <span className="text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                {simulationData.name}{simulationData.portfolioCompany && ` · ${simulationData.portfolioCompany}`}
              </span>
            )}
            <span className="text-xs text-gray-400">{currentStepIdx + 1} / {steps.length}</span>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="animate-in fade-in duration-300">
        {currentStep === 'step1' && <Step1PriorInvestment data={simulationData} onContinue={handleStep1Continue} onStepBack={handleStepBack} />}
        {currentStep === 'step2' && <Step2CapTable data={simulationData} onContinue={handleStep2Continue} onStepBack={handleStepBack} />}
        {currentStep === 'step3' && <Step3SenioritySelection data={simulationData.seniority} onContinue={handleStep3Continue} onStepBack={handleStepBack} />}
        {currentStep === 'step4' && <Step3ContractValuation data={simulationData.contractValuation} onContinue={handleStep4Continue} onStepBack={handleStepBack} />}
      </div>
    </div>
  );
};

export default Simulator;