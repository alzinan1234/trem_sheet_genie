// // app/simulator/components/CompareScenarios.tsx
// "use client";

// import React, { useState } from 'react';
// import { 
//   AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
//   XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
//   LineChart, Line, ComposedChart, Scatter, ReferenceLine
// } from 'recharts';
// import { ChevronLeft, Download, Printer, Share2, X, Maximize2, Minimize2 } from 'lucide-react';

// interface CompareScenariosProps {
//   scenarios: any[];
//   onClose: () => void;
//   onBack?: () => void;
// }

// const CompareScenarios: React.FC<CompareScenariosProps> = ({ scenarios, onClose, onBack }) => {
//   const [fullScreenMode, setFullScreenMode] = useState<'exit' | 'cap' | null>(null);
  
//   // Data for Scenario 1 Exit Diagram
//   const scenario1ExitData = [
//     { exitValue: 0, seriesA: 0, seriesB: 0, seriesC: 0, founders: 0 },
//     { exitValue: 10, seriesA: 2, seriesB: 4, seriesC: 6, founders: 15 },
//     { exitValue: 20, seriesA: 5, seriesB: 10, seriesC: 15, founders: 30 },
//     { exitValue: 30, seriesA: 9, seriesB: 18, seriesC: 27, founders: 45 },
//     { exitValue: 40, seriesA: 14, seriesB: 28, seriesC: 42, founders: 60 },
//     { exitValue: 50, seriesA: 20, seriesB: 40, seriesC: 60, founders: 75 },
//     { exitValue: 60, seriesA: 27, seriesB: 54, seriesC: 81, founders: 90 },
//     { exitValue: 70, seriesA: 35, seriesB: 70, seriesC: 105, founders: 105 },
//     { exitValue: 80, seriesA: 44, seriesB: 88, seriesC: 132, founders: 120 },
//     { exitValue: 90, seriesA: 54, seriesB: 108, seriesC: 162, founders: 135 },
//     { exitValue: 100, seriesA: 65, seriesB: 130, seriesC: 195, founders: 150 }
//   ];

//   // Data for Scenario 2 Exit Diagram
//   const scenario2ExitData = [
//     { exitValue: 0, seriesA: 0, seriesB: 0, seriesC: 0, founders: 0 },
//     { exitValue: 10, seriesA: 1.5, seriesB: 3, seriesC: 4.5, founders: 20 },
//     { exitValue: 20, seriesA: 4, seriesB: 8, seriesC: 12, founders: 40 },
//     { exitValue: 30, seriesA: 7.5, seriesB: 15, seriesC: 22.5, founders: 60 },
//     { exitValue: 40, seriesA: 12, seriesB: 24, seriesC: 36, founders: 80 },
//     { exitValue: 50, seriesA: 17.5, seriesB: 35, seriesC: 52.5, founders: 100 },
//     { exitValue: 60, seriesA: 24, seriesB: 48, seriesC: 72, founders: 120 },
//     { exitValue: 70, seriesA: 31.5, seriesB: 63, seriesC: 94.5, founders: 140 },
//     { exitValue: 80, seriesA: 40, seriesB: 80, seriesC: 120, founders: 160 },
//     { exitValue: 90, seriesA: 49.5, seriesB: 99, seriesC: 148.5, founders: 180 },
//     { exitValue: 100, seriesA: 60, seriesB: 120, seriesC: 180, founders: 200 }
//   ];

//   // Data for Round-by-Round distribution
//   const roundDistributionData = [
//     { round: 'Post Series A', scenario1Nominal: 25, scenario1Contract: 5, scenario2Nominal: 25, scenario2Contract: 4.8 },
//     { round: 'Post Series B', scenario1Nominal: 50, scenario1Contract: 10, scenario2Nominal: 50, scenario2Contract: 8 },
//     { round: 'Post Series C', scenario1Nominal: 75, scenario1Contract: 15, scenario2Nominal: 75, scenario2Contract: 12 }
//   ];

