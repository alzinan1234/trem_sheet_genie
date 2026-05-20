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

// ─── Black Scholes ────────────────────────────────────────────────────────────
export const calculateBlackScholes = async (params: any) => {
  const res = await simulationClient.post('/api/calculate', params);
  return res.data;
};

// ─── Cap Table ────────────────────────────────────────────────────────────────
// Correct endpoint: /api/create-cap-table (per API integration guide)
export const createCapTable = async (body: any) => {
  const res = await simulationClient.post('/api/create-cap-table', body);
  return res.data;
};

// createPrePostFinanceCapTables now correctly uses /api/create-cap-table
export const createPrePostFinanceCapTables = async (body: any) => {
  const res = await simulationClient.post('/api/create-cap-table', body);
  return res.data;
};

// ─── Single Investment (Phase 1) ──────────────────────────────────────────────
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

// ─── Multiple Investments (Phase 2 & 3) ──────────────────────────────────────
// Per API doc: the entire body is wrapped in { params: ... }
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

// ─── Exit Breakdown ───────────────────────────────────────────────────────────
export const calculateExitBreakdown = async (body: any) => {
  const res = await simulationClient.post('/api/exit-breakdown', body);
  return res.data;
};

// ─── Generate Term Sheet (stub — backend not ready) ───────────────────────────
export async function generateTermSheet(_data: any) {
  // TODO: Uncomment when term sheet backend is ready
  // const response = await fetch(`${BASE_URL}/api/generate-term-sheet`, { ... });
  // return response.json();
  return null;
}

// ─── investment_type derivation ───────────────────────────────────────────────
export function deriveInvestmentType(participation: string, qpoMultiple: number, capMultiple: number): string {
  const isConverting =
    (participation || '').toLowerCase() === 'converting' ||
    (participation || '').toLowerCase() === 'convertible';
  if (isConverting) return 'convertible preferred';
  const hasQpo = qpoMultiple > 0;
  const hasCap = capMultiple > 0;
  if (!hasQpo && !hasCap) return 'redeemable preferred plus common';
  if (hasQpo && !hasCap) return 'participating convertible preferred';
  if (hasQpo && hasCap) return 'participating convertible preferred with cap';
  return 'convertible preferred';
}

// ─── dividend_type derivation ─────────────────────────────────────────────────
export function deriveDividendType(type: string, frequency: string): string {
  const t = (type || '').toLowerCase();
  const f = (frequency || '').toLowerCase();
  if (!t || t === 'none') return 'none';
  if (t === 'simple') return 'simple';
  if (t === 'compounded' || t === 'compound') {
    if (f.includes('annual')) return 'compounded_annually';
    if (f.includes('semi')) return 'compounded_semiannually';
    if (f.includes('quarter')) return 'compounded_quarterly';
    if (f.includes('month')) return 'compounded_monthly';
    if (f.includes('continu')) return 'compounded_continuously';
    return 'compounded_annually';
  }
  return 'simple';
}

