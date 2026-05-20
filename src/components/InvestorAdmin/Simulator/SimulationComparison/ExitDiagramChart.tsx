"use client";

import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// ছবির ডাটা পয়েন্ট অনুযায়ী স্যাম্পল ডাটা
const data = [
  { name: 0, seriesA: 0, seriesB: 0, seriesC: 0, founders: 0 },
  { name: 10, seriesA: 2, seriesB: 3, seriesC: 5, founders: 8 },
  { name: 20, seriesA: 4, seriesB: 6, seriesC: 10, founders: 15 },
  { name: 30, seriesA: 6, seriesB: 9, seriesC: 12, founders: 22 },
  { name: 40, seriesA: 8, seriesB: 11, seriesC: 14, founders: 28 },
  { name: 50, seriesA: 10, seriesB: 13, seriesC: 16, founders: 34 },
  { name: 60, seriesA: 12, seriesB: 15, seriesC: 18, founders: 40 },
  { name: 70, seriesA: 14, seriesB: 17, seriesC: 20, founders: 46 },
  { name: 80, seriesA: 16, seriesB: 19, seriesC: 22, founders: 52 },
  { name: 90, seriesA: 18, seriesB: 21, seriesC: 24, founders: 58 },
  { name: 100, seriesA: 20, seriesB: 23, seriesC: 26, founders: 64 },
  { name: 110, seriesA: 22, seriesB: 25, seriesC: 28, founders: 70 },
  { name: 120, seriesA: 24, seriesB: 27, seriesC: 30, founders: 76 },
  { name: 130, seriesA: 26, seriesB: 29, seriesC: 32, founders: 82 },
  { name: 140, seriesA: 28, seriesB: 31, seriesC: 34, founders: 88 },
  { name: 150, seriesA: 30, seriesB: 33, seriesC: 36, founders: 94 },
  { name: 160, seriesA: 32, seriesB: 35, seriesC: 38, founders: 100 },
  { name: 170, seriesA: 34, seriesB: 37, seriesC: 40, founders: 106 },
  { name: 180, seriesA: 36, seriesB: 39, seriesC: 42, founders: 112 },
  { name: 190, seriesA: 38, seriesB: 41, seriesC: 44, founders: 118 },
  { name: 200, seriesA: 40, seriesB: 43, seriesC: 46, founders: 124 },
];