//   // Cap table data
//   const scenario1CapData = [
//     { name: 'Founders', investors: '3 Founders', commonStock: 100000, stockOptions: 10000, seriesA: '-', seriesB: '-', seriesA_Preferred: '', seriesB_Preferred: '', fullyDiluted: 110000, nominalOwnership: '10.8%', pricePerShare: 10.8 },
//     { name: 'Unallocated Options', investors: '-', commonStock: '-', stockOptions: 10000, seriesA: '-', seriesB: '-', seriesA_Preferred: '', seriesB_Preferred: '', fullyDiluted: 10000, nominalOwnership: '1.0%', pricePerShare: 1.0 },
//     { name: 'Series A', investors: '2 Investors', commonStock: '-', stockOptions: '-', seriesA: '500,000', seriesB: '-', seriesA_Preferred: '500,000', seriesB_Preferred: '', fullyDiluted: 500000, nominalOwnership: '49.0%', pricePerShare: 49.0 },
//     { name: 'Series B', investors: 'Accel Partners', commonStock: '-', stockOptions: '-', seriesA: '-', seriesB: '400,000', seriesA_Preferred: '', seriesB_Preferred: '400,000', fullyDiluted: 400000, nominalOwnership: '39.2%', pricePerShare: 39.2 },
//     { name: 'Total', investors: '-', commonStock: 100000, stockOptions: 20000, seriesA: '500,000', seriesB: '400,000', seriesA_Preferred: '500,000', seriesB_Preferred: '400,000', fullyDiluted: 1020000, nominalOwnership: '100.0%', pricePerShare: 100.0 }
//   ];

//   const scenario2CapData = [
//     { name: 'Founders', investors: '3 Founders', commonStock: 100000, stockOptions: 10000, seriesA: '-', seriesB: '-', seriesA_Preferred: '', seriesB_Preferred: '', fullyDiluted: 110000, nominalOwnership: '10.8%', pricePerShare: 10.8 },
//     { name: 'Unallocated Options', investors: '-', commonStock: '-', stockOptions: 10000, seriesA: '-', seriesB: '-', seriesA_Preferred: '', seriesB_Preferred: '', fullyDiluted: 10000, nominalOwnership: '1.0%', pricePerShare: 1.0 },
//     { name: 'Series A', investors: '2 Investors', commonStock: '-', stockOptions: '-', seriesA: '500,000', seriesB: '-', seriesA_Preferred: '500,000', seriesB_Preferred: '', fullyDiluted: 500000, nominalOwnership: '49.0%', pricePerShare: 49.0 },
//     { name: 'Series B', investors: 'Accel Partners', commonStock: '-', stockOptions: '-', seriesA: '-', seriesB: '400,000', seriesA_Preferred: '', seriesB_Preferred: '400,000', fullyDiluted: 400000, nominalOwnership: '39.2%', pricePerShare: 39.2 },
//     { name: 'Total', investors: '-', commonStock: 100000, stockOptions: 20000, seriesA: '500,000', seriesB: '400,000', seriesA_Preferred: '500,000', seriesB_Preferred: '400,000', fullyDiluted: 1020000, nominalOwnership: '100.0%', pricePerShare: 100.0 }
//   ];

//   // Data for pie charts
//   const founderDistributionScenario1 = [
//     { name: 'Founder', value: 50, color: '#3B82F6' },
//     { name: 'Non-founder', value: 50, color: '#10B981' }
//   ];

//   const founderDistributionScenario2 = [
//     { name: 'Founder', value: 70, color: '#3B82F6' },
//     { name: 'Non-founder', value: 30, color: '#10B981' }
//   ];

//   const barChartData = [
//     { category: 'Founder', scenario1: 100000, scenario2: 100000 },
//     { category: 'Non-founder', scenario1: 10000, scenario2: 10000 }
//   ];

//   // Helper function to format numbers
//   const formatNumber = (num: number) => {
//     return new Intl.NumberFormat('en-US').format(num);
//   };

//   const formatCurrency = (value: number) => {
//     if (value >= 1000000) {
//       return `$${(value / 1000000).toFixed(1)}M`;
//     }
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,
//     }).format(value);
//   };

//   // Handle full screen toggle
//   const toggleFullScreen = (mode: 'exit' | 'cap') => {
//     setFullScreenMode(fullScreenMode === mode ? null : mode);
//   };

//   // Handle print
//   const handlePrint = () => {
//     window.print();
//   };

//   // Handle export
//   const handleExport = () => {
//     alert('Export functionality would be implemented here');
//   };

//   // Handle share
//   const handleShare = () => {
//     alert('Share functionality would be implemented here');
//   };

