import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import AccountSidebar from '@/components/account/AccountSidebar';
import { authOptions } from '@/lib/auth';
import { generateMetadata as buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Customer Account',
  description: 'Manage your Sun Sales orders, saved items, addresses, profile, and account settings.',
  url: '/account',
  noIndex: true,
});

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-background">
      <div className="container-base py-6 md:py-10">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <AccountSidebar
              name={session?.user?.name || 'Sun Sales customer'}
              email={session?.user?.email || 'hello@sunsales.lk'}
              avatar={session?.user?.avatar || null}
            />
          </div>
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
