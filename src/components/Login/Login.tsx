"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { login, getMe } from '@/services/auth.service';

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setIsLoading(true);
    try {
      const res = await login({ email, password });

      // 2FA check
      const raw = res as any;
      const dataLevel = raw?.data as any;
      const preAuthToken = dataLevel?.preAuthToken || raw?.preAuthToken;
      const needs2FA =
        dataLevel?.twoFactorRequired === true ||
        raw?.twoFactorRequired === true ||
        !!preAuthToken;

      if (needs2FA && preAuthToken) {
        sessionStorage.setItem('preAuthToken', preAuthToken);
        router.push('/verify-2fa');
        return;
      }

      if (res.success) {
        sessionStorage.setItem('emailVerified', 'true');

        const userData = (res.data as any)?.user as any;
        const userName = `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim();
        if (userName) sessionStorage.setItem('userName', userName);

   
        if (userData?.status === 'PENDING') {
          try {
            const meRes = await getMe();
            const me = (meRes.data as any);
            const nextStep = me?.nextStep;
            const termSheetGenie = me?.termSheetGenie;

            const roleReverseMap: Record<string, string> = {
              'AS_AN_INVESTOR': 'investor',
              'AS_AN_ENTREPRENEUR': 'entrepreneur',
              'AS_A_STUDENT': 'student',
            };

            if (!termSheetGenie || nextStep === 'UPDATE_TERM_SHEET_GENIE') {
             
              router.push('/role-selection');
            } else if (nextStep === 'CREATE_ORGANIZATION') {
            
              sessionStorage.setItem('userRole', roleReverseMap[termSheetGenie] || 'investor');
              router.push('/additional-info');
            } else {
              router.push('/investor-admin/my-funds');
            }
          } catch {
         
            router.push('/role-selection');
          }
        } else {
          router.push('/investor-admin/my-funds');
        }
      }
    } catch (err: any) {
      console.log(err);
      const msg = err?.response?.data?.message;
      if (err?.response?.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(msg || 'Login failed. Please try again.');
      }
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
              <h1 className="text-[32px] font-bold text-[#1A1C1E] mb-2 leading-tight">Welcome back!</h1>
              <p className="text-gray-500 text-sm">Enter your credentials to access your account</p>
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
            )}
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Email address</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0A2A99] focus:ring-1 focus:ring-[#0A2A99] outline-none transition-all placeholder:text-gray-300 bg-gray-50/50"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Password</label>
                  <Link href="/forgot-password" className="text-xs font-bold text-[#0A2A99] hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0A2A99] focus:ring-1 focus:ring-[#0A2A99] outline-none transition-all placeholder:text-gray-300 bg-gray-50/50"
                />
              </div>
              <div className="flex items-center gap-2 py-1">
                <input type="checkbox" id="remember" className="w-4 h-4 rounded border-gray-300 text-[#0A2A99] focus:ring-[#0A2A99]" />
                <label htmlFor="remember" className="text-xs font-medium text-gray-600">Remember this account</label>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0A2A99] text-white py-4 rounded-full font-bold text-lg hover:bg-blue-800 transition-all active:scale-[0.98] shadow-lg shadow-blue-900/10 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Logging in...' : 'Log in'}
              </button>
            </form>
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
              <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <span className="bg-white px-4">Or continue with</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-8">
              <button className="flex items-center justify-center gap-2 border border-gray-200 py-3 rounded-xl hover:bg-gray-50 transition-all font-semibold text-xs text-gray-700">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
                Sign in with Google
              </button>
              <button className="flex items-center justify-center gap-2 border border-gray-200 py-3 rounded-xl hover:bg-gray-50 transition-all font-semibold text-xs text-black">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.03 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.702z"/></svg>
                Sign in with Apple
              </button>
            </div>
            <p className="text-center text-sm font-medium text-gray-500">
              Don't have an account?{' '}
              <Link href="/signup" className="text-[#0A2A99] font-bold hover:underline ml-1">Sign Up</Link>
            </p>
          </div>
        </div>
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
};

export default LoginPage;