'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validators';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Lock, ArrowLeft, Check, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="animate-pulse"><div className="h-14 w-14 mb-5 bg-surface-warm rounded-2xl" /><div className="h-7 bg-surface-warm rounded w-48 mb-2" /><div className="h-5 bg-surface-warm rounded w-64 mb-8" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, watch, setError, formState: { errors } } = useForm<ResetPasswordInput>({
    defaultValues: { token },
  });

  const password = watch('password', '');
  const checks = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
  ];

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsLoading(true);

    const parsed = resetPasswordSchema.safeParse(data);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (typeof field === 'string') {
          setError(field as keyof ResetPasswordInput, { type: 'manual', message: issue.message });
        }
      });
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...parsed.data, email }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.message || 'Failed to reset password.');
        return;
      }
      setSuccess(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <h2 className="text-display-md font-display text-foreground mb-3">Invalid Link</h2>
        <p className="text-body-md text-muted mb-6">This reset link is invalid or has expired.</p>
        <Link href="/forgot-password"><Button>Request New Link</Button></Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-5 bg-success-50 rounded-2xl flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-success-600" />
        </div>
        <h2 className="text-display-md font-display text-foreground mb-2">Password Reset!</h2>
        <p className="text-body-md text-muted mb-8">Your password has been updated successfully. You can now sign in.</p>
        <Link href="/login"><Button fullWidth size="lg">Sign In</Button></Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/login" className="inline-flex items-center gap-1.5 text-body-sm font-medium text-muted hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to login
      </Link>
      <div className="mb-8">
        <h2 className="text-display-md font-display text-foreground mb-2">Set New Password</h2>
        <p className="text-body-md text-muted">Create a strong password for your account.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <input type="hidden" {...register('token')} />

        <div>
          <Input
            label="New Password"
            type="password"
            placeholder="Enter new password"
            leftIcon={<Lock className="h-4 w-4" />}
            error={errors.password?.message}
            autoComplete="new-password"
            {...register('password')}
          />
          {password.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {checks.map((c) => (
                <div key={c.label} className="flex items-center gap-1.5">
                  <div className={cn('w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors', c.met ? 'bg-success-500' : 'bg-surface-border')}>
                    {c.met && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                  </div>
                  <span className={cn('text-body-xs', c.met ? 'text-success-600' : 'text-muted-light')}>{c.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm new password"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
          {...register('confirmPassword')}
        />

        <Button type="submit" fullWidth size="lg" isLoading={isLoading} loadingText="Resetting...">
          Reset Password
        </Button>
      </form>
    </div>
  );
}
