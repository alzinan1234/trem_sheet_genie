"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { verifyEmail, sendVerificationOTP } from '@/services/auth.service';
import toast from 'react-hot-toast';

const OTP_LENGTH = 4;

const VerifyEmailPage: React.FC = () => {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [verifyToken, setVerifyToken] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const email = sessionStorage.getItem('userEmail');
    const token = sessionStorage.getItem('verifyToken');
    if (!email) { router.push('/signup'); return; }
    setUserEmail(email);
    if (token) setVerifyToken(token);
    inputRefs.current[0]?.focus();
  }, [router]);

  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value.replace(/\D/g, '');
    if (!value) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      if (!otp[index] && index > 0) { inputRefs.current[index - 1]?.focus(); }
      newOtp[index] = "";
      setOtp(newOtp);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const newOtp = [...otp];
    pasted.split('').forEach((char, i) => { if (i < OTP_LENGTH) newOtp[i] = char; });
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex(v => !v);
    inputRefs.current[nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCode = otp.join("");
    if (finalCode.length !== OTP_LENGTH) { toast.error(`Please enter a valid ${OTP_LENGTH}-digit code`); return; }
    setIsVerifying(true);
    const toastId = toast.loading('Verifying...');
    try {
      const res = await verifyEmail({ otp: finalCode, verifyEmailToken: verifyToken });
      if (res.success) {
        toast.success('Email verified!', { id: toastId });
        sessionStorage.setItem('emailVerified', 'true');
        if (res.data.nextStep === 'UPDATE_TERM_SHEET_GENIE') router.push('/role-selection');
        else if (res.data.nextStep === 'CREATE_ORGANIZATION') router.push('/additional-info');
        else router.push('/investor-admin/my-funds');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid code. Try again.', { id: toastId });
      setOtp(new Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setIsResending(true);
    const toastId = toast.loading('Sending code...');
    try {
      const res = await sendVerificationOTP({ email: userEmail });
      if (res.success) {
        sessionStorage.setItem('verifyToken', res.data.verifyEmailToken);
        setVerifyToken(res.data.verifyEmailToken);
        setOtp(new Array(OTP_LENGTH).fill(""));
        setCountdown(60); setCanResend(false);
        toast.success('New code sent!', { id: toastId });
        inputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to resend.', { id: toastId });
    } finally {
      setIsResending(false);
    }
  };

  const isComplete = otp.join("").length === OTP_LENGTH;

  return (
    <div className="min-h-screen w-full bg-white overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 h-screen">
        <div className="flex flex-col justify-center items-center px-6 md:px-12 bg-white">
          <div className="w-full max-w-[434px]">
            <div className="mb-10">
              <Link href="/"><img src="/logo/TermSheetGenie.png" alt="TermSheetGenie" className="h-8 w-auto" /></Link>
            </div>
            <div className="mb-8">
              <h1 className="text-[32px] font-bold text-[#1A1C1E] mb-2">Confirm your email</h1>
              <p className="text-gray-500 text-sm">We sent a <strong>{OTP_LENGTH}-digit</strong> code to <strong>{userEmail}</strong></p>
            </div>
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="flex justify-between gap-3" onPaste={handlePaste}>
                {otp.map((data, index) => (
                  <input key={index} type="text" inputMode="numeric" maxLength={1}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    value={data}
                    onChange={(e) => handleChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className={`flex-1 w-1 h-16 text-center text-2xl font-bold border-2 rounded-2xl bg-gray-50/50 outline-none transition-all
                      ${data ? 'border-[#0A2A99] bg-blue-50/30 text-[#0A2A99]' : 'border-gray-200'}
                      focus:border-[#0A2A99] focus:bg-blue-50/30`} />
                ))}
              </div>
              <div className="text-center">
                {canResend ? (
                  <button type="button" onClick={handleResend} disabled={isResending}
                    className="text-[#0A2A99] font-bold text-sm hover:underline disabled:opacity-50">
                    {isResending ? 'Sending...' : 'Resend code'}
                  </button>
                ) : (
                  <p className="text-sm text-gray-400">Resend code in <span className="font-bold text-gray-600">{countdown}s</span></p>
                )}
              </div>
              <button type="submit" disabled={isVerifying || !isComplete}
                className={`w-full py-4 rounded-full font-bold text-lg transition-all active:scale-[0.98] shadow-lg
                  ${isComplete && !isVerifying ? 'bg-[#0A2A99] text-white hover:bg-blue-800 shadow-blue-900/10' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}>
                {isVerifying ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : 'Verify Email'}
              </button>
            </form>
            <p className="text-center text-sm font-medium text-gray-500 mt-10">
              Have an account? <Link href="/login" className="text-[#0A2A99] font-bold hover:underline ml-1">Sign In</Link>
            </p>
          </div>
        </div>
        <div className="hidden md:block relative h-full">
          <div className="w-full h-full overflow-hidden rounded-l-[40px]">
            <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" alt="" className="object-cover w-full h-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
