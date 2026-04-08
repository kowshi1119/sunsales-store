'use client';

import { ChevronDown, ChevronUp, Eye, EyeOff, ImageIcon, Trash2, Type } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DesignElement } from '@/types/customization';

interface LayerManagerProps {
  elements: DesignElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function LayerManager({
  elements,
  selectedId,
  onSelect,
  onMoveUp,
  onMoveDown,
  onToggleVisibility,
  onDelete,
}: LayerManagerProps) {
  if (elements.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-surface-border bg-surface-card p-4 text-body-sm text-muted">
        Your layers will appear here after you add text or images.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {[...elements].slice().reverse().map((element) => {
        const isSelected = element.id === selectedId;
        const isVisible = element.visible !== false;
        const title = element.type === 'text' ? element.text || 'Text Layer' : element.name || 'Image Layer';

        return (
          <div
            key={element.id}
            className={cn(
              'rounded-2xl border bg-white p-3 transition-colors',
              isSelected ? 'border-primary-400 bg-primary-50' : 'border-surface-border'
            )}
          >
            <button
              type="button"
              onClick={() => onSelect(element.id)}
              className="flex w-full items-center gap-3 text-left"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-surface-card text-primary-600">
                {element.type === 'text' ? <Type className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body-sm font-semibold text-foreground">{title}</span>
                <span className="text-body-xs text-muted">{element.type === 'text' ? 'Editable text' : 'Uploaded image'}</span>
              </span>
            </button>

            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => onMoveUp(element.id)} className="rounded-md border border-surface-border px-2 py-1 text-body-xs text-muted hover:bg-surface-warm" aria-label="Move layer up">
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => onMoveDown(element.id)} className="rounded-md border border-surface-border px-2 py-1 text-body-xs text-muted hover:bg-surface-warm" aria-label="Move layer down">
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => onToggleVisibility(element.id)} className="rounded-md border border-surface-border px-2 py-1 text-body-xs text-muted hover:bg-surface-warm" aria-label={isVisible ? 'Hide layer' : 'Show layer'}>
                {isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              </button>
              <button type="button" onClick={() => onDelete(element.id)} className="rounded-md border border-error-200 px-2 py-1 text-body-xs text-error-600 hover:bg-error-50" aria-label="Delete layer">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
