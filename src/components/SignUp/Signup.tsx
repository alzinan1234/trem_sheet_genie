"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { register } from '@/services/auth.service';
import { sendVerificationOTP } from '@/services/auth.service';

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  termsAccepted: boolean;
}

const SignupPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<SignupFormData>({ name: '', email: '', password: '', termsAccepted: false });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!formData.name || !formData.email || !formData.password) { setError('Please fill in all fields'); return; }
    if (!formData.termsAccepted) { setError('Please accept the terms & policy'); return; }
    setIsLoading(true);
    try {
      const res = await register({ name: formData.name, email: formData.email, password: formData.password });
      if (res.success) {
        // register() already triggers OTP — do NOT call sendVerificationOTP again
        const token = (res.data as any)?.verifyEmailToken || (res.data as any)?.verifyToken || '';
        sessionStorage.setItem('verifyToken', token);
        sessionStorage.setItem('userEmail', formData.email);
        sessionStorage.setItem('userName', formData.name);
        router.push('/email-verification');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 h-screen">
        <div className="flex flex-col justify-center items-center px-6 md:px-12 bg-white">
          <div className="w-full max-w-[434px]">
            <div className="mb-10">
              <Link href="/" className="flex items-center gap-2">
                <img src="/logo/TermSheetGenie.png" alt="TermSheetGenie" className="h-8 w-auto" />
              </Link>
            </div>
            <div className="mb-8">
              <h1 className="text-[32px] font-bold text-[#1A1C1E] mb-2 leading-tight">Create your account</h1>
              <p className="text-gray-500 text-sm">Join TermSheetGenie to manage your investments</p>
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
            )}
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Full Name</label>
                <input type="text" name="name" placeholder="Enter your full name" value={formData.name} onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0A2A99] focus:ring-1 focus:ring-[#0A2A99] outline-none transition-all placeholder:text-gray-300 bg-gray-50/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Email address</label>
                <input type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0A2A99] focus:ring-1 focus:ring-[#0A2A99] outline-none transition-all placeholder:text-gray-300 bg-gray-50/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Password</label>
                <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0A2A99] focus:ring-1 focus:ring-[#0A2A99] outline-none transition-all placeholder:text-gray-300 bg-gray-50/50" />
              </div>
              <div className="flex items-center gap-2 py-1">
                <input type="checkbox" id="terms" name="termsAccepted" checked={formData.termsAccepted} onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-300 text-[#0A2A99] focus:ring-[#0A2A99]" />
                <label htmlFor="terms" className="text-xs font-medium text-gray-600">
                  I agree to the <Link href="/terms" className="text-[#0A2A99] font-bold hover:underline">Terms</Link> &amp; <Link href="/privacy" className="text-[#0A2A99] font-bold hover:underline">Privacy Policy</Link>
                </label>
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full bg-[#0A2A99] text-white py-4 rounded-full font-bold text-lg hover:bg-blue-800 transition-all active:scale-[0.98] shadow-lg shadow-blue-900/10 disabled:opacity-60 disabled:cursor-not-allowed">
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
            <p className="text-center text-sm font-medium text-gray-500 mt-8">
              Already have an account? <Link href="/login" className="text-[#0A2A99] font-bold hover:underline ml-1">Log in</Link>
            </p>
          </div>
        </div>
        <div className="hidden md:block relative h-full">
          <div className="w-full h-full overflow-hidden rounded-l-[40px]">
            <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" alt="Modern Skyscrapers" className="object-cover w-full h-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;