//   // Main content when not in full screen mode
//   if (!fullScreenMode) {
//     return (
//       <div className="min-h-screen bg-gray-50 p-6">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-6">
//           <div className="flex items-center gap-4">
//             {onBack && (
//               <button
//                 onClick={onBack}
//                 className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
//               >
//                 <ChevronLeft size={20} />
//                 Back
//               </button>
//             )}
//             <h1 className="text-2xl font-bold text-gray-900">Scenario Comparison</h1>
//           </div>
//           <div className="flex items-center gap-3">
//             <button
//               onClick={handlePrint}
//               className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
//             >
//               <Printer size={16} />
//               Print
//             </button>
//             <button
//               onClick={handleExport}
//               className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
//             >
//               <Download size={16} />
//               Export
//             </button>
//             <button
//               onClick={handleShare}
//               className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//             >
//               <Share2 size={16} />
//               Share
//             </button>
//             <button
//               onClick={onClose}
//               className="p-2 text-gray-500 hover:text-gray-700"
//             >
//               <X size={24} />
//             </button>
//           </div>
//         </div>

//         {/* Two Column Layout */}
//         <div className="grid grid-cols-2 gap-6">
//           {/* Left Column - Scenario 1 */}
//           <div className="space-y-6">
//             {/* Scenario 1 Header */}
//             <div className="bg-white rounded-lg border border-gray-300 p-4">
//               <h2 className="text-xl font-bold text-gray-900 mb-4">Scenario 1</h2>
//               <div className="grid grid-cols-3 gap-4">
//                 <div>
//                   <p className="text-sm text-gray-600">Investment Amount</p>
//                   <p className="text-lg font-bold text-gray-900">$10,000,000</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Pre-Money Valuation</p>
//                   <p className="text-lg font-bold text-gray-900">$40,000,000</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Ownership %</p>
//                   <p className="text-lg font-bold text-gray-900">20%</p>
//                 </div>
//               </div>
//             </div>

//             {/* Exit Diagram Comparison - Scenario 1 */}
//             <div className="bg-white rounded-lg border border-gray-300 p-4">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="font-semibold text-gray-900">Exit Diagram Comparison</h3>
//                 <button
//                   onClick={() => toggleFullScreen('exit')}
//                   className="p-1 text-gray-500 hover:text-gray-700"
//                 >
//                   <Maximize2 size={18} />
//                 </button>
//               </div>
//               <div className="h-64">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <AreaChart data={scenario1ExitData}>
//                     <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
//                     <XAxis 
//                       dataKey="exitValue"
//                       label={{ value: 'Exit Company Valuation ($M)', position: 'insideBottom', offset: -5 }}
//                       tick={{ fill: '#6B7280' }}
//                       axisLine={{ stroke: '#E5E7EB' }}
//                     />
//                     <YAxis 
//                       label={{ value: 'Value to All Shareholders (MM)', angle: -90, position: 'insideLeft' }}
//                       tick={{ fill: '#6B7280' }}
//                       axisLine={{ stroke: '#E5E7EB' }}
//                     />
//                     <Tooltip 
//                       formatter={(value) => [`$${value}M`, 'Value']}
//                       labelFormatter={(label) => `Exit Value: $${label}M`}
//                     />
//                     <Legend />
//                     <Area type="monotone" dataKey="seriesA" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Series A" />
//                     <Area type="monotone" dataKey="seriesB" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Series B" />
//                     <Area type="monotone" dataKey="seriesC" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} name="Series C" />
//                     <Area type="monotone" dataKey="founders" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} name="Founders" />
//                   </AreaChart>
//                 </ResponsiveContainer>
//               </div>
//               <div className="mt-4 text-sm text-gray-600">
//                 <p className="font-medium mb-1">Legend:</p>
//                 <div className="flex flex-wrap gap-3">
//                   <span className="flex items-center">
//                     <div className="w-3 h-3 bg-blue-500 mr-1 rounded"></div>
//                     Series A
//                   </span>
//                   <span className="flex items-center">
//                     <div className="w-3 h-3 bg-green-500 mr-1 rounded"></div>
//                     Series B
//                   </span>
//                   <span className="flex items-center">
//                     <div className="w-3 h-3 bg-purple-500 mr-1 rounded"></div>
//                     Series C
//                   </span>
//                   <span className="flex items-center">
//                     <div className="w-3 h-3 bg-yellow-500 mr-1 rounded"></div>
//                     Founders
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Cap Table Comparison - Scenario 1 */}
//             <div className="bg-white rounded-lg border border-gray-300 p-4">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="font-semibold text-gray-900">Cap Table Comparison</h3>
//                 <button
//                   onClick={() => toggleFullScreen('cap')}
//                   className="p-1 text-gray-500 hover:text-gray-700"
//                 >
//                   <Maximize2 size={18} />
//                 </button>
//               </div>
              
