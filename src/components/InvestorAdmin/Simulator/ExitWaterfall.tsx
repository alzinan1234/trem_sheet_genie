import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

// Data points precisely matching the trajectories in the provided image
const waterfallData = [
  { val: 0, seriesA: 0, seriesB: 0, seriesC: 0, founders: 0 },
  { val: 10, seriesA: 2, seriesB: 5, seriesC: 10, founders: 6 },
  { val: 20, seriesA: 4, seriesB: 8, seriesC: 15, founders: 12 },
  { val: 30, seriesA: 6, seriesB: 10, seriesC: 15, founders: 18 },
  { val: 40, seriesA: 8, seriesB: 12, seriesC: 16, founders: 22 },
  { val: 50, seriesA: 10, seriesB: 13, seriesC: 17, founders: 28 },
  { val: 60, seriesA: 12, seriesB: 15, seriesC: 18, founders: 33 },
  { val: 70, seriesA: 14, seriesB: 16, seriesC: 19, founders: 39 },
  { val: 80, seriesA: 16, seriesB: 17, seriesC: 20, founders: 44 },
  { val: 90, seriesA: 18, seriesB: 19, seriesC: 21, founders: 50 },
  { val: 100, seriesA: 20, seriesB: 20, seriesC: 22, founders: 55 },
  { val: 110, seriesA: 23, seriesB: 22, seriesC: 23, founders: 60 },
  { val: 120, seriesA: 25, seriesB: 24, seriesC: 24, founders: 66 },
  { val: 130, seriesA: 26, seriesB: 25, seriesC: 25, founders: 72 },
  { val: 140, seriesA: 28, seriesB: 27, seriesC: 26, founders: 77 },
  { val: 150, seriesA: 30, seriesB: 28, seriesC: 27, founders: 82 },
  { val: 160, seriesA: 32, seriesB: 30, seriesC: 29, founders: 88 },
  { val: 170, seriesA: 34, seriesB: 31, seriesC: 30, founders: 93 },
  { val: 180, seriesA: 37, seriesB: 33, seriesC: 31, founders: 99 },
  { val: 190, seriesA: 38, seriesB: 35, seriesC: 32, founders: 104 },
  { val: 200, seriesA: 40, seriesB: 36, seriesC: 33, founders: 110 },
];

const ExitWaterfall: React.FC = () => {
  const lineConfigs = [
    { dataKey: 'seriesA', name: 'Series A', stroke: '#818cf8' },
    { dataKey: 'seriesB', name: 'Series B', stroke: '#f87171' },
    { dataKey: 'seriesC', name: 'Series C', stroke: '#22d3ee' },
    { dataKey: 'founders', name: 'Founders', stroke: '#fbbf24' },
  ];
  const [selectedSeries, setSelectedSeries] = useState(lineConfigs.map((line) => line.dataKey));
  const [range, setRange] = useState({ start: 0, end: waterfallData.length - 1 });

  const minWindowSize = 6;
  const windowSize = range.end - range.start + 1;
  const totalPoints = waterfallData.length;
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

  const toggleSeries = (dataKey?: string) => {
    if (!dataKey) return;
    setSelectedSeries((prev) => {
      if (prev.includes(dataKey)) {
        if (prev.length === 1) return prev;
        return prev.filter((key) => key !== dataKey);
      }
      return [...prev, dataKey];
    });
  };

  const visibleData = useMemo(
    () => waterfallData.slice(range.start, range.end + 1),
    [range.end, range.start]
  );

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm font-sans overflow-hidden">
      {/* Header Bar */}
   

      <div className="p-8">
        <div className="mb-4 flex items-center justify-end">
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
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={visibleData}
              margin={{ top: 10, right: 30, left: 20, bottom: 16 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              
              <XAxis 
                dataKey="val" 
                fontSize={10} 
                tick={{ fill: '#64748b' }}
                axisLine={{ stroke: '#94a3b8' }}
                tickLine={false}
              />
              
              <YAxis 
                fontSize={11} 
                tick={{ fill: '#64748b' }}
                axisLine={{ stroke: '#94a3b8' }}
                tickLine={false}
                domain={[0, 120]}
                ticks={[0, 30, 60, 90, 120]}
                label={{ 
                  value: 'Value to All Shareholders (MM)', 
                  angle: -90, 
                  position: 'center', 
                  offset: -22,
                  fontSize: 14, 
                  fontWeight: 600, 
                  fill: '#1e293b' 
                }} 
              />

              <Tooltip 
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: '1px solid #e2e8f0', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '12px'
                }}
                labelFormatter={(value) => `Exit Value: $${value}M`}
                formatter={(value, name) => [`$${Number(value ?? 0)}M`, name]}
              />

              {lineConfigs.map((line) => (
                <Line
                  key={line.dataKey}
                  type="monotone"
                  dataKey={line.dataKey}
                  name={line.name}
                  stroke={line.stroke}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                  hide={!selectedSeries.includes(line.dataKey)}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 text-center text-sm font-semibold text-[#1e293b]">
          Exit Company Valuation (MM)
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          {lineConfigs.map((line) => {
            const isSelected = selectedSeries.includes(line.dataKey);
            return (
              <button
                key={line.dataKey}
                type="button"
                onClick={() => toggleSeries(line.dataKey)}
                className={`inline-flex items-center gap-1.5 text-sm transition ${
                  isSelected ? 'text-[#334155]' : 'text-[#94a3b8]'
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${isSelected ? 'opacity-100' : 'opacity-40'}`}
                  style={{ backgroundColor: line.stroke }}
                />
                <span>{line.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>  
  );
};

export default ExitWaterfall;
