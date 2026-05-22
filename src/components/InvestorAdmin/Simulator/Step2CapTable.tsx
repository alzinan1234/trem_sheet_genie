"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  createCapTable,
  mapPricedRoundToInvestmentRound,
  mapSafeNoteToUnpricedRound,
  InvestmentRound,
} from '@/services/simulationEngine.service';

interface Step2Props {
  data: any;
  onContinue: (data: any) => void;
  onStepBack: () => void;
}

// ─── Round Name Formatting ────────────────────────────────────────────────────
const formatRoundName = (roundId: string, investmentId?: string): string => {
  if (investmentId === 'Round A') return 'Series A';
  if (investmentId === 'Round B') return 'Series B';
  if (investmentId === 'Round C') return 'Series C';

  const match = investmentId?.match(/Round\s+([A-Z])/i);
  if (match) return `Series ${match[1].toUpperCase()}`;

  return roundId.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

// ─── Check if investment is from an unpriced round (SAFE/Note conversion) ──────
const isUnpricedConversion = (sc: any): boolean => {
  return sc?.unpriced_round_investment_amount !== undefined && sc?.unpriced_round_investment_amount !== null;
};

const Step2CapTable: React.FC<Step2Props> = ({ data, onContinue, onStepBack }) => {
  console.log("On continue xxxxxxxxxxxxxxxxxxxx", onContinue)
  console.log("On continue yyyyyyyyyyyyyyy", data)
  const router = useRouter();
  const pathname = usePathname();
  const [isLoadingCapTable, setIsLoadingCapTable] = useState(false);
  const [capTable, setCapTable] = useState<any[]>([]);

  const loadCapTableFromAPI = async () => {
    setIsLoadingCapTable(true);
    const toastId = toast.loading('Generating cap table...');
    try {
      const allPricedRounds: InvestmentRound[] = (data.pricedRounds || []).map((r: any, i: number) =>
        mapPricedRoundToInvestmentRound(r, i + 1, null)
      );

      if (allPricedRounds.length === 0) {
        toast.dismiss(toastId);
        setIsLoadingCapTable(false);
        return;
      }

      // Strip fund params
      const cleanPricedRounds = allPricedRounds.map((round: any) => {
        console.log("pppppppppppppppppppppppppppppp")
        const { committed_capital, commitment_period, commitment_period_mgmt_fee,
          post_commitment_period_mgmt_fee, performance_fee, moic, fund_lifetime, ...clean } = round;
        return clean;
      });

      console.log('🔍 investment_rounds IDs:', cleanPricedRounds.map((r: any) => r.id));

      // Build unpriced_round_conversions map
      const unpricedMap: Record<string, any> = {};
      (data.safeNotes || []).forEach((safe: any) => {
        const rawTargetName = safe.convertingPricedRound || '';

        const targetRound = cleanPricedRounds.find((r: any) => {
          return r.id === rawTargetName;
        });

        if (!targetRound) {
          console.warn(`[Step2] ❌ Target round "${rawTargetName}" not found`);
          console.warn(`[Step2] Available IDs:`, cleanPricedRounds.map((r: any) => r.id));
          return;
        }

        const mapKey = targetRound.id;

        console.log(`[Step2] ✅ SAFE "${safe.roundName}" → key="${mapKey}"`);

        if (!unpricedMap[mapKey]) {
          unpricedMap[mapKey] = {
            converting_round: { ...targetRound },
            unpriced_rounds: [],
          };
        }

        unpricedMap[mapKey].unpriced_rounds.push(
          mapSafeNoteToUnpricedRound(safe, targetRound.investment_date)
        );
      });

      const requestBody: any = {
        founder_shares: Number(data.foundersShares || 0) / 1_000_000,
        current_committed_options: Number(data.allocatedOptions || 0) / 1_000_000,
        current_uncommitted_options: Number(data.unallocatedOptions || 0) / 1_000_000,
        investment_rounds: cleanPricedRounds,
      };

      if (Object.keys(unpricedMap).length > 0) {
        requestBody.unpriced_round_conversions = unpricedMap;
      }

      console.log('🔍 unpriced_round_conversions keys:', Object.keys(unpricedMap));
      // console.log('[Step2 CapTable Request]', JSON.stringify(requestBody, null, 2));

      const res = await createCapTable(requestBody);
      // console.log('[Step2 CapTable Response]', JSON.stringify(res, null, 2));

      if (res?.success && res?.data) {
        const d = res.data;
        const rows: any[] = [];

        const founderShares = Math.round((d.founder_shares ?? 0) * 1_000_000);
        const uncommittedOptions = Math.round((d.uncommitted_options_at_round_end ?? 0) * 1_000_000);
        const committedOptions = Math.round((d.committed_options_at_round_end ?? 0) * 1_000_000);
        const roundToInv = d.round_to_investment_class || {};

        // Add founders
        if (founderShares > 0) {
          rows.push({ 
            id: 1, 
            name: 'Founders', 
            commonStock: founderShares, 
            stockOptions: 0, 
            preferredShares: 0, 
            fullyDiluted: founderShares, 
            nominalOwnership: 0, 
            pricePerShare: 0 
          });
        }
        
        // Add unallocated options
        if (uncommittedOptions > 0) {
          rows.push({ 
            id: 2, 
            name: 'Unallocated Options', 
            commonStock: 0, 
            stockOptions: uncommittedOptions, 
            preferredShares: 0, 
            fullyDiluted: uncommittedOptions, 
            nominalOwnership: 0, 
            pricePerShare: 0 
          });
        }
        
        // Add allocated options
        if (committedOptions > 0) {
          rows.push({ 
            id: 3, 
            name: 'Allocated Options', 
            commonStock: 0, 
            stockOptions: committedOptions, 
            preferredShares: 0, 
            fullyDiluted: committedOptions, 
            nominalOwnership: 0, 
            pricePerShare: 0 
          });
        }

        // ✅ MERGE SAFE shares into their converting round
        const roundMergedMap: Record<string, { 
          pricedShares: number; 
          unpricedShares: number; 
          pricePerShare: number;
          unpricedNames: string[];
        }> = {};

        Object.entries(roundToInv).forEach(([roundKey, roundData]: [string, any]) => {
          const shareClasses = roundData?.share_class_investment_rounds || [];
          const pricePerShare = parseFloat(((roundData?.price_per_share ?? 0) * 1_000_000).toFixed(4));
          const displayName = formatRoundName(roundKey);

          if (!roundMergedMap[displayName]) {
            roundMergedMap[displayName] = { 
              pricedShares: 0, 
              unpricedShares: 0, 
              pricePerShare: pricePerShare > 0 ? pricePerShare : 0,
              unpricedNames: [],
            };
          }

          shareClasses.forEach((sc: any) => {
            const vcShares = Math.round((sc?.vc_shares ?? 0) * 1_000_000);
            const investmentId = sc?.id || '';

            if (vcShares <= 0 || vcShares >= 1_000_000_000) return;

            if (isUnpricedConversion(sc)) {
              // SAFE/Note conversion → merge into same round
              roundMergedMap[displayName].unpricedShares += vcShares;
              const safeName = investmentId.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
              roundMergedMap[displayName].unpricedNames.push(safeName);
              
              if (roundMergedMap[displayName].pricePerShare === 0 && pricePerShare > 0) {
                roundMergedMap[displayName].pricePerShare = pricePerShare;
              }
            } else {
              // Regular priced round shares
              roundMergedMap[displayName].pricedShares += vcShares;
              if (roundMergedMap[displayName].pricePerShare === 0 && pricePerShare > 0) {
                roundMergedMap[displayName].pricePerShare = pricePerShare;
              }
            }
          });
        });

        // ✅ ADD: Initialize pricedRoundsList
        let roundIdx = 4;
        const pricedRoundsList: any[] = [];

        Object.entries(roundMergedMap).forEach(([roundName, data]) => {
          const totalShares = data.pricedShares + data.unpricedShares;
          
          if (totalShares > 0) {
            let displayName = roundName;
            if (data.unpricedNames.length > 0) {
              const safeList = data.unpricedNames.join(', ');
              displayName = `${roundName} (incl. SAFE: ${safeList})`;
            }

            pricedRoundsList.push({
              id: roundIdx++,
              name: displayName,
              commonStock: 0,
              stockOptions: 0,
              preferredShares: totalShares,
              fullyDiluted: totalShares,
              nominalOwnership: 0,
              pricePerShare: data.pricePerShare,
              _pricedShares: data.pricedShares,
              _unpricedShares: data.unpricedShares,
              _unpricedNames: data.unpricedNames,
            });
          }
        });

        rows.push(...pricedRoundsList);

        if (rows.length > 0) {
          const totalFD = rows.reduce((sum, row) => sum + (row.fullyDiluted || 0), 0);
          rows.forEach(row => {
            row.nominalOwnership = totalFD > 0 
              ? parseFloat(((row.fullyDiluted / totalFD) * 100).toFixed(2)) 
              : 0;
          });

          rows.push({
            id: 999, 
            name: 'Total',
            commonStock: rows.reduce((sum, row) => sum + (row.commonStock || 0), 0),
            stockOptions: rows.reduce((sum, row) => sum + (row.stockOptions || 0), 0),
            preferredShares: rows.reduce((sum, row) => sum + (row.preferredShares || 0), 0),
            fullyDiluted: totalFD,
            nominalOwnership: 100.0,
            pricePerShare: 0,
          });

          setCapTable(rows);
          console.log('🔍 Final cap table:', rows.map(r => ({ name: r.name, shares: r.preferredShares || r.fullyDiluted })));
          toast.success('Cap table loaded!', { id: toastId });
        } else {
          toast.dismiss(toastId);
        }
      } else {
        toast.error('Cap table API returned no data', { id: toastId });
      }
    } catch (err: any) {
      console.error('[Step2 CapTable Error]', err?.response?.data || err);
      toast.error(
        err?.response?.data?.error?.message || 
        err?.response?.data?.message || 
        'Failed to load cap table', 
        { id: toastId }
      );
    } finally {
      setIsLoadingCapTable(false);
    }
  };

  useEffect(() => {
    if (data.pricedRounds?.length > 0 || data.equityRounds?.length > 0) {
      console.log('🔍 [DEBUG] safeNotes raw data:', JSON.stringify(data.safeNotes, null, 2));
      loadCapTableFromAPI();
    }
  }, []);

  console.log("Captable yyyy", capTable)

  const formatNumber = (num: number) => {
    if (!num || num === 0) return '';
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M';
    return num.toLocaleString();
  };

  return (
    <div className="mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Cap Table Summary</h1>
        {isLoadingCapTable && (
          <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
            <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
            Generating cap table...
          </div>
        )}
      </div>

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
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-600">Price / Share</th>
              </tr>
            </thead>
            <tbody>
              {capTable.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">
                    {isLoadingCapTable ? 'Loading...' : 'No cap table data. Add a priced round in Step 1.'}
                  </td>
                </tr>
              ) : capTable.map((row: any) => (
                <tr
                  key={row.id}
                  className={`border-b border-gray-100 ${row.name === 'Total' ? 'bg-gray-50 font-semibold' : 'bg-white'}`}
                >
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">{row.name}</div>
                    {row._unpricedNames?.length > 0 && (
                      <div className="text-xs text-gray-400 mt-0.5">
                        Priced: {formatNumber(row._pricedShares)} + SAFE: {formatNumber(row._unpricedShares)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {row.name === 'Total' ? '-' : (
                      <>
                        Activest III, Sequoia<br />
                        <span
                          onClick={() => router.push(`${pathname}/${row.name.toLowerCase().replace(/\s+/g, '-')}?returnStep=step2&returnTo=${encodeURIComponent(pathname)}`)}
                          className="text-blue-600 cursor-pointer hover:underline"
                        >
                          Specify Investors
                        </span>
                      </>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">{formatNumber(row.commonStock || 0)}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{formatNumber(row.stockOptions || 0)}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{formatNumber(row.preferredShares || 0)}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{formatNumber(row.fullyDiluted)}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{row.nominalOwnership}%</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{row.pricePerShare ? `$${row.pricePerShare.toFixed(4)}` : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center mt-12">
        <button onClick={onStepBack} className="px-8 py-2.5 border border-blue-200 text-blue-500 rounded-full hover:bg-blue-50 transition-all font-medium">
          Cancel
        </button>
        <div className="flex gap-4">
          <button onClick={onStepBack} className="px-8 py-2.5 border border-blue-200 text-blue-500 rounded-full hover:bg-blue-50 transition-all font-medium">
            Step back
          </button>
          <button
            onClick={() => onContinue({ capTable })}
            className="px-8 py-2.5 bg-[#3b66ff] text-white rounded-full hover:bg-blue-700 transition-all font-medium"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step2CapTable;