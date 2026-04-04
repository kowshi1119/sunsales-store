'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/lib/validators';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-surface-warm rounded w-32 mb-2" />
      <div className="h-5 bg-surface-warm rounded w-64 mb-8" />
      <div className="space-y-5">
        <div className="h-[68px] bg-surface-warm rounded" />
        <div className="h-[68px] bg-surface-warm rounded" />
        <div className="h-12 bg-surface-warm rounded" />
      </div>
    </div>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === 'UNVERIFIED_EMAIL') {
          router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
          return;
        }
        toast.error(result.error);
        return;
      }

      toast.success('Welcome back!');
      router.push(callbackUrl);
      router.refresh();
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-display-md font-display text-foreground mb-2">Sign In</h2>
        <p className="text-body-md text-muted">
          Welcome back! Enter your credentials to access your account.
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
          {...register('email')}
        />

        <div>
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            leftIcon={<Lock className="h-4 w-4" />}
            error={errors.password?.message}
            autoComplete="current-password"
            {...register('password')}
          />
          <div className="mt-2 text-right">
            <Link
              href="/forgot-password"
              className="text-body-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" fullWidth size="lg" isLoading={isLoading} loadingText="Signing in...">
          Sign In
        </Button>
      </form>

      <p className="mt-8 text-center text-body-md text-muted">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
          Create one
        </Link>
      </p>
    </div>
  );
}
