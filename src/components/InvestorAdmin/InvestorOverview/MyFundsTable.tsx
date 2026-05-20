"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Plus, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getFunds, deleteFund } from "@/services/fund.service";
import { Fund } from "@/types";
import toast from "react-hot-toast";

type SortConfig = { key: keyof Fund | null; direction: "asc" | "desc" };

export default function MyFundsTable({ onAddNew }: { onAddNew: () => void }) {
  const router = useRouter();
  const [funds, setFunds] = useState<Fund[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "asc" });

  const handleDeleteFund = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const toastId = toast.loading('Deleting fund...');
    try {
      await deleteFund(id);
      setFunds(prev => prev.filter(f => f.id !== id));
      toast.success('Fund deleted', { id: toastId });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete fund', { id: toastId });
    }
  };

  useEffect(() => {
    const fetchFunds = async () => {
      try {
        const res = await getFunds({ page: 1, limit: 50 });
        if (res.success) setFunds(res.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load funds');
      } finally {
        setIsLoading(false);
      }
    };
    fetchFunds();
  }, []);

  const handleSort = (key: keyof Fund) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const sortedFunds = useMemo(() => {
    const items = [...funds];
    if (sortConfig.key !== null) {
      items.sort((a, b) => {
        const rawA = a[sortConfig.key!];
        const rawB = b[sortConfig.key!];
        if (rawA === undefined || rawB === undefined) return 0;
        if (rawA < rawB) return sortConfig.direction === "asc" ? -1 : 1;
        if (rawA > rawB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [sortConfig, funds]);

  const SortIcon = ({ column }: { column: keyof Fund }) => {
    if (sortConfig.key !== column) return <ChevronDown size={14} className="text-gray-300 opacity-0 group-hover:opacity-100" />;
    return sortConfig.direction === "asc" ? <ChevronUp size={14} className="text-blue-500" /> : <ChevronDown size={14} className="text-blue-500" />;
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });

  if (isLoading) return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-[#101828]">My Funds</h1>
        <button onClick={onAddNew} className="bg-[#2D60FF] hover:bg-[#1a4bd6] text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 transition-all font-bold text-sm shadow-md shadow-blue-100 active:scale-95">
          <Plus size={18} /> Add New Fund
        </button>
      </div>
      <div className="bg-white rounded-[24px] border border-gray-100 p-8 text-center text-gray-400">Loading funds...</div>
    </div>
  );

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-[#101828]">My Funds</h1>
        <button onClick={onAddNew} className="bg-[#2D60FF] hover:bg-[#1a4bd6] text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 transition-all font-bold text-sm shadow-md shadow-blue-100 active:scale-95">
          <Plus size={18} /> Add New Fund
        </button>
      </div>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}
      <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 text-[#667085] text-[13px] border-b border-gray-100">
              <th onClick={() => handleSort("fundName")} className="px-6 py-4 font-semibold cursor-pointer group select-none">
                <div className="flex items-center gap-1">Fund Name <SortIcon column="fundName" /></div>
              </th>
              <th onClick={() => handleSort("inceptionDate")} className="px-6 py-4 font-semibold cursor-pointer group select-none">
                <div className="flex items-center gap-1">Initiation Date <SortIcon column="inceptionDate" /></div>
              </th>
              <th onClick={() => handleSort("committedCapital")} className="px-6 py-4 font-semibold cursor-pointer group select-none">
                <div className="flex items-center gap-1">Committed Capital <SortIcon column="committedCapital" /></div>
              </th>
              <th onClick={() => handleSort("status")} className="px-6 py-4 font-semibold cursor-pointer group select-none">
                <div className="flex items-center gap-1">Status <SortIcon column="status" /></div>
              </th>
              <th onClick={() => handleSort("leadGP")} className="px-6 py-4 font-semibold cursor-pointer group select-none">
                <div className="flex items-center gap-1">Lead Partner <SortIcon column="leadGP" /></div>
              </th>
              <th onClick={() => handleSort("carryPercentage")} className="px-6 py-4 font-semibold cursor-pointer group select-none text-right">
                <div className="flex items-center justify-end gap-1">Carry % <SortIcon column="carryPercentage" /></div>
              </th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sortedFunds.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-[#667085]">No funds found. Add your first fund!</td></tr>
            ) : sortedFunds.map((fund) => (
              <tr key={fund.id} onClick={() => router.push(`/investor-admin/my-funds/${fund.id}`)}
                className="group hover:bg-blue-50/30 transition-all cursor-pointer">
                <td className="px-6 py-5"><span className="font-bold text-[#1A2B49]">{fund.fundName}</span></td>
                <td className="px-6 py-5 text-[#475467] text-sm font-medium">{formatDate(fund.inceptionDate)}</td>
                <td className="px-6 py-5 text-[#475467] text-sm font-medium">{formatCurrency(fund.committedCapital)}</td>
                <td className="px-6 py-5">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 w-fit border ${
                    fund.status === 'OPEN' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${fund.status === 'OPEN' ? 'bg-green-500' : 'bg-red-500'}`} />
                    {fund.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-[#475467] text-sm font-medium">{fund.leadGP}</td>
                <td className="px-6 py-5 text-right font-bold text-[#101828]">{fund.carryPercentage}%</td>
                <td className="px-6 py-5 text-right">
                  <button onClick={(e) => handleDeleteFund(e, fund.id, fund.fundName)}
                    className="p-1.5 text-[#98A2B3] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
