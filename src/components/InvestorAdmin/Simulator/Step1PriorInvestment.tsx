// app/simulator/components/Step1PriorInvestment.tsx
"use client";

import React, { useMemo, useState } from 'react';
import { Plus, Trash2, Edit2, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { generatePricedRoundName } from '@/services/simulationEngine.service';

interface PricedRound {
  id: number;
  roundName: string;
  investmentDate: string;
  investmentAmount: number;
  liquidationPreference: number;
  ownership: number;
  ownershipType: '#' | '%';
  participation: string;
  converting: boolean;
  qpoThreshold: boolean;
  qpoThresholdValue: number;
  cap: boolean;
  capValue: number;
  dividends: string;
  dividendsSelect: string;
  dividendRate: number;
  antidilution: string;
  comments: string;
  allocatedOptionsPrior: number;
  unallocatedOptionsPrior: number;
  requestedOptionPool: number;
  requestedOptionPoolType: '#' | '%';
  myInvestment: number;
}

interface EquityRound {
  id: number;
  roundName: string;
  investmentDate: string;
  investmentAmount: number;
  commonShares: number;
  preferredShares: number;
  liquidationPreferences: string;
  participationType: string;
  dividendTiming: string;
  compoundingFrequency?: string;
  dividendRate: number;
  antiDilutionProvisions: string;
  qpoSharePriceMultiple?: number;
  qpoMinimumProceeds?: number;
  forcedConversionSharePriceMultipleCap?: number;
}

interface SafeNote {
  id: number;
  roundName: string;
  convertingPricedRound: string;
  type: string;
  investmentDate: string;
  investmentAmount: number;
  pmvCap: number;
  discount: number;
  interestRate: number;
  mfn: boolean;
  proRata: boolean;
}

interface DebtRound {
  id: number;
  roundName: string;
  paymentNature: string;
  issuanceDate: string;
  principalAmount: number;
  interestType: string;
  interestFrequency: string;
  interestRate: number;
  expirationDate: string;
}

interface Step1Props {
  data: any;
  onContinue: (data: any) => void;
  onStepBack: () => void;
}

const Step1PriorInvestment: React.FC<Step1Props> = ({ data, onContinue, onStepBack }) => {
  const [formData, setFormData] = useState({
    ...data,
    foundersShares: data.foundersShares || 100000,
    allocatedOptions: data.allocatedOptions || 20000,
    unallocatedOptions: data.unallocatedOptions || 20000,
    safeNotes: data.safeNotes || [],
    debtRounds: data.debtRounds || [],
    equityRounds: data.equityRounds || [],
    pricedRounds: data.pricedRounds || [],
  });

  React.useEffect(() => {
    setFormData((prev: typeof formData) => ({
      ...prev,
      name: data.name || '',
      description: data.description || '',
      fundName: data.fundName || '',
      portfolioCompany: data.portfolioCompany || ''
    }));
  }, [data.name, data.description, data.fundName, data.portfolioCompany]);

  const getStepTitle = () => {
    const simulationName = (formData.name || '').trim();
    const fundName = (formData.fundName || '').trim();
    const portfolioCompany = (formData.portfolioCompany || '').trim();

    if (simulationName && fundName && portfolioCompany) {
      return `${simulationName} in ${fundName} for ${portfolioCompany}`;
    }

    if (simulationName && fundName) {
      return `${simulationName} in ${fundName}`;
    }

    return simulationName || 'Portfolio Company Investment Information';
  };

  const [activeTab, setActiveTab] = useState<'latest' | 'roundbyround'>('latest');
  const [expandedRounds, setExpandedRounds] = useState<number[]>([0]);
  const [editingEquityId, setEditingEquityId] = useState<number | null>(null);
  const [editingSafeNoteId, setEditingSafeNoteId] = useState<number | null>(null);
  const [editingDebtId, setEditingDebtId] = useState<number | null>(null);

  const handleAddEquity = () => {
    const newEquity: EquityRound = {
      id: Date.now(),
      roundName: `Round ${String.fromCharCode(65 + formData.equityRounds.length)}`,
      investmentDate: '',
      investmentAmount: 0,
      commonShares: 0,
      preferredShares: 0,
      liquidationPreferences: '',
      participationType: 'Participating',
      dividendTiming: 'None',
      compoundingFrequency: 'None',
      dividendRate: 0,
      antiDilutionProvisions: 'None',
      qpoSharePriceMultiple: 0,
      qpoMinimumProceeds: 0,
      forcedConversionSharePriceMultipleCap: 0
    };
    setFormData({ ...formData, equityRounds: [...formData.equityRounds, newEquity] });
    setEditingEquityId(newEquity.id);
  };

  const handleAddSafeNote = () => {
    const newSafeNote: SafeNote = {
      id: Date.now(),
      roundName: `Safe ${String.fromCharCode(65 + formData.safeNotes.length)}`,
      convertingPricedRound: '',
      type: 'Pre-Money',
      investmentDate: '',
      investmentAmount: 0,
      pmvCap: 0,
      discount: 0,
      interestRate: 0,
      mfn: false,
      proRata: false
    };
    setFormData({ ...formData, safeNotes: [...formData.safeNotes, newSafeNote] });
    setEditingSafeNoteId(newSafeNote.id);
  };

  const handleAddDebt = () => {
    const newDebt: DebtRound = {
      id: Date.now(),
      roundName: `Debt Round ${formData.debtRounds.length + 1}`,
      paymentNature: 'Lump Sum',
      issuanceDate: '',
      principalAmount: 0,
      interestType: 'Fixed',
      interestFrequency: 'Annual',
      interestRate: 0,
      expirationDate: ''
    };
    setFormData({ ...formData, debtRounds: [...formData.debtRounds, newDebt] });
    setEditingDebtId(newDebt.id);
  };

  const handleAddPricedRound = () => {
    const newRound: PricedRound = {
      id: Date.now(),
      roundName: `Round ${String.fromCharCode(65 + formData.pricedRounds.length)}`,
      investmentDate: '',
      investmentAmount: 0,
      liquidationPreference: 1.0,
      ownership: 0,
      ownershipType: '#',
      participation: 'Participating',
      converting: false,
      qpoThreshold: false,
      qpoThresholdValue: 0,
      cap: false,
      capValue: 0,
      dividends: 'None',
      dividendsSelect: 'None',
      dividendRate: 0,
      antidilution: 'None',
      comments: '',
      allocatedOptionsPrior: 0,
      unallocatedOptionsPrior: 0,
      requestedOptionPool: 0,
      requestedOptionPoolType: '%',
      myInvestment: 0
    };
    setFormData({ ...formData, pricedRounds: [...formData.pricedRounds, newRound] });
    setExpandedRounds([...expandedRounds, formData.pricedRounds.length]);
  };

  const handleRemoveEquity = (id: number) => {
    setFormData({
      ...formData,
      equityRounds: formData.equityRounds.filter((equity: EquityRound) => equity.id !== id)
    });
  };

  const handleRemoveSafeNote = (id: number) => {
    setFormData({
      ...formData,
      safeNotes: formData.safeNotes.filter((note: SafeNote) => note.id !== id)
    });
  };

  const handleRemoveDebt = (id: number) => {
    setFormData({
      ...formData,
      debtRounds: formData.debtRounds.filter((debt: DebtRound) => debt.id !== id)
    });
  };

  const handleRemovePricedRound = (id: number) => {
    const index = formData.pricedRounds.findIndex((round: PricedRound) => round.id === id);
    setFormData({
      ...formData,
      pricedRounds: formData.pricedRounds.filter((round: PricedRound) => round.id !== id)
    });
    setExpandedRounds(expandedRounds.filter(i => i !== index));
  };

  const updateEquity = (id: number, field: string, value: any) => {
    setFormData({
      ...formData,
      equityRounds: formData.equityRounds.map((equity: EquityRound) =>
        equity.id === id ? { ...equity, [field]: value } : equity
      )
    });
  };

  const updateSafeNote = (id: number, field: string, value: any) => {
    if (field === 'convertingPricedRound') {
      // value হবে "Round A" বা "Round B" (যা ড্রপডাউন থেকে সিলেক্ট করেছে)
      console.log('[updateSafeNote] Selected converting round:', value);

      setFormData({
        ...formData,
        safeNotes: formData.safeNotes.map((note: SafeNote) =>
          note.id === id ? { ...note, [field]: value } : note
        )
      });
    } else {
      setFormData({
        ...formData,
        safeNotes: formData.safeNotes.map((note: SafeNote) =>
          note.id === id ? { ...note, [field]: value } : note
        )
      });
    }
  };

  const updateDebt = (id: number, field: string, value: any) => {
    setFormData({
      ...formData,
      debtRounds: formData.debtRounds.map((debt: DebtRound) =>
        debt.id === id ? { ...debt, [field]: value } : debt
      )
    });
  };

  const updatePricedRound = (id: number, field: string, value: any) => {
    setFormData({
      ...formData,
      pricedRounds: formData.pricedRounds.map((round: PricedRound) =>
        round.id === id ? { ...round, [field]: value } : round
      )
    });
  };

  const toggleRoundExpansion = (index: number) => {
    setExpandedRounds(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const clampUnitBasedValue = (rawValue: number, unit: '#' | '%') => {
    const nonNegativeValue = Number.isFinite(rawValue) ? Math.max(0, rawValue) : 0;
    if (unit === '%') {
      return Math.min(nonNegativeValue, 99.99);
    }
    return nonNegativeValue;
  };

  const parseNonNegativeNumberInput = (rawValue: string) => {
    const normalized = rawValue.replace(/,/g, '').trim();
    if (!normalized || normalized === '.') return 0;
    const parsed = Number.parseFloat(normalized);
    return Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
  };

  const updateOwnershipType = (id: number, nextType: '#' | '%') => {
    setFormData((prev: typeof formData) => ({
      ...prev,
      pricedRounds: prev.pricedRounds.map((round: PricedRound) => {
        if (round.id !== id) return round;
        return {
          ...round,
          ownershipType: nextType,
          ownership: clampUnitBasedValue(round.ownership || 0, nextType),
        };
      }),
    }));
  };

  const updateRequestedOptionPoolType = (id: number, nextType: '#' | '%') => {
    setFormData((prev: typeof formData) => ({
      ...prev,
      pricedRounds: prev.pricedRounds.map((round: PricedRound) => {
        if (round.id !== id) return round;
        return {
          ...round,
          requestedOptionPoolType: nextType,
          requestedOptionPool: clampUnitBasedValue(round.requestedOptionPool || 0, nextType),
        };
      }),
    }));
  };

  const compoundingFrequencyOptions = ['Annually', 'Semiannually', 'Quarterly', 'Monthly', 'Daily', 'Continuously'];

  const normalizeDividendType = (value?: string) =>
    value === 'Compounding' ? 'Continuous' : (value || 'None');

  const parseDividendRateToHundredths = (rawValue: string) => {
    const normalizedRaw = rawValue.replace(',', '.');
    if (normalizedRaw.trim() === '') return 0;
    const parsed = Number.parseFloat(normalizedRaw);
    if (Number.isNaN(parsed)) return 0;
    return Math.round(parsed * 100) / 100;
  };

  const [equityDividendRateDrafts, setEquityDividendRateDrafts] = useState<Record<number, string>>({});
  const [pricedDividendRateDrafts, setPricedDividendRateDrafts] = useState<Record<number, string>>({});

  React.useEffect(() => {
    setEquityDividendRateDrafts((prev) => {
      const next: Record<number, string> = {};
      formData.equityRounds.forEach((equity: EquityRound) => {
        next[equity.id] = Object.prototype.hasOwnProperty.call(prev, equity.id)
          ? prev[equity.id]
          : `${equity.dividendRate ?? 0}`;
      });
      return next;
    });
  }, [formData.equityRounds]);

  React.useEffect(() => {
    setPricedDividendRateDrafts((prev) => {
      const next: Record<number, string> = {};
      formData.pricedRounds.forEach((round: PricedRound) => {
        next[round.id] = Object.prototype.hasOwnProperty.call(prev, round.id)
          ? prev[round.id]
          : `${round.dividendRate ?? 0}`;
      });
      return next;
    });
  }, [formData.pricedRounds]);

  const isValidDividendRateInput = (rawValue: string) => /^\d*([\.,]\d{0,2})?$/.test(rawValue);

  const handleEquityDividendRateChange = (id: number, rawValue: string) => {
    const normalizedRaw = rawValue.replace(',', '.');
    if (!isValidDividendRateInput(rawValue)) return;
    setEquityDividendRateDrafts((prev) => ({ ...prev, [id]: normalizedRaw }));
    if (normalizedRaw === '' || normalizedRaw === '.') {
      updateEquity(id, 'dividendRate', 0);
      return;
    }
    updateEquity(id, 'dividendRate', parseDividendRateToHundredths(normalizedRaw));
  };

  const handlePricedDividendRateChange = (id: number, rawValue: string) => {
    const normalizedRaw = rawValue.replace(',', '.');
    if (!isValidDividendRateInput(rawValue)) return;
    setPricedDividendRateDrafts((prev) => ({ ...prev, [id]: normalizedRaw }));
    if (normalizedRaw === '' || normalizedRaw === '.') {
      updatePricedRound(id, 'dividendRate', 0);
      return;
    }
    updatePricedRound(id, 'dividendRate', parseDividendRateToHundredths(normalizedRaw));
  };

  const normalizeDividendRateDraft = (rawValue?: string) => `${parseDividendRateToHundredths(rawValue || '0')}`;

  const handleEquityDividendRateBlur = (id: number) => {
    const normalizedText = normalizeDividendRateDraft(equityDividendRateDrafts[id] ?? '0');
    setEquityDividendRateDrafts((prev) => ({ ...prev, [id]: normalizedText }));
    updateEquity(id, 'dividendRate', parseDividendRateToHundredths(normalizedText));
  };

  const handlePricedDividendRateBlur = (id: number) => {
    const normalizedText = normalizeDividendRateDraft(pricedDividendRateDrafts[id] ?? '0');
    setPricedDividendRateDrafts((prev) => ({ ...prev, [id]: normalizedText }));
    updatePricedRound(id, 'dividendRate', parseDividendRateToHundredths(normalizedText));
  };

  const updateEquityDividendType = (id: number, rawType: string) => {
    const nextType = normalizeDividendType(rawType);
    if (nextType === 'None') {
      setEquityDividendRateDrafts((prev) => ({ ...prev, [id]: '0' }));
    }
    setFormData((prev: typeof formData) => ({
      ...prev,
      equityRounds: prev.equityRounds.map((equity: EquityRound) => {
        if (equity.id !== id) return equity;
        const existingFrequency =
          equity.compoundingFrequency && equity.compoundingFrequency !== 'None'
            ? equity.compoundingFrequency
            : 'Annually';
        return {
          ...equity,
          dividendTiming: nextType,
          compoundingFrequency: nextType === 'Continuous' ? existingFrequency : 'None',
          dividendRate: nextType === 'None' ? 0 : equity.dividendRate,
        };
      }),
    }));
  };

  const updateEquityCompoundingFrequency = (id: number, frequency: string) => {
    setFormData((prev: typeof formData) => ({
      ...prev,
      equityRounds: prev.equityRounds.map((equity: EquityRound) => {
        if (equity.id !== id) return equity;
        const type = normalizeDividendType(equity.dividendTiming);
        if (type !== 'Continuous') {
          return { ...equity, compoundingFrequency: 'None' };
        }
        return { ...equity, compoundingFrequency: frequency };
      }),
    }));
  };

  const updatePricedRoundDividendType = (id: number, rawType: string) => {
    const nextType = normalizeDividendType(rawType);
    if (nextType === 'None') {
      setPricedDividendRateDrafts((prev) => ({ ...prev, [id]: '0' }));
    }
    setFormData((prev: typeof formData) => ({
      ...prev,
      pricedRounds: prev.pricedRounds.map((round: PricedRound) => {
        if (round.id !== id) return round;
        const existingFrequency =
          round.dividendsSelect && round.dividendsSelect !== 'None' && round.dividendsSelect !== 'Select'
            ? round.dividendsSelect
            : 'Annually';
        return {
          ...round,
          dividends: nextType,
          dividendsSelect: nextType === 'Continuous' ? existingFrequency : 'None',
          dividendRate: nextType === 'None' ? 0 : round.dividendRate,
        };
      }),
    }));
  };

  const updatePricedRoundCompoundingFrequency = (id: number, frequency: string) => {
    setFormData((prev: typeof formData) => ({
      ...prev,
      pricedRounds: prev.pricedRounds.map((round: PricedRound) => {
        if (round.id !== id) return round;
        const type = normalizeDividendType(round.dividends);
        if (type !== 'Continuous') {
          return { ...round, dividendsSelect: 'None' };
        }
        return { ...round, dividendsSelect: frequency };
      }),
    }));
  };

  // Always use pricedRounds for SAFE converting-round dropdown
  const pricedRoundOptions = useMemo(() => {
    const names = formData.pricedRounds.map((round: PricedRound, index: number) =>
      (round.roundName || generatePricedRoundName(index)).trim()
    );
    return names;
  }, [formData.pricedRounds]);

  // ── Inline validation ────────────────────────────────────────────────────────
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [showValidation, setShowValidation] = React.useState(false);

  const validateAndContinue = () => {
    const errors: Record<string, string> = {};

    if (!Number(formData.foundersShares) || Number(formData.foundersShares) <= 0)
      errors['foundersShares'] = 'Required — must be greater than 0';

    if (formData.pricedRounds.length === 0)
      errors['pricedRounds'] = 'Add at least one Priced Round before continuing';

    formData.pricedRounds.forEach((r: PricedRound) => {
      const p = `pr_${r.id}`;
      if (!r.roundName?.trim()) errors[`${p}_name`] = 'Round name is required';
      if (!r.investmentDate) errors[`${p}_date`] = 'Select an investment date';
      if (!Number(r.investmentAmount) || Number(r.investmentAmount) <= 0) {
        errors[`${p}_amount`] = 'Must be greater than $0';
      } else if (Number(r.investmentAmount) < 10000) {
        errors[`${p}_amount`] = 'Amount seems too low. Enter the full dollar amount (e.g. $2,000,000 not $2)';
      }
      if (!Number(r.ownership) || Number(r.ownership) <= 0) errors[`${p}_ownership`] = 'Must be greater than 0';
      if (!Number(r.liquidationPreference) || Number(r.liquidationPreference) <= 0) errors[`${p}_liqpref`] = 'Must be > 0 (standard: 1.0×)';
    });

    formData.safeNotes.forEach((s: SafeNote) => {
      const p = `safe_${s.id}`;
      if (!Number(s.investmentAmount) || Number(s.investmentAmount) <= 0) errors[`${p}_amount`] = 'Must be greater than $0';
      if (!s.convertingPricedRound) errors[`${p}_converting`] = 'Select which priced round this converts into';
      if (!s.investmentDate) errors[`${p}_date`] = 'Select an investment date';
      if (s.investmentDate && s.convertingPricedRound) {
        const target = formData.pricedRounds.find(
          (r: PricedRound) => r.roundName === s.convertingPricedRound
        );
        if (target?.investmentDate && s.investmentDate >= target.investmentDate) {
          errors[`safe_${s.id}_date`] =
            `Must be BEFORE ${target.roundName} date (${target.investmentDate})`;
        }
      }
    });

    formData.debtRounds.forEach((d: DebtRound) => {
      const p = `debt_${d.id}`;
      if (!Number(d.principalAmount) || Number(d.principalAmount) <= 0) errors[`${p}_amount`] = 'Must be greater than $0';
      if (!d.expirationDate) errors[`${p}_expiry`] = 'Expiration date is required';
    });

    setFieldErrors(errors);
    setShowValidation(true);
    if (Object.keys(errors).length > 0) {
      setTimeout(() => {
        const el = document.querySelector('[data-has-error="true"]');
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return;
    }
    onContinue(formData);
  };

  const formatNumber = (value: any) => {
    const num = Number(value);
    return isNaN(num) ? '0' : num.toLocaleString();
  };

  const saveProgress = () => {
    console.log('Saving progress:', formData);
    alert('Progress saved successfully!');
  };

  const startEditEquity = (id: number) => {
    setEditingEquityId(id);
  };

  const startEditSafeNote = (id: number) => {
    setEditingSafeNoteId(id);
  };

  const startEditDebt = (id: number) => {
    setEditingDebtId(id);
  };

  const saveEquity = (id: number) => {
    setEditingEquityId(null);
  };

  const saveSafeNote = (id: number) => {
    setEditingSafeNoteId(null);
  };

  const saveDebt = (id: number) => {
    setEditingDebtId(null);
  };

  console.log("From data oooooo", formData)

  return (
    <div className="mx-auto px-4 py-1 ">
      {/* Header */}
      <div className="mb-8">
        {/* <div className="text-sm  text-blue-600 mb-1">Step 1 of 3</div> */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{getStepTitle()}</h1>
        <p className="text-gray-600">{formData.description || 'Enter all current funding for this company'}</p>
      </div>

      <div className="w-[2440px] min-w-[2440px]">
        {/* Tab Navigation */}
        <div className="inline-flex p-1 bg-[#ebf0f7] rounded-full mb-8 w-full">
          <button
            className={`px-12 py-2.5 w-full font-bold text-sm transition-all duration-200 rounded-full ${activeTab === 'latest'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
              }`}
            onClick={() => setActiveTab('latest')}
          >
            Latest Cap Table
          </button>
          <button
            className={`px-12 py-2.5 font-bold w-full text-sm transition-all duration-200 rounded-full ${activeTab === 'roundbyround'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
              }`}
            onClick={() => setActiveTab('roundbyround')}
          >
            Round by Round
          </button>
        </div>

        {/* About This Section */}
        <div className="border bg-white border-gray-200 rounded-lg p-4 mb-8 shadow-sm">
          <p className="text-sm text-gray-700">
            <strong>About this:</strong> {activeTab === 'latest' ? (
              'The Latest Cap Table entry method is easiest when the current shares outstanding of each share class are known and when the current number of allocated and unallocated options is. The Round by Round entry method is practical when the terms of each round are known and the number of allocated and unallocated options immediately prior to a round can be estimated, but the current dilutive effects are not known.'
            ) : (
              'The Round by Round entry method is practical when the terms of each round are known and the number of allocated and unallocated options immediately prior to a round can be estimated, but the current dilutive effects are not known. The Latest Cap Table entry method is easiest when the current shares outstanding of each share class are known and when the current number of allocated and unallocated options is.'
            )}
          </p>
        </div>

        {activeTab === 'latest' ? (
          /* LATEST CAP TABLE VIEW */
          <div className="space-y-5">
            {/* Founders Shares and Outstanding Options Summary - COPIED FROM ROUND BY ROUND */}
            <div className="bg-white rounded-lg border border-[#e5e7eb]">
              <div className="px-5 py-4 border-b border-[#e5e7eb]">
                <h3 className="text-[15px] font-semibold text-[#1f2937]">Founders Shares and Outstanding Options</h3>
              </div>

              <div className="p-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2.5 px-4 bg-[#f9fafb] rounded-md border border-[#e5e7eb]">
                    <label className="text-[13px] font-normal text-[#374151]">Founders Outstanding Shares</label>
                    <div data-has-error={showValidation && !!fieldErrors['foundersShares'] ? "true" : "false"}>
                      <input
                        type="text"
                        value={(formData.foundersShares || 0).toLocaleString()}
                        onChange={(e) => {
                          const value = e.target.value.replace(/,/g, '');
                          setFormData({ ...formData, foundersShares: parseInt(value) || 0 });
                          if (fieldErrors['foundersShares']) setFieldErrors(prev => ({ ...prev, foundersShares: '' }));
                        }}
                        className={`w-28 h-9 rounded-md bg-white border px-3 text-right text-[13px] text-[#111827] focus:ring-1 transition-all ${showValidation && fieldErrors['foundersShares'] ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-[#d1d5db] focus:ring-[#3b82f6] focus:border-[#3b82f6]'}`}
                      />
                      {showValidation && fieldErrors['foundersShares'] && (
                        <p className="text-xs text-red-500 mt-1 text-right">{fieldErrors['foundersShares']}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2.5 px-4 bg-[#f9fafb] rounded-md border border-[#e5e7eb]">
                    <label className="text-[13px] font-normal text-[#374151]">Total Allocated Options</label>
                    <input
                      type="text"
                      value={(formData.allocatedOptions || 0).toLocaleString()}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, '');
                        setFormData({ ...formData, allocatedOptions: parseInt(value) || 0 });
                      }}
                      className="w-28 h-9 rounded-md bg-white border border-[#d1d5db] px-3 text-right text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2.5 px-4 bg-[#f9fafb] rounded-md border border-[#e5e7eb]">
                    <label className="text-[13px] font-normal text-[#374151]">Total Unallocated Options</label>
                    <input
                      type="text"
                      value={(formData.unallocatedOptions || 0).toLocaleString()}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, '');
                        setFormData({ ...formData, unallocatedOptions: parseInt(value) || 0 });
                      }}
                      className="w-28 h-9 rounded-md bg-white border border-[#d1d5db] px-3 text-right text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Current Cap Table Section */}
            <div className="bg-white rounded-lg border border-[#e5e7eb]">
              <div className="px-5 py-4 border-b border-[#e5e7eb]">
                <h3 className="text-[15px] font-semibold text-[#1f2937]">Current Cap Table (Existing Equity)</h3>
              </div>

              <div className="p-5">
                <div className="overflow-x-auto pb-2">
                  <table className="w-full min-w-[2400px] border-collapse">
                    <thead>
                      <tr className="bg-[#f9fafb]">
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Round Name</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Investment Date</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Investment Amount</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Common Shares</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Preferred Shares</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Liquidation Preferences</th>
                        <th className="text-left py-3 px-4 w-[180px] text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Participation</th>
                        <th className="text-left py-3 px-4 w-[180px] text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Dividend Type</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Compounding Frequency</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Dividend Rate</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Anti-dilution Provisions</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">QPO Share Price Multiple</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">QPO Minimum Proceeds</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Forced Conversion Multiple Cap</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.equityRounds.map((equity: EquityRound) => (
                        <tr key={equity.id} className="hover:bg-[#f9fafb] border-b border-[#f3f4f6]">
                          <td className="py-3 px-4 min-w-[180px]">
                            <input
                              type="text"
                              value={equity.roundName}
                              onChange={(e) => updateEquity(equity.id, 'roundName', e.target.value)}
                              className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#d1d5db] px-3 text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] focus:bg-white"
                            />
                          </td>
                          <td className="py-3 px-4 min-w-[180px]">
                            <input
                              type="date"
                              value={equity.investmentDate}
                              onChange={(e) => updateEquity(equity.id, 'investmentDate', e.target.value)}
                              className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#d1d5db] px-3 text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] focus:bg-white"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[13px]">$</span>
                              <input
                                type="text"
                                value={(equity.investmentAmount || 0).toLocaleString()}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/,/g, '');
                                  updateEquity(equity.id, 'investmentAmount', parseInt(value) || 0);
                                }}
                                className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#d1d5db] pl-7 pr-3 text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] focus:bg-white"
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={(equity.commonShares || 0).toLocaleString()}
                              onChange={(e) => {
                                const value = e.target.value.replace(/,/g, '');
                                updateEquity(equity.id, 'commonShares', parseInt(value) || 0);
                              }}
                              className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#d1d5db] px-3 text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] focus:bg-white"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={(equity.preferredShares || 0).toLocaleString()}
                              onChange={(e) => {
                                const value = e.target.value.replace(/,/g, '');
                                updateEquity(equity.id, 'preferredShares', parseInt(value) || 0);
                              }}
                              className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#d1d5db] px-3 text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] focus:bg-white"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={equity.liquidationPreferences}
                              onChange={(e) => updateEquity(equity.id, 'liquidationPreferences', e.target.value)}
                              className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#d1d5db] px-3 text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] focus:bg-white"
                            />
                          </td>
                          <td className="min-w-[170px] py-3 px-4">
                            <select
                              value={equity.participationType}
                              onChange={(e) => updateEquity(equity.id, 'participationType', e.target.value)}
                              className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#d1d5db] px-3 text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] focus:bg-white"
                            >
                              <option>Participating</option>
                              <option>Converting</option>
                            </select>
                          </td>
                          <td className="min-w-[170px] py-3 px-4">
                            <select
                              value={normalizeDividendType(equity.dividendTiming)}
                              onChange={(e) => updateEquityDividendType(equity.id, e.target.value)}
                              className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#d1d5db] px-3 text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] focus:bg-white"
                            >
                              <option>None</option>
                              <option>Simple</option>
                              <option>Continuous</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={
                                normalizeDividendType(equity.dividendTiming) === 'Continuous'
                                  ? ((equity.compoundingFrequency && equity.compoundingFrequency !== 'None') ? equity.compoundingFrequency : 'Annually')
                                  : 'None'
                              }
                              onChange={(e) => updateEquityCompoundingFrequency(equity.id, e.target.value)}
                              disabled={normalizeDividendType(equity.dividendTiming) !== 'Continuous'}
                              className={`w-full h-9 rounded-md border px-3 text-[13px] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] ${normalizeDividendType(equity.dividendTiming) === 'Continuous'
                                ? 'bg-[#f9fafb] border-[#d1d5db] text-[#111827] focus:bg-white'
                                : 'bg-[#f3f4f6] border-[#e5e7eb] text-[#9ca3af] cursor-not-allowed'
                                }`}
                            >
                              {normalizeDividendType(equity.dividendTiming) !== 'Continuous' ? (
                                <option>None</option>
                              ) : (
                                compoundingFrequencyOptions.map((frequency) => (
                                  <option key={frequency} value={frequency}>
                                    {frequency}
                                  </option>
                                ))
                              )}
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <div className="relative">
                              <input
                                type="text"
                                inputMode="decimal"
                                value={equityDividendRateDrafts[equity.id] ?? `${equity.dividendRate ?? 0}`}
                                onChange={(e) => handleEquityDividendRateChange(equity.id, e.target.value)}
                                onBlur={() => handleEquityDividendRateBlur(equity.id)}
                                className={`w-full h-9 rounded-md border px-3 text-[13px] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] ${normalizeDividendType(equity.dividendTiming) === 'None'
                                  ? 'bg-[#f9fafb] border-[#d1d5db] text-[#111827]'
                                  : 'bg-[#f9fafb] border-[#d1d5db] text-[#111827] pr-7 focus:bg-white'
                                  }`}
                              />
                              {normalizeDividendType(equity.dividendTiming) !== 'None' && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[13px]">%</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={equity.antiDilutionProvisions}
                              onChange={(e) => updateEquity(equity.id, 'antiDilutionProvisions', e.target.value)}
                              className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#d1d5db] px-3 text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] focus:bg-white"
                            >
                              <option>None</option>
                              <option>Full Ratchet</option>
                              <option>Narrow Based Weighted Average</option>
                              <option>Broad Based Weighted Average</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={(equity.qpoSharePriceMultiple || 0).toLocaleString()}
                              onChange={(e) => {
                                const value = e.target.value.replace(/,/g, '');
                                updateEquity(equity.id, 'qpoSharePriceMultiple', parseFloat(value) || 0);
                              }}
                              placeholder="0"
                              className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#d1d5db] px-3 text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] focus:bg-white"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[13px]">$</span>
                              <input
                                type="text"
                                value={(equity.qpoMinimumProceeds || 0).toLocaleString()}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/,/g, '');
                                  updateEquity(equity.id, 'qpoMinimumProceeds', parseInt(value) || 0);
                                }}
                                placeholder="0"
                                className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#d1d5db] pl-7 pr-3 text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] focus:bg-white"
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={(equity.forcedConversionSharePriceMultipleCap || 0).toLocaleString()}
                              onChange={(e) => {
                                const value = e.target.value.replace(/,/g, '');
                                updateEquity(equity.id, 'forcedConversionSharePriceMultipleCap', parseFloat(value) || 0);
                              }}
                              placeholder="0"
                              className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#d1d5db] px-3 text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] focus:bg-white"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleRemoveEquity(equity.id)}
                              className="text-[#ef4444] hover:text-[#dc2626] p-1 rounded hover:bg-[#fef2f2]"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={handleAddEquity}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-[#3b82f6] hover:text-[#2563eb] transition-colors"
                >
                  <Plus size={16} />
                  <span>Add Equity</span>
                </button>
              </div>
            </div>

            {/* SAFEs and Convertible Notes Section */}
            <div className="bg-white rounded-lg border border-[#e5e7eb]">
              <div className="px-5 py-4 border-b border-[#e5e7eb]">
                <h3 className="text-[15px] font-semibold text-[#1f2937]">SAFEs and Convertible Notes</h3>
              </div>

              <div className="p-5">
                <div className="overflow-x-auto max-w-full pb-2">
                  <table className="w-full min-w-[1200px] border-collapse">
                    <thead>
                      <tr className="bg-[#f9fafb]">
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Round Name</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Converting Priced Round</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Type</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Investment Date</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Amount</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">PMV Cap</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Discount</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Interest Rate</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">MFN</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Pro Rata Rights</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.safeNotes.map((note: SafeNote) => (
                        <tr key={note.id} className="hover:bg-[#f9fafb] border-b border-[#f3f4f6]">
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={note.roundName}
                              onChange={(e) => updateSafeNote(note.id, 'roundName', e.target.value)}
                              className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#d1d5db] px-3 text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] focus:bg-white"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={note.convertingPricedRound || ''}
                              onChange={(e) => { updateSafeNote(note.id, 'convertingPricedRound', e.target.value); setFieldErrors(prev => ({ ...prev, [`safe_${note.id}_converting`]: '' })); }}
                              className={`w-full h-9 rounded-md bg-[#f9fafb] border px-3 text-[13px] focus:ring-1 focus:bg-white ${showValidation && fieldErrors[`safe_${note.id}_converting`] ? 'border-red-400 text-[#111827] focus:ring-red-400' : `border-[#d1d5db] focus:ring-[#3b82f6] focus:border-[#3b82f6] ${note.convertingPricedRound ? 'text-[#111827]' : 'text-[#94a3b8]'}`}`}
                            >
                              <option value="">Select priced round *</option>
                              {pricedRoundOptions.map((roundName: string, idx: number) => (
                                <option key={`${roundName}-${idx}`} value={roundName}>
                                  {roundName}
                                </option>
                              ))}
                            </select>
                            {showValidation && fieldErrors[`safe_${note.id}_converting`] && <p className="text-xs text-red-500 mt-1">{fieldErrors[`safe_${note.id}_converting`]}</p>}
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={note.type}
                              onChange={(e) => updateSafeNote(note.id, 'type', e.target.value)}
                              className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#d1d5db] px-3 text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] focus:bg-white"
                            >
                              <option value="Pre-Money">Pre-Money SAFE</option>
                              <option value="Post-Money">Post-Money</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="date"
                              value={note.investmentDate}
                              onChange={(e) => { updateSafeNote(note.id, 'investmentDate', e.target.value); setFieldErrors(prev => ({ ...prev, [`safe_${note.id}_date`]: '' })); }}
                              placeholder="mm/dd/yyyy"
                              className={`w-full h-9 rounded-md bg-[#f9fafb] border px-3 text-[13px] text-[#111827] focus:ring-1 focus:bg-white ${showValidation && fieldErrors[`safe_${note.id}_date`] ? 'border-red-400 focus:ring-red-400' : 'border-[#d1d5db] focus:ring-[#3b82f6] focus:border-[#3b82f6]'}`}
                            />
                            {showValidation && fieldErrors[`safe_${note.id}_date`] && <p className="text-xs text-red-500 mt-1">{fieldErrors[`safe_${note.id}_date`]}</p>}
                          </td>
                          <td className="py-3 px-4">
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[13px]">$</span>
                              <input
                                type="text"
                                value={(note.investmentAmount || 0).toLocaleString()}
                                onChange={(e) => { const value = e.target.value.replace(/,/g, ''); updateSafeNote(note.id, 'investmentAmount', parseInt(value) || 0); setFieldErrors(prev => ({ ...prev, [`safe_${note.id}_amount`]: '' })); }}
                                className={`w-full h-9 rounded-md bg-[#f9fafb] border pl-7 pr-3 text-[13px] text-[#111827] focus:ring-1 focus:bg-white ${showValidation && fieldErrors[`safe_${note.id}_amount`] ? 'border-red-400 focus:ring-red-400' : 'border-[#d1d5db] focus:ring-[#3b82f6] focus:border-[#3b82f6]'}`}
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[13px]">$</span>
                              <input
                                type="text"
                                value={(note.pmvCap || 0).toLocaleString()}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/,/g, '');
                                  updateSafeNote(note.id, 'pmvCap', parseInt(value) || 0);
                                }}
                                className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#d1d5db] pl-7 pr-3 text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] focus:bg-white"
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="relative">
                              <input
                                type="number"
                                value={note.discount}
                                onChange={(e) => updateSafeNote(note.id, 'discount', parseInt(e.target.value) || 0)}
                                className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#d1d5db] px-3 pr-7 text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] focus:bg-white"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[13px]">%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="relative">
                              <input
                                type="number"
                                value={note.interestRate}
                                onChange={(e) => updateSafeNote(note.id, 'interestRate', parseInt(e.target.value) || 0)}
                                className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#d1d5db] px-3 pr-7 text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] focus:bg-white"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[13px]">%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center">
                              <input
                                type="checkbox"
                                checked={note.mfn || false}
                                onChange={(e) => updateSafeNote(note.id, 'mfn', e.target.checked)}
                                className="w-4 h-4 rounded border-[#d1d5db] text-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center">
                              <input
                                type="checkbox"
                                checked={note.proRata || false}
                                onChange={(e) => updateSafeNote(note.id, 'proRata', e.target.checked)}
                                className="w-4 h-4 rounded border-[#d1d5db] text-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleRemoveSafeNote(note.id)}
                              className="text-[#ef4444] hover:text-[#dc2626] p-1 rounded hover:bg-[#fef2f2]"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={handleAddSafeNote}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-[#3b82f6] hover:text-[#2563eb] transition-colors"
                >
                  <Plus size={16} />
                  <span>Add SAFE/Convertible Note</span>
                </button>
              </div>
            </div>

            {/* Debt Section */}
            <div className="bg-white rounded-lg border border-[#e5e7eb]">
              <div className="px-5 py-4 border-b border-[#e5e7eb]">
                <h3 className="text-[15px] font-semibold text-[#1f2937]">Debt</h3>
              </div>

              <div className="p-5">
                <div className="overflow-x-auto max-w-full pb-2">
                  <table className="w-full min-w-[1450px] border-collapse">
                    <thead>
                      <tr className="bg-[#f9fafb]">
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Round Name</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Payment Nature</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Issuance Date</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Principal Amount</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Interest Type</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Interest Frequency</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Annual Interest Rate</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Expiration Date</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.debtRounds.map((debt: DebtRound) => (
                        <tr key={debt.id} className="hover:bg-[#f9fafb] border-b border-[#f3f4f6]">
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={debt.roundName}
                              onChange={(e) => updateDebt(debt.id, 'roundName', e.target.value)}
                              className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#d1d5db] px-3 text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] focus:bg-white"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={debt.paymentNature}
                              onChange={(e) => updateDebt(debt.id, 'paymentNature', e.target.value)}
                              className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#d1d5db] px-3 text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] focus:bg-white"
                            >
                              <option value="Lump Sum">Lump Sum</option>
                              <option value="Installment">Installment</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="date"
                              value={debt.issuanceDate}
                              onChange={(e) => updateDebt(debt.id, 'issuanceDate', e.target.value)}
                              placeholder="mm/dd/yyyy"
                              className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#d1d5db] px-3 text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] focus:bg-white"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[13px]">$</span>
                              <input
                                type="text"
                                value={(debt.principalAmount || 0).toLocaleString()}
                                onChange={(e) => { const value = e.target.value.replace(/,/g, ''); updateDebt(debt.id, 'principalAmount', parseInt(value) || 0); setFieldErrors(prev => ({ ...prev, [`debt_${debt.id}_amount`]: '' })); }}
                                className={`w-full h-9 rounded-md bg-[#f9fafb] border pl-7 pr-3 text-[13px] text-[#111827] focus:ring-1 focus:bg-white ${showValidation && fieldErrors[`debt_${debt.id}_amount`] ? 'border-red-400 focus:ring-red-400' : 'border-[#d1d5db] focus:ring-[#3b82f6] focus:border-[#3b82f6]'}`}
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={debt.interestType}
                              onChange={(e) => updateDebt(debt.id, 'interestType', e.target.value)}
                              className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#d1d5db] px-3 text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] focus:bg-white"
                            >
                              <option value="Simple">Simple</option>
                              <option value="Fixed">Fixed</option>
                              <option value="Variable">Variable</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={debt.interestFrequency}
                              onChange={(e) => updateDebt(debt.id, 'interestFrequency', e.target.value)}
                              className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#d1d5db] px-3 text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] focus:bg-white"
                            >
                              <option value="Annual">Annual</option>
                              <option value="Quarterly">Quarterly</option>
                              <option value="Monthly">Monthly</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <div className="relative">
                              <input
                                type="number"
                                value={debt.interestRate}
                                onChange={(e) => updateDebt(debt.id, 'interestRate', parseInt(e.target.value) || 0)}
                                className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#d1d5db] px-3 pr-7 text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] focus:bg-white"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[13px]">%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="date"
                              value={debt.expirationDate}
                              onChange={(e) => updateDebt(debt.id, 'expirationDate', e.target.value)}
                              placeholder="mm/dd/yyyy"
                              className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#d1d5db] px-3 text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] focus:bg-white"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleRemoveDebt(debt.id)}
                              className="text-[#ef4444] hover:text-[#dc2626] p-1 rounded hover:bg-[#fef2f2]"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={handleAddDebt}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-[#3b82f6] hover:text-[#2563eb] transition-colors"
                >
                  <Plus size={16} />
                  <span>Add Debt</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ROUND BY ROUND VIEW - MATCHING PROTOTYPE */
          <div className="space-y-5">
            {/* Founders Shares and Outstanding Options - FIRST */}
            <div className="bg-white rounded-lg border border-[#e5e7eb]">
              <div className="px-5 py-4 border-b border-[#e5e7eb]">
                <h3 className="text-[15px] font-semibold text-[#111827]">
                  Founders Shares and Outstanding Options
                </h3>
              </div>

              <div className="p-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2.5 px-4 bg-[#f9fafb] rounded-md border border-[#e5e7eb]">
                    <label className="text-[13px] font-normal text-[#374151]">Founders Outstanding Shares</label>
                    <div data-has-error={showValidation && !!fieldErrors['foundersShares'] ? "true" : "false"}>
                      <input
                        type="text"
                        value={(formData.foundersShares || 0).toLocaleString()}
                        onChange={(e) => {
                          const value = e.target.value.replace(/,/g, '');
                          setFormData({ ...formData, foundersShares: parseInt(value) || 0 });
                          if (fieldErrors['foundersShares']) setFieldErrors(prev => ({ ...prev, foundersShares: '' }));
                        }}
                        className={`w-28 h-9 rounded-md bg-white border px-3 text-right text-[13px] text-[#111827] focus:ring-1 transition-all ${showValidation && fieldErrors['foundersShares'] ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : 'border-[#d1d5db] focus:ring-[#3b82f6] focus:border-[#3b82f6]'}`}
                      />
                      {showValidation && fieldErrors['foundersShares'] && (
                        <p className="text-xs text-red-500 mt-1 text-right">{fieldErrors['foundersShares']}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2.5 px-4 bg-[#f9fafb] rounded-md border border-[#e5e7eb]">
                    <label className="text-[13px] font-normal text-[#374151]">Total Allocated Options</label>
                    <input
                      type="text"
                      value={(formData.allocatedOptions || 0).toLocaleString()}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, '');
                        setFormData({ ...formData, allocatedOptions: parseInt(value) || 0 });
                      }}
                      className="w-28 h-9 rounded-md bg-white border border-[#d1d5db] px-3 text-right text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2.5 px-4 bg-[#f9fafb] rounded-md border border-[#e5e7eb]">
                    <label className="text-[13px] font-normal text-[#374151]">Total Unallocated Options</label>
                    <input
                      type="text"
                      value={(formData.unallocatedOptions || 0).toLocaleString()}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, '');
                        setFormData({ ...formData, unallocatedOptions: parseInt(value) || 0 });
                      }}
                      className="w-28 h-9 rounded-md bg-white border border-[#d1d5db] px-3 text-right text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Outstanding Debt - SECOND */}
            <div className="bg-white rounded-lg border border-[#e5e7eb]">
              <div className="px-5 py-4 border-b border-[#e5e7eb]">
                <h3 className="text-[15px] font-semibold text-[#111827]">Outstanding Debt</h3>
              </div>

              <div className="p-5">
                <div className="overflow-x-auto max-w-full pb-2">
                  <table className="w-full min-w-[1200px] border-collapse">
                    <thead>
                      <tr className="bg-[#f9fafb]">
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Round Name</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Payment Nature</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Issuance Date</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Principal Amount</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Interest Type</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Interest Frequency</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Interest Rate</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Expiration Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.debtRounds.map((debt: DebtRound) => (
                        <tr key={debt.id} className="hover:bg-[#f9fafb] border-b border-[#f3f4f6]">
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={debt.roundName}
                              onChange={(e) => updateDebt(debt.id, 'roundName', e.target.value)}
                              className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#d1d5db] px-3 text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] focus:bg-white"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={debt.paymentNature}
                              onChange={(e) => updateDebt(debt.id, 'paymentNature', e.target.value)}
                              className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#d1d5db] px-3 text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] focus:bg-white"
                            >
                              <option value="Lump Sum">Lump Sum</option>
                              <option value="Installment">Installment</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="date"
                              value={debt.issuanceDate}
                              onChange={(e) => updateDebt(debt.id, 'issuanceDate', e.target.value)}
                              placeholder="mm/dd/yyyy"
                              className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#d1d5db] px-3 text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] focus:bg-white"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[13px]">$</span>
                              <input
                                type="text"
                                value={(debt.principalAmount || 0).toLocaleString()}
                                onChange={(e) => { const value = e.target.value.replace(/,/g, ''); updateDebt(debt.id, 'principalAmount', parseInt(value) || 0); setFieldErrors(prev => ({ ...prev, [`debt_${debt.id}_amount`]: '' })); }}
                                className={`w-full h-9 rounded-md bg-[#f9fafb] border pl-7 pr-3 text-[13px] text-[#111827] focus:ring-1 focus:bg-white ${showValidation && fieldErrors[`debt_${debt.id}_amount`] ? 'border-red-400 focus:ring-red-400' : 'border-[#d1d5db] focus:ring-[#3b82f6] focus:border-[#3b82f6]'}`}
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={debt.interestType}
                              onChange={(e) => updateDebt(debt.id, 'interestType', e.target.value)}
                              className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#d1d5db] px-3 text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] focus:bg-white"
                            >
                              <option value="Simple">Simple</option>
                              <option value="Fixed">Fixed</option>
                              <option value="Variable">Variable</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={debt.interestFrequency}
                              onChange={(e) => updateDebt(debt.id, 'interestFrequency', e.target.value)}
                              className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#d1d5db] px-3 text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] focus:bg-white"
                            >
                              <option value="Annual">Annual</option>
                              <option value="Quarterly">Quarterly</option>
                              <option value="Monthly">Monthly</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <div className="relative">
                              <input
                                type="number"
                                value={debt.interestRate}
                                onChange={(e) => updateDebt(debt.id, 'interestRate', parseInt(e.target.value) || 0)}
                                className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#d1d5db] px-3 pr-7 text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] focus:bg-white"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[13px]">%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="date"
                              value={debt.expirationDate}
                              onChange={(e) => { updateDebt(debt.id, 'expirationDate', e.target.value); setFieldErrors(prev => ({ ...prev, [`debt_${debt.id}_expiry`]: '' })); }}
                              placeholder="mm/dd/yyyy"
                              className={`w-full h-9 rounded-md bg-[#f9fafb] border px-3 text-[13px] text-[#111827] focus:ring-1 focus:bg-white ${showValidation && fieldErrors[`debt_${debt.id}_expiry`] ? 'border-red-400 focus:ring-red-400' : 'border-[#d1d5db] focus:ring-[#3b82f6] focus:border-[#3b82f6]'}`}
                            />
                            {showValidation && fieldErrors[`debt_${debt.id}_expiry`] && <p className="text-xs text-red-500 mt-1">{fieldErrors[`debt_${debt.id}_expiry`]}</p>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={handleAddDebt}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-[#3b82f6] hover:text-[#2563eb] transition-colors"
                >
                  <Plus size={16} />
                  <span>Add Debt</span>
                </button>
              </div>
            </div>

            {/* Unpriced Rounds (SAFEs and Convertible Notes) - THIRD */}
            <div className="bg-white rounded-lg border border-[#e5e7eb]">
              <div className="px-5 py-4 border-b border-[#e5e7eb]">
                <h3 className="text-[15px] font-semibold text-[#111827]">
                  Unpriced Rounds (SAFEs and Convertible Notes)
                </h3>
              </div>

              <div className="p-5">
                <div className="overflow-x-auto max-w-full pb-2">
                  <table className="w-full min-w-[1450px] border-collapse">
                    <thead>
                      <tr className="bg-[#f9fafb]">
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Round Name</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Converting Priced Round</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Type</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Investment Date</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Investment Amount</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">PMV Cap</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Discount</th>
                        <th className="text-left py-3 px-4 text-[12px] font-medium text-[#6b7280] border-b border-[#e5e7eb]">Interest Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.safeNotes.map((note: SafeNote) => (
                        <tr key={note.id} className="hover:bg-[#f9fafb] border-b border-[#f3f4f6]">
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={note.roundName}
                              onChange={(e) => updateSafeNote(note.id, 'roundName', e.target.value)}
                              className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#d1d5db] px-3 text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] focus:bg-white"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={note.convertingPricedRound || ''}
                              onChange={(e) => { updateSafeNote(note.id, 'convertingPricedRound', e.target.value); setFieldErrors(prev => ({ ...prev, [`safe_${note.id}_converting`]: '' })); }}
                              className={`w-full h-9 rounded-md bg-[#f9fafb] border px-3 text-[13px] focus:ring-1 focus:bg-white ${showValidation && fieldErrors[`safe_${note.id}_converting`] ? 'border-red-400 text-[#111827] focus:ring-red-400' : `border-[#d1d5db] focus:ring-[#3b82f6] focus:border-[#3b82f6] ${note.convertingPricedRound ? 'text-[#111827]' : 'text-[#94a3b8]'}`}`}
                            >
                              <option value="">Select priced round *</option>
                              {pricedRoundOptions.map((roundName: string, idx: number) => (
                                <option key={`${roundName}-${idx}`} value={roundName}>
                                  {roundName}
                                </option>
                              ))}
                            </select>
                            {showValidation && fieldErrors[`safe_${note.id}_converting`] && <p className="text-xs text-red-500 mt-1">{fieldErrors[`safe_${note.id}_converting`]}</p>}
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={note.type}
                              onChange={(e) => updateSafeNote(note.id, 'type', e.target.value)}
                              className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#d1d5db] px-3 text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] focus:bg-white"
                            >
                              <option value="Pre-Money">Pre-Money SAFE</option>
                              <option value="Post-Money">Post-Money</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="date"
                              value={note.investmentDate}
                              onChange={(e) => { updateSafeNote(note.id, 'investmentDate', e.target.value); setFieldErrors(prev => ({ ...prev, [`safe_${note.id}_date`]: '' })); }}
                              placeholder="mm/dd/yyyy"
                              className={`w-full h-9 rounded-md bg-[#f9fafb] border px-3 text-[13px] text-[#111827] focus:ring-1 focus:bg-white ${showValidation && fieldErrors[`safe_${note.id}_date`] ? 'border-red-400 focus:ring-red-400' : 'border-[#d1d5db] focus:ring-[#3b82f6] focus:border-[#3b82f6]'}`}
                            />
                            {showValidation && fieldErrors[`safe_${note.id}_date`] && <p className="text-xs text-red-500 mt-1">{fieldErrors[`safe_${note.id}_date`]}</p>}
                          </td>
                          <td className="py-3 px-4">
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[13px]">$</span>
                              <input
                                type="text"
                                value={(note.investmentAmount || 0).toLocaleString()}
                                onChange={(e) => { const value = e.target.value.replace(/,/g, ''); updateSafeNote(note.id, 'investmentAmount', parseInt(value) || 0); setFieldErrors(prev => ({ ...prev, [`safe_${note.id}_amount`]: '' })); }}
                                className={`w-full h-9 rounded-md bg-[#f9fafb] border pl-7 pr-3 text-[13px] text-[#111827] focus:ring-1 focus:bg-white ${showValidation && fieldErrors[`safe_${note.id}_amount`] ? 'border-red-400 focus:ring-red-400' : 'border-[#d1d5db] focus:ring-[#3b82f6] focus:border-[#3b82f6]'}`}
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[13px]">$</span>
                              <input
                                type="text"
                                value={(note.pmvCap || 0).toLocaleString()}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/,/g, '');
                                  updateSafeNote(note.id, 'pmvCap', parseInt(value) || 0);
                                }}
                                className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#d1d5db] pl-7 pr-3 text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] focus:bg-white"
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="relative">
                              <input
                                type="number"
                                value={note.discount}
                                onChange={(e) => updateSafeNote(note.id, 'discount', parseInt(e.target.value) || 0)}
                                className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#d1d5db] px-3 pr-7 text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] focus:bg-white"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[13px]">%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="relative">
                              <input
                                type="number"
                                value={note.interestRate}
                                onChange={(e) => updateSafeNote(note.id, 'interestRate', parseInt(e.target.value) || 0)}
                                className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#d1d5db] px-3 pr-7 text-[13px] text-[#111827] focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] focus:bg-white"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[13px]">%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={handleAddSafeNote}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-[#3b82f6] hover:text-[#2563eb] transition-colors"
                >
                  <Plus size={16} />
                  <span>Add SAFE/Convertible Note</span>
                </button>
              </div>
            </div>

            {/* Priced Rounds Section */}
            <div className="mt-8">
              <h3 className="text-[16px] font-semibold text-[#111827] mb-4">Priced Rounds</h3>
              {showValidation && fieldErrors['pricedRounds'] && (
                <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                  <span className="font-bold">⚠</span> {fieldErrors['pricedRounds']}
                </div>
              )}

              <div className="flex flex-nowrap gap-6 overflow-x-auto max-w-full pb-6">
                {formData.pricedRounds.map((round: PricedRound, index: number) => {
                  const ownershipType: '#' | '%' = round.ownershipType === '%' ? '%' : '#';
                  const requestedOptionPoolType: '#' | '%' = round.requestedOptionPoolType === '#' ? '#' : '%';
                  return (
                    <div key={round.id} className="flex flex-col gap-4 min-w-[310px] max-w-[310px]">

                      {/* Main Investment Card */}
                      <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-[#f3f4f6] flex items-center justify-between">
                          <h2
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => updatePricedRound(round.id, 'roundName', e.currentTarget.textContent || '')}
                            className="text-[15px] font-semibold text-[#111827] text-center flex-1 focus:outline-none cursor-text"
                          >
                            {round.roundName || `Round A`}

                          </h2>
                          <button
                            onClick={() => handleRemovePricedRound(round.id)}
                            className="text-[#ef4444] hover:text-[#dc2626] p-1 rounded hover:bg-[#fef2f2] flex-shrink-0"
                            title="Delete Round"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="p-5 space-y-4">
                          {/* Investment Date */}
                          <div>
                            <label className="block text-[12px] font-medium text-[#4b5563] mb-1.5">
                              Investment Date <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="date"
                              value={round.investmentDate}
                              onChange={(e) => { updatePricedRound(round.id, 'investmentDate', e.target.value); setFieldErrors(prev => ({ ...prev, [`pr_${round.id}_date`]: '' })); }}
                              className={`w-full h-9 rounded-md bg-[#f9fafb] border px-3 text-[13px] text-[#111827] focus:bg-white focus:ring-1 outline-none transition-all ${showValidation && fieldErrors[`pr_${round.id}_date`] ? 'border-red-400 focus:ring-red-400' : 'border-[#e5e7eb] focus:ring-blue-500'}`}
                            />
                            {showValidation && fieldErrors[`pr_${round.id}_date`] && <p className="text-xs text-red-500 mt-1">{fieldErrors[`pr_${round.id}_date`]}</p>}
                          </div>

                          {/* Investment Amount */}
                          <div>
                            <label className="block text-[12px] font-medium text-[#4b5563] mb-1.5">
                              Investment Amount <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[13px]">$</span>
                              <input
                                type="text"
                                value={(round.investmentAmount || 0).toLocaleString()}
                                onChange={(e) => { const value = e.target.value.replace(/,/g, ''); updatePricedRound(round.id, 'investmentAmount', parseInt(value) || 0); setFieldErrors(prev => ({ ...prev, [`pr_${round.id}_amount`]: '' })); }}
                                className={`w-full h-9 rounded-md bg-[#f9fafb] border pl-7 pr-3 text-[13px] text-[#111827] focus:bg-white focus:ring-1 outline-none ${showValidation && fieldErrors[`pr_${round.id}_amount`] ? 'border-red-400 focus:ring-red-400' : 'border-[#e5e7eb] focus:ring-blue-500'}`}
                              />
                            </div>
                            {showValidation && fieldErrors[`pr_${round.id}_amount`] && <p className="text-xs text-red-500 mt-1">{fieldErrors[`pr_${round.id}_amount`]}</p>}
                          </div>

                          {/* Liquidation Preference */}
                          <div>
                            <label className="block text-[12px] font-medium text-[#4b5563] mb-1.5">
                              Liquidation Preference <span className="text-red-400">*</span>
                              <span className="text-[#9ca3af] font-normal ml-1">(standard: 1.0×)</span>
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={round.liquidationPreference}
                                onChange={(e) => { updatePricedRound(round.id, 'liquidationPreference', e.target.value); setFieldErrors(prev => ({ ...prev, [`pr_${round.id}_liqpref`]: '' })); }}
                                className={`w-full h-9 rounded-md bg-[#f9fafb] border px-3 text-[13px] text-[#111827] focus:bg-white focus:ring-1 outline-none ${showValidation && fieldErrors[`pr_${round.id}_liqpref`] ? 'border-red-400 focus:ring-red-400' : 'border-[#e5e7eb] focus:ring-blue-500'}`}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[13px]">x</span>
                            </div>
                            {showValidation && fieldErrors[`pr_${round.id}_liqpref`] && <p className="text-xs text-red-500 mt-1">{fieldErrors[`pr_${round.id}_liqpref`]}</p>}
                          </div>

                          {/* Ownership */}
                          <div>
                            <label className="block text-[12px] font-medium text-[#4b5563] mb-1.5">
                              Ownership <span className="text-red-400">*</span>
                            </label>
                            <div className="flex gap-0">
                              <select
                                value={ownershipType}
                                onChange={(e) => updateOwnershipType(round.id, e.target.value === '%' ? '%' : '#')}
                                className="w-14 h-9 rounded-l-md bg-[#f9fafb] border border-r-0 border-[#e5e7eb] px-2 text-[13px] text-[#111827] focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                              >
                                <option value="#">#</option>
                                <option value="%">%</option>
                              </select>
                              <input
                                type="text"
                                inputMode="decimal"
                                value={`${round.ownership || 0}`}
                                onChange={(e) => {
                                  const parsed = parseNonNegativeNumberInput(e.target.value);
                                  updatePricedRound(round.id, 'ownership', clampUnitBasedValue(parsed, ownershipType));
                                }}
                                className="flex-1 h-9 rounded-r-md bg-[#f9fafb] border border-[#e5e7eb] px-3 text-[13px] text-[#111827] focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                              />
                            </div>
                            {showValidation && fieldErrors[`pr_${round.id}_ownership`] && <p className="text-xs text-red-500 mt-1">{fieldErrors[`pr_${round.id}_ownership`]}</p>}
                          </div>

                          {/* Participation */}
                          <div>
                            <label className="block text-[12px] font-medium text-[#4b5563] mb-2">Common Stock Participation</label>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  checked={round.participation === 'Participating'}
                                  onChange={() => updatePricedRound(round.id, 'participation', 'Participating')}
                                  className="w-4 h-4 text-blue-600 border-[#d1d5db]"
                                />
                                <span className="text-[13px] text-[#111827]">Participating</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  checked={round.participation === 'Converting'}
                                  onChange={() => updatePricedRound(round.id, 'participation', 'Converting')}
                                  className="w-4 h-4 text-blue-600 border-[#d1d5db]"
                                />
                                <span className="text-[13px] text-[#111827]">Converting</span>
                              </label>
                            </div>
                          </div>

                          {/* Share Multiples */}
                          <div className="space-y-3 pt-1">
                            <div>
                              <label className="block text-[12px] font-medium text-[#4b5563] mb-1.5">QPO Share Multiple</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={round.qpoThresholdValue || 0}
                                  onChange={(e) => {
                                    const parsed = parseNonNegativeNumberInput(e.target.value);
                                    updatePricedRound(round.id, 'qpoThresholdValue', parsed);
                                  }}
                                  className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#e5e7eb] px-3 pr-7 text-[13px] text-[#111827] focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[13px]">x</span>
                              </div>
                            </div>
                            <div>
                              <label className="block text-[12px] font-medium text-[#4b5563] mb-1.5">Forced Conversion Multiple Cap</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={round.capValue || 0}
                                  onChange={(e) => {
                                    const parsed = parseNonNegativeNumberInput(e.target.value);
                                    updatePricedRound(round.id, 'capValue', parsed);
                                  }}
                                  className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#e5e7eb] px-3 pr-7 text-[13px] text-[#111827] focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[13px]">x</span>
                              </div>
                            </div>
                          </div>

                          {/* Dividends */}
                          <div>
                            <label className="block text-[12px] font-medium text-[#4b5563] mb-2">Dividends</label>
                            <div className="grid grid-cols-[0.85fr_1fr_0.75fr] gap-2 items-end mb-2">
                              <div className="min-w-0">
                                <label className="block text-[11px] font-medium text-[#6b7280] mb-1">Type</label>
                                <select
                                  title={`Dividend Type: ${normalizeDividendType(round.dividends)}`}
                                  value={normalizeDividendType(round.dividends)}
                                  onChange={(e) => updatePricedRoundDividendType(round.id, e.target.value)}
                                  className="h-8 w-full bg-[#f9fafb] border border-[#e5e7eb] rounded px-2 text-[12px] text-[#111827] outline-none"
                                >
                                  <option>None</option>
                                  <option>Simple</option>
                                  <option>Continuous</option>
                                </select>
                              </div>
                              <div className="min-w-0">
                                <label className="block text-[11px] font-medium text-[#6b7280] mb-1">Frequency</label>
                                <select
                                  title={`Compounding Frequency: ${normalizeDividendType(round.dividends) === 'Continuous'
                                    ? ((round.dividendsSelect && round.dividendsSelect !== 'None' && round.dividendsSelect !== 'Select')
                                      ? round.dividendsSelect
                                      : 'Annually')
                                    : 'None'
                                    }`}
                                  value={
                                    normalizeDividendType(round.dividends) === 'Continuous'
                                      ? ((round.dividendsSelect && round.dividendsSelect !== 'None' && round.dividendsSelect !== 'Select')
                                        ? round.dividendsSelect
                                        : 'Annually')
                                      : 'None'
                                  }
                                  onChange={(e) => updatePricedRoundCompoundingFrequency(round.id, e.target.value)}
                                  disabled={normalizeDividendType(round.dividends) !== 'Continuous'}
                                  className={`h-8 w-full rounded px-2 text-[12px] outline-none ${normalizeDividendType(round.dividends) === 'Continuous'
                                    ? 'bg-[#f9fafb] border border-[#e5e7eb] text-[#111827]'
                                    : 'bg-[#f3f4f6] border border-[#e5e7eb] text-[#9ca3af] cursor-not-allowed'
                                    }`}
                                >
                                  {normalizeDividendType(round.dividends) !== 'Continuous' ? (
                                    <option>None</option>
                                  ) : (
                                    compoundingFrequencyOptions.map((frequency) => (
                                      <option key={frequency} value={frequency}>
                                        {frequency}
                                      </option>
                                    ))
                                  )}
                                </select>
                              </div>
                              <div className="min-w-0">
                                <label className="block text-[11px] font-medium text-[#6b7280] mb-1">Rate</label>
                                <div className="relative">
                                  <input
                                    title={`Dividend Rate (%): ${round.dividendRate ?? 0}`}
                                    type="text"
                                    inputMode="decimal"
                                    value={pricedDividendRateDrafts[round.id] ?? `${round.dividendRate ?? 0}`}
                                    onChange={(e) => handlePricedDividendRateChange(round.id, e.target.value)}
                                    onBlur={() => handlePricedDividendRateBlur(round.id)}
                                    className={`w-full h-8 rounded text-[12px] outline-none border ${normalizeDividendType(round.dividends) === 'None'
                                      ? 'bg-[#f9fafb] border-[#e5e7eb] text-[#111827] px-2'
                                      : 'bg-[#f9fafb] border-[#e5e7eb] text-[#111827] pl-2 pr-6'
                                      }`}
                                  />
                                  {normalizeDividendType(round.dividends) !== 'None' && (
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[12px]">%</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Antidilution */}
                          <div>
                            <label className="block text-[12px] font-medium text-[#4b5563] mb-1.5">Antidilution Provision</label>
                            <select
                              value={round.antidilution}
                              onChange={(e) => updatePricedRound(round.id, 'antidilution', e.target.value)}
                              className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#e5e7eb] px-3 text-[13px] outline-none"
                            >
                              <option>None</option>
                              <option>Full Ratchet</option>
                              <option>Narrow Based Weighted Average</option>
                              <option>Broad Based Weighted Average</option>
                            </select>
                          </div>

                          {/* Comments */}
                          <div>
                            <label className="block text-[12px] font-medium text-[#4b5563] mb-1.5">Comments</label>
                            <input
                              type="text"
                              placeholder="A 16Z Lead Investor"
                              className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#e5e7eb] px-3 text-[13px] outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Option Pools Card */}
                      <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm p-5 space-y-4">
                        <h5 className="text-[15px] font-semibold text-[#111827] text-center mb-2">Option Pools</h5>

                        <div>
                          <label className="block text-[12px] font-medium text-[#4b5563] mb-1.5 leading-tight">
                            Allocated Options Immediately prior to round
                          </label>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={round.allocatedOptionsPrior || 0}
                            onChange={(e) => {
                              const parsed = parseNonNegativeNumberInput(e.target.value);
                              updatePricedRound(round.id, 'allocatedOptionsPrior', parsed);
                            }}
                            className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#e5e7eb] px-3 text-[13px]"
                          />
                        </div>

                        <div>
                          <label className="block text-[12px] font-medium text-[#4b5563] mb-1.5 leading-tight">
                            Unallocated Options Immediately prior to round
                          </label>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={round.unallocatedOptionsPrior || 0}
                            onChange={(e) => {
                              const parsed = parseNonNegativeNumberInput(e.target.value);
                              updatePricedRound(round.id, 'unallocatedOptionsPrior', parsed);
                            }}
                            className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#e5e7eb] px-3 text-[13px]"
                          />
                        </div>

                        <div>
                          <label className="block text-[12px] font-medium text-[#4b5563] mb-1.5 leading-tight">
                            Requested Available Option Pool Post-Round
                          </label>
                          <div className="flex gap-0">
                            <select
                              value={requestedOptionPoolType}
                              onChange={(e) => updateRequestedOptionPoolType(round.id, e.target.value === '#' ? '#' : '%')}
                              className="w-14 h-9 rounded-l-md bg-[#f9fafb] border border-r-0 border-[#e5e7eb] px-2 text-[13px] text-[#111827] focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                            >
                              <option value="#">#</option>
                              <option value="%">%</option>
                            </select>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={`${round.requestedOptionPool || 0}`}
                              onChange={(e) => {
                                const parsed = parseNonNegativeNumberInput(e.target.value);
                                updatePricedRound(round.id, 'requestedOptionPool', clampUnitBasedValue(parsed, requestedOptionPoolType));
                              }}
                              className="flex-1 h-9 rounded-r-md bg-[#f9fafb] border border-[#e5e7eb] px-3 text-[13px] text-[#111827] focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* My Fund Investment Card */}
                      <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm p-5">
                        <label className="block text-[12px] font-medium text-[#4b5563] mb-2">
                          My Fund's Investment in This Round
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[13px]">$</span>
                          <input
                            type="text"
                            value={(round.myInvestment || 0).toLocaleString()}
                            onChange={(e) => {
                              const value = e.target.value.replace(/,/g, '');
                              updatePricedRound(round.id, 'myInvestment', parseInt(value, 10) || 0);
                            }}
                            className="w-full h-9 rounded-md bg-[#f9fafb] border border-[#e5e7eb] pl-7 pr-3 text-[13px]"
                          />
                        </div>
                      </div>

                    </div>
                  );
                })}

                {/* Add Round Placeholder (Gray Card with Plus) */}
                <button
                  onClick={handleAddPricedRound}
                  className="min-w-[250px] bg-[#e5e7eb]/40 border border-transparent rounded-xl flex flex-col items-center justify-center hover:bg-[#e5e7eb]/60 transition-all"
                >
                  <Plus size={40} className="text-[#374151]" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
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
            onClick={validateAndContinue}
            className="px-8 py-2.5 bg-[#3b66ff] text-white rounded-full hover:bg-blue-700 transition-all font-medium flex items-center gap-2"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step1PriorInvestment;