'use client';

import { useEffect, useState } from 'react';
import { Palette } from 'lucide-react';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  label?: string;
  value: string;
  opacity?: number;
  onChange: (value: { color: string; opacity: number }) => void;
  className?: string;
}

const PRESET_COLORS = [
  { value: '#111827', className: 'bg-slate-900' },
  { value: '#ffffff', className: 'bg-white' },
  { value: '#ef4444', className: 'bg-red-500' },
  { value: '#f97316', className: 'bg-orange-500' },
  { value: '#facc15', className: 'bg-yellow-400' },
  { value: '#22c55e', className: 'bg-green-500' },
  { value: '#06b6d4', className: 'bg-cyan-500' },
  { value: '#3b82f6', className: 'bg-blue-500' },
  { value: '#8b5cf6', className: 'bg-violet-500' },
  { value: '#ec4899', className: 'bg-pink-500' },
  { value: '#7c2d12', className: 'bg-amber-900' },
  { value: '#6b7280', className: 'bg-gray-500' },
] as const;

export default function ColorPicker({ label = 'Color', value, opacity = 1, onChange, className }: ColorPickerProps) {
  const [hexValue, setHexValue] = useState(value);

  useEffect(() => {
    setHexValue(value);
  }, [value]);

  const handleHexChange = (nextColor: string) => {
    setHexValue(nextColor);
    onChange({ color: nextColor, opacity });
  };

  return (
    <div className={cn('space-y-3 rounded-2xl border border-surface-border bg-white p-4', className)}>
      <div className="flex items-center gap-2">
        <Palette className="h-4 w-4 text-primary-500" />
        <p className="text-body-sm font-semibold text-foreground">{label}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => handleHexChange(color.value)}
            className={cn(
              'h-8 w-8 rounded-full border-2 transition-transform hover:scale-105',
              color.className,
              hexValue.toLowerCase() === color.value.toLowerCase() ? 'border-primary-500 ring-2 ring-primary-200' : 'border-surface-border'
            )}
            aria-label={`Select ${color.value} color`}
          />
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-end">
        <label className="inline-flex h-11 w-14 cursor-pointer items-center justify-center rounded-md border border-surface-border bg-surface-card">
          <input
            type="color"
            value={hexValue}
            onChange={(event) => handleHexChange(event.target.value)}
            className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
            aria-label="Pick a custom color"
          />
        </label>

        <Input
          label="Hex value"
          value={hexValue}
          onChange={(event) => setHexValue(event.target.value)}
          onBlur={() => {
            const normalized = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hexValue) ? hexValue : value;
            handleHexChange(normalized);
          }}
          placeholder="#F5A623"
        />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between text-body-xs text-muted">
          <span>Opacity</span>
          <span>{Math.round(opacity * 100)}%</span>
        </div>
        <input
          type="range"
          min={0.1}
          max={1}
          step={0.05}
          value={opacity}
          onChange={(event) => onChange({ color: hexValue, opacity: Number(event.target.value) })}
          className="w-full accent-primary-500"
          aria-label="Adjust opacity"
        />
      </div>
    </div>
  );
}