//               {/* Round-by-Round distribution */}
//               <div className="mb-6">
//                 <h4 className="text-sm font-medium text-gray-700 mb-2">Round-by-Round distribution</h4>
//                 <div className="h-48">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <BarChart data={roundDistributionData}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
//                       <XAxis dataKey="round" tick={{ fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} />
//                       <YAxis tick={{ fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} />
//                       <Tooltip formatter={(value) => [`$${value}M`, 'Value']} />
//                       <Legend />
//                       <Bar dataKey="scenario1Nominal" fill="#3B82F6" name="Nominal" />
//                       <Bar dataKey="scenario1Contract" fill="#10B981" name="Contract Based" />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>
//               </div>

//               {/* Founder/Non-founder Distribution */}
//               <div className="mb-6">
//                 <h4 className="text-sm font-medium text-gray-700 mb-2">Founder/Non-founder distribution</h4>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <div className="h-40">
//                       <ResponsiveContainer width="100%" height="100%">
//                         <PieChart>
//                           <Pie
//                             data={founderDistributionScenario1}
//                             cx="50%"
//                             cy="50%"
//                             labelLine={false}
//                             label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
//                             outerRadius={60}
//                             fill="#8884d8"
//                             dataKey="value"
//                           >
//                             {founderDistributionScenario1.map((entry, index) => (
//                               <Cell key={`cell-${index}`} fill={entry.color} />
//                             ))}
//                           </Pie>
//                           <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
//                         </PieChart>
//                       </ResponsiveContainer>
//                     </div>
//                   </div>
//                   <div>
//                     <div className="h-40">
//                       <ResponsiveContainer width="100%" height="100%">
//                         <BarChart data={barChartData}>
//                           <XAxis dataKey="category" tick={{ fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} />
//                           <YAxis tick={{ fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} />
//                           <Tooltip formatter={(value) => [formatNumber(value as number), 'Shares']} />
//                           <Legend />
//                           <Bar dataKey="scenario1" fill="#3B82F6" name="Scenario 1" />
//                         </BarChart>
//                       </ResponsiveContainer>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Cap Table */}
//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm">
//                   <thead>
//                     <tr className="bg-gray-50">
//                       <th className="text-left p-2 text-xs font-medium text-gray-700 border-b border-gray-300">Name</th>
//                       <th className="text-left p-2 text-xs font-medium text-gray-700 border-b border-gray-300">Investors</th>
//                       <th className="text-left p-2 text-xs font-medium text-gray-700 border-b border-gray-300">Common</th>
//                       <th className="text-left p-2 text-xs font-medium text-gray-700 border-b border-gray-300">Options</th>
//                       <th className="text-left p-2 text-xs font-medium text-gray-700 border-b border-gray-300">Series A</th>
//                       <th className="text-left p-2 text-xs font-medium text-gray-700 border-b border-gray-300">Series B</th>
//                       <th className="text-left p-2 text-xs font-medium text-gray-700 border-b border-gray-300">Fully Diluted</th>
//                       <th className="text-left p-2 text-xs font-medium text-gray-700 border-b border-gray-300">Ownership</th>
//                       <th className="text-left p-2 text-xs font-medium text-gray-700 border-b border-gray-300">Price/Share</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {scenario1CapData.map((row, index) => (
//                       <tr key={index} className={`${row.name === 'Total' ? 'bg-gray-50 font-semibold' : ''}`}>
//                         <td className="p-2 border-b border-gray-200">{row.name}</td>
//                         <td className="p-2 border-b border-gray-200">{row.investors}</td>
//                         <td className="p-2 border-b border-gray-200 text-right">{row.commonStock === '-' ? '-' : formatNumber(row.commonStock)}</td>
//                         <td className="p-2 border-b border-gray-200 text-right">{row.stockOptions === '-' ? '-' : formatNumber(row.stockOptions)}</td>
//                         <td className="p-2 border-b border-gray-200 text-right">{row.seriesA}</td>
//                         <td className="p-2 border-b border-gray-200 text-right">{row.seriesB}</td>
//                         <td className="p-2 border-b border-gray-200 text-right">{formatNumber(row.fullyDiluted)}</td>
//                         <td className="p-2 border-b border-gray-200 text-right">{row.nominalOwnership}</td>
//                         <td className="p-2 border-b border-gray-200 text-right">{row.pricePerShare}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>

