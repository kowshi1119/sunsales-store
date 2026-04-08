'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface FontPickerProps {
  value: string;
  onChange: (font: string) => void;
  className?: string;
}

const FONT_OPTIONS = [
  'Arial',
  'Helvetica',
  'Georgia',
  'Times New Roman',
  'Verdana',
  'Trebuchet MS',
  'Courier New',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Playfair Display',
  'Merriweather',
  'Oswald',
  'Pacifico',
  'Bebas Neue',
  'Inter',
];

export default function FontPicker({ value, onChange, className }: FontPickerProps) {
  const [query, setQuery] = useState('');

  const visibleFonts = useMemo(() => {
    if (!query.trim()) return FONT_OPTIONS;
    return FONT_OPTIONS.filter((font) => font.toLowerCase().includes(query.trim().toLowerCase()));
  }, [query]);

  return (
    <div className={cn('space-y-3 rounded-2xl border border-surface-border bg-white p-4', className)}>
      <Input
        label="Font family"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search fonts"
        leftIcon={<Search className="h-4 w-4" />}
      />

      <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
        {visibleFonts.map((font) => {
          const isActive = value === font;
          return (
            <button
              key={font}
              type="button"
              onClick={() => onChange(font)}
              className={cn(
                'flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition-colors',
                isActive
                  ? 'border-primary-400 bg-primary-50 text-primary-700'
                  : 'border-surface-border hover:border-primary-300 hover:bg-surface-warm'
              )}
            >
              <span className="text-body-md text-foreground">
                {font}
              </span>
              {isActive && <span className="text-body-xs font-semibold">Selected</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
