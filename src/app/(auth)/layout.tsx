import Link from 'next/link';
import { Sun } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left: Decorative Panel (desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-secondary-500 via-secondary-600 to-secondary-700 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-radial-glow opacity-20 pointer-events-none" />
        <div className="absolute top-20 -right-20 w-72 h-72 bg-primary-400/15 rounded-full blur-[80px]" />
        <div className="absolute bottom-20 -left-20 w-56 h-56 bg-accent-coral/15 rounded-full blur-[80px]" />

        <div className="relative z-10 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-8 bg-gradient-to-br from-primary-400 to-accent-coral rounded-2xl flex items-center justify-center shadow-glow">
            <Sun className="h-8 w-8 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-display-lg text-white mb-4">
            Welcome to Sun Sales
          </h1>
          <p className="text-body-lg text-white/60 leading-relaxed">
            Premium gifts, custom phone covers, and personalized photo frames.
            Every product tells a story.
          </p>
          <div className="mt-10 flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-white/20" />
            ))}
          </div>
        </div>
      </div>

      {/* Right: Auth Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center justify-center gap-2 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-accent-coral rounded-xl flex items-center justify-center">
              <Sun className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-xl font-bold text-foreground">Sun Sales</span>
          </Link>

          {children}
        </div>
      </div>
    </div>
  );
}
