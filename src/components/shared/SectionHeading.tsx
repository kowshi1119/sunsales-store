'use client';

import { type ReactNode, Component, type ErrorInfo } from 'react';
import { cn } from '@/lib/utils';
import { useIntersectionObserver } from '@/hooks/useDebounce';
import { MessageCircle, ArrowUp } from 'lucide-react';
import { WHATSAPP_NUMBER } from '@/lib/constants';
import { useEffect, useState } from 'react';

// ============ SECTION HEADING ============
interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeading({ eyebrow, title, description, align = 'center', className }: SectionHeadingProps) {
  return (
    <div className={cn('mb-10 md:mb-14', align === 'center' && 'text-center', className)}>
      {eyebrow && (
        <span className="inline-block text-body-sm font-semibold uppercase tracking-widest text-primary-500 mb-2">
          {eyebrow}
        </span>
      )}
      <h2 className="text-display-md md:text-display-lg font-display text-foreground">
        {title}
      </h2>
      {description && (
        <p className={cn('text-body-lg text-muted mt-3', align === 'center' && 'max-w-2xl mx-auto')}>
          {description}
        </p>
      )}
    </div>
  );
}

// ============ ANIMATED SECTION ============
interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export function AnimatedSection({ children, className, delay = 0, direction = 'up' }: AnimatedSectionProps) {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  const directionMap = {
    up: 'translate-y-8',
    down: '-translate-y-8',
    left: 'translate-x-8',
    right: '-translate-x-8',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-[700ms] ease-smooth',
        isVisible ? 'opacity-100 translate-x-0 translate-y-0' : `opacity-0 ${directionMap[direction]}`,
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ============ WHATSAPP BUTTON ============
export function WhatsAppButton() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(/\+/g, '')}?text=Hi%20Sun%20Sales!%20I%20have%20a%20question.`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-normal md:bottom-8 md:right-8"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" fill="currentColor" />
    </a>
  );
}

// ============ BACK TO TOP ============
export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 left-6 z-40 flex items-center justify-center w-10 h-10 bg-white text-foreground rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-normal border border-surface-border md:bottom-8 md:left-8"
      aria-label="Back to top"
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}

// ============ ERROR BOUNDARY ============
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-error-50 flex items-center justify-center mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-display-sm font-display text-foreground mb-2">Something went wrong</h3>
          <p className="text-body-md text-muted mb-6 max-w-md">
            We encountered an unexpected error. Please try refreshing the page.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="inline-flex items-center px-5 h-10 bg-primary-400 text-white rounded-md font-medium hover:bg-primary-500 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
