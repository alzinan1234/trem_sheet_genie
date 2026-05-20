"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, Plus, Trash2, Edit2 } from "lucide-react";
import { getLimitedPartners, updateLimitedPartner, createLimitedPartner, deleteLimitedPartner } from "@/services/limitedPartner.service";
import { getFunds } from "@/services/fund.service";
import { LimitedPartner, Fund } from "@/types";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import toast from "react-hot-toast";

export default function LimitedPartnersView({ onBack }: { onBack: () => void }) {
  const [partners, setPartners] = useState<LimitedPartner[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<LimitedPartner>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lpRes, fundRes] = await Promise.all([
          getLimitedPartners({ page: 1, limit: 50 }),
          getFunds({ page: 1, limit: 50 }),
        ]);
        if (lpRes.success && lpRes.data.length > 0) {
          setPartners(lpRes.data);
          setSelectedId(lpRes.data[0].id);
          setEditForm(lpRes.data[0]);
        }
        if (fundRes.success) setFunds(fundRes.data);
      } catch (err: any) {
        toast.error('Failed to load partners');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentLP = partners.find(p => p.id === selectedId);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const lp = partners.find(p => p.id === id);
    if (lp) setEditForm(lp);
  };

  const updateField = (field: keyof LimitedPartner, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!selectedId) return;
    setIsSaving(true);
    const toastId = toast.loading('Saving...');
    try {
      const res = await updateLimitedPartner(selectedId, {
        companyName: editForm.companyName,
        committedCapital: editForm.committedCapital,
        capitalCalls: editForm.capitalCalls,
        managementFees: editForm.managementFees,
        carryPercentage: editForm.carryPercentage,
        mainPointOfContactName: editForm.mainPointOfContactName,
        mainPointOfContactEmail: editForm.mainPointOfContactEmail,
        mainPointOfContactRole: editForm.mainPointOfContactRole,
        mainPointOfContactPhoneNumber: editForm.mainPointOfContactPhoneNumber,
      });
      if (res.success) {
        setPartners(prev => prev.map(p => p.id === selectedId ? res.data : p));
        toast.success('Saved!', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Save failed', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNew = async () => {
    const fundId = funds[0]?.id;
    if (!fundId) { toast.error('No funds available'); return; }
    try {
      const res = await createLimitedPartner({
        companyName: 'New Partner',
        fundId,
        relationshipSince: new Date().toISOString(),
        agreementDate: new Date().toISOString(),
        committedCapital: 0,
        capitalCalls: 0,
        managementFees: 0,
        carryPercentage: 0,
        mainPointOfContactName: '',
        mainPointOfContactRole: '',
        mainPointOfContactEmail: '',
        mainPointOfContactPhoneNumber: '',
      });
      if (res.success) {
        setPartners(prev => [...prev, res.data]);
        setSelectedId(res.data.id);
        setEditForm(res.data);
        toast.success('New partner added!');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to add partner');
    }
  };

  const handleRemove = async () => {
    if (!selectedId || !confirm('Delete this partner?')) return;
    const toastId = toast.loading('Deleting...');
    try {
      await deleteLimitedPartner(selectedId);
      const filtered = partners.filter(p => p.id !== selectedId);
      setPartners(filtered);
      if (filtered.length > 0) { setSelectedId(filtered[0].id); setEditForm(filtered[0]); }
      else { setSelectedId(''); setEditForm({}); }
      toast.success('Partner deleted', { id: toastId });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Delete failed', { id: toastId });
    }
  };

  const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v || 0);

  if (isLoading) return <PageLoader text="Loading partners..." />;

  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen font-sans">
      <div className="flex items-start gap-12 mx-auto">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <button onClick={onBack} className="flex items-center gap-2 text-[#2D60FF] bg-white border border-blue-100 px-5 py-2.5 rounded-full font-bold text-sm hover:shadow-md transition-all active:scale-95 mb-8">
            <ChevronLeft size={18} /> Return
          </button>
          <div className="space-y-1 mb-6">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase px-3 mb-2 tracking-wider">Current LPs</h3>
            {partners.map((lp) => (
              <button key={lp.id} onClick={() => handleSelect(lp.id)}
                className={`w-full text-left p-3 text-sm transition-all rounded-xl ${selectedId === lp.id ? 'text-[#2D60FF] font-bold border-l-[4px] border-[#2D60FF] bg-blue-50/50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                {lp.companyName}
              </button>
            ))}
          </div>
          <button onClick={handleAddNew} className="w-full flex items-center justify-center gap-2 bg-blue-50 text-[#2D60FF] py-3.5 rounded-2xl font-bold text-sm hover:bg-blue-100 transition-all active:scale-95">
            <Plus size={18} /> Add new LP
          </button>
        </div>

        {/* Main Form */}
        <div className="flex-1 bg-white p-10 rounded-[32px] shadow-sm border border-gray-100">
          {!currentLP ? (
            <div className="text-center py-12 text-gray-400">No partner selected</div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-50">
                <div className="flex items-center gap-4 group">
                  <input className="text-3xl font-bold text-gray-800 bg-transparent border-none focus:ring-0 p-0 w-auto min-w-[200px]"
                    value={editForm.companyName || ''} onChange={e => updateField('companyName', e.target.value)} />
                  <Edit2 size={20} className="text-gray-300" />
                </div>
                <div className="flex flex-col items-end">
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">Quick Select</label>
                  <select value={selectedId} onChange={e => handleSelect(e.target.value)}
                    className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm font-medium text-gray-600 outline-none">
                    {partners.map(p => <option key={p.id} value={p.id}>{p.companyName}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid gap-6">
                <LPInput label="Agreement Date" value={editForm.agreementDate ? new Date(editForm.agreementDate).toLocaleDateString() : ''} onChange={v => updateField('agreementDate', v)} />
                <LPInput label="Committed Capital ($)" value={String(editForm.committedCapital || 0)} onChange={v => updateField('committedCapital', Number(v))} type="number" />
                <LPInput label="Capital Calls ($)" value={String(editForm.capitalCalls || 0)} onChange={v => updateField('capitalCalls', Number(v))} type="number" />
                <LPInput label="Management Fees ($)" value={String(editForm.managementFees || 0)} onChange={v => updateField('managementFees', Number(v))} type="number" />
                <div className="flex items-center justify-between gap-8">
                  <label className="text-sm font-bold text-gray-800 w-1/3">Carry %</label>
                  <input type="number" value={editForm.carryPercentage || 0} onChange={e => updateField('carryPercentage', Number(e.target.value))}
                    className="flex-1 bg-gray-50 border-none rounded-xl p-3 text-sm text-gray-600 focus:ring-2 focus:ring-blue-100 outline-none" />
                </div>
                <LPInput label="Contact Person" value={editForm.mainPointOfContactName || ''} onChange={v => updateField('mainPointOfContactName', v)} />
                <LPInput label="Contact Role" value={editForm.mainPointOfContactRole || ''} onChange={v => updateField('mainPointOfContactRole', v)} />
                <LPInput label="Contact Email" value={editForm.mainPointOfContactEmail || ''} onChange={v => updateField('mainPointOfContactEmail', v)} />
                <LPInput label="Contact Phone" value={editForm.mainPointOfContactPhoneNumber || ''} onChange={v => updateField('mainPointOfContactPhoneNumber', v)} />
              </div>

              <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-50">
                <button onClick={handleRemove} className="flex items-center gap-2 text-red-500 text-sm font-bold border border-red-50 hover:bg-red-50 px-5 py-3 rounded-2xl transition-all">
                  <Trash2 size={18} /> Remove LP
                </button>
                <button onClick={handleSave} disabled={isSaving}
                  className="bg-[#2D60FF] hover:bg-[#1a4bd6] text-white px-12 py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-60">
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const LPInput = ({ label, value, onChange, type = 'text' }: any) => (
  <div className="flex items-center justify-between gap-8">
    <label className="text-sm font-bold text-gray-800 w-1/3">{label}</label>
    <input type={type} className="flex-1 bg-gray-50 border-none rounded-xl p-3 text-sm text-gray-600 focus:ring-2 focus:ring-blue-100 outline-none" value={value} onChange={e => onChange(e.target.value)} />
  </div>
);
