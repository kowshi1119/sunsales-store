'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validators';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/password/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      // Always show success (don't reveal if email exists)
      setSent(true);
      toast.success(result.message || 'If an account exists, a reset code has been sent.');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    const email = getValues('email');
    return (
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-5 bg-success-50 rounded-2xl flex items-center justify-center">
          <Mail className="h-8 w-8 text-success-600" />
        </div>
        <h2 className="text-display-md font-display text-foreground mb-2">Check Your Email</h2>
        <p className="text-body-md text-muted mb-8">
          If an account exists for <strong className="text-foreground">{email}</strong>, we&apos;ve sent a password reset code.
        </p>
        <Button fullWidth size="lg" onClick={() => router.push(`/verify-otp?email=${encodeURIComponent(email)}&type=password_reset`)}>
          Enter Reset Code
        </Button>
        <button onClick={() => setSent(false)} className="mt-4 text-body-sm font-medium text-muted hover:text-foreground transition-colors">
          Try a different email
        </button>
      </div>
    );
  }

  return (
    <div>
      <Link href="/login" className="inline-flex items-center gap-1.5 text-body-sm font-medium text-muted hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to login
      </Link>

      <div className="mb-8">
        <div className="w-16 h-16 mb-5 bg-primary-50 rounded-2xl flex items-center justify-center">
          <KeyRound className="h-8 w-8 text-primary-500" />
        </div>
        <h2 className="text-display-md font-display text-foreground mb-2">Forgot Password?</h2>
        <p className="text-body-md text-muted">
          No worries! Enter your email and we&apos;ll send you a reset code.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          autoComplete="email"
          autoFocus
          {...register('email')}
        />
        <Button type="submit" fullWidth size="lg" isLoading={isLoading} loadingText="Sending...">
          Send Reset Code
        </Button>
      </form>
    </div>
  );
}
