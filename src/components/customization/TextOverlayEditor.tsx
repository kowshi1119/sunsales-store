'use client';

import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Underline } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ColorPicker from '@/components/customization/ColorPicker';
import FontPicker from '@/components/customization/FontPicker';
import { cn } from '@/lib/utils';
import type { DesignElement } from '@/types/customization';

interface TextOverlayEditorProps {
  element: DesignElement | null;
  onChange: (updates: Partial<DesignElement>) => void;
}

export default function TextOverlayEditor({ element, onChange }: TextOverlayEditorProps) {
  if (!element || element.type !== 'text') {
    return (
      <div className="rounded-2xl border border-dashed border-surface-border bg-surface-card p-4 text-body-sm text-muted">
        Select a text layer to edit its content, font, style, and alignment.
      </div>
    );
  }

  const textAlign = element.textAlign ?? 'center';
  const fontColor = element.fontColor ?? '#111827';

  return (
    <div className="space-y-4">
      <Input
        label="Text content"
        value={element.text ?? ''}
        onChange={(event) => onChange({ text: event.target.value })}
        placeholder="Your Text"
      />

      <FontPicker value={element.fontFamily ?? 'Arial'} onChange={(font) => onChange({ fontFamily: font })} />

      <div className="rounded-2xl border border-surface-border bg-white p-4">
        <div className="mb-2 flex items-center justify-between text-body-sm text-foreground">
          <span className="font-semibold">Font size</span>
          <span>{Math.round(element.fontSize ?? 24)}px</span>
        </div>
        <input
          type="range"
          min={12}
          max={72}
          step={1}
          value={element.fontSize ?? 24}
          onChange={(event) => onChange({ fontSize: Number(event.target.value) })}
          className="w-full accent-primary-500"
          aria-label="Adjust text size"
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <Button
          type="button"
          variant={(element.fontWeight ?? 'normal') === 'bold' ? 'primary' : 'outline'}
          onClick={() => onChange({ fontWeight: (element.fontWeight ?? 'normal') === 'bold' ? 'normal' : 'bold' })}
          leftIcon={<Bold className="h-4 w-4" />}
        >
          Bold
        </Button>
        <Button
          type="button"
          variant={(element.fontStyle ?? 'normal') === 'italic' ? 'primary' : 'outline'}
          onClick={() => onChange({ fontStyle: (element.fontStyle ?? 'normal') === 'italic' ? 'normal' : 'italic' })}
          leftIcon={<Italic className="h-4 w-4" />}
        >
          Italic
        </Button>
        <Button
          type="button"
          variant={element.underline ? 'primary' : 'outline'}
          onClick={() => onChange({ underline: !element.underline })}
          leftIcon={<Underline className="h-4 w-4" />}
        >
          Underline
        </Button>
      </div>

      <div className="rounded-2xl border border-surface-border bg-white p-4">
        <p className="mb-2 text-body-sm font-semibold text-foreground">Text alignment</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'left', icon: AlignLeft, label: 'Left' },
            { value: 'center', icon: AlignCenter, label: 'Center' },
            { value: 'right', icon: AlignRight, label: 'Right' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ textAlign: option.value as 'left' | 'center' | 'right' })}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-body-sm transition-colors',
                textAlign === option.value
                  ? 'border-primary-400 bg-primary-50 text-primary-700'
                  : 'border-surface-border hover:border-primary-300 hover:bg-surface-warm'
              )}
            >
              <option.icon className="h-4 w-4" />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <ColorPicker
        label="Text color"
        value={fontColor}
        opacity={element.opacity ?? 1}
        onChange={({ color, opacity }) => onChange({ fontColor: color, opacity })}
      />
    </div>
  );
}
