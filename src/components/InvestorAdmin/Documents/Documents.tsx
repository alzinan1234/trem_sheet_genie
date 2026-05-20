"use client";
import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown, Upload, FileText, Search, X, Download, Trash2 } from 'lucide-react';
import { getDocuments, uploadDocument, deleteDocument, bulkDeleteDocuments } from '@/services/document.service';
import { getFunds } from '@/services/fund.service';
import { Document, Fund } from '@/types';

export default function Documents() {
  const [selectedFund, setSelectedFund] = useState('All Funds');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFundId, setUploadFundId] = useState('');
  const [uploadCompany, setUploadCompany] = useState('');
  const [uploadRound, setUploadRound] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docRes, fundRes] = await Promise.all([
          getDocuments({ page: 1, limit: 50 }),
          getFunds({ page: 1, limit: 50 }),
        ]);
        if (docRes.success) setDocuments(docRes.data);
        if (fundRes.success) setFunds(fundRes.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load documents');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleRow = (id: string) => setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesFund = selectedFund === 'All Funds' || doc.fund?.fundName === selectedFund;
      const matchesSearch = doc.fileName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFund && matchesSearch;
    });
  }, [selectedFund, searchTerm, documents]);

  const handleUpload = async () => {
    if (!uploadFile) { setError('Please select a file'); return; }
    setIsUploading(true);
    setError('');
    try {
      const res = await uploadDocument({
        file: uploadFile,
        fundId: uploadFundId || undefined,
        companyName: uploadCompany || undefined,
        investmentRound: uploadRound || undefined,
      });
      if (res.success) {
        setDocuments(prev => [res.data, ...prev]);
        setShowUpload(false);
        setUploadFile(null); setUploadFundId(''); setUploadCompany(''); setUploadRound('');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
      setSelectedRows(prev => prev.filter(r => r !== id));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Delete failed');
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteDocuments(selectedRows);
      setDocuments(prev => prev.filter(d => !selectedRows.includes(d.id)));
      setSelectedRows([]);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Bulk delete failed');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    const colors: Record<string, string> = { pdf: 'text-red-500 bg-red-50', jpg: 'text-purple-500 bg-purple-50', png: 'text-purple-500 bg-purple-50', mp4: 'text-blue-500 bg-blue-50', docx: 'text-blue-600 bg-blue-50' };
    return (<div className={`w-10 h-10 flex items-center justify-center rounded-lg border border-gray-100 ${colors[type] || 'bg-gray-50 text-gray-500'}`}><FileText size={20} /></div>);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-8 font-sans relative">
      {selectedRows.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#101828] text-white px-6 py-3 rounded-full flex items-center gap-6 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4">
          <span className="text-sm font-medium">{selectedRows.length} files selected</span>
          <div className="h-4 w-[1px] bg-gray-600" />
          <div className="flex gap-4">
            <button onClick={handleBulkDelete} className="flex items-center gap-2 text-sm hover:text-red-400 transition-colors"><Trash2 size={16}/> Delete</button>
          </div>
          <button onClick={() => setSelectedRows([])} className="ml-2 p-1 hover:bg-gray-800 rounded-full"><X size={16}/></button>
        </div>
      )}
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#101828]">Documents</h1>
        <button onClick={() => setShowUpload(true)} className="bg-[#2D5BFF] hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm">
          <Upload size={18} /> Upload Document
        </button>
      </div>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}
      <div className="mb-6 flex flex-col gap-4">
        <p className="text-[12px] font-bold text-[#667085] uppercase tracking-wider">Filters</p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select value={selectedFund} onChange={e => setSelectedFund(e.target.value)} className="appearance-none bg-white border border-[#EAECF0] rounded-lg pl-3 pr-10 py-2.5 text-sm font-medium text-[#344054] outline-none min-w-[160px] shadow-sm">
              <option>All Funds</option>
              {funds.map(f => <option key={f.id} value={f.fundName}>{f.fundName}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] pointer-events-none" />
          </div>
          <div className="relative max-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]" size={18} />
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search files..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#EAECF0] rounded-lg text-sm outline-none shadow-sm" />
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#EAECF0] rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-[#EAECF0]">
              <th className="px-6 py-3 w-10"><input type="checkbox" onChange={e => setSelectedRows(e.target.checked ? documents.map(d => d.id) : [])} checked={selectedRows.length === documents.length && documents.length > 0} className="w-4 h-4 rounded" /></th>
              <th className="px-4 py-3 text-[12px] font-semibold text-[#475467] uppercase tracking-wider">File Name</th>
              <th className="px-4 py-3 text-[12px] font-semibold text-[#475467] uppercase tracking-wider">Fund</th>
              <th className="px-4 py-3 text-[12px] font-semibold text-[#475467] uppercase tracking-wider">Company</th>
              <th className="px-4 py-3 text-[12px] font-semibold text-[#475467] uppercase tracking-wider">Round</th>
              <th className="px-4 py-3 text-[12px] font-semibold text-[#475467] uppercase tracking-wider">Size</th>
              <th className="px-4 py-3 text-[12px] font-semibold text-[#475467] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAECF0]">
            {isLoading ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-[#667085]">Loading documents...</td></tr>
            ) : filteredDocuments.length > 0 ? filteredDocuments.map(doc => (
              <tr key={doc.id} className={`hover:bg-gray-50/50 transition-colors ${selectedRows.includes(doc.id) ? 'bg-blue-50/30' : ''}`}>
                <td className="px-6 py-4"><input type="checkbox" checked={selectedRows.includes(doc.id)} onChange={() => toggleRow(doc.id)} className="w-4 h-4 rounded" /></td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    {getFileIcon(doc.fileType)}
                    <span className="text-sm font-medium text-[#101828]">{doc.fileName}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-[#475467]">{doc.fund?.fundName || '—'}</td>
                <td className="px-4 py-4 text-sm text-[#475467]">{doc.companyName || '—'}</td>
                <td className="px-4 py-4 text-sm text-[#475467]">{doc.investmentRound || '—'}</td>
                <td className="px-4 py-4 text-sm text-[#475467]">{formatSize(doc.fileSize)}</td>
                <td className="px-4 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <a href={doc.s3Url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-[#667085] hover:text-[#2D5BFF] transition-colors"><Download size={16}/></a>
                    <button onClick={() => handleDelete(doc.id)} className="p-1.5 text-[#667085] hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-[#667085]">No documents found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0c111d]/30 backdrop-blur-[4px]" onClick={() => setShowUpload(false)} />
          <div className="relative bg-white w-full max-w-[480px] rounded-[20px] shadow-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#101828]">Upload Document</h2>
              <button onClick={() => setShowUpload(false)} className="text-[#98A2B3] hover:text-[#667085]"><X size={22}/></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-[#344054] uppercase tracking-wider">File <span className="text-red-500">*</span></label>
                <input type="file" onChange={e => setUploadFile(e.target.files?.[0] || null)} className="w-full mt-1 px-4 py-3 bg-[#F9FAFB] border border-[#EAECF0] rounded-xl text-sm text-[#101828]" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#344054] uppercase tracking-wider">Fund (optional)</label>
                <select value={uploadFundId} onChange={e => setUploadFundId(e.target.value)} className="w-full mt-1 px-4 py-3 bg-[#F9FAFB] border border-[#EAECF0] rounded-xl text-sm text-[#101828] outline-none">
                  <option value="">No fund</option>
                  {funds.map(f => <option key={f.id} value={f.id}>{f.fundName}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#344054] uppercase tracking-wider">Company Name (optional)</label>
                <input type="text" value={uploadCompany} onChange={e => setUploadCompany(e.target.value)} placeholder="e.g. Hourglass" className="w-full mt-1 px-4 py-3 bg-[#F9FAFB] border border-[#EAECF0] rounded-xl text-sm text-[#101828] outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#344054] uppercase tracking-wider">Investment Round (optional)</label>
                <input type="text" value={uploadRound} onChange={e => setUploadRound(e.target.value)} placeholder="e.g. Series B" className="w-full mt-1 px-4 py-3 bg-[#F9FAFB] border border-[#EAECF0] rounded-xl text-sm text-[#101828] outline-none" />
              </div>
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowUpload(false)} className="flex-1 py-3 border border-[#D0D5DD] rounded-xl font-bold text-[#344054] hover:bg-gray-50">Cancel</button>
                <button onClick={handleUpload} disabled={isUploading} className="flex-1 py-3 bg-[#2D5BFF] hover:bg-blue-700 text-white rounded-xl font-bold disabled:opacity-60">
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
