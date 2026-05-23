"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getCountries, getCountryCallingCode, CountryCode } from 'libphonenumber-js';
import { createOrganization } from '@/services/onboarding.service';

interface AdditionalInfoFormData {
  firstName: string; lastName: string; companyName: string;
  companySize: string; companyType: string; entityType: string;
  position: string; countryCode: string; phoneNumber: string;
}

const companySizes = ['1 - 10 employees','11 - 50 employees','51 - 200 employees','201 - 500 employees','501 - 1000 employees','1000+ employees'];

const entityTypes = [
  { label: 'VC', value: 'VC' },
  { label: 'PE', value: 'PE' },
  { label: 'Search Fund', value: 'SEARCH_FUND' },
  { label: 'Angel', value: 'ANGEL' },
  { label: 'Family Office', value: 'FAMILY_OFFICE' },
];

const AdditionalInfoPage: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<AdditionalInfoFormData>({
    firstName: '', lastName: '', companyName: '', companySize: '',
    companyType: '', entityType: '', position: '', countryCode: 'US', phoneNumber: ''
  });

  const countryOptions = useMemo(() => {
    return getCountries().map((country) => ({
      code: country, callingCode: `+${getCountryCallingCode(country)}`,
    })).sort((a, b) => a.callingCode.localeCompare(b.callingCode, undefined, { numeric: true }));
  }, []);

  useEffect(() => {
    const emailVerified = sessionStorage.getItem('emailVerified');
    const userRole = sessionStorage.getItem('userRole');
    const fullName = sessionStorage.getItem('userName') || '';
    const nameParts = fullName.trim().split(/\s+/);
    setFormData(prev => ({ ...prev, firstName: nameParts[0] || '', lastName: nameParts.slice(1).join(' ') || '' }));
    if (!emailVerified) router.push('/email-verification');
    else if (!userRole) router.push('/role-selection');
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.companyName || !formData.position) { setError('Company Name and Position are required'); return; }
    setIsLoading(true);
    setError('');
    try {
      const selectedCallingCode = `+${getCountryCallingCode(formData.countryCode as CountryCode)}`;

      const res = await createOrganization({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: `${selectedCallingCode}${formData.phoneNumber}`,
        position: formData.position,
        companyName: formData.companyName,
        size: formData.companySize,
        typeOfCompany: formData.companyType,
        entityType: formData.entityType,
      });

      if (res.success) {
        // ✅ FIX: userRole আগে read করো, তারপর sessionStorage clear করো
        const userRole = sessionStorage.getItem('userRole') || 'investor';

        sessionStorage.removeItem('userEmail');
        sessionStorage.removeItem('userName');
        sessionStorage.removeItem('emailVerified');
        sessionStorage.removeItem('userRole');
        sessionStorage.removeItem('verifyToken');

        // ✅ FIX: এখন userRole এ সঠিক value আছে
        if (userRole === 'entrepreneur') router.push('/entrepreneur-admin');
        else if (userRole === 'student') router.push('/student-dashboard');
        else router.push('/investor-admin/my-funds');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to complete registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-sm p-8 md:p-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[#1A1C1E] mb-2">Additional Information</h1>
        </div>
        {error && <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h2 className="text-lg font-bold text-[#1A1C1E] mb-6">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600">First Name</label>
                <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleInputChange} disabled={isLoading} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0A2A99] outline-none bg-gray-50/50 text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600">Last Name</label>
                <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} disabled={isLoading} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0A2A99] outline-none bg-gray-50/50 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600">Position <span className="text-red-500">*</span></label>
                <input type="text" name="position" placeholder="Role/Position" value={formData.position} onChange={handleInputChange} disabled={isLoading} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0A2A99] outline-none bg-gray-50/50 text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600">Phone Number</label>
                <div className="flex gap-2">
                  <select name="countryCode" value={formData.countryCode} onChange={handleInputChange} disabled={isLoading} className="w-24 px-2 py-3 rounded-xl border border-gray-200 focus:border-[#0A2A99] outline-none bg-gray-50/50 text-sm text-center">
                    {countryOptions.map((opt) => <option key={opt.code} value={opt.code}>{opt.code} ({opt.callingCode})</option>)}
                  </select>
                  <input type="tel" name="phoneNumber" placeholder="(555) 000-0000" value={formData.phoneNumber} onChange={handleInputChange} disabled={isLoading} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0A2A99] outline-none bg-gray-50/50 text-sm" />
                </div>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1A1C1E] mb-6">Company Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600">Name <span className="text-red-500">*</span></label>
                <input type="text" name="companyName" placeholder="Name of the Company" value={formData.companyName} onChange={handleInputChange} disabled={isLoading} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0A2A99] outline-none bg-gray-50/50 text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600">Size</label>
                <select name="companySize" value={formData.companySize} onChange={handleInputChange} disabled={isLoading} className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0A2A99] outline-none bg-gray-50/50 text-sm ${formData.companySize === '' ? 'text-gray-400' : 'text-black'}`}>
                  <option value="" disabled hidden>Select Number of Employees</option>
                  {companySizes.map((size) => <option key={size} value={size} className="text-black">{size}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600">Type of Company</label>
                <input type="text" name="companyType" placeholder="Type of business" value={formData.companyType} onChange={handleInputChange} disabled={isLoading} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0A2A99] outline-none bg-gray-50/50 text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-600">Entity Type</label>
                <select name="entityType" value={formData.entityType} onChange={handleInputChange} disabled={isLoading} className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0A2A99] outline-none bg-gray-50/50 text-sm ${formData.entityType === '' ? 'text-gray-400' : 'text-black'}`}>
                  <option value="" disabled hidden>Select Type of Entity</option>
                  {entityTypes.map((type) => (
                    <option key={type.value} value={type.value} className="text-black">
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="pt-4">
            <button type="submit" disabled={isLoading} className="w-full bg-[#0A2A99] text-white py-4 rounded-full font-bold text-lg hover:bg-blue-800 transition-all shadow-lg disabled:opacity-50">
              {isLoading ? 'Completing Registration...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdditionalInfoPage;