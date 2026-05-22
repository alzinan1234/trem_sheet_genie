"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

// Build chart data from simulation result points (API returns in $M)
function buildChartData(simResult: any): { data: any[]; lines: { dataKey: string; name: string; stroke: string }[] } {
  const COLORS = ['#818cf8', '#f87171', '#22d3ee', '#34d399', '#fbbf24'];
  const lines: { dataKey: string; name: string; stroke: string }[] = [];
  const pointMap: Record<number, any> = {};

  const addPoints = (pts: any[], key: string) => {
    (pts || []).forEach((pt: any) => {
      const x = Array.isArray(pt) ? pt[0] : pt.x;
      const y = Array.isArray(pt) ? pt[1] : pt.y;
      if (!pointMap[x]) pointMap[x] = { val: Math.round(x) };
      pointMap[x][key] = Math.round(y * 100) / 100;
    });
  };

  if (simResult?.data?.investor_results) {
    // Phase 2/3 — multiple rounds
    let colorIdx = 0;
    Object.entries(simResult.data.investor_results).forEach(([roundId, rd]: [string, any]) => {
      const pts = rd?.investor_portfolio?.points || [];
      if (pts.length > 0) {
        const key = roundId;
        addPoints(pts, key);
        lines.push({ dataKey: key, name: roundId, stroke: COLORS[colorIdx % COLORS.length] });
        colorIdx++;
      }
    });
    const founderPts = simResult.data?.founder_portfolio?.points || [];
    if (founderPts.length > 0) {
      addPoints(founderPts, 'founders');
      lines.push({ dataKey: 'founders', name: 'Founders', stroke: '#fbbf24' });
    }
  } else if (simResult?.data?.investor_portfolio) {
    // Phase 1 — single round
    addPoints(simResult.data.investor_portfolio.points || [], 'investor');
    lines.push({ dataKey: 'investor', name: 'Investor', stroke: '#818cf8' });
    addPoints(simResult.data?.founder_portfolio?.points || [], 'founders');
    lines.push({ dataKey: 'founders', name: 'Founders', stroke: '#fbbf24' });
  }

  const data = Object.values(pointMap).sort((a: any, b: any) => a.val - b.val);
  return { data, lines };
}

// Static fallback data (illustrative)
const STATIC_DATA = [
  { val: 0, seriesA: 0, founders: 0 },
  { val: 20, seriesA: 3, founders: 8 },
  { val: 40, seriesA: 7, founders: 18 },
  { val: 60, seriesA: 11, founders: 30 },
  { val: 80, seriesA: 15, founders: 44 },
  { val: 100, seriesA: 19, founders: 58 },
  { val: 120, seriesA: 24, founders: 72 },
  { val: 140, seriesA: 28, founders: 86 },
  { val: 160, seriesA: 32, founders: 100 },
];
const STATIC_LINES = [
  { dataKey: 'seriesA', name: 'Investor', stroke: '#818cf8' },
  { dataKey: 'founders', name: 'Founders', stroke: '#fbbf24' },
];

export default function ReturnsAnalysis() {
  const [isOpen, setIsOpen] = useState(true);
  const [simResult, setSimResult] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('tsg_simulation_results');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.simResult) setSimResult(parsed.simResult);
      }
    } catch {}
  }, []);

  const { data: chartData, lines } = useMemo(() => {
    if (!simResult) return { data: STATIC_DATA, lines: STATIC_LINES };
    const result = buildChartData(simResult);
    if (result.data.length === 0) return { data: STATIC_DATA, lines: STATIC_LINES };
    return result;
  }, [simResult]);

  const isLive = !!simResult && chartData !== STATIC_DATA;

  // Zoom/pan state
  const [range, setRange] = useState({ start: 0, end: -1 });
  useEffect(() => { setRange({ start: 0, end: chartData.length - 1 }); }, [chartData]);

  const totalPoints = chartData.length;
  const end = range.end === -1 ? totalPoints - 1 : range.end;
  const windowSize = end - range.start + 1;
  const minWindowSize = 4;
  const canZoomIn = windowSize > minWindowSize;
  const canZoomOut = windowSize < totalPoints;
  const canPanLeft = range.start > 0;
  const canPanRight = end < totalPoints - 1;
  const panStep = Math.max(1, Math.floor(windowSize * 0.25));

  const clampStart = (s: number, w: number) => Math.max(0, Math.min(s, totalPoints - w));

  const applyWindow = (targetW: number) => {
    const w = Math.max(minWindowSize, Math.min(totalPoints, targetW));
    const mid = (range.start + end) / 2;
    const s = clampStart(Math.round(mid - (w - 1) / 2), w);
    setRange({ start: s, end: s + w - 1 });
  };

  const pan = (dir: 'left' | 'right') => {
    const delta = dir === 'left' ? -panStep : panStep;
    const s = clampStart(range.start + delta, windowSize);
    setRange({ start: s, end: s + windowSize - 1 });
  };

  const visibleData = useMemo(() => chartData.slice(range.start, end + 1), [chartData, range.start, end]);
  const [selectedSeries, setSelectedSeries] = useState<string[]>([]);
  useEffect(() => { setSelectedSeries(lines.map(l => l.dataKey)); }, [lines]);

  const toggleSeries = (key: string) => {
    setSelectedSeries(prev =>
      prev.includes(key) ? (prev.length > 1 ? prev.filter(k => k !== key) : prev) : [...prev, key]
    );
  };

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm font-sans overflow-hidden">
      <div
        className="px-6 py-4 border-b border-gray-50 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <h3 className="text-[16px] font-semibold text-[#000000]">Exit Waterfall Breakdown</h3>
          {!isLive && (
            <span className="text-[10px] bg-yellow-50 text-yellow-600 border border-yellow-200 px-2 py-0.5 rounded-full font-medium">
              Illustrative — run a simulation to see real data
            </span>
          )}
          {isLive && (
            <span className="text-[10px] bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 rounded-full font-medium">
              Live simulation data
            </span>
          )}
        </div>
        <div className="text-[#667085]">{isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
      </div>

      {isOpen && (
        <div className="p-8">
          <div className="mb-4 flex items-center justify-end">
            <div className="inline-flex items-center gap-1 rounded-full border border-[#dbe3f0] bg-[#f8fbff] p-1">
              {[
                { icon: <ChevronLeft size={14} />, action: () => pan('left'), disabled: !canPanLeft, title: 'Pan left' },
                { icon: <ChevronRight size={14} />, action: () => pan('right'), disabled: !canPanRight, title: 'Pan right' },
                { icon: <ZoomOut size={14} />, action: () => applyWindow(Math.ceil(windowSize * 1.8)), disabled: !canZoomOut, title: 'Zoom out' },
                { icon: <ZoomIn size={14} />, action: () => applyWindow(Math.floor(windowSize * 0.5)), disabled: !canZoomIn, title: 'Zoom in' },
                { icon: <RotateCcw size={14} />, action: () => setRange({ start: 0, end: totalPoints - 1 }), disabled: !canZoomOut, title: 'Reset' },
              ].map((btn, i) => (
                <button key={i} onClick={btn.action} disabled={btn.disabled} title={btn.title}
                  className="rounded-full p-2 text-[#475569] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40">
                  {btn.icon}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={visibleData} margin={{ top: 10, right: 30, left: 20, bottom: 16 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="val" fontSize={10} tick={{ fill: '#64748b' }} axisLine={{ stroke: '#94a3b8' }} tickLine={false}
                  tickFormatter={(v) => `$${v}M`} />
                <YAxis fontSize={11} tick={{ fill: '#64748b' }} axisLine={{ stroke: '#94a3b8' }} tickLine={false}
                  label={{ value: 'Payoff ($M)', angle: -90, position: 'center', offset: -22, fontSize: 13, fontWeight: 600, fill: '#1e293b' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                  labelFormatter={(v) => `Exit: $${v}M`}
                  formatter={(v: any, name: string) => [`$${Number(v ?? 0).toFixed(2)}M`, name]}
                />
                {lines.map(l => (
                  <Line key={l.dataKey} type="monotone" dataKey={l.dataKey} name={l.name}
                    stroke={l.stroke} strokeWidth={2} dot={false} activeDot={{ r: 5 }}
                    hide={!selectedSeries.includes(l.dataKey)} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 text-center text-sm font-semibold text-[#1e293b]">Exit Company Valuation ($M)</div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            {lines.map(l => {
              const on = selectedSeries.includes(l.dataKey);
              return (
                <button key={l.dataKey} onClick={() => toggleSeries(l.dataKey)}
                  className={`inline-flex items-center gap-1.5 text-sm transition ${on ? 'text-[#334155]' : 'text-[#94a3b8]'}`}>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: l.stroke, opacity: on ? 1 : 0.4 }} />
                  <span>{l.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
