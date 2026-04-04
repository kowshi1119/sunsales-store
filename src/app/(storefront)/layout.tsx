import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';
import SearchBar from '@/components/layout/SearchBar';
import MobileNav from '@/components/layout/MobileNav';
import { WhatsAppButton, BackToTop } from '@/components/shared/SectionHeading';

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <CartDrawer />
      <SearchBar />
      <MobileNav />
      <WhatsAppButton />
      <BackToTop />
    </div>
  );
}
