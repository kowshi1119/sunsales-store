'use client';

import { Eraser, Redo2, RotateCcw, Type, Undo2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import ColorPicker from '@/components/customization/ColorPicker';
import ImageUploadArea from '@/components/customization/ImageUploadArea';
import type { ImageQuality, PrintArea } from '@/types/customization';

interface DesignToolbarProps {
  printArea: PrintArea | null;
  backgroundColor: string;
  onAddText: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onDeleteSelected: () => void;
  onReset: () => void;
  onBackgroundColorChange: (color: string) => void;
  onImageReady: (dataUrl: string, quality: ImageQuality, fileName: string) => void;
}

export default function DesignToolbar({
  printArea,
  backgroundColor,
  onAddText,
  onUndo,
  onRedo,
  onDeleteSelected,
  onReset,
  onBackgroundColorChange,
  onImageReady,
}: DesignToolbarProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-surface-border bg-white p-4 shadow-card">
        <p className="mb-3 text-body-sm font-semibold text-foreground">Quick tools</p>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
          <Button type="button" variant="primary" onClick={onAddText} leftIcon={<Type className="h-4 w-4" />}>
            Add Text
          </Button>
          <Button type="button" variant="outline" onClick={onUndo} leftIcon={<Undo2 className="h-4 w-4" />}>
            Undo
          </Button>
          <Button type="button" variant="outline" onClick={onRedo} leftIcon={<Redo2 className="h-4 w-4" />}>
            Redo
          </Button>
          <Button type="button" variant="outline" onClick={onDeleteSelected} leftIcon={<Eraser className="h-4 w-4" />}>
            Delete Selected
          </Button>
          <Button type="button" variant="ghost" onClick={onReset} leftIcon={<RotateCcw className="h-4 w-4" />} className="sm:col-span-2 xl:col-span-1">
            Reset Canvas
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-surface-border bg-white p-4 shadow-card">
        <p className="mb-3 text-body-sm font-semibold text-foreground">Upload artwork</p>
        <ImageUploadArea printArea={printArea} onImageReady={onImageReady} />
      </div>

      <ColorPicker
        label="Canvas background"
        value={backgroundColor}
        opacity={1}
        onChange={({ color }) => onBackgroundColorChange(color)}
      />
    </div>
  );
}
