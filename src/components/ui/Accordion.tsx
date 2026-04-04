'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
  allowMultiple?: boolean;
  defaultOpen?: string[];
}

export default function Accordion({
  items,
  className,
  allowMultiple = false,
  defaultOpen = [],
}: AccordionProps) {
  const [openIds, setOpenIds] = useState<string[]>(defaultOpen);

  const toggle = (id: string) => {
    if (allowMultiple) {
      setOpenIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={cn('divide-y divide-surface-border border-y border-surface-border', className)}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div key={item.id}>
            <button
              onClick={() => toggle(item.id)}
              className="w-full flex items-center justify-between py-4 px-1 text-left group"
              aria-expanded={isOpen}
              aria-controls={`accordion-panel-${item.id}`}
            >
              <span className="text-body-md font-medium text-foreground group-hover:text-primary-600 transition-colors pr-4">
                {item.title}
              </span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-muted flex-shrink-0 transition-transform duration-normal',
                  isOpen && 'rotate-180'
                )}
              />
            </button>
            <div
              id={`accordion-panel-${item.id}`}
              role="region"
              className={cn(
                'overflow-hidden transition-all duration-normal',
                isOpen ? 'max-h-[2000px] opacity-100 pb-4' : 'max-h-0 opacity-0'
              )}
            >
              <div className="px-1 text-body-md text-muted leading-relaxed">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
