import React, { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const defaultData = [
  { name: 'Post Series A', SeriesA: 20, Founders: 15 },
  { name: 'Post Series B', SeriesA: 30, SeriesB: 25, Founders: 25 },
  { name: 'Post Series C', SeriesA: 25, SeriesB: 20, SeriesC: 30, Founders: 25 },
];

interface ValuationAnalysisProps {
  selectedShareholders?: string[];
  nominalValue?: number;
  contractValue?: number;
  data?: Array<Record<string, number | string>>;
}

const ValuationAnalysis: React.FC<ValuationAnalysisProps> = ({
  selectedShareholders,
  nominalValue = 5.0,
  contractValue = 5.0,
  data = defaultData,
}) => {
  const seriesConfigs = [
    { id: 'seriesA', dataKey: 'SeriesA', name: 'Series A', color: '#818cf8' },
    { id: 'seriesB', dataKey: 'SeriesB', name: 'Series B', color: '#f87171' },
    { id: 'seriesC', dataKey: 'SeriesC', name: 'Series C', color: '#22d3ee' },
    { id: 'founders', dataKey: 'Founders', name: 'Founders', color: '#fbbf24' },
  ];

  const availableSeries = useMemo(
    () =>
      selectedShareholders && selectedShareholders.length > 0
        ? seriesConfigs.filter((series) => selectedShareholders.includes(series.id))
        : seriesConfigs,
    [selectedShareholders]
  );

  const [selectedSeries, setSelectedSeries] = useState(
    availableSeries.map((series) => series.dataKey)
  );

  useEffect(() => {
    setSelectedSeries((prev) => {
      const allowed = new Set(availableSeries.map((series) => series.dataKey));
      const next = prev.filter((key) => allowed.has(key));
      return next.length > 0 ? next : availableSeries.map((series) => series.dataKey);
    });
  }, [availableSeries]);

  const toggleSeries = (dataKey: string) => {
    setSelectedSeries((prev) => {
      if (prev.includes(dataKey)) {
        if (prev.length === 1) return prev;
        return prev.filter((key) => key !== dataKey);
      }
      return [...prev, dataKey];
    });
  };

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm font-sans overflow-hidden">
      <div className="p-8">
        <p className="text-[12px] text-[#475569] mb-6 font-medium">Round-by-Round distribution</p>
        
        <div className="flex flex-row gap-4 items-start">
          {/* Chart Section */}
          <div className="flex-[3] h-[380px] flex flex-col">
            <ResponsiveContainer width="100%" height="84%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: 20, bottom: 16 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  fontSize={10} 
                  axisLine={{ stroke: '#94a3b8' }} 
                  tickLine={false} 
                  tickMargin={10}
                  tick={{ fill: '#64748b' }}
                />
                <YAxis 
                  fontSize={11} 
                  axisLine={{ stroke: '#94a3b8' }} 
                  tickLine={false} 
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tick={{ fill: '#64748b' }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value, name) => [`$${Number(value ?? 0)}M`, name]}
                />
                {availableSeries.map((series, index) => (
                  <Bar
                    key={series.dataKey}
                    dataKey={series.dataKey}
                    stackId="a"
                    fill={series.color}
                    hide={!selectedSeries.includes(series.dataKey)}
                    barSize={index === 0 ? 120 : undefined}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-2 text-center text-sm font-semibold text-[#1e293b]">
              Funding Rounds
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              {availableSeries.map((series) => {
                const isSelected = selectedSeries.includes(series.dataKey);
                return (
                  <button
                    key={series.dataKey}
                    type="button"
                    onClick={() => toggleSeries(series.dataKey)}
                    className={`inline-flex items-center gap-1.5 text-sm transition ${
                      isSelected ? 'text-[#334155]' : 'text-[#94a3b8]'
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${isSelected ? 'opacity-100' : 'opacity-40'}`}
                      style={{ backgroundColor: series.color }}
                    />
                    <span>{series.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Metrics Section precisely as seen in image_c1713b.png */}
          <div className="flex-1 pt-4 space-y-10 border-l border-gray-50 pl-8">
            <div className="text-right">
              <p className="text-[11px] font-bold text-[#94a3b8] mb-1 uppercase tracking-tight">Nominal Post Money Valuation</p>
              <p className="text-[72px] font-medium text-[#0f172a] leading-none tracking-tighter">
                {nominalValue.toFixed(3)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-bold text-[#94a3b8] mb-1 uppercase tracking-tight">Contract Based Valuation</p>
              <p className="text-[72px] font-medium text-[#0f172a] leading-none tracking-tighter">
                {contractValue.toFixed(3)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValuationAnalysis;
