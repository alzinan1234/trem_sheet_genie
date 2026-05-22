"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SimulationResults from '@/components/InvestorAdmin/Simulator/SimulationResults';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import toast from 'react-hot-toast';
import { getFunds } from '@/services/fund.service';
import {
  buildPricedRound,
  buildDebtRound,
  buildSingleSimulateRequest,
  buildMultipleSimulateParams,
  buildCapTableRequest,
  buildCapTableRequestMultiRound,
  simulateSingleInvestment,
  simulateSingleInvestmentWithValuation,
  simulateMultipleInvestments,
  simulateMultipleInvestmentsWithValuation,
  createCapTable,
} from '@/services/simulationEngine.service';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ValidationIssue {
  field: string;
  label: string;
  reason: string;
  step: string;
}

// ─── Front-end validation ─────────────────────────────────────────────────────

function validateSimulationData(data: any, fund: any): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const cv = data.contractValuation || {};
  const pricedRounds = data.pricedRounds || [];
  const debtRounds = data.debtRounds || [];
  const safeNotes = data.safeNotes || [];

  // Fund parameters
  if (!fund) {
    issues.push({ field: 'fundName', label: 'Fund', reason: 'Could not find the selected fund. Please go back and select a valid fund.', step: 'Step 1' });
  } else {
    if (!Number(fund.committedCapital) || Number(fund.committedCapital) <= 0)
      issues.push({ field: 'committedCapital', label: 'Fund → Committed Capital', reason: 'Must be greater than 0. Go to Fund Settings to update.', step: 'Fund Settings' });
    if (!Number(fund.commitmentPeriod) || Number(fund.commitmentPeriod) <= 0)
      issues.push({ field: 'commitmentPeriod', label: 'Fund → Commitment Period (Years)', reason: 'Must be greater than 0. Go to Fund Settings to update.', step: 'Fund Settings' });
    if (!Number(fund.term) || Number(fund.term) <= 0)
      issues.push({ field: 'term', label: 'Fund → Fund Lifetime / Term (Years)', reason: 'Must be greater than 0. Go to Fund Settings to update.', step: 'Fund Settings' });
    if (Number(fund.commitmentPeriodManagementFee) < 0)
      issues.push({ field: 'commitmentPeriodManagementFee', label: 'Fund → Commitment Period Management Fee (%)', reason: 'Cannot be negative.', step: 'Fund Settings' });
    if (Number(fund.postCommitmentPeriodManagementFee) < 0)
      issues.push({ field: 'postCommitmentPeriodManagementFee', label: 'Fund → Post Commitment Period Management Fee (%)', reason: 'Cannot be negative.', step: 'Fund Settings' });
    if (!Number(fund.carryPercentage) || Number(fund.carryPercentage) <= 0)
      issues.push({ field: 'carryPercentage', label: 'Fund → Performance Fee / Carry (%)', reason: 'Must be greater than 0. Go to Fund Settings to update.', step: 'Fund Settings' });
  }

  // Founder shares
  if (!Number(data.foundersShares) || Number(data.foundersShares) <= 0)
    issues.push({ field: 'foundersShares', label: 'Founders Outstanding Shares', reason: 'Must be greater than 0.', step: 'Step 1' });

  // At least one priced round
  if (pricedRounds.length === 0)
    issues.push({ field: 'pricedRounds', label: 'Priced Round', reason: 'At least one priced round is required. Click "Add Priced Round" in Step 1.', step: 'Step 1' });

  // Each priced round
  pricedRounds.forEach((r: any, i: number) => {
    const label = r.roundName?.trim() || `Round ${i + 1}`;
    if (!r.roundName?.trim())
      issues.push({ field: `pricedRounds[${i}].roundName`, label: `Round ${i + 1} → Round Name`, reason: 'Enter a name for this round.', step: 'Step 1' });
    if (!r.investmentDate)
      issues.push({ field: `pricedRounds[${i}].investmentDate`, label: `${label} → Investment Date`, reason: 'Select an investment date.', step: 'Step 1' });
    if (!Number(r.investmentAmount) || Number(r.investmentAmount) <= 0)
      issues.push({ field: `pricedRounds[${i}].investmentAmount`, label: `${label} → Investment Amount ($)`, reason: 'Must be greater than $0.', step: 'Step 1' });
    if (!Number(r.ownership) || Number(r.ownership) <= 0)
      issues.push({ field: `pricedRounds[${i}].ownership`, label: `${label} → Ownership (# shares or %)`, reason: 'Must be greater than 0.', step: 'Step 1' });
    if (!Number(r.liquidationPreference) || Number(r.liquidationPreference) <= 0)
      issues.push({ field: `pricedRounds[${i}].liquidationPreference`, label: `${label} → Liquidation Preference Multiple`, reason: 'Must be > 0. Standard value is 1.0×.', step: 'Step 1' });
  });

  // Each debt round
  debtRounds.forEach((d: any, i: number) => {
    const label = d.roundName?.trim() || `Debt Round ${i + 1}`;
    if (!Number(d.principalAmount) || Number(d.principalAmount) <= 0)
      issues.push({ field: `debtRounds[${i}].principalAmount`, label: `${label} → Principal Amount ($)`, reason: 'Must be greater than $0.', step: 'Step 1' });
    if (!d.expirationDate)
      issues.push({ field: `debtRounds[${i}].expirationDate`, label: `${label} → Expiration Date`, reason: 'Required — used as the debt maturity date.', step: 'Step 1' });
    if (Number(d.interestRate) < 0)
      issues.push({ field: `debtRounds[${i}].interestRate`, label: `${label} → Interest Rate (%)`, reason: 'Cannot be negative.', step: 'Step 1' });
  });

  // Each SAFE / Convertible Note
  safeNotes.forEach((s: any, i: number) => {
    const label = s.roundName?.trim() || `SAFE/Note ${i + 1}`;
    if (!Number(s.investmentAmount) || Number(s.investmentAmount) <= 0)
      issues.push({ field: `safeNotes[${i}].investmentAmount`, label: `${label} → Investment Amount ($)`, reason: 'Must be greater than $0.', step: 'Step 1' });
    if (!s.convertingPricedRound)
      issues.push({ field: `safeNotes[${i}].convertingPricedRound`, label: `${label} → Converting Priced Round`, reason: 'Select which priced round this SAFE/Note converts into.', step: 'Step 1' });
    if (!s.investmentDate)
      issues.push({ field: `safeNotes[${i}].investmentDate`, label: `${label} → Investment Date`, reason: 'Select an investment date.', step: 'Step 1' });
  });

  // Step 4 — Contract Valuation
  if (!Number(cv.expectedTimeToExit) || Number(cv.expectedTimeToExit) <= 0)
    issues.push({ field: 'expectedTimeToExit', label: 'Expected Time to Exit (Years)', reason: 'Must be greater than 0.', step: 'Step 4' });
  if (!Number(cv.volatilityHoldingPeriod) || Number(cv.volatilityHoldingPeriod) <= 0)
    issues.push({ field: 'volatilityHoldingPeriod', label: 'Volatility Around Holding Period (Years)', reason: 'Must be greater than 0.', step: 'Step 4' });
  const vol = parseFloat(String(cv.volatility || '').replace('%', ''));
  if (!vol || vol <= 0 || vol > 200)
    issues.push({ field: 'volatility', label: 'Volatility (%)', reason: 'Must be between 1% and 200%. Typical value: 80%.', step: 'Step 4' });
  if (!Number(cv.riskFreeRate) || Number(cv.riskFreeRate) <= 0)
    issues.push({ field: 'riskFreeRate', label: 'Risk Free Rate (%)', reason: 'Must be greater than 0. Typical value: 4–5%.', step: 'Step 4' });

  return issues;
}

