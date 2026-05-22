import simulationClient from '@/lib/simulationClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AntidilutionObject {
  has_antidilution: boolean;
  includes_preferred_shares: boolean;
  includes_common_shares: boolean;
  includes_unpriced_round_conversions: boolean;
}

export interface InvestmentRound {
  id: string;
  investment_type: string;
  investment_amount: number;
  vc_shares?: number;
  target_percent_ownership?: number;
  liquidation_preference_multiple: number;
  dividend_type: string;
  annual_dividend_rate: number;
  antidilution: AntidilutionObject;
  investment_date: string;
  seniority?: number;
  debt_seniority?: number;
  options_created_in_round?: number;
  target_percent_option_pool?: number;
  qpo_per_share?: number;
  cap_multiple?: number;
  committed_capital?: number;
  commitment_period?: number;
  commitment_period_mgmt_fee?: number;
  post_commitment_period_mgmt_fee?: number;
  performance_fee?: number;
  moic?: number;
  fund_lifetime?: number;
  interest_rate?: number;
  interest_type?: string;
}

export interface UnpricedRound {
  type: string;
  id: string;
  principal: number;
  valuation_cap: number;
  discount_rate: number;
  investment_date: string;
  priced_round_investment_date: string;
  converting_investment_round_id?: string;
  converting_round_id?: string;
  interest_rate?: number;
}

// ─── Helper: Normalize Round ID ───────────────────────────────────────────────
export function normalizeRoundId(roundName: string): string {
  if (!roundName) return '';

  let normalized = roundName
    .toLowerCase()
    .replace(/series\s+/i, '')
    .replace(/round\s+/i, '')
    .replace(/\s+/g, '_')
    .trim();

  if (normalized.length === 1 && /[a-z]/.test(normalized)) {
    normalized = `series_${normalized}`;
  }

  if (normalized.startsWith('round_')) {
    normalized = normalized.replace('round_', 'series_');
  }

  return normalized;
}

// ─── Round Name Generation ────────────────────────────────────────────────────
export function generatePricedRoundName(index: number): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return `Series ${letters[index] || String(index + 1)}`;
}

export function generateUnpricedRoundName(targetPricedRoundName: string, countInTarget: number): string {
  const match = targetPricedRoundName.match(/([A-Z])$/i);
  const letter = match ? match[1].toUpperCase() : targetPricedRoundName;
  return `Series ${letter}-${countInTarget}`;
}

// ─── API Calls ────────────────────────────────────────────────────────────────
export const calculateBlackScholes = async (params: any) => {
  const res = await simulationClient.post('/api/calculate', params);
  return res.data;
};

export const createCapTable = async (body: any) => {
  const res = await simulationClient.post('/api/create-cap-table', body);
  return res.data;
};

export const simulateSingleInvestment = async (body: any) => {
  const res = await simulationClient.post('/api/simulate/single-investment', body);
  return res.data;
};

export const simulateSingleInvestmentWithValuation = async (body: any) => {
  const res = await simulationClient.post('/api/simulate/single-investment/with-valuation', body);
  return res.data;
};

export const breakevenSingleInvestmentAmount = async (body: any) => {
  const res = await simulationClient.post('/api/breakeven/single-investment/investment-amount', body);
  return res.data;
};

export const breakevenSingleLiquidationPreference = async (body: any) => {
  const res = await simulationClient.post('/api/breakeven/single-investment/liquidation-preference-multiple', body);
  return res.data;
};

export const breakevenSingleVcShares = async (body: any) => {
  const res = await simulationClient.post('/api/breakeven/single-investment/vc-shares', body);
  return res.data;
};

export const simulateMultipleInvestments = async (params: any) => {
  const res = await simulationClient.post('/api/simulate/multiple-investments', { params });
  return res.data;
};

export const simulateMultipleInvestmentsWithValuation = async (params: any) => {
  const res = await simulationClient.post('/api/simulate/multiple-investments/with-valuation', { params });
  return res.data;
};

export const breakevenMultipleInvestmentAmount = async (params: any) => {
  const res = await simulationClient.post('/api/breakeven/multiple-investments/investment-amount', { params });
  return res.data;
};

export const breakevenMultipleLiquidationPreference = async (params: any) => {
  const res = await simulationClient.post('/api/breakeven/multiple-investments/liquidation-preference-multiple', { params });
  return res.data;
};

