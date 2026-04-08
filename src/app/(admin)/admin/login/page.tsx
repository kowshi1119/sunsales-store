import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Sparkles, Store } from 'lucide-react';
import AdminLoginForm from '@/components/admin/AdminLoginForm';
import Button from '@/components/ui/Button';
import { generateMetadata as buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Admin Login',
  description: 'Sign in to the Sun Sales admin workspace to manage orders, products, and store settings.',
  url: '/admin/login',
  noIndex: true,
});

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white md:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 shadow-2xl md:p-8">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Back to storefront
            </Link>

            <div className="mt-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-accent-coral text-slate-950 shadow-lg">
              <ShieldCheck className="h-7 w-7" />
            </div>

            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-primary-300">Sun Sales admin</p>
            <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Control orders, catalog updates, and daily store operations.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
              This secured workspace is reserved for the Sun Sales team. Use it to review orders, approve designs,
              maintain products, and monitor store performance.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-primary-300">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-semibold">Live dashboard</span>
              </div>
              <p className="mt-2 text-sm text-slate-300">Track orders, revenue trends, and production queues in one place.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-primary-300">
                <Store className="h-4 w-4" />
                <span className="text-sm font-semibold">Operational control</span>
              </div>
              <p className="mt-2 text-sm text-slate-300">Update the catalog, resolve support issues, and manage promotions.</p>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <AdminLoginForm />
            <div className="mt-4 text-center">
              <Link href="/">
                <Button variant="ghost" className="text-slate-200 hover:bg-slate-800 hover:text-white">
                  Return to storefront
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