// ─── Parse API error into friendly message ────────────────────────────────────

function parseApiError(err: any): string {
  const raw =
    err?.response?.data?.error?.message ||
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.message ||
    'Unknown error';
  const msg = String(raw);

  if (msg.includes('committed_capital')) return 'Fund Committed Capital is 0 or missing. Please go to your Fund Settings and enter a valid Committed Capital amount greater than 0.';
  if (msg.includes('commitment_period_mgmt_fee') || msg.includes('post_commitment_period_mgmt_fee')) return 'Fund Management Fee is missing or negative. Please check your Fund Settings.';
  if (msg.includes('commitment_period')) return 'Fund Commitment Period is 0 or missing. Please update your Fund Settings.';
  if (msg.includes('performance_fee')) return 'Fund Performance Fee (Carry %) is 0 or missing. Please update your Fund Settings.';
  if (msg.includes('fund_lifetime')) return 'Fund Lifetime is 0 or missing. Please update your Fund Settings.';
  if (msg.includes('moic')) return 'Fund MOIC target is 0 or missing. Please update your Fund Settings.';
  if (msg.includes('founder_shares') || msg.includes('founderShares')) return 'Founders Outstanding Shares is 0 or missing. Please check Step 1.';
  if (msg.includes('investment_amount') || msg.includes('investmentAmount')) return 'Investment amount is 0 or missing in one of your rounds. Please check Step 1.';
  if (msg.includes('vc_shares') || msg.includes('target_percent_ownership')) return 'Ownership (shares or %) is 0 or missing in one of your priced rounds. Please check Step 1.';
  if (msg.includes('liquidation_preference')) return 'Liquidation Preference Multiple is 0 or missing. Must be greater than 0 (standard: 1.0×).';
  if (msg.includes('holding_period') || msg.includes('holdingPeriod')) return 'Expected Time to Exit is 0 or missing. Please check Step 4.';
  if (msg.includes('volatility_around_holding')) return 'Volatility Around Holding Period is 0 or missing. Please check Step 4.';
  if (msg.includes('volatility')) return 'Volatility (%) is 0 or invalid. Please check Step 4.';
  if (msg.includes('risk_free_rate') || msg.includes('riskFreeRate')) return 'Risk Free Rate is 0 or missing. Please check Step 4.';
  if (msg.includes('principal')) return 'Principal amount for a SAFE or Debt round is 0 or missing. Please check Step 1.';
  if (msg.includes('valuation_cap')) return 'Valuation cap for a SAFE/Note is 0 or missing. Please check Step 1.';
  return msg;
}

