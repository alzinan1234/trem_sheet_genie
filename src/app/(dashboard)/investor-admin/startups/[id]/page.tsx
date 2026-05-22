"use client";
import React, { use, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getStartupById, updateStartup, deleteStartup } from '@/services/startup.service';
import { getSimulations, createSimulation } from '@/services/simulation.service';
import { getFunds } from '@/services/fund.service';
import { Startup, Simulation, Fund } from '@/types';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import CompanyHeader from '@/components/InvestorAdmin/Startups/StartupsDetails/CompanyHeader';
import CapTableOverview from '@/components/InvestorAdmin/Startups/StartupsDetails/CapTableOverview';
import CompanyInfoAccordion from '@/components/InvestorAdmin/Startups/StartupsDetails/CompanyInfoAccordion';
import ReturnsAnalysis from '@/components/InvestorAdmin/Startups/StartupsDetails/ReturnsAnalysis';
import CalculateExitBreakdown from '@/components/InvestorAdmin/Startups/StartupsDetails/CalculateExitBreakdown';
import TermSheetGenieValuation from '@/components/InvestorAdmin/Startups/StartupsDetails/TermSheetGenieValuation';
import ValuationAnalysis from '@/components/InvestorAdmin/Simulator/ValuationAnalysis';
import NewSimulationModal, { NewSimulationModalData } from '@/components/InvestorAdmin/Simulator/NewSimulationModal';
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface PageProps { params: Promise<{ id: string }>; }

export default function PortfolioDetails({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const searchParams = useSearchParams();

  const [startup, setStartup] = useState<Startup | null>(null);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [isCreatingSim, setIsCreatingSim] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [startupRes, simRes, fundRes] = await Promise.all([
          getStartupById(id),
          getSimulations({ page: 1, limit: 50 }),
          getFunds({ page: 1, limit: 50 }),
        ]);
        if (startupRes.success) setStartup(startupRes.data);
        if (simRes.success) setSimulations(simRes.data.filter(s => s.startupId === id));
        if (fundRes.success) setFunds(fundRes.data);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load startup');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);
 
  const handleSimulationSubmit = async (data: NewSimulationModalData) => {
    if (!startup) return;
    setIsCreatingSim(true);
    try {
      const res = await createSimulation({ name: data.name, description: data.description, fundId: startup.fundId, startupId: id });
      if (res.success) {
        setSimulations(prev => [res.data, ...prev]);
        sessionStorage.setItem('simulationData', JSON.stringify({ ...data, simulationId: res.data.id }));
        setIsSimModalOpen(false);
        toast.success('Simulation created!');
        router.push('/investor-admin/simulator?step=step1');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create simulation');
    } finally {
      setIsCreatingSim(false);
    }
  };

  if (isLoading) return <PageLoader text="Loading company details..." />;
  if (!startup) return <div className="p-8 text-center text-gray-500">Company not found.</div>;

  const portfolioCompanyName = startup.name;
  const fundOptions = funds.map(f => f.fundName);
  const BADGE_COLORS = ['bg-purple-50 text-purple-600 border-purple-100', 'bg-blue-50 text-blue-600 border-blue-100', 'bg-orange-50 text-orange-600 border-orange-100', 'bg-green-50 text-green-600 border-green-100'];
  const formatCurrency = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

  return (
    <div className="bg-[#F9FAFB] w-full font-sans">
      <CompanyHeader companyName={portfolioCompanyName} />
      <div className="mx-auto p-6 lg:p-10 space-y-10">

        {/* Stats from real data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { value: formatCurrency(startup.investmentAmount), label: 'Investment Amount' },
            { value: `${startup.growthPercentage}%`, label: 'Growth Percentage' },
            { value: startup.status, label: 'Status' },
            { value: startup.fund?.fundName || '—', label: 'Fund' },
          ].map((s, i) => (
            <div key={i} className="bg-white px-5 py-8 rounded-lg border border-[#EAECF0] shadow-sm flex flex-col justify-center min-h-[140px]">
              <h3 className="text-[32px] font-bold text-[#030303] leading-tight mb-1">{s.value}</h3>
              <p className="text-[14px] text-[#98A2B3] font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Company Info with real data */}
        <div className="bg-white rounded-xl border border-[#EAECF0] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#F2F4F7]">
            <span className="text-lg font-semibold text-[#101828]">Basic Company Information</span>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
            <div className="space-y-6">
              <InfoPair label="Company Name" value={startup.name} />
              <InfoPair label="Status" value={startup.status} />
              <InfoPair label="Website" value={startup.website || '—'} />
              <InfoPair label="Description" value={startup.description || '—'} />
            </div>
            <div className="space-y-6">
              <InfoPair label="Investment Amount" value={formatCurrency(startup.investmentAmount)} />
              <InfoPair label="Growth Percentage" value={`${startup.growthPercentage}%`} />
              <InfoPair label="Fund" value={startup.fund?.fundName || '—'} />
              <InfoPair label="Created" value={new Date(startup.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
            </div>
          </div>
        </div>

        <ReturnsAnalysis />
        <div className="rounded-2xl border-[#EAECF0]"><CalculateExitBreakdown /></div>
        <div className="rounded-2xl border-[#EAECF0]"><TermSheetGenieValuation /></div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-gray-700">Cap Table Comparison</h2>
          </div>
          <div className="p-2"><ValuationAnalysis /></div>
        </div>

        <CapTableOverview />

        {/* Real Simulations Section */}
        <div className="mt-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[18px] font-semibold text-gray-900">Individual Investment Simulations</h2>
            <button onClick={() => setIsSimModalOpen(true)}
              className="bg-[#2D60FF] hover:bg-[#1a4bd6] text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 font-bold text-sm shadow-lg shadow-blue-100 transition-all active:scale-95">
              <Plus size={18} /> Create New Simulation
            </button>
          </div>

          {simulations.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100">
              No simulations yet. Create your first one!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {simulations.map((item, idx) => (
                <div key={item.id} onClick={() => { sessionStorage.setItem('simulationData', JSON.stringify({ name: item.name, description: item.description, fundName: item.fund?.fundName || '', portfolioCompany: startup.name, simulationId: item.id })); router.push('/investor-admin/simulator?step=step1'); }}
                  className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm cursor-pointer hover:shadow-md hover:border-gray-200 transition-all duration-200 group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-[#1A2B49] group-hover:text-[#2D60FF] transition-colors">{item.name}</h3>
                    <MoreHorizontal size={20} className="text-gray-400" onClick={e => e.stopPropagation()} />
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed mb-6">{item.description || 'No description'}</p>
                  <div className="flex justify-end">
                    <span className={`px-4 py-1 rounded-full text-[10px] font-bold border ${BADGE_COLORS[idx % BADGE_COLORS.length]}`}>
                      {item.fund?.fundName || 'Simulation'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <NewSimulationModal isOpen={isSimModalOpen} onClose={() => setIsSimModalOpen(false)} onSubmit={handleSimulationSubmit}
            mode="simulation" fundOptions={fundOptions} portfolioCompanyOptions={[startup.name]}
            defaultPortfolioCompany={startup.name} lockPortfolioCompanySelection />
        </div>
      </div>
    </div>
  );
}

function InfoPair({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-[12px] font-medium text-[#667085] block mb-1">{label}</label>
      <p className="text-[14px] font-semibold text-[#101828]">{value}</p>
    </div>
  );
}