export const breakevenMultipleVcShares = async (params: any) => {
  const res = await simulationClient.post('/api/breakeven/multiple-investments/vc-shares', { params });
  return res.data;
};

export const calculateExitBreakdown = async (body: any) => {
  const res = await simulationClient.post('/api/exit-breakdown', body);
  return res.data;
};

export async function generateTermSheet(_data: any) {
  return null;
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

function normalizeFeePercent(val: number): number {
  if (!val) return 0;
  return val > 1 ? val / 100 : val;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [mm, dd, yyyy] = dateStr.split('/');
    return `${yyyy}-${mm}-${dd}`;
  }
  try {
    return new Date(dateStr).toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

export function deriveInvestmentType(participation: string, qpoMultiple: number, capMultiple: number): string {
  const isConverting = (participation || '').toLowerCase() === 'converting';
  if (isConverting) return 'convertible preferred';
  const hasQpo = qpoMultiple > 0;
  const hasCap = capMultiple > 0;
  if (!hasQpo && !hasCap) return 'redeemable preferred plus common';
  if (hasQpo && !hasCap) return 'participating convertible preferred';
  if (hasQpo && hasCap) return 'participating convertible preferred with cap';
  return 'convertible preferred';
}

export function deriveDividendType(type: string, frequency: string): string {
  const t = (type || '').toLowerCase().trim();
  const f = (frequency || '').toLowerCase().trim();
  if (!t || t === 'none') return 'none';
  if (t === 'simple') return 'simple';
  if (t === 'compounded' || t === 'compound' || t === 'continuous') {
    if (f.includes('annual') || f === 'annually') return 'compounded_annually';
    if (f.includes('semi') || f.includes('semiannually') || f.includes('semi-annually')) return 'compounded_semiannually';
    if (f.includes('quarter') || f.includes('quarterly')) return 'compounded_quarterly';
    if (f.includes('month') || f.includes('monthly')) return 'compounded_monthly';
    if (f.includes('continu') || f.includes('continuously')) return 'compounded_continuously';
    return 'compounded_annually';
  }
  return 'simple';
}

export function deriveAntidilution(val: string): AntidilutionObject {
  const v = (val || '').toLowerCase().trim();
  if (!v || v === 'none') {
    return { has_antidilution: false, includes_preferred_shares: false, includes_common_shares: false, includes_unpriced_round_conversions: false };
  }
  if (v.includes('full ratchet') || v === 'full') {
    return { has_antidilution: true, includes_preferred_shares: false, includes_common_shares: false, includes_unpriced_round_conversions: false };
  }
  if (v.includes('narrow')) {
    return { has_antidilution: true, includes_preferred_shares: true, includes_common_shares: false, includes_unpriced_round_conversions: false };
  }
  if (v.includes('broad')) {
    return { has_antidilution: true, includes_preferred_shares: true, includes_common_shares: true, includes_unpriced_round_conversions: true };
  }
  return { has_antidilution: false, includes_preferred_shares: false, includes_common_shares: false, includes_unpriced_round_conversions: false };
}

export function deriveInterestType(interestType: string, frequency: string): string {
  const t = (interestType || '').toLowerCase().trim();
  const f = (frequency || '').toLowerCase().trim();
  if (t === 'simple') return 'simple';
  if (t === 'fixed' || t === 'variable') {
    if (f.includes('annual') || f === 'annually') return 'compounded_annually';
    if (f.includes('semi') || f.includes('semiannually') || f.includes('semi-annually')) return 'compounded_semiannually';
    if (f.includes('quarter') || f.includes('quarterly')) return 'compounded_quarterly';
    if (f.includes('month') || f.includes('monthly')) return 'compounded_monthly';
    return 'compounded_annually';
  }
  return 'simple';
}

// ─── Build Priced Round Object ─────────────────────────────────────────────────
export function buildPricedRound(round: any, seniority: number, fund: any): InvestmentRound {
  const qpo = Number(round.qpoThresholdValue || 0);
  const cap = Number(round.capValue || 0);
  const participation = round.participation || 'Converting';
  const investment_type = deriveInvestmentType(participation, qpo, cap);
  const antidilutionVal = round.antidilution || 'None';

  // CRITICAL: Get values with proper defaults
  const investmentAmount = Number(round.investmentAmount || 0);
  let ownershipValue = Number(round.ownership || 0);
  let isPercentage = round.ownershipType === '%';
  
  // FIX: If ownership is 0 or invalid, set default 20%
  if (isNaN(ownershipValue) || ownershipValue <= 0) {
    console.warn(`[buildPricedRound] Round ${round.roundName} invalid ownership, using 20%`);
    ownershipValue = 20;
    isPercentage = true;
  }

  const obj: InvestmentRound = {
    id: round.roundName || `round-${seniority}`,
    investment_date: formatDate(round.investmentDate || ''),
    investment_type,
    investment_amount: investmentAmount / 1_000_000,
    liquidation_preference_multiple: Number(round.liquidationPreference || 1),
    dividend_type: deriveDividendType(round.dividends || 'None', round.dividendsSelect || ''),
    annual_dividend_rate: Number(round.dividendRate || 0) / 100,
    antidilution: deriveAntidilution(antidilutionVal),
    seniority,
  };

  // CRITICAL: ONLY ONE field - NOT both
  if (isPercentage) {
    obj.target_percent_ownership = ownershipValue / 100;
  } else {
    obj.vc_shares = ownershipValue / 1_000_000;
  }

  // Option Pool - ensure it has a value
  if (round.requestedOptionPoolType === '%') {
    const pct = Math.min(Math.max(Number(round.requestedOptionPool || 10), 1), 30);
    obj.target_percent_option_pool = pct / 100;
  } else {
    obj.options_created_in_round = Math.max(Number(round.requestedOptionPool || 0), 0) / 1_000_000;
  }

  if (qpo > 0) obj.qpo_per_share = qpo;
  if (qpo > 0 && cap > 0) obj.cap_multiple = cap;

  if (fund && Number(fund.committedCapital) > 0) {
    obj.committed_capital = Number(fund.committedCapital || 0) / 1_000_000;
    obj.commitment_period = Number(fund.commitmentPeriod || 10);
    obj.commitment_period_mgmt_fee = normalizeFeePercent(Number(fund.commitmentPeriodManagementFee || 2));
    obj.post_commitment_period_mgmt_fee = normalizeFeePercent(Number(fund.postCommitmentPeriodManagementFee || 1.5));
    obj.performance_fee = normalizeFeePercent(Number(fund.carryPercentage || 20));
    obj.moic = Number(fund.moic || 2.5);
    obj.fund_lifetime = Number(fund.term || 10);
  }

  return obj;
}

// ─── Build Debt Round Object ──────────────────────────────────────────────────
export function buildDebtRound(debt: any, debtSeniority: number): InvestmentRound {
  const roundId = normalizeRoundId(debt.roundName || debt.name || `debt-${debtSeniority}`);

  return {
    id: roundId,
    investment_type: 'venture_debt',
    investment_amount: Number(debt.principalAmount || debt.principal || 0) / 1_000_000,
    vc_shares: 0,
    liquidation_preference_multiple: 1.0,
    dividend_type: 'none',
    annual_dividend_rate: 0,
    antidilution: { has_antidilution: false, includes_preferred_shares: false, includes_common_shares: false, includes_unpriced_round_conversions: false },
    investment_date: formatDate(debt.expirationDate || debt.investmentDate || ''),
    debt_seniority: debtSeniority,
    interest_rate: Number(debt.interestRate || 0) / 100,
    interest_type: deriveInterestType(debt.interestType || 'Simple', debt.interestFrequency || 'Annual'),
    options_created_in_round: 0,
  };
}

// ─── Build Unpriced Round Object ──────────────────────────────────────────────
export function buildUnpricedRound(safe: any, pricedRoundDate: string): UnpricedRound {
  const typeMap: Record<string, string> = {
    'Pre-Money': 'pre_money_safe_note',
    'Post-Money': 'post_money_safe_note',
    'pre-money': 'pre_money_safe_note',
    'post-money': 'post_money_safe_note',
    'Convertible Note': 'convertible_note',
    'convertible_note': 'convertible_note',
  };

  const type = typeMap[safe.type] || 'pre_money_safe_note';
  const safeId = (safe.roundName || safe.name || safe.id || `safe-${Date.now()}`).trim();
  const roundId = safeId.toLowerCase().replace(/\s+/g, '_');
  
  // ✅ FIX: DO NOT normalize — keep the EXACT name from dropdown
  const convertingId = safe.convertingPricedRound || safe.convertingRoundId || '';
  // ❌ REMOVE: const convertingId = normalizeRoundId(safe.convertingPricedRound || ...);

  const obj: UnpricedRound = {
    type,
    id: roundId,
    principal: Number(safe.investmentAmount || safe.amount || 0) / 1_000_000,
    valuation_cap: Number(safe.pmvCap || safe.valuationCap || 0) / 1_000_000,
    discount_rate: Number(safe.discount || safe.discountRate || 0) / 100,
    investment_date: formatDate(safe.investmentDate || safe.date || ''),
    priced_round_investment_date: pricedRoundDate,
    // ✅ FIX: Use EXACT name from dropdown (e.g., "Round A")
    converting_investment_round_id: convertingId,
    converting_round_id: convertingId,
  };

  if (type === 'convertible_note') {
    obj.interest_rate = Number(safe.interestRate || 0) / 100;
  }

  return obj;
}

// ─── Utility Functions ────────────────────────────────────────────────────────
function stripFundParams(round: InvestmentRound): InvestmentRound {
  const { committed_capital, commitment_period, commitment_period_mgmt_fee,
    post_commitment_period_mgmt_fee, performance_fee, moic, fund_lifetime, ...clean } = round as any;
  return clean as InvestmentRound;
}

function cleanOwnership(round: InvestmentRound): InvestmentRound {
  const r = { ...round } as any;
  if (r.target_percent_ownership != null && r.target_percent_ownership > 0) {
    delete r.vc_shares;
  } else if (r.vc_shares != null && r.vc_shares > 0) {
    delete r.target_percent_ownership;
  }
  return r as InvestmentRound;
}

// ─── Build Cap Table Request (Single Round) ───────────────────────────────────
export function buildCapTableRequest(data: any, pricedRound: InvestmentRound, safeNotes: any[]) {
  const cleanRound = cleanOwnership(stripFundParams(pricedRound));
  const body: any = {
    founder_shares: Number(data.foundersShares || 0) / 1_000_000,
    current_committed_options: Number(data.allocatedOptions || 0) / 1_000_000,
    current_uncommitted_options: Number(data.unallocatedOptions || 0) / 1_000_000,
    investment_rounds: [cleanRound],
  };
  
  if (safeNotes?.length > 0) {
    const unpricedMap: Record<string, any> = {};
    safeNotes.forEach((safe: any) => {
      // CRITICAL: Use the exact same id that exists in investment_rounds
      // safe.convertingPricedRound should be "Round A" or "Round B", not "series_b"
      const targetId = safe.convertingPricedRound || cleanRound.id;
      
      // Log for debugging
      console.log(`[buildCapTableRequest] SAFE ${safe.roundName} converting to: ${targetId}`);
      console.log(`[buildCapTableRequest] Available round id: ${cleanRound.id}`);
      
      if (!unpricedMap[targetId]) {
        // Make sure converting_round has the SAME id
        const convertingRound = cleanOwnership({ ...cleanRound, id: targetId });
        unpricedMap[targetId] = { 
          converting_round: convertingRound, 
          unpriced_rounds: [] 
        };
      }
      unpricedMap[targetId].unpriced_rounds.push(
        buildUnpricedRound(safe, cleanRound.investment_date)
      );
    });
    body.unpriced_round_conversions = unpricedMap;
  }
  
  return body;
}

// ─── Build Cap Table Request (Multiple Rounds) ────────────────────────────────
export function buildCapTableRequestMultiRound(data: any, pricedRounds: InvestmentRound[], safeNotes: any[]) {
  const cleanRounds = pricedRounds.map(r => cleanOwnership(stripFundParams(r)));
  
  // Log available round ids
  console.log('[buildCapTableRequestMultiRound] Available rounds:', cleanRounds.map(r => r.id));
  
  const body: any = {
    founder_shares: Number(data.foundersShares || 0) / 1_000_000,
    current_committed_options: Number(data.allocatedOptions || 0) / 1_000_000,
    current_uncommitted_options: Number(data.unallocatedOptions || 0) / 1_000_000,
    investment_rounds: cleanRounds,
  };
  
  if (safeNotes?.length > 0) {
    const unpricedMap: Record<string, any> = {};
    safeNotes.forEach((safe: any) => {
      // Find the correct target round by name
      const targetRoundName = safe.convertingPricedRound || cleanRounds[0]?.id;
      const targetRound = cleanRounds.find(r => r.id === targetRoundName);
      
      if (!targetRound) {
        console.error(`[buildCapTableRequestMultiRound] Target round "${targetRoundName}" not found! Available:`, cleanRounds.map(r => r.id));
        return;
      }
      
      const targetId = targetRound.id;
      
      if (!unpricedMap[targetId]) {
        unpricedMap[targetId] = { 
          converting_round: cleanOwnership({ ...targetRound }), 
          unpriced_rounds: [] 
        };
      }
      unpricedMap[targetId].unpriced_rounds.push(
        buildUnpricedRound(safe, targetRound.investment_date)
      );
    });
    body.unpriced_round_conversions = unpricedMap;
  }
  
  return body;
}

// ─── Build Single Simulate Request ───────────────────────────────────────────
export function buildSingleSimulateRequest(data: any, pricedRound: InvestmentRound, cv: any) {
  const cleanRound = cleanOwnership({ ...pricedRound });

  const body: any = {
    investment_round: cleanRound,
    founder_shares: Number(data.foundersShares || 0) / 1_000_000,
    committed_options_before_round: Number(data.allocatedOptions || 0) / 1_000_000,
    uncommitted_options_before_round: Number(data.unallocatedOptions || 0) / 1_000_000,
    holding_period: Number(cv.expectedTimeToExit || 5),
    volatility_around_holding_period: Number(cv.volatilityHoldingPeriod || 1),
    volatility: Number(String(cv.volatility || '80').replace('%', '')) / 100,
    risk_free_rate: Number(cv.riskFreeRate || 4.3) / 100,
  };

  if (Number(cv.subjectivePostMoneyValuation || 0) > 0) {
    body.subjective_current_value = Number(cv.subjectivePostMoneyValuation);
  }

  return body;
}

// ─── Build Multiple Simulate Params ──────────────────────────────────────────
export function buildMultipleSimulateParams(
  data: any,
  currentRound: InvestmentRound,
  pastRounds: InvestmentRound[],
  safeNotes: any[],
  cv: any
) {
  const cleanCurrent = cleanOwnership({ ...currentRound });

  // ✅ FIX: Strip fund params from past rounds
  const cleanPastRounds = pastRounds.map(r => {
    const { committed_capital, commitment_period, commitment_period_mgmt_fee,
            post_commitment_period_mgmt_fee, performance_fee, moic, fund_lifetime, ...clean } = r as any;
    return cleanOwnership(clean as InvestmentRound);
  });

  const params: any = {
    currentRound: cleanCurrent,
    pastRounds: cleanPastRounds,  // ✅ Clean past rounds
    founderShares: Number(data.foundersShares || 0) / 1_000_000,
    volatility: Number(String(cv.volatility || '80').replace('%', '')) / 100,
    riskFreeRate: Number(cv.riskFreeRate || 4.3) / 100,
    holdingPeriod: Number(cv.expectedTimeToExit || 5),
    volatilityAroundHoldingPeriod: Number(cv.volatilityHoldingPeriod || 1),
    committed_options_before_round: Number(data.allocatedOptions || 0) / 1_000_000,
    uncommitted_options_before_round: Number(data.unallocatedOptions || 0) / 1_000_000,
  };

  if (safeNotes?.length > 0) {
    params.converting_unpriced_rounds = safeNotes.map((safe: any) =>
      buildUnpricedRound(safe, params.currentRound.investment_date)
    );
  }

  if (Number(cv.subjectivePostMoneyValuation || 0) > 0) {
    params.subjectiveCurrentValue = Number(cv.subjectivePostMoneyValuation);
  }

  return params;
}

// ─── Legacy Aliases ───────────────────────────────────────────────────────────
export const mapPricedRoundToInvestmentRound = (round: any, seniority: number, _fund?: any) =>
  buildPricedRound(round, seniority, null);

export const mapDebtRoundToInvestmentRound = (debt: any, debtSeniority: number) =>
  buildDebtRound(debt, debtSeniority);

export const mapSafeNoteToUnpricedRound = (safe: any, pricedRoundDate: string) =>
  buildUnpricedRound(safe, pricedRoundDate);

export const createPrePostFinanceCapTables = createCapTable;

export function buildPricedRoundForCapTable(round: any, seniority: number): InvestmentRound {
  return stripFundParams(buildPricedRound(round, seniority, null));
}