// ─── antidilution object derivation (per API doc — must be object, NOT string) ─
export function deriveAntidilution(val: string): AntidilutionObject {
  const v = (val || '').toLowerCase();
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

// ─── interest_type derivation (Debt) ─────────────────────────────────────────
export function deriveInterestType(interestType: string, frequency: string): string {
  const t = (interestType || '').toLowerCase();
  const f = (frequency || '').toLowerCase();
  if (t === 'simple') return 'simple';
  if (f.includes('annual')) return 'compounded_annually';
  if (f.includes('semi')) return 'compounded_semiannually';
  if (f.includes('quarter')) return 'compounded_quarterly';
  if (f.includes('month')) return 'compounded_monthly';
  return 'simple';
}

// ─── Date Format ──────────────────────────────────────────────────────────────
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

// Management fee: stored as % (e.g. 2) → divide by 100; already decimal → pass as-is
function normalizeFeePercent(val: number): number {
  if (!val) return 0;
  return val > 1 ? val / 100 : val;
}

// ─── Build Priced Round Object ────────────────────────────────────────────────
export function buildPricedRound(round: any, seniority: number, fund: any): InvestmentRound {
  const qpo = Number(round.qpoThresholdValue || round.qpoSharePriceMultiple || round.qpoShareMultiple || round.qpoThreshold ? round.qpoThresholdValue || 0 : 0);
  const cap = Number(round.capValue || round.forcedConversionSharePriceMultipleCap || round.forcedConversionCap || 0);
  const participation = round.participation || round.participationType || round.commonStockParticipation || 'Converting';
  const investment_type = deriveInvestmentType(participation, qpo, cap);
  const antidilutionVal = round.antidilution || round.antiDilutionProvisions || '';

  const obj: InvestmentRound = {
    id: round.roundName || round.name || round.id || `round-${seniority}`,
    investment_date: formatDate(round.investmentDate || round.date || ''),
    investment_type,
    investment_amount: Number(round.investmentAmount || 0) / 1_000_000,
    liquidation_preference_multiple: Number(round.liquidationPreference || round.liquidationPreferenceMultiple || 1),
    dividend_type: deriveDividendType(
      round.dividendType || round.dividends || round.dividendsSelect || '',
      round.dividendFrequency || round.dividendTiming || round.compoundingFrequency || ''
    ),
    annual_dividend_rate: Number(round.dividendRate || 0) / 100,
    antidilution: deriveAntidilution(antidilutionVal),
    seniority,
  };

  // Ownership: # or %
  if (round.ownershipType === '%') {
    obj.target_percent_ownership = Number(round.ownership || round.vcShares || 0) / 100;
  } else {
    obj.vc_shares = Number(round.ownership || round.vcShares || round.preferredShares || 0) / 1_000_000;
  }

  // Options: # or %
  const optionPoolType = round.optionPoolType || round.requestedOptionPoolType || '#';
  if (optionPoolType === '%') {
    obj.target_percent_option_pool = Number(round.optionPool || round.requestedOptionPool || round.allocatedOptionsPrior || 0) / 100;
  } else {
    const optVal = Number(round.optionPool || round.requestedOptionPool || round.optionsCreatedInRound || round.allocatedOptionsPrior || 0);
    if (optVal > 0) obj.options_created_in_round = optVal / 1_000_000;
  }

  // QPO / Cap
  if (qpo > 0) obj.qpo_per_share = qpo;
  if (qpo > 0 && cap > 0) obj.cap_multiple = cap;

  // Fund params
  if (fund) {
    obj.committed_capital = Number(fund.committedCapital || 0) / 1_000_000;
    obj.commitment_period = Number(fund.commitmentPeriod || 10);
    obj.commitment_period_mgmt_fee = normalizeFeePercent(Number(fund.commitmentPeriodManagementFee || 2));
    obj.post_commitment_period_mgmt_fee = normalizeFeePercent(Number(fund.postCommitmentPeriodManagementFee || 1.5));
    obj.performance_fee = normalizeFeePercent(Number(fund.carryPercentage || fund.performanceFee || 20));
    obj.moic = Number(fund.moic || 2.5);
    obj.fund_lifetime = Number(fund.term || fund.fundLifetime || 10);
  }

  return obj;
}

// ─── Build Debt Round Object ──────────────────────────────────────────────────
export function buildDebtRound(debt: any, debtSeniority: number): InvestmentRound {
  return {
    id: debt.roundName || debt.name || debt.id || `debt-${debtSeniority}`,
    investment_type: 'venture_debt',
    investment_amount: Number(debt.principalAmount || debt.principal || debt.amount || 0) / 1_000_000,
    vc_shares: 0,
    liquidation_preference_multiple: 1.0,
    dividend_type: 'none',
    annual_dividend_rate: 0,
    antidilution: { has_antidilution: false, includes_preferred_shares: false, includes_common_shares: false, includes_unpriced_round_conversions: false },
    // Per API doc: Expiration Date as investment_date for debt
    investment_date: formatDate(debt.expirationDate || debt.expiration || debt.investmentDate || debt.date || ''),
    debt_seniority: debtSeniority,
    interest_rate: Number(debt.interestRate || 0) / 100,
    interest_type: deriveInterestType(debt.interestType || '', debt.interestFrequency || ''),
    options_created_in_round: 0,
  };
}

// ─── Build SAFE / Convertible Note Object ─────────────────────────────────────
export function buildUnpricedRound(safe: any, pricedRoundDate: string): UnpricedRound {
  const typeMap: Record<string, string> = {
    'Pre-Money': 'pre_money_safe_note',
    'Post-Money': 'post_money_safe_note',
    'pre-money': 'pre_money_safe_note',
    'post-money': 'post_money_safe_note',
    'Convertible Note': 'convertible_note',
    'convertible_note': 'convertible_note',
    'pre_money_safe_note': 'pre_money_safe_note',
    'post_money_safe_note': 'post_money_safe_note',
  };
  const type = typeMap[safe.type] || 'pre_money_safe_note';
  const obj: UnpricedRound = {
    type,
    id: safe.roundName || safe.name || safe.id || `safe-${Date.now()}`,
    principal: Number(safe.investmentAmount || safe.amount || safe.principal || 0) / 1_000_000,
    valuation_cap: Number(safe.pmvCap || safe.valuationCap || 0) / 1_000_000,
    discount_rate: Number(safe.discount || safe.discountRate || 0) / 100,
    investment_date: formatDate(safe.issuanceDate || safe.investmentDate || safe.date || ''),
    priced_round_investment_date: pricedRoundDate,
    converting_investment_round_id: safe.convertingPricedRound || safe.convertingRoundId || '',
    converting_round_id: safe.convertingPricedRound || safe.convertingRoundId || '',
  };
  if (type === 'convertible_note') {
    obj.interest_rate = Number(safe.interestRate || 0) / 100;
  }
  return obj;
}

// ─── Build Cap Table Request (/api/create-cap-table) ──────────────────────────
// Per API doc: debt rounds NOT included; only priced rounds + unpriced_round_conversions
// ─── Strip fund params from a round object (for cap table requests) ───────────
function stripFundParams(round: InvestmentRound): InvestmentRound {
  const { committed_capital, commitment_period, commitment_period_mgmt_fee,
          post_commitment_period_mgmt_fee, performance_fee, moic, fund_lifetime, ...clean } = round as any;
  return clean as InvestmentRound;
}

export function buildCapTableRequest(data: any, pricedRound: InvestmentRound, safeNotes: any[]) {
  const cleanRound = stripFundParams(pricedRound);
  const body: any = {
    founder_shares: Number(data.foundersShares || 0) / 1_000_000,
    current_committed_options: Number(data.allocatedOptions || 0) / 1_000_000,
    current_uncommitted_options: Number(data.unallocatedOptions || 0) / 1_000_000,
    investment_rounds: [cleanRound],
  };

  if (safeNotes.length > 0) {
    const unpricedMap: Record<string, any> = {};
    safeNotes.forEach((safe: any) => {
      const targetRoundId = safe.convertingPricedRound || safe.convertingRoundId || cleanRound.id;
      if (!unpricedMap[targetRoundId]) {
        unpricedMap[targetRoundId] = {
          converting_round: cleanRound,
          unpriced_rounds: [],
        };
      }
      unpricedMap[targetRoundId].unpriced_rounds.push(
        buildUnpricedRound(safe, cleanRound.investment_date)
      );
    });
    body.unpriced_round_conversions = unpricedMap;
  }

  return body;
}

// ─── Build Cap Table Request for Multiple Priced Rounds (Phase 3) ─────────────
export function buildCapTableRequestMultiRound(
  data: any,
  pricedRounds: InvestmentRound[],
  safeNotes: any[]
) {
  const cleanRounds = pricedRounds.map(stripFundParams);
  const body: any = {
    founder_shares: Number(data.foundersShares || 0) / 1_000_000,
    current_committed_options: Number(data.allocatedOptions || 0) / 1_000_000,
    current_uncommitted_options: Number(data.unallocatedOptions || 0) / 1_000_000,
    investment_rounds: cleanRounds,
  };

  if (safeNotes.length > 0) {
    const unpricedMap: Record<string, any> = {};
    safeNotes.forEach((safe: any) => {
      const targetRoundId = safe.convertingPricedRound || safe.convertingRoundId || cleanRounds[0]?.id;
      const targetRound = cleanRounds.find(r => r.id === targetRoundId) || cleanRounds[cleanRounds.length - 1];
      if (!targetRound) return;
      if (!unpricedMap[targetRoundId]) {
        unpricedMap[targetRoundId] = { converting_round: targetRound, unpriced_rounds: [] };
      }
      unpricedMap[targetRoundId].unpriced_rounds.push(
        buildUnpricedRound(safe, targetRound.investment_date)
      );
    });
    body.unpriced_round_conversions = unpricedMap;
  }

  return body;
}

// ─── Build Single Investment Simulate Request (Phase 1) ───────────────────────
// Per API doc: all snake_case
export function buildSingleSimulateRequest(data: any, pricedRound: InvestmentRound, cv: any) {
  const body: any = {
    investment_round: pricedRound,
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

// ─── Build Multiple Investments Simulate Params (Phase 2 & 3) ────────────────
// Per API doc: camelCase top-level, snake_case for options_before_round
// NOTE: The wrapper { params: ... } is added by simulateMultipleInvestments()
export function buildMultipleSimulateParams(
  data: any,
  currentRound: InvestmentRound,
  pastRounds: InvestmentRound[],
  safeNotes: any[],
  cv: any
) {
  const params: any = {
    currentRound,
    pastRounds,
    founderShares: Number(data.foundersShares || 0) / 1_000_000,
    volatility: Number(String(cv.volatility || '80').replace('%', '')) / 100,
    riskFreeRate: Number(cv.riskFreeRate || 4.3) / 100,
    holdingPeriod: Number(cv.expectedTimeToExit || 5),
    volatilityAroundHoldingPeriod: Number(cv.volatilityHoldingPeriod || 1),
    committed_options_before_round: Number(data.allocatedOptions || 0) / 1_000_000,
    uncommitted_options_before_round: Number(data.unallocatedOptions || 0) / 1_000_000,
  };

  if (safeNotes.length > 0) {
    params.converting_unpriced_rounds = safeNotes.map((safe: any) =>
      buildUnpricedRound(safe, currentRound.investment_date)
    );
  }

  if (Number(cv.subjectivePostMoneyValuation || 0) > 0) {
    params.subjectiveCurrentValue = Number(cv.subjectivePostMoneyValuation);
  }

  return params;
}

// ─── Legacy mapper aliases (backward compat) ──────────────────────────────────
// ─── Build Priced Round for Cap Table (NO fund params) ───────────────────────
// /api/create-cap-table does NOT accept fund fields (committed_capital etc.)
// Use this builder for ALL cap table requests.
export function buildPricedRoundForCapTable(round: any, seniority: number): InvestmentRound {
  const built = buildPricedRound(round, seniority, null); // null = no fund params
  // Explicitly strip any fund fields in case they crept in
  const { committed_capital, commitment_period, commitment_period_mgmt_fee,
          post_commitment_period_mgmt_fee, performance_fee, moic, fund_lifetime, ...clean } = built as any;
  return clean as InvestmentRound;
}
  
export const mapEquityRoundToInvestmentRound = (round: any, seniority: number) =>
  buildPricedRoundForCapTable(round, seniority);

export const mapPricedRoundToInvestmentRound = (round: any, seniority: number, _fund?: any) =>
  buildPricedRoundForCapTable(round, seniority);

export const mapDebtRoundToInvestmentRound = (debt: any, debtSeniority: number) =>
  buildDebtRound(debt, debtSeniority);

export const mapSafeNoteToUnpricedRound = (safe: any, pricedRoundDate: string) =>
  buildUnpricedRound(safe, pricedRoundDate);