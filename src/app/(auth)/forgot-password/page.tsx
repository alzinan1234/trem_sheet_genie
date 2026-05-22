"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { forgotPassword, verifyForgotPasswordOTP, resetPassword } from '@/services/auth.service';

type Step = 'request' | 'verify' | 'reset';

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const [resetToken, setResetToken] = useState('');

  // Timer for OTP resend
  useEffect(() => {
    if (step !== 'verify' || timeLeft <= 0) {
      if (timeLeft <= 0) setCanResend(true);
      return;
    }
    
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [step, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Step 1: Send OTP (সঠিকভাবে resetToken সংরক্ষণ)
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await forgotPassword({ email });
      
      console.log('Forgot password response:', res);
      
      if (res.success) {
        // সংরক্ষণ করুন resetToken যা ব্যাকএন্ড থেকে এসেছে
        if (res.data?.resetToken) {
          sessionStorage.setItem('resetToken', res.data.resetToken);
          setResetToken(res.data.resetToken);
          console.log('Reset token saved:', res.data.resetToken);
        }
        
        setSuccess('4-digit OTP sent to your email!');
        sessionStorage.setItem('resetEmail', email);
        setStep('verify');
        setTimeLeft(300);
        setCanResend(false);
        setOtp(['', '', '', '']);
      } else {
        setError(res.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err: any) {
      console.error('Send OTP error:', err);
      const msg = err?.response?.data?.message;
      setError(msg || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP (OTP + টোকেন উভয়ই পাঠানো হচ্ছে)
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const otpValue = otp.join('');
    if (otpValue.length !== 4) {
      setError('Please enter the complete 4-digit OTP');
      return;
    }
    
    // চেক করুন resetToken আছে কিনা
    const storedToken = resetToken || sessionStorage.getItem('resetToken');
    
    if (!storedToken) {
      setError('Session expired. Please request OTP again.');
      setStep('request');
      return;
    }
    
    setIsLoading(true);
    try {
      // OTP এবং টোকেন উভয়ই পাঠানো হচ্ছে
      const res = await verifyForgotPasswordOTP({
        otp: otpValue,
        email: email,
      });
      
      console.log('Verify OTP response:', res);
      
      if (res.success) {
        // ভেরিফিকেশন সফল হলে রিসেট পাসওয়ার্ড স্টেপে যান
        setStep('reset');
        setError('');
        setSuccess('OTP verified successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(res.message || 'Invalid OTP. Please try again.');
      }
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      const msg = err?.response?.data?.message;
      setError(msg || 'Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setError('');
    setIsLoading(true);
    try {
      const res = await forgotPassword({ email });
      
      if (res.success) {
        // নতুন resetToken সংরক্ষণ করুন
        if (res.data?.resetToken) {
          sessionStorage.setItem('resetToken', res.data.resetToken);
          setResetToken(res.data.resetToken);
        }
        
        setTimeLeft(300);
        setCanResend(false);
        setOtp(['', '', '', '']);
        setSuccess('New 4-digit OTP sent to your email!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(res.message || 'Failed to resend OTP.');
      }
    } catch (err: any) {
      console.error('Resend OTP error:', err);
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (!/[A-Z]/.test(newPassword)) {
      setError('Password must contain at least one uppercase letter');
      return;
    }
    
    if (!/[a-z]/.test(newPassword)) {
      setError('Password must contain at least one lowercase letter');
      return;
    }
    
    if (!/[0-9]/.test(newPassword)) {
      setError('Password must contain at least one number');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    const storedToken = resetToken || sessionStorage.getItem('resetToken');
    
    if (!storedToken) {
      setError('Session expired. Please request OTP again.');
      setStep('request');
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await resetPassword({
        newPassword,
        confirmPassword,
        resetToken: storedToken,
      });
      
      console.log('Reset password response:', res);
      
      if (res.success) {
        sessionStorage.removeItem('resetEmail');
        sessionStorage.removeItem('resetToken');
        router.push('/login?reset=success');
      } else {
        setError(res.message || 'Failed to reset password. Please try again.');
      }
    } catch (err: any) {
      console.error('Reset password error:', err);
      const msg = err?.response?.data?.message;
      setError(msg || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // OTP input handlers
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const pastedDigits = pastedData.slice(0, 4).split('');
    
    if (pastedDigits.length === 4 && pastedDigits.every(d => /^\d$/.test(d))) {
      const newOtp = [...otp];
      pastedDigits.forEach((digit, idx) => {
        if (idx < 4) newOtp[idx] = digit;
      });
      setOtp(newOtp);
      
      const lastInput = document.getElementById(`otp-3`);
      lastInput?.focus();
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

            {/* Step 1: Request OTP */}
            {step === 'request' && (
              <>
                <div className="mb-8">
                  <h1 className="text-[32px] font-bold text-[#1A1C1E] mb-2 leading-tight">Forgot Password?</h1>
                  <p className="text-gray-500 text-sm">Enter your email to receive a 4-digit password reset OTP</p>
                </div>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm">
                    {success}
                  </div>
                )}
                
                <form className="space-y-5" onSubmit={handleSendOTP}>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Email address
                    </label>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0A2A99] focus:ring-1 focus:ring-[#0A2A99] outline-none transition-all placeholder:text-gray-300 bg-gray-50/50"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#0A2A99] text-white py-4 rounded-full font-bold text-lg hover:bg-blue-800 transition-all active:scale-[0.98] shadow-lg shadow-blue-900/10 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Sending OTP...' : 'Send Reset OTP'}
                  </button>
                </form>
              </>
            )}

            {/* Step 2: Verify OTP */}
            {step === 'verify' && (
              <>
                <div className="mb-8">
                  <h1 className="text-[32px] font-bold text-[#1A1C1E] mb-2 leading-tight">Verify OTP</h1>
                  <p className="text-gray-500 text-sm">
                    We've sent a 4-digit verification code to <strong>{email}</strong>
                  </p>
                </div>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm">
                    {success}
                  </div>
                )}
                
                <form onSubmit={handleVerifyOTP}>
                  <div className="space-y-6">
                    <div className="flex gap-4 justify-between" onPaste={handlePaste}>
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-16 h-16 text-center text-2xl font-bold rounded-xl border border-gray-200 focus:border-[#0A2A99] focus:ring-1 focus:ring-[#0A2A99] outline-none transition-all bg-gray-50/50"
                        />
                      ))}
                    </div>
                    
                    <div className="text-center">
                      {!canResend ? (
                        <p className="text-sm text-gray-500">
                          Resend code in <span className="font-bold text-[#0A2A99]">{formatTime(timeLeft)}</span>
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOTP}
                          disabled={isLoading}
                          className="text-sm text-[#0A2A99] font-bold hover:underline"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#0A2A99] text-white py-4 rounded-full font-bold text-lg hover:bg-blue-800 transition-all active:scale-[0.98] shadow-lg shadow-blue-900/10 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Step 3: Reset Password */}
            {step === 'reset' && (
              <>
                <div className="mb-8">
                  <h1 className="text-[32px] font-bold text-[#1A1C1E] mb-2 leading-tight">Set New Password</h1>
                  <p className="text-gray-500 text-sm">Create a strong password for your account</p>
                </div>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {error}
                  </div>
                )}
                
                <form className="space-y-5" onSubmit={handleResetPassword}>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0A2A99] focus:ring-1 focus:ring-[#0A2A99] outline-none transition-all placeholder:text-gray-300 bg-gray-50/50 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Confirm Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#0A2A99] focus:ring-1 focus:ring-[#0A2A99] outline-none transition-all placeholder:text-gray-300 bg-gray-50/50"
                    />
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                    <p className="text-xs font-semibold text-gray-600">Password requirements:</p>
                    <ul className="text-xs text-gray-500 space-y-1">
                      <li className={newPassword.length >= 8 ? 'text-green-600' : ''}>
                        • At least 8 characters
                      </li>
                      <li className={/[A-Z]/.test(newPassword) ? 'text-green-600' : ''}>
                        • One uppercase letter
                      </li>
                      <li className={/[a-z]/.test(newPassword) ? 'text-green-600' : ''}>
                        • One lowercase letter
                      </li>
                      <li className={/[0-9]/.test(newPassword) ? 'text-green-600' : ''}>
                        • One number
                      </li>
                    </ul>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#0A2A99] text-white py-4 rounded-full font-bold text-lg hover:bg-blue-800 transition-all active:scale-[0.98] shadow-lg shadow-blue-900/10 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Resetting Password...' : 'Reset Password'}
                  </button>
                </form>
              </>
            )}

            <div className="mt-6 text-center">
              <Link href="/login" className="text-[#0A2A99] font-bold hover:underline text-sm">
                ← Back to Login
              </Link>
            </div>
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

export default ForgotPasswordPage;