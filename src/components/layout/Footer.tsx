'use client';

import Link from 'next/link';
import { Sun, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import { FOOTER_LINKS, SOCIAL_LINKS, SITE_NAME } from '@/lib/constants';
import { AnimatedSection } from '@/components/shared/SectionHeading';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary-500 text-white relative overflow-hidden">
      {/* Decorative gradient orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary-400/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="container-base py-12 md:py-16">
          <AnimatedSection>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3 className="text-display-sm font-display text-white mb-1">Stay in the loop</h3>
                <p className="text-body-md text-white/60">
                  Get exclusive deals, new arrivals & styling tips straight to your inbox.
                </p>
              </div>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex w-full md:w-auto"
              >
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 md:w-64 h-12 px-4 bg-white/10 border border-white/20 rounded-l-md text-body-md text-white placeholder:text-white/40 focus:outline-none focus:border-primary-400 transition-colors"
                  required
                />
                <button
                  type="submit"
                  className="h-12 px-6 bg-gradient-to-r from-primary-400 to-accent-coral text-white font-semibold rounded-r-md hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-base py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-accent-coral rounded-xl flex items-center justify-center">
                <Sun className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <span className="font-display text-xl font-bold text-white block leading-tight">Sun Sales</span>
                <span className="text-[10px] text-white/50 font-medium uppercase tracking-widest">Premium Gifts</span>
              </div>
            </Link>
            <p className="text-body-sm text-white/60 mb-5 max-w-xs leading-relaxed">
              Sri Lanka&apos;s premium destination for unique gifts, custom phone covers, and personalized photo frames. Every product tells a story.
            </p>
            <div className="flex items-center gap-3">
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 text-white/70 hover:bg-primary-400 hover:text-white transition-all"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 text-white/70 hover:bg-primary-400 hover:text-white transition-all"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={SOCIAL_LINKS.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 text-white/70 hover:bg-primary-400 hover:text-white transition-all"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-body-sm font-semibold text-white uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.shop.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-body-sm text-white/60 hover:text-primary-300 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-body-sm font-semibold text-white uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-body-sm text-white/60 hover:text-primary-300 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-body-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-body-sm text-white/60 hover:text-primary-300 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-body-sm font-semibold text-white uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-body-sm text-white/60">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary-400" />
                <span>123 Galle Road,<br />Colombo 03, Sri Lanka</span>
              </li>
              <li>
                <a href="tel:+94771234567" className="flex items-center gap-2.5 text-body-sm text-white/60 hover:text-primary-300 transition-colors">
                  <Phone className="h-4 w-4 flex-shrink-0 text-primary-400" />
                  +94 77 123 4567
                </a>
              </li>
              <li>
                <a href="mailto:hello@sunsales.lk" className="flex items-center gap-2.5 text-body-sm text-white/60 hover:text-primary-300 transition-colors">
                  <Mail className="h-4 w-4 flex-shrink-0 text-primary-400" />
                  hello@sunsales.lk
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-base py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-body-xs text-white/40">
            &copy; {currentYear} {SITE_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-body-xs text-white/30">We accept</span>
            <div className="flex items-center gap-2 text-white/50 text-body-xs font-medium">
              <span className="px-2 py-0.5 bg-white/10 rounded">VISA</span>
              <span className="px-2 py-0.5 bg-white/10 rounded">Master</span>
              <span className="px-2 py-0.5 bg-white/10 rounded">PayHere</span>
              <span className="px-2 py-0.5 bg-white/10 rounded">COD</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
