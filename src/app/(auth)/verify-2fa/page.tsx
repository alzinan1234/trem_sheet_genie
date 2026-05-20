"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { verifyLoginOTP } from '@/services/auth.service';

export default function Verify2FAPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [preAuthToken, setPreAuthToken] = useState('');
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const token = sessionStorage.getItem('preAuthToken');
    if (!token) {
      router.replace('/login');
      return;
    }
    setPreAuthToken(token);
    inputs.current[0]?.focus();
  }, [router]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
    // Auto-submit when all 6 digits entered
    if (value && index === 5) {
      const code = [...newOtp.slice(0, 5), value.slice(-1)].join('');
      if (code.length === 6) submitOTP(code);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      submitOTP(pasted);
    }
  };

  const submitOTP = async (code: string) => {
    if (!preAuthToken) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await verifyLoginOTP({ otp: code, preAuthToken });
      if (res.success) {
        sessionStorage.removeItem('preAuthToken');
        router.push('/investor-admin/my-funds');
      }
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401 || status === 400) {
        setError('Invalid or expired code. Please try again.');
      } else {
        setError(err?.response?.data?.message || 'Verification failed. Please try again.');
      }
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { setError('Please enter all 6 digits'); return; }
    submitOTP(code);
  };

  return (
    <div className="min-h-screen w-full bg-white overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 h-screen">

        {/* Left panel */}
        <div className="flex flex-col justify-center items-center px-6 md:px-12 bg-white">
          <div className="w-full max-w-[434px]">

            {/* Logo */}
            <div className="mb-10">
              <Link href="/" className="flex items-center gap-2">
                <img src="/logo/TermSheetGenie.png" alt="TermSheetGenie" className="h-8 w-auto" />
              </Link>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-[32px] font-bold text-[#1A1C1E] mb-2 leading-tight">
                Two-factor authentication
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed">
                A 6-digit verification code has been sent to your email address. Enter it below to continue.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* OTP form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-3">
                  Verification Code
                </label>
                <div className="flex gap-3 justify-between" onPaste={handlePaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { inputs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleChange(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                      disabled={isLoading}
                      className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all
                        ${digit ? 'border-[#0A2A99] bg-blue-50 text-[#0A2A99]' : 'border-gray-200 bg-gray-50 text-gray-900'}
                        focus:border-[#0A2A99] focus:ring-2 focus:ring-[#0A2A99]/10
                        disabled:opacity-50`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.join('').length < 6}
                className="w-full bg-[#0A2A99] text-white py-4 rounded-full font-bold text-lg hover:bg-blue-800 transition-all active:scale-[0.98] shadow-lg shadow-blue-900/10 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Verify & Sign In'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Didn't receive the code?{' '}
              <button
                onClick={() => { sessionStorage.removeItem('preAuthToken'); router.push('/login'); }}
                className="text-[#0A2A99] font-bold hover:underline"
              >
                Go back to login
              </button>
            </p>
          </div>
        </div>

        {/* Right panel — same image as login */}
        <div className="hidden md:block relative h-full">
          <div className="w-full h-full overflow-hidden rounded-l-[40px]">
            <img
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
              alt="Modern Skyscrapers"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}