// ছবির মতো হুবহু কাস্টম টুলটিপ
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-100 shadow-xl rounded-xl">
        <p className="text-[12px] font-bold text-gray-800 mb-2">exit value: ${label}m</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-[11px] font-medium" style={{ color: entry.color }}>
              {entry.name}: ${entry.value}m
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const ExitDiagramChart = ({ selectedShareholders }: { selectedShareholders: string[] }) => {
  // Define line configurations
  const lineConfigs = [
    { 
      id: 'seriesA', 
      dataKey: 'seriesA', 
      name: 'Series A', 
      stroke: '#818cf8' 
    },
    { 
      id: 'seriesB', 
      dataKey: 'seriesB', 
      name: 'Series B', 
      stroke: '#fb7185' 
    },
    { 
      id: 'seriesC', 
      dataKey: 'seriesC', 
      name: 'Series C', 
      stroke: '#2dd4bf' 
    },
    { 
      id: 'founders', 
      dataKey: 'founders', 
      name: 'Founders', 
      stroke: '#fbbf24' 
    },
  ];

  const [range, setRange] = useState({ start: 0, end: data.length - 1 });
  const minWindowSize = 6;
  const windowSize = range.end - range.start + 1;
  const totalPoints = data.length;
  const canZoomIn = windowSize > minWindowSize;
  const canZoomOut = windowSize < totalPoints;
  const canPanLeft = range.start > 0;
  const canPanRight = range.end < totalPoints - 1;
  const panStep = Math.max(1, Math.floor(windowSize * 0.25));

  const clampStart = (start: number, targetWindow: number) =>
    Math.max(0, Math.min(start, totalPoints - targetWindow));

  const applyWindow = (targetWindow: number) => {
    const boundedWindow = Math.max(minWindowSize, Math.min(totalPoints, targetWindow));
    const midpoint = (range.start + range.end) / 2;
    const idealStart = Math.round(midpoint - (boundedWindow - 1) / 2);
    const nextStart = clampStart(idealStart, boundedWindow);
    setRange({
      start: nextStart,
      end: nextStart + boundedWindow - 1,
    });
  };

  const handleZoomIn = () => {
    if (!canZoomIn) return;
    applyWindow(Math.floor(windowSize * 0.5));
  };

  const handleZoomOut = () => {
    if (!canZoomOut) return;
    applyWindow(Math.ceil(windowSize * 1.8));
  };

  const resetZoom = () => {
    setRange({ start: 0, end: totalPoints - 1 });
  };

  const panWindow = (direction: 'left' | 'right') => {
    const delta = direction === 'left' ? -panStep : panStep;
    const nextStart = clampStart(range.start + delta, windowSize);
    setRange({
      start: nextStart,
      end: nextStart + windowSize - 1,
    });
  };

  // Filter lines based on selected shareholders
  const visibleLines = lineConfigs.filter(line => selectedShareholders.includes(line.id));
  const visibleData = useMemo(
    () => data.slice(range.start, range.end + 1),
    [range.end, range.start]
  );

  return (
    <div className="w-full h-full bg-white p-4 flex flex-col">
      <div className="mb-3 flex items-center justify-end">
        <div className="inline-flex items-center gap-1 rounded-full border border-[#dbe3f0] bg-[#f8fbff] p-1">
          <button
            type="button"
            onClick={() => panWindow('left')}
            disabled={!canPanLeft}
            className="rounded-full p-2 text-[#475569] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
            title="Pan left"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => panWindow('right')}
            disabled={!canPanRight}
            className="rounded-full p-2 text-[#475569] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
            title="Pan right"
          >
            <ChevronRight size={14} />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={!canZoomOut}
            className="rounded-full p-2 text-[#475569] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
            title="Zoom out"
          >
            <ZoomOut size={14} />
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={!canZoomIn}
            className="rounded-full p-2 text-[#475569] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
            title="Zoom in"
          >
            <ZoomIn size={14} />
          </button>
          <button
            type="button"
            onClick={resetZoom}
            disabled={!canZoomOut}
            className="rounded-full p-2 text-[#475569] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
            title="Reset zoom"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={visibleData} margin={{ top: 24, right: 20, left: 36, bottom: 24 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            
            <XAxis 
              dataKey="name" 
              tick={{fontSize: 10, fill: '#64748b'}} 
              axisLine={{ stroke: '#94a3b8' }}
              tickLine={false}
              dy={6}
            />
            
            <YAxis 
              width={44}
              tick={{fontSize: 10, fill: '#64748b'}} 
              axisLine={false}
              tickLine={false}
              dx={-2}
              label={{ 
                value: 'Value to All Shareholders (MM)', 
                angle: -90, 
                position: 'center', 
                offset: 0,
                dx: -22,
                fontWeight: 600,
                fontSize: 14, 
                fill: '#1e293b'
              }} 
            />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }} />

            {visibleLines.map((line) => (
              <Line 
                key={line.id}
                name={line.name}
                type="monotone" 
                dataKey={line.dataKey} 
                stroke={line.stroke} 
                strokeWidth={2} 
                dot={false}
                activeDot={{ r: 5 }} 
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 text-center text-sm font-semibold text-[#1e293b]">
        Exit Company Valuation (MM)
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {visibleLines.map((line) => (
          <span key={line.id} className="inline-flex items-center gap-1.5 text-sm text-[#334155]">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: line.stroke }} />
            <span>{line.name}</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default ExitDiagramChart;
