'use client';

import { FormEvent, useState } from 'react';
import { getSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';

const adminRoles = new Set(['ADMIN', 'SUPER_ADMIN', 'STAFF']);

export default function AdminLoginForm() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (!result) {
        toast.error('Unable to start the admin session. Please try again.');
        return;
      }

      if (result.error) {
        toast.error(result.error === 'UNVERIFIED_EMAIL' ? 'Please verify the email before signing in.' : result.error);
        return;
      }

      const session = await getSession();
      const role = session?.user?.role || '';

      if (!adminRoles.has(role)) {
        await signOut({ redirect: false });
        toast.error('Admin access required.');
        return;
      }

      toast.success('Welcome back. Redirecting to the dashboard...');
      router.push('/admin');
      router.refresh();
    } catch {
      toast.error('Something went wrong while signing in.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-card md:p-8">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
        <ShieldCheck className="h-6 w-6" />
      </div>
      <p className="text-body-sm font-semibold uppercase tracking-widest text-primary-600">Protected area</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Admin sign in</h1>
      <p className="mt-3 text-body-sm text-slate-600">
        Use a staff or administrator account to manage orders, the catalog, and store operations.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          label="Admin username or email"
          type="text"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="username"
          required
          leftIcon={<Mail className="h-4 w-4" />}
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
          leftIcon={<LockKeyhole className="h-4 w-4" />}
        />

        <Button type="submit" fullWidth isLoading={isLoading} loadingText="Signing in...">
          Secure admin login
        </Button>
      </form>

      <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
        Demo access: <span className="font-semibold text-slate-900">admin</span> /{' '}
        <span className="font-semibold text-slate-900">admin123</span>
      </div>
    </div>
  );
}
