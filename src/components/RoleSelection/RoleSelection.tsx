"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateTermSheetGenie } from '@/services/onboarding.service';

type UserRole = 'investor' | 'entrepreneur' | 'student' | '';
const roleMap: Record<string, 'AS_AN_INVESTOR' | 'AS_AN_ENTREPRENEUR' | 'AS_A_STUDENT'> = {
  investor: 'AS_AN_INVESTOR',
  entrepreneur: 'AS_AN_ENTREPRENEUR',
  student: 'AS_A_STUDENT',
};

const roles = [
  { id: 'investor' as UserRole, icon: (<svg className="w-8 h-8 text-[#0A2A99]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>), title: 'As an Investor', description: 'Manage all your investments in one place. From detailed deal-by-deal analysis, to full fund and smart fund metrics.' },
  { id: 'entrepreneur' as UserRole, icon: (<svg className="w-8 h-8 text-[#0A2A99]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>), title: 'As an Entrepreneur', description: 'Understand your current cap table, and simulate future investments or exit scenarios to negotiate smarter deals.' },
  { id: 'student' as UserRole, icon: (<svg className="w-8 h-8 text-[#0A2A99]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>), title: 'As a Student', description: 'Get full access to the platform to learn how term sheets affect the overall value of a deal for both investors and founders.' },
];

const RoleSelectionPage: React.FC = () => {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const emailVerified = sessionStorage.getItem('emailVerified');
    if (!emailVerified) router.push('/email-verification');
  }, [router]);

  const handleContinue = async () => {
    if (!selectedRole) { setError('Please select a role to continue'); return; }
    setIsLoading(true);
    setError('');
    try {
      const res = await updateTermSheetGenie({ termSheetGenie: roleMap[selectedRole] });
      if (res.success) {
        sessionStorage.setItem('userRole', selectedRole);
        if (res.data.nextStep === 'CREATE_ORGANIZATION') {
          router.push('/additional-info');
        } else {
          router.push('/investor-admin/my-funds');
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save role. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[#1A1C1E] mb-2">Select how you want to use Term Sheet Genie</h1>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">{error}</div>}
        <div className="space-y-4 mb-8">
          {roles.map((role) => (
            <div key={role.id} onClick={() => !isLoading && setSelectedRole(role.id)}
              className={`bg-white rounded-2xl p-6 cursor-pointer transition-all border-2 hover:shadow-md ${selectedRole === role.id ? 'border-[#0A2A99] shadow-md' : 'border-gray-100 hover:border-gray-200'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${selectedRole === role.id ? 'bg-blue-50' : 'bg-gray-50'}`}>{role.icon}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#1A1C1E] mb-1">{role.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{role.description}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedRole === role.id ? 'border-[#0A2A99] bg-[#0A2A99]' : 'border-gray-300'}`}>
                  {selectedRole === role.id && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                </div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={handleContinue} disabled={!selectedRole || isLoading}
          className={`w-full py-4 rounded-full font-bold text-lg transition-all active:scale-[0.98] ${selectedRole && !isLoading ? 'bg-[#0A2A99] text-white hover:bg-blue-800 shadow-lg shadow-blue-900/10' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
          {isLoading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default RoleSelectionPage;
