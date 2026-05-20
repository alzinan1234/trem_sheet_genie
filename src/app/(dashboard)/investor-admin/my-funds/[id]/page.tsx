"use client";
import React, { use, useState, useEffect } from "react";
import { Plus, Edit2, ChevronDown, ChevronUp, FileText, ArrowLeft, Save, X, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import NewSimulationModal, { NewSimulationModalData } from "@/components/InvestorAdmin/Simulator/NewSimulationModal";
import { getFundById, updateFund } from "@/services/fund.service";
import { getLimitedPartners, createLimitedPartner } from "@/services/limitedPartner.service";
import { getStartups } from "@/services/startup.service";
import { getInvestmentPipelines, createInvestmentPipeline } from "@/services/pipeline.service";
import { createSimulation } from "@/services/simulation.service";
import { Fund, LimitedPartner, Startup, InvestmentPipeline, CompanyStatus, DecisionStatus } from "@/types";
import { PageLoader } from "@/components/shared/LoadingSpinner";

interface PageProps { params: Promise<{ id: string }>; }

export default function FundDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const fundId = resolvedParams.id;

  const [fund, setFund] = useState<Fund | null>(null);
  const [lps, setLps] = useState<LimitedPartner[]>([]);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [pipeline, setPipeline] = useState<InvestmentPipeline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [isSavingFund, setIsSavingFund] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Fund>>({});
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState(false);
  const [startupOptions, setStartupOptions] = useState<string[]>([]);
  const [startupMap, setStartupMap] = useState<Record<string, string>>({});

  // Add LP Modal
  const [isLPModalOpen, setIsLPModalOpen] = useState(false);
  const [lpStep, setLpStep] = useState<1 | 2>(1);
  const [lpForm, setLpForm] = useState({ companyName: '', committedCapital: '', capitalCalls: '', managementFees: '', carryPercentage: '', mainPointOfContactName: '', mainPointOfContactRole: '', mainPointOfContactEmail: '', mainPointOfContactPhoneNumber: '', relationshipSince: '', agreementDate: '' });
  const [isSavingLP, setIsSavingLP] = useState(false);

  // Add Pipeline Modal
  const [isPipelineModalOpen, setIsPipelineModalOpen] = useState(false);
  const [pipelineForm, setPipelineForm] = useState({ companyName: '', companyWebsite: '', companyStatus: 'CURRENTLY_FUNDRAISING' as CompanyStatus, decisionStatus: 'UNDER_REVIEW' as DecisionStatus });
  const [isSavingPipeline, setIsSavingPipeline] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [fundRes, lpRes, startupRes, pipelineRes] = await Promise.all([
          getFundById(fundId),
          getLimitedPartners({ page: 1, limit: 50 }),
          getStartups({ page: 1, limit: 50 }),
          getInvestmentPipelines({ page: 1, limit: 50 }),
        ]);
        if (fundRes.success) {
          setFund(fundRes.data);
          setEditForm(fundRes.data);
        }
        if (lpRes.success) setLps(lpRes.data.filter(lp => lp.fundId === fundId));
        if (startupRes.success) {
          const fundStartups = startupRes.data.filter(s => s.fundId === fundId);
          setStartups(fundStartups);
          setStartupOptions(fundStartups.map(s => s.name));
          const sm: Record<string, string> = {};
          fundStartups.forEach(s => { sm[s.name] = s.id; });
          setStartupMap(sm);
        }
        if (pipelineRes.success) setPipeline(pipelineRes.data.filter(p => p.fundId === fundId));
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load fund details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, [fundId]);

  const handleSaveFund = async () => {
    setIsSavingFund(true);
    try {
      const res = await updateFund(fundId, { fundName: editForm.fundName, leadGP: editForm.leadGP, status: editForm.status, commitmentPeriodManagementFee: editForm.commitmentPeriodManagementFee, carryPercentage: editForm.carryPercentage });
      if (res.success) { setFund(res.data); toast.success('Fund updated!'); setIsEditingBasic(false); }
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Update failed'); }
    finally { setIsSavingFund(false); }
  };

  const handleSimulationSubmit = async (data: NewSimulationModalData) => {
    const startupId = startupMap[data.portfolioCompany];
    if (!startupId) { toast.error('Startup not found'); return; }
    try {
      const res = await createSimulation({ name: data.name, description: data.description, fundId, startupId });
      if (res.success) {
        // Include the full fund object so simulation-results can use fund params (committed_capital etc.)
        sessionStorage.setItem('simulationData', JSON.stringify({ ...data, simulationId: res.data.id, fund }));
        setIsSimulationModalOpen(false);
        toast.success('Simulation created!');
        router.push('/investor-admin/simulator?step=step1');
      }
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Failed to create simulation'); }
  };

  const handleAddLP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lpForm.companyName) { toast.error('Company name required'); return; }
    setIsSavingLP(true);
    try {
      const res = await createLimitedPartner({
        companyName: lpForm.companyName, fundId,
        relationshipSince: lpForm.relationshipSince || new Date().toISOString(),
        agreementDate: lpForm.agreementDate || new Date().toISOString(),
        committedCapital: Number(lpForm.committedCapital) || 0,
        capitalCalls: Number(lpForm.capitalCalls) || 0,
        managementFees: Number(lpForm.managementFees) || 0,
        carryPercentage: Number(lpForm.carryPercentage) || 0,
        mainPointOfContactName: lpForm.mainPointOfContactName,
        mainPointOfContactRole: lpForm.mainPointOfContactRole,
        mainPointOfContactEmail: lpForm.mainPointOfContactEmail,
        mainPointOfContactPhoneNumber: lpForm.mainPointOfContactPhoneNumber,
      });
      if (res.success) { setLps(prev => [...prev, res.data]); setIsLPModalOpen(false); toast.success('Limited Partner added!'); setLpStep(1); setLpForm({ companyName: '', committedCapital: '', capitalCalls: '', managementFees: '', carryPercentage: '', mainPointOfContactName: '', mainPointOfContactRole: '', mainPointOfContactEmail: '', mainPointOfContactPhoneNumber: '', relationshipSince: '', agreementDate: '' }); }
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Failed to add LP'); }
    finally { setIsSavingLP(false); }
  };

  const handleAddPipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pipelineForm.companyName) { toast.error('Company name required'); return; }
    setIsSavingPipeline(true);
    try {
      const res = await createInvestmentPipeline({ ...pipelineForm, fundId });
      if (res.success) { setPipeline(prev => [...prev, res.data]); setIsPipelineModalOpen(false); toast.success('Pipeline entry added!'); setPipelineForm({ companyName: '', companyWebsite: '', companyStatus: 'CURRENTLY_FUNDRAISING', decisionStatus: 'UNDER_REVIEW' }); }
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Failed to add pipeline entry'); }
    finally { setIsSavingPipeline(false); }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  if (isLoading) return <PageLoader text="Loading fund details..." />;
  if (!fund) return <div className="p-8 text-center text-gray-500">Fund not found.</div>;

  return (
    <div className="p-0 bg-[#F9FAFB] min-h-screen font-sans text-[#101828]">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"><ArrowLeft size={20} /></button>
          <nav className="flex items-center gap-2 text-sm font-medium">
            <span className="text-gray-400">Fund Overview</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-bold">{fund.fundName}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard label="Committed Capital" value={formatCurrency(fund.committedCapital)} badge="Fund" />
          <MetricCard label="Carry Type" value={fund.carryType} badge="Structure" />
          <MetricCard label="Carry Percentage" value={`${fund.carryPercentage}%`} badge="Terms" />
          <MetricCard label="Fund Term" value={`${fund.term} Years`} badge="Duration" />
        </div>

        {/* Basic Fund Information */}
        <AccordionSection title="Basic Fund Information" rightElement={
          <button onClick={(e) => { e.stopPropagation(); isEditingBasic ? handleSaveFund() : setIsEditingBasic(true); }}
            className="flex items-center gap-2 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-all">
            {isSavingFund ? <span className="w-3 h-3 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" /> : isEditingBasic ? <><Save size={14}/> Save</> : <><Edit2 size={14}/> Edit Info</>}
          </button>
        }>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-6">
              <EditableInfoItem isEditing={isEditingBasic} label="Fund Name" value={editForm.fundName || fund.fundName} onChange={v => setEditForm(p => ({ ...p, fundName: v }))} />
              <EditableInfoItem isEditing={isEditingBasic} label="Lead GP" value={editForm.leadGP || fund.leadGP} onChange={v => setEditForm(p => ({ ...p, leadGP: v }))} />
              <InfoItem label="Inception Date" value={formatDate(fund.inceptionDate)} />
              <InfoItem label="Initial Closing Date" value={formatDate(fund.initialClosingDate)} />
              <InfoItem label="Status" value={fund.status} isStatus />
            </div>
            <div className="space-y-6">
              <h3 className="text-[16px] font-bold text-gray-900 mb-4">Standard LP Terms</h3>
              <InfoItem label="Commitment Period" value={`${fund.commitmentPeriod} Years`} />
              <InfoItem label="Maximal Extension" value={`${fund.maximalExtension} Years`} />
              <InfoItem label="Commitment Period Management Fee" value={`${fund.commitmentPeriodManagementFee}%`} />
              <InfoItem label="Post Commitment Period Management Fee" value={`${fund.postCommitmentPeriodManagementFee}%`} />
              <InfoItem label="Carry" value={`${fund.carryType} - ${fund.carryPercentage}%`} />
            </div>
          </div>
        </AccordionSection>

        {/* Investments (Startups) */}
        <SectionTable title="Investments" description="Companies this fund has invested in" buttonText="New Portfolio Company" onAdd={() => setIsSimulationModalOpen(true)}
          columns={[{ key: 'name', label: 'Company' }, { key: 'status', label: 'Status' }, { key: 'description', label: 'Description' }, { key: 'investmentAmount', label: 'Investment Amount' }, { key: 'growthPercentage', label: 'Growth %' }]}
          rows={startups.map(s => ({ id: s.id, name: s.name, url: s.website, status: s.status, description: s.description, investmentAmount: formatCurrency(s.investmentAmount), growthPercentage: `${s.growthPercentage}%` }))}
          onRowClick={(row) => router.push(`/investor-admin/startups/${row.id}`)} />

        {/* Investment Pipeline */}
        <SectionTable title="Investment Pipeline" description="Companies with investment potential" buttonText="New Potential Investment" onAdd={() => setIsPipelineModalOpen(true)}
          columns={[{ key: 'name', label: 'Company' }, { key: 'companyStatus', label: 'Company Status' }, { key: 'decisionStatus', label: 'Decision Status' }]}
          rows={pipeline.map(p => ({ id: p.id, name: p.companyName, url: p.companyWebsite, companyStatus: p.companyStatus.replace(/_/g, ' '), decisionStatus: p.decisionStatus.replace(/_/g, ' ') }))} />

        {/* Limited Partners */}
        <SectionTable title="Limited Partners" description="Partners who committed capital to this fund" buttonText="New Partner" onAdd={() => setIsLPModalOpen(true)}
          columns={[{ key: 'name', label: 'Name' }, { key: 'committedCapital', label: 'Committed Capital' }, { key: 'managementFees', label: 'Management Fees' }, { key: 'carryPercentage', label: 'Carry %' }]}
          rows={lps.map(lp => ({ id: lp.id, name: lp.companyName, committedCapital: formatCurrency(lp.committedCapital), managementFees: formatCurrency(lp.managementFees), carryPercentage: `${lp.carryPercentage}%` }))}
          onRowClick={(row) => router.push(`/investor-admin/limited-partners/${row.id}`)} />
      </div>

      {/* Simulation Modal */}
      <NewSimulationModal isOpen={isSimulationModalOpen} onClose={() => setIsSimulationModalOpen(false)} onSubmit={handleSimulationSubmit} mode="newPortfolioCompany" showFundSelector={false} defaultFundName={fund.fundName} portfolioCompanyOptions={startupOptions} fundOptions={[fund.fundName]} />

      {/* Add LP Modal */}
      {isLPModalOpen && (
        <Modal title={lpStep === 1 ? "Add Limited Partner" : "Partner Details"} onClose={() => { setIsLPModalOpen(false); setLpStep(1); }}>
          <form onSubmit={handleAddLP} className="space-y-4">
            {lpStep === 1 ? (
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-gray-500">Company Name</label>
                <input value={lpForm.companyName} onChange={e => setLpForm(p => ({ ...p, companyName: e.target.value }))} className="w-full p-3.5 bg-[#F2F4F7] rounded-xl outline-none text-sm font-medium" placeholder="Summit Capital" />
              </div>
            ) : (
              <>
                {[['Committed Capital ($)', 'committedCapital'], ['Capital Calls ($)', 'capitalCalls'], ['Management Fees ($)', 'managementFees'], ['Carry %', 'carryPercentage'], ['Main Contact Name', 'mainPointOfContactName'], ['Main Contact Role', 'mainPointOfContactRole'], ['Main Contact Email', 'mainPointOfContactEmail'], ['Main Contact Phone', 'mainPointOfContactPhoneNumber']].map(([label, key]) => (
                  <div key={key} className="space-y-1">
                    <label className="text-[12px] font-semibold text-gray-500">{label}</label>
                    <input value={(lpForm as any)[key]} onChange={e => setLpForm(p => ({ ...p, [key]: e.target.value }))} className="w-full p-3 bg-[#F2F4F7] rounded-xl outline-none text-sm" placeholder={label} />
                  </div>
                ))}
              </>
            )}
            <div className="flex gap-3 pt-2">
              {lpStep === 2 && <button type="button" onClick={() => setLpStep(1)} className="flex-1 py-3 bg-blue-50 text-blue-600 rounded-full font-bold text-sm">Back</button>}
              <button type={lpStep === 1 ? "button" : "submit"} onClick={() => lpStep === 1 && lpForm.companyName && setLpStep(2)} disabled={isSavingLP}
                className="flex-1 py-3 bg-[#2D60FF] hover:bg-blue-700 text-white rounded-full font-bold text-sm disabled:opacity-60">
                {isSavingLP ? 'Adding...' : lpStep === 1 ? 'Next' : 'Add Partner'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Pipeline Modal */}
      {isPipelineModalOpen && (
        <Modal title="Add Potential Investment" onClose={() => setIsPipelineModalOpen(false)}>
          <form onSubmit={handleAddPipeline} className="space-y-4">
            {[['Company Name', 'companyName'], ['Website', 'companyWebsite']].map(([label, key]) => (
              <div key={key} className="space-y-1">
                <label className="text-[13px] font-semibold text-gray-500">{label}</label>
                <input value={(pipelineForm as any)[key]} onChange={e => setPipelineForm(p => ({ ...p, [key]: e.target.value }))} className="w-full p-3.5 bg-[#F2F4F7] rounded-xl outline-none text-sm font-medium" placeholder={label} />
              </div>
            ))}
            <div className="space-y-1">
              <label className="text-[13px] font-semibold text-gray-500">Company Status</label>
              <select value={pipelineForm.companyStatus} onChange={e => setPipelineForm(p => ({ ...p, companyStatus: e.target.value as CompanyStatus }))} className="w-full p-3.5 bg-[#F2F4F7] rounded-xl outline-none text-sm font-medium">
                {['CURRENTLY_FUNDRAISING','MID_CYCLE','NOT_RAISING','CLOSED'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[13px] font-semibold text-gray-500">Decision Status</label>
              <select value={pipelineForm.decisionStatus} onChange={e => setPipelineForm(p => ({ ...p, decisionStatus: e.target.value as DecisionStatus }))} className="w-full p-3.5 bg-[#F2F4F7] rounded-xl outline-none text-sm font-medium">
                {['UNDER_REVIEW','INVESTMENT_COMMITTEE','TERM_SHEET','DUE_DILIGENCE','INVESTED','PASSED'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <button type="submit" disabled={isSavingPipeline} className="w-full py-4 mt-2 text-white bg-[#2D60FF] hover:bg-blue-700 rounded-full font-bold text-sm disabled:opacity-60">
              {isSavingPipeline ? 'Adding...' : 'Add Company'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

const Modal = ({ title, children, onClose }: any) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white w-full max-w-[440px] rounded-[32px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200">
      <div className="p-8 pb-0 flex justify-between items-start">
        <h2 className="text-2xl font-bold text-[#101828] leading-tight pr-8">{title}</h2>
        <button onClick={onClose} className="p-1.5 border border-gray-200 rounded-full text-gray-400 hover:bg-gray-50"><X size={18}/></button>
      </div>
      <div className="p-8 pt-6">{children}</div>
    </div>
  </div>
);

const SectionTable = ({ title, description, buttonText, columns, rows = [], onAdd, onRowClick }: any) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between">
        <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-lg text-[#101828]">{title}</h2>
            {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </div>
          <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">{description}</p>
        </div>
        <button onClick={onAdd} className="bg-[#2D60FF] hover:bg-blue-700 text-white px-5 py-2.5 rounded-[12px] text-xs font-bold flex items-center gap-2 transition-all active:scale-95"><Plus size={14}/> {buttonText}</button>
      </div>
      {isOpen && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/40 text-[10px] text-gray-400 uppercase tracking-[0.1em] font-bold border-b border-gray-100">
                {columns.map((col: any) => <th key={col.key} className="px-8 py-4">{col.label}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.length === 0 ? (
                <tr><td colSpan={columns.length} className="px-8 py-8 text-center text-sm text-gray-400">No data yet.</td></tr>
              ) : rows.map((row: any, i: number) => (
                <tr key={i} onClick={() => onRowClick?.(row)} className={`hover:bg-blue-50/10 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}>
                  {columns.map((col: any) => (
                    <td key={col.key} className="px-8 py-5">
                      {col.key === 'name' ? (
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#F2F4F7] rounded-xl flex items-center justify-center text-[#475467] font-bold text-xs">{row.name?.charAt(0)}</div>
                          <div>
                            <div className="text-sm font-bold text-[#101828]">{row.name}</div>
                            {row.url && <div className="text-[10px] text-gray-400">{row.url}</div>}
                          </div>
                        </div>
                      ) : col.key === 'status' || col.key === 'companyStatus' || col.key === 'decisionStatus' ? (
                        <StatusBadge status={row[col.key]} />
                      ) : <div className="text-sm font-bold text-[#101828]">{row[col.key]}</div>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const isGreen = ['Active', 'ACTIVE', 'OPEN', 'INVESTED'].includes(status);
  const isBlue = ['Under Review', 'UNDER REVIEW'].includes(status);
  const isRed = ['Closed', 'CLOSED', 'PASSED'].includes(status);
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border flex items-center gap-1.5 w-fit whitespace-nowrap
      ${isGreen ? 'bg-green-50 text-green-700 border-green-100' : isBlue ? 'bg-blue-50 text-blue-700 border-blue-100' : isRed ? 'bg-red-50 text-red-700 border-red-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isGreen ? 'bg-green-500' : isBlue ? 'bg-blue-500' : isRed ? 'bg-red-500' : 'bg-orange-500'}`} />
      {status}
    </span>
  );
};

const MetricCard = ({ label, value, badge }: any) => (
  <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
    <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase border border-blue-100 tracking-wider">{badge}</span>
    <div className="text-[26px] font-bold mt-4 tracking-tight text-[#101828] leading-none">{value}</div>
    <div className="text-[12px] text-gray-400 font-bold uppercase tracking-wider mt-2">{label}</div>
  </div>
);

const AccordionSection = ({ title, children, rightElement }: any) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
      <div onClick={() => setIsOpen(!isOpen)} className="p-6 flex items-center justify-between border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3">
          {isOpen ? <ChevronUp size={18} className="text-gray-400"/> : <ChevronDown size={18} className="text-gray-400"/>}
          <h2 className="font-bold text-lg text-[#101828]">{title}</h2>
        </div>
        <div onClick={e => e.stopPropagation()}>{rightElement}</div>
      </div>
      {isOpen && <div className="animate-in fade-in duration-300">{children}</div>}
    </div>
  );
};

const InfoItem = ({ label, value, isStatus }: any) => (
  <div className="flex flex-col gap-1.5">
    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</div>
    {isStatus ? <StatusBadge status={value} /> : <div className="text-[15px] font-bold text-[#101828]">{value}</div>}
  </div>
);

const EditableInfoItem = ({ label, value, isEditing, onChange }: any) => (
  <div className="flex flex-col gap-1.5">
    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</div>
    {isEditing ? (
      <input value={value} onChange={e => onChange(e.target.value)} className="text-[15px] font-bold text-[#101828] bg-[#F9FAFB] px-2 py-1 rounded-md border border-gray-200 outline-none focus:border-[#2D60FF] w-full" />
    ) : (
      <div className="text-[15px] font-bold text-[#101828] py-1">{value}</div>
    )}
  </div>
);