//           {/* Right Column - Scenario 2 */}
//           <div className="space-y-6">
//             {/* Scenario 2 Header */}
//             <div className="bg-white rounded-lg border border-gray-300 p-4">
//               <h2 className="text-xl font-bold text-gray-900 mb-4">Scenario 2</h2>
//               <div className="grid grid-cols-3 gap-4">
//                 <div>
//                   <p className="text-sm text-gray-600">Investment Amount</p>
//                   <p className="text-lg font-bold text-gray-900">$12,000,000</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Pre-Money Valuation</p>
//                   <p className="text-lg font-bold text-gray-900">$45,000,000</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Ownership %</p>
//                   <p className="text-lg font-bold text-gray-900">21%</p>
//                 </div>
//               </div>
//             </div>

//             {/* Exit Diagram Comparison - Scenario 2 */}
//             <div className="bg-white rounded-lg border border-gray-300 p-4">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="font-semibold text-gray-900">Exit Diagram Comparison</h3>
//                 <button
//                   onClick={() => toggleFullScreen('exit')}
//                   className="p-1 text-gray-500 hover:text-gray-700"
//                 >
//                   <Maximize2 size={18} />
//                 </button>
//               </div>
//               <div className="h-64">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <AreaChart data={scenario2ExitData}>
//                     <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
//                     <XAxis 
//                       dataKey="exitValue"
//                       label={{ value: 'Exit Company Valuation ($M)', position: 'insideBottom', offset: -5 }}
//                       tick={{ fill: '#6B7280' }}
//                       axisLine={{ stroke: '#E5E7EB' }}
//                     />
//                     <YAxis 
//                       label={{ value: 'Value to All Shareholders (MM)', angle: -90, position: 'insideLeft' }}
//                       tick={{ fill: '#6B7280' }}
//                       axisLine={{ stroke: '#E5E7EB' }}
//                     />
//                     <Tooltip 
//                       formatter={(value) => [`$${value}M`, 'Value']}
//                       labelFormatter={(label) => `Exit Value: $${label}M`}
//                     />
//                     <Legend />
//                     <Area type="monotone" dataKey="seriesA" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Series A" />
//                     <Area type="monotone" dataKey="seriesB" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Series B" />
//                     <Area type="monotone" dataKey="seriesC" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} name="Series C" />
//                     <Area type="monotone" dataKey="founders" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} name="Founders" />
//                   </AreaChart>
//                 </ResponsiveContainer>
//               </div>
//               <div className="mt-4 text-sm text-gray-600">
//                 <p className="font-medium mb-1">Legend:</p>
//                 <div className="flex flex-wrap gap-3">
//                   <span className="flex items-center">
//                     <div className="w-3 h-3 bg-blue-500 mr-1 rounded"></div>
//                     Series A
//                   </span>
//                   <span className="flex items-center">
//                     <div className="w-3 h-3 bg-green-500 mr-1 rounded"></div>
//                     Series B
//                   </span>
//                   <span className="flex items-center">
//                     <div className="w-3 h-3 bg-purple-500 mr-1 rounded"></div>
//                     Series C
//                   </span>
//                   <span className="flex items-center">
//                     <div className="w-3 h-3 bg-yellow-500 mr-1 rounded"></div>
//                     Founders
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Cap Table Comparison - Scenario 2 */}
//             <div className="bg-white rounded-lg border border-gray-300 p-4">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="font-semibold text-gray-900">Cap Table Comparison</h3>
//                 <button
//                   onClick={() => toggleFullScreen('cap')}
//                   className="p-1 text-gray-500 hover:text-gray-700"
//                 >
//                   <Maximize2 size={18} />
//                 </button>
//               </div>
              
//               {/* Round-by-Round distribution */}
//               <div className="mb-6">
//                 <h4 className="text-sm font-medium text-gray-700 mb-2">Round-by-Round distribution</h4>
//                 <div className="h-48">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <BarChart data={roundDistributionData}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
//                       <XAxis dataKey="round" tick={{ fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} />
//                       <YAxis tick={{ fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} />
//                       <Tooltip formatter={(value) => [`$${value}M`, 'Value']} />
//                       <Legend />
//                       <Bar dataKey="scenario2Nominal" fill="#3B82F6" name="Nominal" />
//                       <Bar dataKey="scenario2Contract" fill="#10B981" name="Contract Based" />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>
//               </div>

