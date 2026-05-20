"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import "./investor.css";
// import { Toaster } from "react-hot-toast";
import InvestorTopbar from "@/components/InvestorAdmin/InvestorTopbar";
import InvestorSidebar from "@/components/InvestorAdmin/InvestorSidebar";
import NewSimulationModal, { NewSimulationModalData } from "@/components/InvestorAdmin/Simulator/NewSimulationModal";
import { createSimulation } from "@/services/simulation.service";
import { getFunds } from "@/services/fund.service";
import { getStartups } from "@/services/startup.service";
import toast, { Toaster } from "react-hot-toast";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSimulatorModalOpen, setIsSimulatorModalOpen] = useState(false);
  const [fundOptions, setFundOptions] = useState<string[]>([]);
  const [startupOptions, setStartupOptions] = useState<string[]>([]);
  const [fundMap, setFundMap] = useState<Record<string, string>>({});
  const [startupMap, setStartupMap] = useState<Record<string, string>>({});

  const contextualFundName = useMemo(() => {
    const match = pathname.match(/^\/investor-admin\/my-funds\/([^/]+)$/);
    if (!match?.[1]) return '';
    return match[1].split('-').join(' ').toUpperCase();
  }, [pathname]);

  const handleSimulatorOpen = async () => {
    try {
      const [fRes, sRes] = await Promise.all([
        getFunds({ page: 1, limit: 50 }),
        getStartups({ page: 1, limit: 50 }),
      ]);
      if (fRes.success) {
        setFundOptions(fRes.data.map(f => f.fundName));
        const fm: Record<string, string> = {};
        fRes.data.forEach(f => { fm[f.fundName] = f.id; });
        setFundMap(fm);
      }
      if (sRes.success) {
        setStartupOptions(sRes.data.map(s => s.name));
        const sm: Record<string, string> = {};
        sRes.data.forEach(s => { sm[s.name] = s.id; });
        setStartupMap(sm);
      }
    } catch {}
    setIsSimulatorModalOpen(true);
  };

  const handleSimulatorSubmit = async (data: NewSimulationModalData) => {
    const fundId = fundMap[data.fundName];
    const startupId = startupMap[data.portfolioCompany];
    if (!fundId || !startupId) {
      toast.error("Could not find selected fund or startup");
      return;
    }
    try {
      const res = await createSimulation({ name: data.name, description: data.description, fundId, startupId });
      if (res.success) {
        if (typeof window !== 'undefined') {
          const simData = { ...data, simulationId: res.data.id };
          sessionStorage.setItem('simulationData', JSON.stringify(simData));
          // Also save to localStorage so it persists on refresh
          localStorage.setItem('tsg_simulation_data', JSON.stringify({ ...simData, _savedAt: Date.now() }));
        }
        setIsSimulatorModalOpen(false);
        toast.success("Simulation created!");
        router.push('/investor-admin/simulator?step=step1');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create simulation");
    }
  };

  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-y-scroll`} style={{ scrollbarGutter: 'stable' }}>
        <Toaster position="top-right" toastOptions={{
          duration: 3000,
          style: { borderRadius: '12px', background: '#1A1C1E', color: '#fff', fontSize: '14px', fontWeight: '500', padding: '12px 16px' },
          success: { iconTheme: { primary: '#22C55E', secondary: '#fff' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }} />
        <div className="flex bg-[#F5F7FA] text-black min-h-screen">
          <InvestorSidebar isOpen={isOpen} setIsOpen={setIsOpen} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} onSimulatorClick={handleSimulatorOpen} />
          <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${isCollapsed ? "lg:ml-20" : "lg:ml-72"}`}>
            <InvestorTopbar isCollapsed={isCollapsed} onBellClick={() => setShowNotifications(true)} />
            <div className="p-4 lg:p-8 pt-24 lg:pt-28">
              {showNotifications ? (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <button onClick={() => setShowNotifications(false)} className="mb-4 text-[#2D60FF] font-medium flex items-center gap-2">← Back to Dashboard</button>
                  <h2 className="text-xl font-bold">Notifications</h2>
                </div>
              ) : (
                <div className="animate-in fade-in duration-500">{children}</div>
              )}
            </div>
          </main>
          {isSimulatorModalOpen && (
            <NewSimulationModal isOpen={isSimulatorModalOpen} onClose={() => setIsSimulatorModalOpen(false)} onSubmit={handleSimulatorSubmit} mode="simulation" fundOptions={fundOptions} portfolioCompanyOptions={startupOptions} defaultFundName={contextualFundName} />
          )}
        </div>
      </body>
    </html>
  );
}
