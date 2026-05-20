"use client";
import React, { useState, useEffect } from "react";
import { Plus, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { getSimulations, createSimulation } from "@/services/simulation.service";
import { getFunds } from "@/services/fund.service";
import NewSimulationModal, { NewSimulationModalData } from "../../Simulator/NewSimulationModal";
import { Simulation, Fund } from "@/types";
import toast from "react-hot-toast";

const BADGE_COLORS = ['bg-purple-50 text-purple-600 border-purple-100','bg-blue-50 text-blue-600 border-blue-100','bg-orange-50 text-orange-600 border-orange-100','bg-green-50 text-green-600 border-green-100'];

interface Props {
  onSimulationOpen?: () => void;
  onSimulationClose?: () => void;
  portfolioCompanyName?: string;
  startupId?: string;
  fundId?: string;
}

export default function SimulationSectionCard({ onSimulationOpen, onSimulationClose, portfolioCompanyName = '', startupId = '', fundId = '' }: Props) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [simRes, fundRes] = await Promise.all([getSimulations({ page: 1, limit: 50 }), getFunds({ page: 1, limit: 50 })]);
        if (simRes.success) setSimulations(startupId ? simRes.data.filter(s => s.startupId === startupId) : simRes.data);
        if (fundRes.success) setFunds(fundRes.data);
      } catch {} finally { setIsLoading(false); }
    };
    fetchData();
  }, [startupId]);

  const handleModalSubmit = async (data: NewSimulationModalData) => {
    if (!startupId || !fundId) {
      sessionStorage.setItem('simulationData', JSON.stringify(data));
      setIsModalOpen(false);
      router.push('/investor-admin/simulator?step=step1');
      return;
    }
    try {
      const res = await createSimulation({ name: data.name, description: data.description, fundId, startupId });
      if (res.success) {
        setSimulations(prev => [res.data, ...prev]);
        sessionStorage.setItem('simulationData', JSON.stringify({ ...data, simulationId: res.data.id }));
        setIsModalOpen(false);
        toast.success('Simulation created!');
        router.push('/investor-admin/simulator?step=step1');
      }
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Failed to create simulation'); }
  };

  return (
    <div className="relative mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[18px] font-semibold text-gray-900">Individual Investment Simulations</h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-[#2D60FF] hover:bg-[#1a4bd6] text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 font-bold text-sm shadow-lg shadow-blue-100 transition-all active:scale-95">
          <Plus size={18} /> Create New Simulation
        </button>
      </div>
      {isLoading ? (
        <div className="text-center py-8 text-gray-400">Loading simulations...</div>
      ) : simulations.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100">No simulations yet. Create your first one!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {simulations.map((item, idx) => (
            <div key={item.id} onClick={() => { sessionStorage.setItem('simulationData', JSON.stringify({ name: item.name, description: item.description, fundName: item.fund?.fundName || '', portfolioCompany: portfolioCompanyName, simulationId: item.id })); router.push('/investor-admin/simulator?step=step1'); }}
              className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm cursor-pointer hover:shadow-md hover:border-gray-200 transition-all duration-200 group">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-[#1A2B49] group-hover:text-[#2D60FF] transition-colors">{item.name}</h3>
                <MoreHorizontal size={20} className="text-gray-400" onClick={e => e.stopPropagation()} />
              </div>
              <p className="text-xs text-gray-400 leading-relaxed mb-6">{item.description || 'No description'}</p>
              <div className="flex justify-end">
                <span className={`px-4 py-1 rounded-full text-[10px] font-bold border ${BADGE_COLORS[idx % BADGE_COLORS.length]}`}>{item.fund?.fundName || 'Simulation'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <NewSimulationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleModalSubmit}
        mode="simulation" fundOptions={funds.map(f => f.fundName)}
        portfolioCompanyOptions={portfolioCompanyName ? [portfolioCompanyName] : []}
        defaultPortfolioCompany={portfolioCompanyName} lockPortfolioCompanySelection={Boolean(portfolioCompanyName)} />
    </div>
  );
}