//               {/* Founder/Non-founder Distribution */}
//               <div className="mb-6">
//                 <h4 className="text-sm font-medium text-gray-700 mb-2">Founder/Non-founder distribution</h4>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <div className="h-40">
//                       <ResponsiveContainer width="100%" height="100%">
//                         <PieChart>
//                           <Pie
//                             data={founderDistributionScenario2}
//                             cx="50%"
//                             cy="50%"
//                             labelLine={false}
//                             label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
//                             outerRadius={60}
//                             fill="#8884d8"
//                             dataKey="value"
//                           >
//                             {founderDistributionScenario2.map((entry, index) => (
//                               <Cell key={`cell-${index}`} fill={entry.color} />
//                             ))}
//                           </Pie>
//                           <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
//                         </PieChart>
//                       </ResponsiveContainer>
//                     </div>
//                   </div>
//                   <div>
//                     <div className="h-40">
//                       <ResponsiveContainer width="100%" height="100%">
//                         <BarChart data={barChartData}>
//                           <XAxis dataKey="category" tick={{ fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} />
//                           <YAxis tick={{ fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} />
//                           <Tooltip formatter={(value) => [formatNumber(value as number), 'Shares']} />
//                           <Legend />
//                           <Bar dataKey="scenario2" fill="#10B981" name="Scenario 2" />
//                         </BarChart>
//                       </ResponsiveContainer>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Cap Table */}
//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm">
//                   <thead>
//                     <tr className="bg-gray-50">
//                       <th className="text-left p-2 text-xs font-medium text-gray-700 border-b border-gray-300">Name</th>
//                       <th className="text-left p-2 text-xs font-medium text-gray-700 border-b border-gray-300">Investors</th>
//                       <th className="text-left p-2 text-xs font-medium text-gray-700 border-b border-gray-300">Common</th>
//                       <th className="text-left p-2 text-xs font-medium text-gray-700 border-b border-gray-300">Options</th>
//                       <th className="text-left p-2 text-xs font-medium text-gray-700 border-b border-gray-300">Series A</th>
//                       <th className="text-left p-2 text-xs font-medium text-gray-700 border-b border-gray-300">Series B</th>
//                       <th className="text-left p-2 text-xs font-medium text-gray-700 border-b border-gray-300">Fully Diluted</th>
//                       <th className="text-left p-2 text-xs font-medium text-gray-700 border-b border-gray-300">Ownership</th>
//                       <th className="text-left p-2 text-xs font-medium text-gray-700 border-b border-gray-300">Price/Share</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {scenario2CapData.map((row, index) => (
//                       <tr key={index} className={`${row.name === 'Total' ? 'bg-gray-50 font-semibold' : ''}`}>
//                         <td className="p-2 border-b border-gray-200">{row.name}</td>
//                         <td className="p-2 border-b border-gray-200">{row.investors}</td>
//                         <td className="p-2 border-b border-gray-200 text-right">{row.commonStock === '-' ? '-' : formatNumber(row.commonStock)}</td>
//                         <td className="p-2 border-b border-gray-200 text-right">{row.stockOptions === '-' ? '-' : formatNumber(row.stockOptions)}</td>
//                         <td className="p-2 border-b border-gray-200 text-right">{row.seriesA}</td>
//                         <td className="p-2 border-b border-gray-200 text-right">{row.seriesB}</td>
//                         <td className="p-2 border-b border-gray-200 text-right">{formatNumber(row.fullyDiluted)}</td>
//                         <td className="p-2 border-b border-gray-200 text-right">{row.nominalOwnership}</td>
//                         <td className="p-2 border-b border-gray-200 text-right">{row.pricePerShare}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="mt-8 flex justify-center gap-4">
//           <button
//             onClick={onClose}
//             className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
//           >
//             Close Comparison
//           </button>
//           <button
//             onClick={() => alert('New comparison functionality')}
//             className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
//           >
//             Compare Different Scenarios
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Full screen mode for Exit Diagram
//   if (fullScreenMode === 'exit') {
//     return (
//       <div className="fixed inset-0 bg-white z-50 p-6">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold text-gray-900">Exit Diagram Comparison - Full Screen</h1>
//           <div className="flex items-center gap-3">
//             <button
//               onClick={handlePrint}
//               className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
//             >
//               <Printer size={16} />
//               Print
//             </button>
//             <button
//               onClick={() => toggleFullScreen('exit')}
//               className="p-2 text-gray-500 hover:text-gray-700"
//             >
//               <Minimize2 size={24} />
//             </button>
//             <button
//               onClick={onClose}
//               className="p-2 text-gray-500 hover:text-gray-700"
//             >
//               <X size={24} />
//             </button>
//           </div>
//         </div>

