"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  createPrePostFinanceCapTables,
  mapPricedRoundToInvestmentRound,
  mapSafeNoteToUnpricedRound,
  InvestmentRound,
} from '@/services/simulationEngine.service';

interface Step2Props {
  data: any;
  onContinue: (data: any) => void;
  onStepBack: () => void;
}

const DEFAULT_CAP_TABLE = [
  { id: 1, name: 'Founders', investors: '-', commonStock: 100000, stockOptions: 10000, seriesA: 0, seriesB: 0, fullyDiluted: 110000, nominalOwnership: 10.8, pricePerShare: 10.8 },
  { id: 2, name: 'Unallocated Options', investors: '-', commonStock: 0, stockOptions: 10000, seriesA: 0, seriesB: 0, fullyDiluted: 10000, nominalOwnership: 1.0, pricePerShare: 1.0 },
  { id: 3, name: 'Series A', investors: '-', commonStock: 0, stockOptions: 0, seriesA: 500000, seriesB: 0, fullyDiluted: 500000, nominalOwnership: 49.0, pricePerShare: 49.0 },
  { id: 4, name: 'Series B', investors: '-', commonStock: 0, stockOptions: 0, seriesA: 0, seriesB: 400000, fullyDiluted: 400000, nominalOwnership: 39.2, pricePerShare: 39.2 },
  { id: 5, name: 'Total', investors: '-', commonStock: 100000, stockOptions: 20000, seriesA: 500000, seriesB: 400000, fullyDiluted: 1020000, nominalOwnership: 100.0, pricePerShare: 100.0 },
];

