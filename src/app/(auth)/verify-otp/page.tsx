'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div className="animate-pulse text-center"><div className="h-14 w-14 mx-auto mb-5 bg-surface-warm rounded-2xl" /><div className="h-7 bg-surface-warm rounded w-48 mx-auto mb-3" /><div className="h-5 bg-surface-warm rounded w-64 mx-auto mb-8" /></div>}>
      <VerifyOTPContent />
    </Suspense>
  );
}

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const type = (searchParams.get('type') as 'verification' | 'password_reset') || 'verification';

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = useCallback(async (code: string) => {
    if (!email) {
      toast.error('Email is missing. Please go back and try again.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, type }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.message || 'Verification failed');
        setOtp(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
        return;
      }
      toast.success(result.message || 'Verified successfully!');
      if (type === 'password_reset') {
        router.push(`/reset-password?token=${result.data?.token}&email=${encodeURIComponent(email)}`);
      } else {
        router.push('/login?verified=true');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [email, type, router]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (newOtp.every((d) => d !== '') && newOtp.join('').length === OTP_LENGTH) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pastedData.length) return;
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) newOtp[i] = pastedData[i];
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex((d) => d === '');
    inputRefs.current[nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty]?.focus();
    if (newOtp.every((d) => d !== '')) handleVerify(newOtp.join(''));
  };

  const handleResend = async () => {
    if (cooldown > 0 || !email) return;
    setIsResending(true);
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type }),
      });
      const result = await res.json();
      if (!res.ok) { toast.error(result.message || 'Failed to resend'); return; }
      toast.success('New code sent to your email.');
      setCooldown(RESEND_COOLDOWN);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch {
      toast.error('Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div className="text-center">
        <h2 className="text-display-md font-display text-foreground mb-3">Missing Email</h2>
        <p className="text-body-md text-muted mb-6">Please try registering again.</p>
        <Link href="/register"><Button>Go to Register</Button></Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/login" className="inline-flex items-center gap-1.5 text-body-sm font-medium text-muted hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to login
      </Link>
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-5 bg-primary-50 rounded-2xl flex items-center justify-center">
          <ShieldCheck className="h-8 w-8 text-primary-500" />
        </div>
        <h2 className="text-display-md font-display text-foreground mb-2">
          {type === 'password_reset' ? 'Reset Code' : 'Verify Your Email'}
        </h2>
        <p className="text-body-md text-muted">
          We sent a 6-digit code to <strong className="text-foreground">{email}</strong>
        </p>
      </div>

      <div className="flex justify-center gap-2.5 mb-8" onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={isLoading}
            className={cn(
              'w-12 h-14 text-center text-xl font-bold font-mono rounded-lg border-2 transition-all duration-fast',
              'focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20',
              'disabled:opacity-50',
              digit ? 'border-primary-300 bg-primary-50/50' : 'border-surface-border bg-white'
            )}
            aria-label={`Digit ${i + 1}`}
          />
        ))}
      </div>

      <Button fullWidth size="lg" isLoading={isLoading} loadingText="Verifying..." disabled={otp.some((d) => d === '')} onClick={() => handleVerify(otp.join(''))}>
        Verify Code
      </Button>

      <div className="mt-6 text-center">
        <p className="text-body-sm text-muted mb-2">Didn&apos;t receive the code?</p>
        <button onClick={handleResend} disabled={cooldown > 0 || isResending} className={cn('inline-flex items-center gap-1.5 text-body-sm font-semibold transition-colors', cooldown > 0 ? 'text-muted-light cursor-not-allowed' : 'text-primary-600 hover:text-primary-700')}>
          <RefreshCw className={cn('h-3.5 w-3.5', isResending && 'animate-spin')} />
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
        </button>
      </div>
    </div>
  );
}