//         <div className="grid grid-cols-2 gap-6 h-[calc(100vh-120px)]">
//           <div className="bg-white rounded-lg border border-gray-300 p-6">
//             <h2 className="text-xl font-bold text-gray-900 mb-6">Scenario 1</h2>
//             <div className="h-full">
//               <ResponsiveContainer width="100%" height="100%">
//                 <AreaChart data={scenario1ExitData}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
//                   <XAxis 
//                     dataKey="exitValue"
//                     label={{ value: 'Exit Company Valuation ($M)', position: 'insideBottom', offset: -5 }}
//                     tick={{ fill: '#6B7280' }}
//                     axisLine={{ stroke: '#E5E7EB' }}
//                   />
//                   <YAxis 
//                     label={{ value: 'Value to All Shareholders (MM)', angle: -90, position: 'insideLeft' }}
//                     tick={{ fill: '#6B7280' }}
//                     axisLine={{ stroke: '#E5E7EB' }}
//                   />
//                   <Tooltip 
//                     formatter={(value) => [`$${value}M`, 'Value']}
//                     labelFormatter={(label) => `Exit Value: $${label}M`}
//                   />
//                   <Legend />
//                   <Area type="monotone" dataKey="seriesA" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Series A" />
//                   <Area type="monotone" dataKey="seriesB" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Series B" />
//                   <Area type="monotone" dataKey="seriesC" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} name="Series C" />
//                   <Area type="monotone" dataKey="founders" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} name="Founders" />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg border border-gray-300 p-6">
//             <h2 className="text-xl font-bold text-gray-900 mb-6">Scenario 2</h2>
//             <div className="h-full">
//               <ResponsiveContainer width="100%" height="100%">
//                 <AreaChart data={scenario2ExitData}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
//                   <XAxis 
//                     dataKey="exitValue"
//                     label={{ value: 'Exit Company Valuation ($M)', position: 'insideBottom', offset: -5 }}
//                     tick={{ fill: '#6B7280' }}
//                     axisLine={{ stroke: '#E5E7EB' }}
//                   />
//                   <YAxis 
//                     label={{ value: 'Value to All Shareholders (MM)', angle: -90, position: 'insideLeft' }}
//                     tick={{ fill: '#6B7280' }}
//                     axisLine={{ stroke: '#E5E7EB' }}
//                   />
//                   <Tooltip 
//                     formatter={(value) => [`$${value}M`, 'Value']}
//                     labelFormatter={(label) => `Exit Value: $${label}M`}
//                   />
//                   <Legend />
//                   <Area type="monotone" dataKey="seriesA" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Series A" />
//                   <Area type="monotone" dataKey="seriesB" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Series B" />
//                   <Area type="monotone" dataKey="seriesC" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} name="Series C" />
//                   <Area type="monotone" dataKey="founders" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} name="Founders" />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Full screen mode for Cap Table
//   if (fullScreenMode === 'cap') {
//     return (
//       <div className="fixed inset-0 bg-white z-50 p-6">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold text-gray-900">Cap Table Comparison - Full Screen</h1>
//           <div className="flex items-center gap-3">
//             <button
//               onClick={handlePrint}
//               className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
//             >
//               <Printer size={16} />
//               Print
//             </button>
//             <button
//               onClick={() => toggleFullScreen('cap')}
//               className="p-2 text-gray-500 hover:text-gray-700"
//             >
//               <Minimize2 size={24} />
//             </button>
//             <button
//               onClick={onClose}
//               className="p-2 text-gray-500 hover:text-gray-700"
//             >
//               <X size={24} />
//             </button>
//           </div>
//         </div>

