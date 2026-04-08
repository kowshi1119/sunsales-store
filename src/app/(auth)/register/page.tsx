'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { registerSchema, type RegisterInput } from '@/lib/validators';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Mail, Lock, User, Phone, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<RegisterInput>({
    defaultValues: { acceptTerms: false as unknown as true },
  });

  const password = watch('password', '');
  const passwordChecks = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
  ];

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);

    const parsed = registerSchema.safeParse(data);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (typeof field === 'string') {
          setError(field as keyof RegisterInput, { type: 'manual', message: issue.message });
        }
      });
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || 'Registration failed');
        return;
      }

      toast.success('Account created! Check your email for the verification code.');
      router.push(`/verify-otp?email=${encodeURIComponent(parsed.data.email)}`);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-display-md font-display text-foreground mb-2">Create Account</h2>
        <p className="text-body-md text-muted">
          Join Sun Sales and start shopping for premium gifts.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Full Name"
          placeholder="John Doe"
          leftIcon={<User className="h-4 w-4" />}
          error={errors.fullName?.message}
          autoComplete="name"
          required
          {...register('fullName')}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          autoComplete="email"
          required
          {...register('email')}
        />

        <Input
          label="Phone Number"
          type="tel"
          placeholder="+94 7X XXX XXXX"
          leftIcon={<Phone className="h-4 w-4" />}
          error={errors.phone?.message}
          hint="Sri Lankan format: +94XXXXXXXXX or 0XXXXXXXXX"
          autoComplete="tel"
          required
          {...register('phone')}
        />

        <div>
          <Input
            label="Password"
            type="password"
            placeholder="Create a strong password"
            leftIcon={<Lock className="h-4 w-4" />}
            error={errors.password?.message}
            autoComplete="new-password"
            required
            {...register('password')}
          />
          {password.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {passwordChecks.map((check) => (
                <div key={check.label} className="flex items-center gap-1.5">
                  <div className={cn(
                    'w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors',
                    check.met ? 'bg-success-500' : 'bg-surface-border'
                  )}>
                    {check.met && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                  </div>
                  <span className={cn(
                    'text-body-xs transition-colors',
                    check.met ? 'text-success-600' : 'text-muted-light'
                  )}>
                    {check.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Terms checkbox */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 w-4 h-4 rounded border-surface-border text-primary-400 focus:ring-primary-400/30 cursor-pointer"
            {...register('acceptTerms')}
          />
          <span className="text-body-sm text-muted">
            I agree to the{' '}
            <Link href="/terms" className="text-primary-600 hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy-policy" className="text-primary-600 hover:underline">Privacy Policy</Link>
          </span>
        </label>
        {errors.acceptTerms && (
          <p className="text-body-xs text-error-500 -mt-2">{errors.acceptTerms.message}</p>
        )}

        <Button type="submit" fullWidth size="lg" isLoading={isLoading} loadingText="Creating account...">
          Create Account
        </Button>
      </form>

      <p className="mt-8 text-center text-body-md text-muted">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
