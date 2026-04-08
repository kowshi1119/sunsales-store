'use client';

import Image from 'next/image';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Layers3, Move } from 'lucide-react';
import { Spinner } from '@/components/ui/Skeleton';
import { useCustomizerStore } from '@/stores/customizerStore';
import { cn } from '@/lib/utils';
import type { DesignData, DesignElement, PrintArea } from '@/types/customization';

type FabricModule = typeof import('fabric');
type FabricCanvas = import('fabric').Canvas;
type FabricObject = import('fabric').FabricObject;

interface CanvasObjectData {
  id: string;
  type: 'image' | 'text';
  imageUrl?: string;
  name?: string;
  isDesign: true;
}

type CanvasObject = FabricObject & {
  data?: Partial<CanvasObjectData>;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fill?: string;
  fontWeight?: string | number;
  fontStyle?: string;
  underline?: boolean;
  textAlign?: 'left' | 'center' | 'right';
};

export interface LivePreviewCanvasHandle {
  addText: () => void;
  addImage: (dataUrl: string, fileName?: string) => Promise<void>;
  removeSelected: () => void;
  clearCanvas: () => void;
  undo: () => void;
  redo: () => void;
  exportPreview: () => string | null;
  updateSelectedText: (updates: Partial<DesignElement>) => void;
  selectLayer: (id: string) => void;
  toggleVisibility: (id: string) => void;
  moveLayerUp: (id: string) => void;
  moveLayerDown: (id: string) => void;
}

interface LivePreviewCanvasProps {
  mockupImage: string;
  printArea: PrintArea;
  className?: string;
}

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 700;

function createSnapshot(
  elements: DesignElement[],
  backgroundColor: string,
  printArea: PrintArea
): DesignData {
  return {
    elements,
    backgroundColor,
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    printArea,
  };
}