//         <div className="grid grid-cols-2 gap-6 h-[calc(100vh-120px)]">
//           <div className="bg-white rounded-lg border border-gray-300 p-6 overflow-auto">
//             <h2 className="text-xl font-bold text-gray-900 mb-6">Scenario 1 Cap Table</h2>
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="bg-gray-50">
//                     <th className="text-left p-3 text-sm font-medium text-gray-700 border-b border-gray-300">Name</th>
//                     <th className="text-left p-3 text-sm font-medium text-gray-700 border-b border-gray-300">Investors</th>
//                     <th className="text-left p-3 text-sm font-medium text-gray-700 border-b border-gray-300">Common Stock</th>
//                     <th className="text-left p-3 text-sm font-medium text-gray-700 border-b border-gray-300">Stock Options</th>
//                     <th className="text-left p-3 text-sm font-medium text-gray-700 border-b border-gray-300">Series A Preferred</th>
//                     <th className="text-left p-3 text-sm font-medium text-gray-700 border-b border-gray-300">Series B Preferred</th>
//                     <th className="text-left p-3 text-sm font-medium text-gray-700 border-b border-gray-300">Fully Diluted Share</th>
//                     <th className="text-left p-3 text-sm font-medium text-gray-700 border-b border-gray-300">Nominal Ownership</th>
//                     <th className="text-left p-3 text-sm font-medium text-gray-700 border-b border-gray-300">Price/Share</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {scenario1CapData.map((row, index) => (
//                     <tr key={index} className={`${row.name === 'Total' ? 'bg-gray-50 font-semibold' : ''}`}>
//                       <td className="p-3 border-b border-gray-200">{row.name}</td>
//                       <td className="p-3 border-b border-gray-200">{row.investors}</td>
//                       <td className="p-3 border-b border-gray-200 text-right">{row.commonStock === '-' ? '-' : formatNumber(row.commonStock)}</td>
//                       <td className="p-3 border-b border-gray-200 text-right">{row.stockOptions === '-' ? '-' : formatNumber(row.stockOptions)}</td>
//                       <td className="p-3 border-b border-gray-200 text-right">{row.seriesA_Preferred}</td>
//                       <td className="p-3 border-b border-gray-200 text-right">{row.seriesB_Preferred}</td>
//                       <td className="p-3 border-b border-gray-200 text-right">{formatNumber(row.fullyDiluted)}</td>
//                       <td className="p-3 border-b border-gray-200 text-right">{row.nominalOwnership}</td>
//                       <td className="p-3 border-b border-gray-200 text-right">{row.pricePerShare}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg border border-gray-300 p-6 overflow-auto">
//             <h2 className="text-xl font-bold text-gray-900 mb-6">Scenario 2 Cap Table</h2>
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="bg-gray-50">
//                     <th className="text-left p-3 text-sm font-medium text-gray-700 border-b border-gray-300">Name</th>
//                     <th className="text-left p-3 text-sm font-medium text-gray-700 border-b border-gray-300">Investors</th>
//                     <th className="text-left p-3 text-sm font-medium text-gray-700 border-b border-gray-300">Common Stock</th>
//                     <th className="text-left p-3 text-sm font-medium text-gray-700 border-b border-gray-300">Stock Options</th>
//                     <th className="text-left p-3 text-sm font-medium text-gray-700 border-b border-gray-300">Series A Preferred</th>
//                     <th className="text-left p-3 text-sm font-medium text-gray-700 border-b border-gray-300">Series B Preferred</th>
//                     <th className="text-left p-3 text-sm font-medium text-gray-700 border-b border-gray-300">Fully Diluted Share</th>
//                     <th className="text-left p-3 text-sm font-medium text-gray-700 border-b border-gray-300">Nominal Ownership</th>
//                     <th className="text-left p-3 text-sm font-medium text-gray-700 border-b border-gray-300">Price/Share</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {scenario2CapData.map((row, index) => (
//                     <tr key={index} className={`${row.name === 'Total' ? 'bg-gray-50 font-semibold' : ''}`}>
//                       <td className="p-3 border-b border-gray-200">{row.name}</td>
//                       <td className="p-3 border-b border-gray-200">{row.investors}</td>
//                       <td className="p-3 border-b border-gray-200 text-right">{row.commonStock === '-' ? '-' : formatNumber(row.commonStock)}</td>
//                       <td className="p-3 border-b border-gray-200 text-right">{row.stockOptions === '-' ? '-' : formatNumber(row.stockOptions)}</td>
//                       <td className="p-3 border-b border-gray-200 text-right">{row.seriesA_Preferred}</td>
//                       <td className="p-3 border-b border-gray-200 text-right">{row.seriesB_Preferred}</td>
//                       <td className="p-3 border-b border-gray-200 text-right">{formatNumber(row.fullyDiluted)}</td>
//                       <td className="p-3 border-b border-gray-200 text-right">{row.nominalOwnership}</td>
//                       <td className="p-3 border-b border-gray-200 text-right">{row.pricePerShare}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return null;
// };

// export default CompareScenarios;