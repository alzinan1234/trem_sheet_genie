"use client";
import React, { useState, useEffect } from "react";
import { Plus, MoreHorizontal, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import SimulationResults from "../Simulator/SimulationResults";
import SimulationResultsWrapper from "./Simulationresultswrapper";
import NewSimulationModal, { NewSimulationModalData } from "../Simulator/NewSimulationModal";
import { getSimulations, createSimulation, deleteSimulation } from "@/services/simulation.service";
import { getFunds } from "@/services/fund.service";
import { getStartups } from "@/services/startup.service";
import { Simulation, Fund, Startup } from "@/types";
import toast from "react-hot-toast";

interface SimulationSectionProps {
  onSimulationOpen?: () => void;
  onSimulationClose?: () => void;
}

const BADGE_COLORS = [
  "bg-purple-50 text-purple-600 border-purple-100",
  "bg-blue-50 text-blue-600 border-blue-100",
  "bg-orange-50 text-orange-600 border-orange-100",
  "bg-green-50 text-green-600 border-green-100",
];

export default function SimulationSection({ onSimulationOpen, onSimulationClose }: SimulationSectionProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSimulation, setSelectedSimulation] = useState<any | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleDeleteSimulation = async (e: React.MouseEvent, id: string, name: string) => {

    e.stopPropagation();
    if (!confirm(`Delete simulation "${name}"? This cannot be undone.`)) return;
    const toastId = toast.loading('Deleting...');
    try {
      await deleteSimulation(id);
      setSimulations(prev => prev.filter(s => s.id !== id));
      toast.success('Simulation deleted', { id: toastId });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete', { id: toastId });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [simRes, fundRes, startupRes] = await Promise.all([
          getSimulations({ page: 1, limit: 50 }),
          getFunds({ page: 1, limit: 50 }),
          getStartups({ page: 1, limit: 50 }),
        ]);
        if (simRes.success) setSimulations(simRes.data);
        if (fundRes.success) setFunds(fundRes.data);
        if (startupRes.success) setStartups(startupRes.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load simulations');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCardClick = async (simulation: Simulation) => {
    // Load the full simulation input data (steps 1-4) from sessionStorage/localStorage
    // and merge it with the simulation metadata so SimulationResults has everything it needs
    let storedData: any = null;
    try {
      const raw = sessionStorage.getItem('simulationData') || localStorage.getItem('tsg_simulation_data');
      if (raw) storedData = JSON.parse(raw);
    } catch {}

    // Fetch fund object for this simulation so breakeven/simulate calls work
    let fund: any = storedData?.fund || simulation.fund || null;
    if (!fund && (storedData?.fundName || simulation.fund?.fundName)) {
      try {
        const fundRes = await getFunds();
        if (fundRes.success) {
          const name = storedData?.fundName || simulation.fund?.fundName;
          fund = ((fundRes.data as any) || []).find((f: any) => f.fundName === name) || null;
        }
      } catch {}
    }

    // Only merge sessionStorage data if it belongs to this simulation
    const isMatchingSimulation = storedData?.simulationId === simulation.id;
    const mergedData = {
      ...simulation,
      ...(isMatchingSimulation ? storedData : {}),
      fund,
      // Always keep simulation metadata
      id: simulation.id,
      name: simulation.name,
      description: simulation.description,
      fundName: storedData?.fundName || simulation.fund?.fundName || '',
      portfolioCompany: storedData?.portfolioCompany || simulation.startup?.name || '',
    };

    setSelectedSimulation(mergedData);
    setShowResults(true);
    onSimulationOpen?.();
  };

  const handleModalSubmit = async (data: NewSimulationModalData) => {
    setIsCreating(true);
    setError('');
    try {
      // Find fund id by name
      const fund = funds.find(f => f.fundName === data.fundName);
      const startup = startups.find(s => s.name === data.portfolioCompany);
      if (!fund || !startup) {
        setError('Could not find selected fund or startup. Please try again.');
        setIsCreating(false);
        return;
      }
      const res = await createSimulation({
        name: data.name,
        description: data.description,
        fundId: fund.id,
        startupId: startup.id,
      });
      if (res.success) {
        setSimulations(prev => [res.data, ...prev]);
        setIsModalOpen(false);
        // Store fund object alongside simulation data so simulation-results can use fund params
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('simulationData', JSON.stringify({ ...data, simulationId: res.data.id, fund }));
        }
        router.push('/investor-admin/simulator?step=step1');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create simulation');
    } finally {
      setIsCreating(false);
    }
  };

  const handleStepBack = () => {
    setShowResults(false);
    setSelectedSimulation(null);
    onSimulationClose?.();
  };

  if (showResults && selectedSimulation) {
    return (
      <SimulationResultsWrapper data={selectedSimulation} onStepBack={handleStepBack}>
        <SimulationResults data={selectedSimulation} onStepBack={handleStepBack} />
      </SimulationResultsWrapper>
    );
  }

  const fundOptions = funds.map(f => f.fundName);
  const startupOptions = startups.map(s => s.name);

  return (
    <div className="relative">
      <div className="mt-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Individual Investment Simulations</h2>
          <button onClick={() => setIsModalOpen(true)}
            className="bg-[#2D60FF] hover:bg-[#1a4bd6] text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 font-bold text-sm shadow-lg shadow-blue-100 transition-all active:scale-95">
            <Plus size={18} /> Create New Simulation
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}

        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Loading simulations...</div>
        ) : simulations.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No simulations yet. Create your first one!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {simulations.map((item, idx) => (
              <div key={item.id} onClick={() => handleCardClick(item)}
                className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm cursor-pointer hover:shadow-md hover:border-gray-200 transition-all duration-200 group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-[#1A2B49] group-hover:text-[#2D60FF] transition-colors">{item.startup?.name || item.name}</h3>
                  <button onClick={(e) => handleDeleteSimulation(e, item.id, item.name)}
                    className="p-1 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-6">{item.description || 'No description'}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">{item.fund?.fundName}</span>
                  <span className={`px-4 py-1 rounded-full text-[10px] font-bold border ${BADGE_COLORS[idx % BADGE_COLORS.length]}`}>
                    {item.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <NewSimulationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
          mode="simulation"
          fundOptions={fundOptions}
          portfolioCompanyOptions={startupOptions}
        />
      </div>
    </div>
  );
}