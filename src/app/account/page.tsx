import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { Package, UserCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { authOptions } from '@/lib/auth';
import { generateMetadata as buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'My Account',
  description: 'Manage your Sun Sales account, saved items, and upcoming orders.',
  url: '/account',
  noIndex: true,
});

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name || 'Sun Sales customer';

  return (
    <div className="min-h-screen bg-background">
      <div className="container-base py-8 md:py-12">
        <div className="max-w-3xl rounded-3xl border border-surface-border bg-white p-6 shadow-card md:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
              <UserCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-body-sm font-semibold uppercase tracking-wider text-primary-500">Account</p>
              <h1 className="text-display-md font-display text-foreground">Welcome back, {userName}</h1>
            </div>
          </div>

          <p className="mt-4 max-w-2xl text-body-md text-muted">
            Your protected account route is now live. This page can safely expand into order history, saved addresses, and profile settings next without returning a 404.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/wishlist">
              <Button>View Wishlist</Button>
            </Link>
            <Link href="/shop">
              <Button variant="outline" leftIcon={<Package className="h-4 w-4" />}>
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