// ─── Validation Error Panel ───────────────────────────────────────────────────

function ValidationErrorPanel({ issues, onBack }: { issues: ValidationIssue[]; onBack: () => void }) {
  const stepOrder = ['Fund Settings', 'Step 1', 'Step 4'];
  const byStep = issues.reduce((acc: Record<string, ValidationIssue[]>, issue) => {
    if (!acc[issue.step]) acc[issue.step] = [];
    acc[issue.step].push(issue);
    return acc;
  }, {});

  const stepColors: Record<string, string> = {
    'Fund Settings': 'bg-orange-50 text-orange-600 border-orange-100',
    'Step 1': 'bg-blue-50 text-[#2D60FF] border-blue-100',
    'Step 4': 'bg-purple-50 text-purple-600 border-purple-100',
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-[#F9FAFB] p-6 pt-12">
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm max-w-2xl w-full overflow-hidden">

        {/* Header */}
        <div className="bg-red-50 px-6 py-5 border-b border-red-100 flex items-start gap-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L1 17h18L10 2z" stroke="#ef4444" strokeWidth="1.5" fill="#fee2e2" />
              <path d="M10 8v4M10 14h.01" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-red-700">Cannot Run Simulation</h2>
            <p className="text-sm text-red-500 mt-0.5">
              {issues.length} required field{issues.length !== 1 ? 's are' : ' is'} missing or invalid.
              Fix them below, then try again.
            </p>
          </div>
        </div>

        {/* Issues by step */}
        <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
          {stepOrder.map(step => {
            const list = byStep[step];
            if (!list) return null;
            return (
              <div key={step} className="px-6 py-5">
                <div className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border mb-4 ${stepColors[step] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                  {step === 'Fund Settings' && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M6 0a6 6 0 100 12A6 6 0 006 0zm0 1a5 5 0 110 10A5 5 0 016 1zm-.5 2.5v4l3 1.5.5-1-2.5-1.25V3.5h-1z" /></svg>
                  )}
                  {step}
                </div>
                <ul className="space-y-3">
                  {list.map((issue, idx) => (
                    <li key={idx} className="flex gap-3 items-start bg-red-50/50 rounded-lg px-3 py-2.5">
                      <span className="text-red-400 shrink-0 mt-0.5 font-bold text-sm">✗</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{issue.label}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{issue.reason}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 bg-gray-50 border-t border-gray-100 space-y-2">
          <button
            onClick={onBack}
            className="w-full bg-[#2D60FF] text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
          >
            ← Go Back &amp; Fix Inputs
          </button>
          {byStep['Fund Settings'] && (
            <p className="text-xs text-center text-gray-400">
              💡 Fund Settings issues must be fixed from your <strong>Fund details page</strong>, not the simulator.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── API Error Panel ──────────────────────────────────────────────────────────

function ApiErrorPanel({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#F9FAFB] p-8">
      <div className="bg-white p-8 rounded-2xl border border-red-100 shadow-sm max-w-lg w-full text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 3L2 28h28L16 3z" stroke="#ef4444" strokeWidth="2" fill="#fee2e2" />
            <path d="M16 13v6M16 22h.01" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[#101828] mb-2">Simulation Error</h2>
        <p className="text-sm text-[#667085] mb-6 leading-relaxed">{message}</p>
        <button
          onClick={onBack}
          className="w-full bg-[#2D60FF] text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
        >
          ← Go Back &amp; Fix Inputs
        </button>
      </div>
    </div>
  );
}

// ─── Strip fund params from a round object ────────────────────────────────────
function stripFundParams(round: any): any {
  const { 
    committed_capital, 
    commitment_period, 
    commitment_period_mgmt_fee,
    post_commitment_period_mgmt_fee, 
    performance_fee, 
    moic, 
    fund_lifetime, 
    ...clean 
  } = round;
  return clean;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function SimulationResultsPageContent() {
  const router = useRouter();
  const [resultsData, setResultsData] = useState<any>(null);
  const [simResult, setSimResult] = useState<any>(null);
  const [capTableResult, setCapTableResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(true);
  const [calcError, setCalcError] = useState('');
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [fundData, setFundData] = useState<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Try all known storage keys in priority order
    const stored =
      localStorage.getItem('tsg_simulation_results') ||  // Step4 saves here (most complete — has contractValuation)
      localStorage.getItem('tsg_simulation_data') ||     // fallback — mid-flow data
      sessionStorage.getItem('simulationData') ||         // key used by SimulationSection / my-funds
      sessionStorage.getItem('simulationResultsData');   // legacy
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setResultsData(parsed);
        runSimulation(parsed);
      } catch {
        setIsCalculating(false);
      }
    } else {
      setIsCalculating(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runSimulation = async (data: any) => {
    const toastId = toast.loading('Running simulation...');
    try {
      const cv = data.contractValuation || {};

      // ── Fetch fund object by fundName if not already present ───────────────
      let fund: any = data.fund || null;
      if (!fund && data.fundName) {
        try {
          const fundRes = await getFunds();
          if (fundRes.success) {
            fund = ((fundRes.data as any) || []).find(
              (f: any) => f.fundName === data.fundName
            ) || null;
          }
        } catch {
          // validation will catch missing fund below
        }
      }

      // Save fetched fund to state so SimulationResults can use it for breakeven
      setFundData(fund);

      // ── Front-end validation ───────────────────────────────────────────────
      const issues = validateSimulationData(data, fund);
      if (issues.length > 0) {
        setValidationIssues(issues);
        toast.error(
          `${issues.length} input issue${issues.length !== 1 ? 's' : ''} found. Please fix them.`,
          { id: toastId }
        );
        setIsCalculating(false);
        return;
      }

      // ── Gather rounds ──────────────────────────────────────────────────────
      const pricedRounds = data.pricedRounds || [];
      const debtRounds = data.debtRounds || [];
      const safeNotes = data.safeNotes || [];

      const hasDebtOrSafe = debtRounds.length > 0 || safeNotes.length > 0;
      const hasMultiplePricedRounds = pricedRounds.length > 1;
      const isMultiPhase = hasDebtOrSafe || hasMultiplePricedRounds;

      const seniority = data.seniority || {};
      const equitySeniority = seniority.equity || [];
      const debtSeniorityList = seniority.debt || [];

      const getEquitySeniority = (roundName: string): number => {
        for (let i = 0; i < equitySeniority.length; i++) {
          const item = equitySeniority[i];
          const name = Array.isArray(item) ? item[0] : item;
          if (name === roundName) return i + 1;
        }
        return equitySeniority.length + 1;
      };

      const getDebtSeniority = (roundName: string): number => {
        for (let i = 0; i < debtSeniorityList.length; i++) {
          const item = debtSeniorityList[i];
          const name = Array.isArray(item) ? item[0] : item;
          if (name === roundName) return i + 1;
        }
        return debtSeniorityList.length + 1;
      };

      // ── Build rounds ──────────────────────────────────────────────────────
      // ✅ FIX: Build ALL priced rounds first (WITHOUT fund params for past rounds)
      const builtPricedRounds = pricedRounds.map((r: any, idx: number) => {
        // Ensure ownership has a valid value
        let ownershipValue = Number(r.ownership);
        let ownershipType = r.ownershipType || '%';

        if (isNaN(ownershipValue) || ownershipValue <= 0) {
          console.warn(`[Fix] Round ${r.roundName} had invalid ownership: ${r.ownership}, setting to 20%`);
          ownershipValue = 20;
          ownershipType = '%';
        }

        const fixedRound = {
          ...r,
          ownership: ownershipValue,
          ownershipType: ownershipType,
          investmentAmount: Number(r.investmentAmount) || 2000000
        };

        // ✅ FIX: Only pass fund for the LAST round (currentRound)
        const isCurrentRound = idx === pricedRounds.length - 1;
        return buildPricedRound(fixedRound, idx + 1, isCurrentRound ? fund : null);
      });

      // Current round = last one (has fund params)
      const currentPricedRound = builtPricedRounds[builtPricedRounds.length - 1];

      // Past priced rounds = all except last (strip fund params)
      const pastPricedRounds = builtPricedRounds.slice(0, builtPricedRounds.length - 1);
      
      // ✅ FIX: Strip fund params from past priced rounds (belt + suspenders)
      const pastPricedRoundsClean = pastPricedRounds.map((r: any) => stripFundParams(r));

      // Build debt rounds (no fund params)
      const builtDebtRounds = debtRounds.map((d: any) =>
        buildDebtRound(d, getDebtSeniority(d.roundName || d.name || ''))
      );

      // ✅ FIX: Combine clean past rounds + debt rounds
      const pastRoundsForSimulate = [...pastPricedRoundsClean, ...builtDebtRounds];

      // ── Build clean priced rounds for cap table (ALL without fund params) ──
      const cleanPricedRoundsForCapTable = builtPricedRounds.map((r: any) => stripFundParams(r));

      // ── Cap Table call ─────────────────────────────────────────────────────
      const capTableBody = hasMultiplePricedRounds
        ? buildCapTableRequestMultiRound(data, cleanPricedRoundsForCapTable, safeNotes)
        : buildCapTableRequest(data, cleanPricedRoundsForCapTable[0], safeNotes);

      console.log('[CapTable Request]', JSON.stringify(capTableBody, null, 2));
      const capRes = await createCapTable(capTableBody).catch(e => {
        console.warn('[CapTable Error]', e?.response?.data);
        return null;
      });

      // ── Simulate ───────────────────────────────────────────────────────────
      let simRes: any;
      const hasSubjective = Number(cv.subjectivePostMoneyValuation || 0) > 0;

      if (!isMultiPhase) {
        const body = buildSingleSimulateRequest(data, currentPricedRound, cv);
        console.log('[Phase 1 Body]', JSON.stringify(body, null, 2));
        simRes = hasSubjective
          ? await simulateSingleInvestmentWithValuation(body)
          : await simulateSingleInvestment(body);
      } else {
        const params = buildMultipleSimulateParams(data, currentPricedRound, pastRoundsForSimulate, safeNotes, cv);
        console.log('[Phase 2/3 Params]', JSON.stringify(params, null, 2));
        simRes = hasSubjective
          ? await simulateMultipleInvestmentsWithValuation(params)
          : await simulateMultipleInvestments(params);
      }

      console.log('[Simulate Response]', simRes);
      setSimResult(simRes);
      setCapTableResult(capRes);
      toast.success('Simulation complete!', { id: toastId });
    } catch (err: any) {
      const friendly = parseApiError(err);
      toast.error(friendly, { id: toastId });
      setCalcError(friendly);
      console.error('[Simulation Error]', err?.response?.data || err);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleBack = () => router.push('/investor-admin/simulator?step=step1');

  if (isCalculating) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#F9FAFB]">
      <div className="w-16 h-16 border-4 border-[#2D60FF]/20 border-t-[#2D60FF] rounded-full animate-spin" />
      <div className="text-center">
        <p className="text-lg font-bold text-[#101828]">Running Simulation</p>
        <p className="text-sm text-[#667085] mt-1">Calculating investment analysis...</p>
      </div>
    </div>
  );

  if (validationIssues.length > 0 && !simResult)
    return <ValidationErrorPanel issues={validationIssues} onBack={handleBack} />;

  if (calcError && !simResult)
    return <ApiErrorPanel message={calcError} onBack={handleBack} />;

  return (
    <SimulationResults
      data={{ ...resultsData, simResult, capTableResult, fund: fundData || resultsData?.fund }}
      onStepBack={() => router.push('/investor-admin/simulator?step=step4')}
    />
  );
}

export default function SimulationResultsPage() {
  return (
    <Suspense fallback={<PageLoader text="Loading..." />}>
      <SimulationResultsPageContent />
    </Suspense>
  );
}