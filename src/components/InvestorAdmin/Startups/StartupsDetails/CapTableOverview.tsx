"use client";

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';

interface CapRow {
  id: string;
  name: string;
  shares: number;
  ownership: number;
  pricePerShare?: number;
  type: 'founder' | 'option' | 'preferred';
}

export default function CapTableOverview() {
  const [isTableVisible, setIsTableVisible] = useState(true);
  const [rows, setRows] = useState<CapRow[]>([]);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    // Load cap table data from the latest simulation stored in localStorage
    try {
      const raw =
        localStorage.getItem('tsg_simulation_results') ||
        localStorage.getItem('tsg_simulation_data') ||
        sessionStorage.getItem('simulationData');
      if (!raw) return;
      const stored = JSON.parse(raw);
      const cap = stored?.capTableResult?.data || stored?.simResult?.capTableResult?.data;
      if (!cap) return;

      const built: CapRow[] = [];
      const totalShares =
        (cap.founder_shares || 0) +
        (cap.committed_options_at_round_end || 0) +
        (cap.uncommitted_options_at_round_end || 0) +
        Object.values(cap.round_to_investment_class || {}).reduce((sum: number, rc: any) => {
          return sum + (rc.share_class_investment_rounds?.[0]?.vc_shares || 0);
        }, 0);

      if (totalShares === 0) return;

      built.push({
        id: 'founders',
        name: 'Founders — Common Stock',
        shares: Math.round((cap.founder_shares || 0) * 1_000_000),
        ownership: ((cap.founder_shares || 0) / totalShares) * 100,
        type: 'founder',
      });

      built.push({
        id: 'allocated',
        name: 'Allocated Options',
        shares: Math.round((cap.committed_options_at_round_end || 0) * 1_000_000),
        ownership: ((cap.committed_options_at_round_end || 0) / totalShares) * 100,
        type: 'option',
      });

      built.push({
        id: 'unallocated',
        name: 'Unallocated Options',
        shares: Math.round((cap.uncommitted_options_at_round_end || 0) * 1_000_000),
        ownership: ((cap.uncommitted_options_at_round_end || 0) / totalShares) * 100,
        type: 'option',
      });

      Object.entries(cap.round_to_investment_class || {}).forEach(([key, rc]: [string, any]) => {
        const vcShares = rc.share_class_investment_rounds?.[0]?.vc_shares || 0;
        const pricePerShare = rc.price_per_share || 0;
        built.push({
          id: key,
          name: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) + ' — Preferred',
          shares: Math.round(vcShares * 1_000_000),
          ownership: (vcShares / totalShares) * 100,
          pricePerShare: pricePerShare * 1_000_000,
          type: 'preferred',
        });
      });

      setRows(built);
      setHasData(true);
    } catch {}
  }, []);

  const fmtNum = (n: number) => n.toLocaleString('en-US');
  const fmtPct = (n: number) => `${n.toFixed(2)}%`;
  const fmtPrice = (n: number) =>
    n ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 4 }).format(n) : '—';

  const totalShares = rows.reduce((s, r) => s + r.shares, 0);

  const badgeColor = (type: CapRow['type']) => {
    if (type === 'founder') return 'bg-blue-50 text-blue-600';
    if (type === 'option') return 'bg-gray-50 text-gray-500';
    return 'bg-purple-50 text-purple-600';
  };

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm font-sans overflow-hidden">
      <div
        className="px-6 py-4 border-b border-gray-100 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsTableVisible(v => !v)}
      >
        <h3 className="text-[16px] font-semibold text-[#101828]">Cap Table Overview</h3>
        <div className="text-[#667085]">
          {isTableVisible ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {isTableVisible && (
        <div className="p-6">
          {!hasData ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              <p className="mb-1 font-medium">No cap table data yet</p>
              <p className="text-xs">Run a simulation to generate a cap table for this startup.</p>
            </div>
          ) : (
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full text-[12px] border-collapse">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-gray-500 text-left">
                    <th className="px-5 py-3 font-semibold uppercase tracking-tight">Shareholder</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-tight text-right">Shares</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-tight text-right">Ownership %</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-tight text-right">Price / Share</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-tight text-right">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {rows.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 font-medium text-[#101828]">{row.name}</td>
                      <td className="px-5 py-4 text-right text-gray-600">{fmtNum(row.shares)}</td>
                      <td className="px-5 py-4 text-right text-gray-600">{fmtPct(row.ownership)}</td>
                      <td className="px-5 py-4 text-right text-gray-600">
                        {row.pricePerShare ? fmtPrice(row.pricePerShare) : '—'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${badgeColor(row.type)}`}>
                          {row.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <td className="px-5 py-3 font-bold text-[#101828] text-[12px]">Total (Fully Diluted)</td>
                    <td className="px-5 py-3 text-right font-bold text-[#101828] text-[12px]">{fmtNum(totalShares)}</td>
                    <td className="px-5 py-3 text-right font-bold text-[#101828] text-[12px]">100.00%</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}