const Step2CapTable: React.FC<Step2Props> = ({ data, onContinue, onStepBack }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoadingCapTable, setIsLoadingCapTable] = useState(false);
  const [capTable, setCapTable] = useState(data.capTable?.length > 0 ? data.capTable : DEFAULT_CAP_TABLE);

  // Auto-load cap table from API when component mounts
  useEffect(() => {
    if (data.equityRounds?.length > 0 || data.pricedRounds?.length > 0) {
      loadCapTableFromAPI();
    }
  }, []);

  const loadCapTableFromAPI = async () => {
    setIsLoadingCapTable(true);
    const toastId = toast.loading('Generating cap table...');
    try {
      // Per API doc: ONLY pricedRounds go into investment_rounds for cap table.
      // equityRounds is a legacy/unused array — do NOT merge it; it produces
      // duplicate entries with investment_amount: 0 which the API rejects.
      const allPricedRounds: InvestmentRound[] = (data.pricedRounds || []).map((r: any, i: number) =>
        mapPricedRoundToInvestmentRound(r, i + 1, null)
      );

      if (allPricedRounds.length === 0) {
        toast.dismiss(toastId);
        setIsLoadingCapTable(false);
        return;
      }

      // Build unpriced_round_conversions map (SAFEs converting into priced rounds)
      const unpricedMap: Record<string, any> = {};
      (data.safeNotes || []).forEach((safe: any) => {
        const targetId = safe.convertingPricedRound || (allPricedRounds[0]?.id || 'round-1');
        const targetRound = allPricedRounds.find(r => r.id === targetId) || allPricedRounds[allPricedRounds.length - 1];
        if (!targetRound) return;
        if (!unpricedMap[targetId]) {
          unpricedMap[targetId] = {
            converting_round: targetRound,
            unpriced_rounds: [],
          };
        }
        unpricedMap[targetId].unpriced_rounds.push(
          mapSafeNoteToUnpricedRound(safe, targetRound.investment_date)
        );
      });

      const requestBody: any = {
        founder_shares: Number(data.foundersShares || 0) / 1_000_000,
        current_committed_options: Number(data.allocatedOptions || 0) / 1_000_000,
        current_uncommitted_options: Number(data.unallocatedOptions || 0) / 1_000_000,
        investment_rounds: allPricedRounds,
      };

      if (Object.keys(unpricedMap).length > 0) {
        requestBody.unpriced_round_conversions = unpricedMap;
      }

      const res = await createPrePostFinanceCapTables(requestBody);

      if (res?.success && res?.data) {
        // /api/create-cap-table response mapping per API doc:
        // data.founder_shares × 1,000,000
        // data.uncommitted_options_at_round_end × 1,000,000
        // data.committed_options_at_round_end × 1,000,000
        // data.round_to_investment_class.<round_key>.share_class_investment_rounds[0].vc_shares × 1,000,000
        // data.round_to_investment_class.<round_key>.price_per_share × 1,000,000
        const d = res.data;
        const rows: any[] = [];

        const founderShares = Math.round((d.founder_shares ?? 0) * 1_000_000);
        const uncommittedOptions = Math.round((d.uncommitted_options_at_round_end ?? 0) * 1_000_000);
        const committedOptions = Math.round((d.committed_options_at_round_end ?? 0) * 1_000_000);
        const roundToInv = d.round_to_investment_class || {};

        if (founderShares > 0) {
          rows.push({ id: 1, name: 'Founders', investors: '-', commonStock: founderShares, stockOptions: 0, fullyDiluted: founderShares, nominalOwnership: 0, pricePerShare: 0 });
        }
        if (uncommittedOptions > 0) {
          rows.push({ id: 2, name: 'Unallocated Options', investors: '-', commonStock: 0, stockOptions: uncommittedOptions, fullyDiluted: uncommittedOptions, nominalOwnership: 0, pricePerShare: 0 });
        }
        if (committedOptions > 0) {
          rows.push({ id: 3, name: 'Allocated Options', investors: '-', commonStock: 0, stockOptions: committedOptions, fullyDiluted: committedOptions, nominalOwnership: 0, pricePerShare: 0 });
        }

        // Round preferred shares
        let roundIdx = 4;
        Object.entries(roundToInv).forEach(([roundId, roundData]: [string, any]) => {
          const shareClasses = roundData?.share_class_investment_rounds || [];
          const pricePerShare = Math.round((roundData?.price_per_share ?? 0) * 1_000_000 * 100) / 100;
          shareClasses.forEach((sc: any) => {
            const vcShares = Math.round((sc?.vc_shares ?? 0) * 1_000_000);
            if (vcShares > 0) {
              rows.push({
                id: roundIdx++,
                name: roundId,
                investors: '-',
                commonStock: 0,
                stockOptions: 0,
                preferredShares: vcShares,
                fullyDiluted: vcShares,
                nominalOwnership: 0,
                pricePerShare,
              });
            }
          });
        });

        if (rows.length > 0) {
          // Calculate fully diluted total and ownership %
          const totalFD = rows.reduce((s, r) => s + r.fullyDiluted, 0);
          rows.forEach(r => {
            r.nominalOwnership = totalFD > 0 ? parseFloat((r.fullyDiluted / totalFD * 100).toFixed(2)) : 0;
          });

          // Add total row
          rows.push({
            id: 999,
            name: 'Total',
            investors: '-',
            commonStock: rows.reduce((s, r) => s + (r.commonStock || 0), 0),
            stockOptions: rows.reduce((s, r) => s + (r.stockOptions || 0), 0),
            fullyDiluted: totalFD,
            nominalOwnership: 100.0,
            pricePerShare: 0,
          });

          setCapTable(rows);
          toast.success('Cap table loaded!', { id: toastId });
        } else {
          toast.dismiss(toastId);
        }
      } else {
        toast.dismiss(toastId);
      }
    } catch (err: any) {
      console.error('[Step2 CapTable Error]', err?.response?.data || err);
      toast.error(err?.response?.data?.error || err?.response?.data?.message || 'Failed to load cap table', { id: toastId });
    } finally {
      setIsLoadingCapTable(false);
    }
  };

  const formatNumber = (num: number) => {
    if (!num) return '';
    return num.toLocaleString();
  };

  return (
    <div className="mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Cap Table Summary</h1>
        {isLoadingCapTable && (
          <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
            <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
            Generating cap table from simulation data...
          </div>
        )}
      </div>

      {/* Cap Table Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">Investors</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">Common Stock</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">Stock Options</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">Preferred Shares</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">Fully Diluted Share</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">Nominal Ownership</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">Price/Share</th>
              </tr>
            </thead>
            <tbody>
              {capTable.map((row: any) => (
                <tr
                  key={row.id}
                  className={`border-b border-gray-100 ${row.name === 'Total' ? 'bg-gray-50 font-semibold' : 'bg-white'}`}
                >
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">{row.name}</div>
                  </td>
                  <td className="px-4 py-4">
                    {row.name === 'Total' ? (
                      <div className="text-sm text-gray-900">{row.investors}</div>
                    ) : (
                      <div className="text-sm text-gray-900">
                        Activest III, Sequoia
                        <br />
                        <span
                          onClick={() => router.push(`${pathname}/${row.name.toLowerCase().replace(/\s+/g, '-')}?returnStep=step2&returnTo=${encodeURIComponent(pathname)}`)}
                          className="text-blue-600 cursor-pointer hover:underline"
                        >
                          Specify Investors
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">{formatNumber(row.commonStock || 0)}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">{formatNumber(row.stockOptions || 0)}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">{formatNumber(row.preferredShares || row.seriesA || row.seriesB || 0)}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">{formatNumber(row.fullyDiluted)}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">{row.nominalOwnership}%</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">{row.pricePerShare || ''}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
            onClick={() => onContinue({ capTable })}
            className="px-8 py-2.5 bg-[#3b66ff] text-white rounded-full hover:bg-blue-700 transition-all font-medium flex items-center gap-2"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step2CapTable;