function generateId(prefix: 'text' | 'image') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const LivePreviewCanvas = forwardRef<LivePreviewCanvasHandle, LivePreviewCanvasProps>(
  function LivePreviewCanvas({ mockupImage, printArea, className }, ref) {
    const canvasElementRef = useRef<HTMLCanvasElement | null>(null);
    const fabricCanvasRef = useRef<FabricCanvas | null>(null);
    const fabricModuleRef = useRef<FabricModule | null>(null);
    const restoringRef = useRef(false);
    const [isReady, setIsReady] = useState(false);

    const {
      elements,
      backgroundColor,
      selectedElementId,
      setElements,
      selectElement,
      setBackgroundColor,
      setCanvasSize,
      setPrintArea,
      pushHistory,
      undo: undoStore,
      redo: redoStore,
    } = useCustomizerStore((state) => ({
      elements: state.elements,
      backgroundColor: state.backgroundColor,
      selectedElementId: state.selectedElementId,
      setElements: state.setElements,
      selectElement: state.selectElement,
      setBackgroundColor: state.setBackgroundColor,
      setCanvasSize: state.setCanvasSize,
      setPrintArea: state.setPrintArea,
      pushHistory: state.pushHistory,
      undo: state.undo,
      redo: state.redo,
    }));

    const syncCanvasState = useCallback(
      (recordHistory: boolean) => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        const serialized = canvas
          .getObjects()
          .filter((object) => Boolean((object as CanvasObject).data?.isDesign))
          .map((object, index) => {
            const layer = object as CanvasObject;
            const width = typeof layer.getScaledWidth === 'function' ? layer.getScaledWidth() : layer.width ?? 0;
            const height = typeof layer.getScaledHeight === 'function' ? layer.getScaledHeight() : layer.height ?? 0;

            return {
              id: layer.data?.id ?? generateId('text'),
              type: layer.data?.type ?? 'text',
              x: layer.left ?? 0,
              y: layer.top ?? 0,
              width,
              height,
              rotation: layer.angle ?? 0,
              opacity: layer.opacity ?? 1,
              visible: layer.visible,
              scaleX: layer.scaleX ?? 1,
              scaleY: layer.scaleY ?? 1,
              zIndex: index,
              name: layer.data?.name,
              imageUrl: layer.data?.imageUrl,
              text: layer.text,
              fontFamily: layer.fontFamily,
              fontSize: layer.fontSize,
              fontColor: typeof layer.fill === 'string' ? layer.fill : undefined,
              fontWeight: typeof layer.fontWeight === 'number' ? String(layer.fontWeight) : layer.fontWeight,
              fontStyle: layer.fontStyle === 'italic' ? 'italic' : 'normal',
              underline: layer.underline,
              textAlign: layer.textAlign,
            } satisfies DesignElement;
          });

        setElements(serialized);
        const activeObject = canvas.getActiveObject() as CanvasObject | undefined;
        selectElement(activeObject?.data?.id ?? null);

        const nextBackground = typeof canvas.backgroundColor === 'string' ? canvas.backgroundColor : backgroundColor;
        setBackgroundColor(nextBackground);

        if (recordHistory && !restoringRef.current) {
          pushHistory(createSnapshot(serialized, nextBackground, printArea));
        }
      },
      [backgroundColor, printArea, pushHistory, selectElement, setBackgroundColor, setElements]
    );

    const createClipPath = useCallback(() => {
      const module = fabricModuleRef.current;
      if (!module) return null;
      return new module.Rect({
        left: printArea.x,
        top: printArea.y,
        width: printArea.width,
        height: printArea.height,
        absolutePositioned: true,
      });
    }, [printArea]);

    const constrainObject = useCallback(
      (object: CanvasObject) => {
        const width = typeof object.getScaledWidth === 'function' ? object.getScaledWidth() : object.width ?? 0;
        const height = typeof object.getScaledHeight === 'function' ? object.getScaledHeight() : object.height ?? 0;
        const minLeft = printArea.x;
        const minTop = printArea.y;
        const maxLeft = printArea.x + printArea.width - width;
        const maxTop = printArea.y + printArea.height - height;

        object.set({
          left: Math.min(Math.max(object.left ?? 0, minLeft), maxLeft),
          top: Math.min(Math.max(object.top ?? 0, minTop), maxTop),
        });
        object.setCoords();
      },
      [printArea]
    );

    const rebuildFromSnapshot = useCallback(
      async (snapshot: DesignData | null) => {
        const canvas = fabricCanvasRef.current;
        const module = fabricModuleRef.current;
        if (!canvas || !module || !snapshot) {
          return;
        }

        restoringRef.current = true;

        const currentObjects = canvas.getObjects().filter((object) => Boolean((object as CanvasObject).data?.isDesign));
        currentObjects.forEach((object) => canvas.remove(object));
        canvas.backgroundColor = snapshot.backgroundColor;

        for (const element of snapshot.elements) {
          if (element.type === 'image' && element.imageUrl) {
            const image = await module.FabricImage.fromURL(element.imageUrl, { crossOrigin: 'anonymous' });
            const clipPath = createClipPath();
            image.set({
              left: element.x,
              top: element.y,
              scaleX: element.scaleX ?? 1,
              scaleY: element.scaleY ?? 1,
              angle: element.rotation,
              opacity: element.opacity,
              visible: element.visible !== false,
              clipPath: clipPath ?? undefined,
              cornerStyle: 'circle',
              transparentCorners: false,
              data: {
                id: element.id,
                type: 'image',
                imageUrl: element.imageUrl,
                name: element.name,
                isDesign: true,
              },
            });
            canvas.add(image);
            continue;
          }

          if (element.type === 'text') {
            const clipPath = createClipPath();
            const text = new module.IText(element.text || 'Your Text', {
              left: element.x,
              top: element.y,
              width: element.width,
              angle: element.rotation,
              opacity: element.opacity,
              visible: element.visible !== false,
              fill: element.fontColor || '#111827',
              fontFamily: element.fontFamily || 'Arial',
              fontSize: element.fontSize || 26,
              fontWeight: element.fontWeight || 'normal',
              fontStyle: element.fontStyle || 'normal',
              underline: element.underline ?? false,
              textAlign: element.textAlign || 'center',
              clipPath: clipPath ?? undefined,
              cornerStyle: 'circle',
              transparentCorners: false,
              data: {
                id: element.id,
                type: 'text',
                name: element.name || 'Text Layer',
                isDesign: true,
              },
            });
            text.set({
              scaleX: element.scaleX ?? 1,
              scaleY: element.scaleY ?? 1,
            });
            canvas.add(text);
          }
        }

        canvas.requestRenderAll();
        restoringRef.current = false;
        syncCanvasState(false);
      },
      [createClipPath, syncCanvasState]
    );

    const addText = useCallback(() => {
      const canvas = fabricCanvasRef.current;
      const module = fabricModuleRef.current;
      if (!canvas || !module) return;

      const text = new module.IText('Your Text', {
        left: printArea.x + printArea.width / 2 - 60,
        top: printArea.y + printArea.height / 2 - 20,
        width: Math.min(printArea.width - 20, 180),
        fontFamily: 'Arial',
        fontSize: 28,
        fill: '#111827',
        textAlign: 'center',
        cornerStyle: 'circle',
        transparentCorners: false,
        clipPath: createClipPath() ?? undefined,
        data: {
          id: generateId('text'),
          type: 'text',
          name: 'Text Layer',
          isDesign: true,
        },
      });

      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.requestRenderAll();
      syncCanvasState(true);
    }, [createClipPath, printArea, syncCanvasState]);

    const addImage = useCallback(
      async (dataUrl: string, fileName = 'Uploaded image') => {
        const canvas = fabricCanvasRef.current;
        const module = fabricModuleRef.current;
        if (!canvas || !module) return;

        const image = await module.FabricImage.fromURL(dataUrl, { crossOrigin: 'anonymous' });
        const width = image.width ?? printArea.width;
        const height = image.height ?? printArea.height;
        const scale = Math.min((printArea.width * 0.75) / width, (printArea.height * 0.75) / height, 1);

        image.set({
          left: printArea.x + (printArea.width - width * scale) / 2,
          top: printArea.y + (printArea.height - height * scale) / 2,
          scaleX: scale,
          scaleY: scale,
          clipPath: createClipPath() ?? undefined,
          cornerStyle: 'circle',
          transparentCorners: false,
          data: {
            id: generateId('image'),
            type: 'image',
            imageUrl: dataUrl,
            name: fileName,
            isDesign: true,
          },
        });

        canvas.add(image);
        canvas.setActiveObject(image);
        canvas.requestRenderAll();
        syncCanvasState(true);
      },
      [createClipPath, printArea, syncCanvasState]
    );

    useImperativeHandle(
      ref,
      () => ({
        addText,
        addImage,
        removeSelected: () => {
          const canvas = fabricCanvasRef.current;
          const active = canvas?.getActiveObject();
          if (canvas && active) {
            canvas.remove(active);
            canvas.discardActiveObject();
            canvas.requestRenderAll();
            syncCanvasState(true);
          }
        },
        clearCanvas: () => {
          void rebuildFromSnapshot({
            elements: [],
            backgroundColor,
            canvasWidth: CANVAS_WIDTH,
            canvasHeight: CANVAS_HEIGHT,
            printArea,
          });
          pushHistory(createSnapshot([], backgroundColor, printArea));
        },
        undo: () => {
          const snapshot = undoStore();
          void rebuildFromSnapshot(snapshot);
        },
        redo: () => {
          const snapshot = redoStore();
          void rebuildFromSnapshot(snapshot);
        },
        exportPreview: () => {
          const canvas = fabricCanvasRef.current;
          if (!canvas) return null;
          return canvas.toDataURL({ format: 'png', multiplier: 1 });
        },
        updateSelectedText: (updates) => {
          const canvas = fabricCanvasRef.current;
          const active = canvas?.getActiveObject() as CanvasObject | undefined;
          if (!canvas || !active) return;

          if (typeof updates.text === 'string') active.set('text', updates.text);
          if (typeof updates.fontFamily === 'string') active.set('fontFamily', updates.fontFamily);
          if (typeof updates.fontSize === 'number') active.set('fontSize', updates.fontSize);
          if (typeof updates.fontColor === 'string') active.set('fill', updates.fontColor);
          if (typeof updates.fontWeight === 'string') active.set('fontWeight', updates.fontWeight);
          if (typeof updates.fontStyle === 'string') active.set('fontStyle', updates.fontStyle);
          if (typeof updates.underline === 'boolean') active.set('underline', updates.underline);
          if (typeof updates.textAlign === 'string') active.set('textAlign', updates.textAlign);
          if (typeof updates.opacity === 'number') active.set('opacity', updates.opacity);

          canvas.requestRenderAll();
          syncCanvasState(true);
        },
        selectLayer: (id) => {
          const canvas = fabricCanvasRef.current;
          if (!canvas) return;
          const object = canvas
            .getObjects()
            .find((item) => (item as CanvasObject).data?.id === id);
          if (object) {
            canvas.setActiveObject(object);
            canvas.requestRenderAll();
            syncCanvasState(false);
          }
        },
        toggleVisibility: (id) => {
          const canvas = fabricCanvasRef.current;
          if (!canvas) return;
          const object = canvas
            .getObjects()
            .find((item) => (item as CanvasObject).data?.id === id) as CanvasObject | undefined;
          if (object) {
            object.set('visible', !(object.visible ?? true));
            canvas.requestRenderAll();
            syncCanvasState(true);
          }
        },
        moveLayerUp: (id) => {
          const canvas = fabricCanvasRef.current;
          if (!canvas) return;
          const object = canvas
            .getObjects()
            .find((item) => (item as CanvasObject).data?.id === id);
          if (object) {
            canvas.bringObjectForward(object);
            canvas.requestRenderAll();
            syncCanvasState(true);
          }
        },
        moveLayerDown: (id) => {
          const canvas = fabricCanvasRef.current;
          if (!canvas) return;
          const object = canvas
            .getObjects()
            .find((item) => (item as CanvasObject).data?.id === id);
          if (object) {
            canvas.sendObjectBackwards(object);
            canvas.requestRenderAll();
            syncCanvasState(true);
          }
        },
      }),
      [addImage, addText, backgroundColor, printArea, pushHistory, rebuildFromSnapshot, redoStore, syncCanvasState, undoStore]
    );

    useEffect(() => {
      setCanvasSize(CANVAS_WIDTH, CANVAS_HEIGHT);
      setPrintArea(printArea);
    }, [printArea, setCanvasSize, setPrintArea]);

    useEffect(() => {
      let mounted = true;

      async function initialize() {
        if (!canvasElementRef.current) return;

        const module = await import('fabric');
        if (!mounted || !canvasElementRef.current) return;

        fabricModuleRef.current = module;

        const canvas = new module.Canvas(canvasElementRef.current, {
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          preserveObjectStacking: true,
          selection: true,
        });

        canvas.backgroundColor = backgroundColor;
        fabricCanvasRef.current = canvas;

        const onSelection = () => syncCanvasState(false);
        const onModified = () => syncCanvasState(true);
        const onMoving = (event: { target?: FabricObject }) => {
          if (event.target) {
            constrainObject(event.target as CanvasObject);
          }
        };

        canvas.on('selection:created', onSelection);
        canvas.on('selection:updated', onSelection);
        canvas.on('selection:cleared', () => selectElement(null));
        canvas.on('object:added', () => {
          if (!restoringRef.current) {
            syncCanvasState(true);
          }
        });
        canvas.on('object:removed', () => {
          if (!restoringRef.current) {
            syncCanvasState(true);
          }
        });
        canvas.on('object:modified', onModified);
        canvas.on('object:moving', onMoving);
        canvas.on('object:scaling', onMoving);

        setIsReady(true);

        if (elements.length > 0) {
          await rebuildFromSnapshot({
            elements,
            backgroundColor,
            canvasWidth: CANVAS_WIDTH,
            canvasHeight: CANVAS_HEIGHT,
            printArea,
          });
        } else {
          pushHistory(createSnapshot([], backgroundColor, printArea));
        }
      }

      void initialize();

      return () => {
        mounted = false;
        fabricCanvasRef.current?.dispose();
        fabricCanvasRef.current = null;
      };
    }, [backgroundColor, constrainObject, elements, printArea, pushHistory, rebuildFromSnapshot, selectElement, syncCanvasState]);

    useEffect(() => {
      const canvas = fabricCanvasRef.current;
      if (!canvas || restoringRef.current) return;
      if (typeof canvas.backgroundColor === 'string' && canvas.backgroundColor !== backgroundColor) {
        canvas.backgroundColor = backgroundColor;
        canvas.requestRenderAll();
      }
    }, [backgroundColor]);

    useEffect(() => {
      if (!selectedElementId) return;
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      const object = canvas.getObjects().find((item) => (item as CanvasObject).data?.id === selectedElementId);
      if (object) {
        canvas.setActiveObject(object);
        canvas.requestRenderAll();
      }
    }, [selectedElementId]);

    return (
      <div className={cn('rounded-3xl border border-surface-border bg-white p-4 shadow-card', className)}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-body-sm font-semibold text-foreground">Live Preview Canvas</p>
            <p className="text-body-xs text-muted">Drag, resize, and rotate your design inside the safe print area.</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-body-xs font-semibold text-primary-700">
            <Layers3 className="h-3.5 w-3.5" />
            Interactive editor
          </span>
        </div>

        <div className="mx-auto w-full max-w-[420px]">
          <div className="relative overflow-hidden rounded-[2rem] border border-surface-border bg-surface-card">
            {!isReady && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/85">
                <div className="flex flex-col items-center gap-2 text-body-sm text-muted">
                  <Spinner size="md" />
                  Preparing the design canvas...
                </div>
              </div>
            )}

            <div className="relative aspect-[4/7] w-full">
              <Image
                src={mockupImage}
                alt="Phone cover mockup preview"
                fill
                sizes="(max-width: 768px) 100vw, 420px"
                className="pointer-events-none object-cover"
                unoptimized={mockupImage.startsWith('/images/')}
              />
              <canvas ref={canvasElementRef} className="relative z-10 h-full w-full" aria-label="Phone cover design canvas" />
              <div className="pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-black/65 px-3 py-1 text-body-xs text-white">
                <Move className="h-3.5 w-3.5" />
                Drag to position
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default LivePreviewCanvas;
