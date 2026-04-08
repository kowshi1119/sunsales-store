import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';
import SearchBar from '@/components/layout/SearchBar';
import MobileNav from '@/components/layout/MobileNav';
import { BackToTop, WhatsAppButton } from '@/components/shared/SectionHeading';

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
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
