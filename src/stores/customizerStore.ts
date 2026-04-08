import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DesignData, DesignElement, PrintArea } from '@/types/customization';

interface CustomizerStore {
  step: number;
  selectedBrandId: string | null;
  selectedBrandSlug: string | null;
  selectedBrandName: string | null;
  selectedModelId: string | null;
  selectedModelSlug: string | null;
  selectedModelName: string | null;
  selectedCaseType: string | null;
  selectedFrameStyleId: string | null;
  selectedFrameSize: string | null;
  selectedFrameColor: string | null;
  elements: DesignElement[];
  selectedElementId: string | null;
  backgroundColor: string;
  canvasWidth: number;
  canvasHeight: number;
  printArea: PrintArea | null;
  previewImage: string | null;
  uploadedImages: string[];
  history: DesignData[];
  historyIndex: number;

  setStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  setSelectedBrand: (brand: { id: string | null; slug?: string | null; name?: string | null }) => void;
  setSelectedModel: (model: { id: string | null; slug?: string | null; name?: string | null }) => void;
  setSelectedCaseType: (type: string | null) => void;
  setSelectedFrameStyle: (id: string | null) => void;
  setSelectedFrameSize: (size: string | null) => void;
  setSelectedFrameColor: (color: string | null) => void;
  setElements: (elements: DesignElement[]) => void;
  addElement: (element: DesignElement) => void;
  updateElement: (id: string, updates: Partial<DesignElement>) => void;
  removeElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  setBackgroundColor: (color: string) => void;
  setCanvasSize: (width: number, height: number) => void;
  setPrintArea: (area: PrintArea | null) => void;
  setPreviewImage: (image: string | null) => void;
  moveElementUp: (id: string) => void;
  moveElementDown: (id: string) => void;
  pushHistory: (snapshot: DesignData) => void;
  undo: () => DesignData | null;
  redo: () => DesignData | null;
  addUploadedImage: (url: string) => void;
  removeUploadedImage: (url: string) => void;
  resetCustomizer: () => void;
  resetCanvas: () => void;
  getSelectedElement: () => DesignElement | null;
}

const createSnapshot = (
  elements: DesignElement[] = [],
  backgroundColor = '#FFFFFF',
  canvasWidth = 400,
  canvasHeight = 700,
  printArea: PrintArea | null = null,
  previewImage: string | null = null
): DesignData => ({
  elements,
  backgroundColor,
  canvasWidth,
  canvasHeight,
  printArea,
  previewImage,
});

const initialState = {
  step: 1,
  selectedBrandId: null,
  selectedBrandSlug: null,
  selectedBrandName: null,
  selectedModelId: null,
  selectedModelSlug: null,
  selectedModelName: null,
  selectedCaseType: null,
  selectedFrameStyleId: null,
  selectedFrameSize: null,
  selectedFrameColor: null,
  elements: [] as DesignElement[],
  selectedElementId: null,
  backgroundColor: '#FFFFFF',
  canvasWidth: 400,
  canvasHeight: 700,
  printArea: null as PrintArea | null,
  previewImage: null as string | null,
  uploadedImages: [] as string[],
  history: [createSnapshot()],
  historyIndex: 0,
};

export const useCustomizerStore = create<CustomizerStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStep: (step) => set({ step }),
      nextStep: () => set((state) => ({ step: Math.min(state.step + 1, 5) })),
      previousStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),

      setSelectedBrand: (brand) =>
        set({
          selectedBrandId: brand.id,
          selectedBrandSlug: brand.slug ?? null,
          selectedBrandName: brand.name ?? null,
          selectedModelId: null,
          selectedModelSlug: null,
          selectedModelName: null,
          selectedCaseType: null,
          step: brand.id ? 2 : 1,
        }),

      setSelectedModel: (model) =>
        set({
          selectedModelId: model.id,
          selectedModelSlug: model.slug ?? null,
          selectedModelName: model.name ?? null,
          step: model.id ? 3 : 2,
        }),

      setSelectedCaseType: (type) =>
        set((state) => ({
          selectedCaseType: type,
          step: type ? Math.max(state.step, 4) : 3,
        })),

      setSelectedFrameStyle: (id) => set({ selectedFrameStyleId: id }),
      setSelectedFrameSize: (size) => set({ selectedFrameSize: size }),
      setSelectedFrameColor: (color) => set({ selectedFrameColor: color }),

      setElements: (elements) => set({ elements }),
      addElement: (element) => set((state) => ({ elements: [...state.elements, element] })),
      updateElement: (id, updates) =>
        set((state) => ({
          elements: state.elements.map((element) =>
            element.id === id ? { ...element, ...updates } : element
          ),
        })),
      removeElement: (id) =>
        set((state) => ({
          elements: state.elements.filter((element) => element.id !== id),
          selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
        })),
      selectElement: (id) => set({ selectedElementId: id }),
      setBackgroundColor: (color) => set({ backgroundColor: color }),
      setCanvasSize: (width, height) => set({ canvasWidth: width, canvasHeight: height }),
      setPrintArea: (area) => set({ printArea: area }),
      setPreviewImage: (image) => set({ previewImage: image }),

      moveElementUp: (id) =>
        set((state) => {
          const index = state.elements.findIndex((element) => element.id === id);
          if (index < 0 || index >= state.elements.length - 1) {
            return state;
          }

          const nextElements = [...state.elements];
          [nextElements[index], nextElements[index + 1]] = [nextElements[index + 1], nextElements[index]];
          return { elements: nextElements };
        }),

      moveElementDown: (id) =>
        set((state) => {
          const index = state.elements.findIndex((element) => element.id === id);
          if (index <= 0) {
            return state;
          }

          const nextElements = [...state.elements];
          [nextElements[index], nextElements[index - 1]] = [nextElements[index - 1], nextElements[index]];
          return { elements: nextElements };
        }),

      pushHistory: (snapshot) =>
        set((state) => {
          const trimmedHistory = state.history.slice(0, state.historyIndex + 1);
          const nextHistory = [...trimmedHistory, snapshot].slice(-30);
          return {
            history: nextHistory,
            historyIndex: nextHistory.length - 1,
          };
        }),

      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex <= 0) {
          return null;
        }

        const previousSnapshot = history[historyIndex - 1];
        set({
          historyIndex: historyIndex - 1,
          elements: previousSnapshot.elements,
          backgroundColor: previousSnapshot.backgroundColor,
          canvasWidth: previousSnapshot.canvasWidth,
          canvasHeight: previousSnapshot.canvasHeight,
          printArea: previousSnapshot.printArea ?? null,
          previewImage: previousSnapshot.previewImage ?? null,
        });
        return previousSnapshot;
      },

      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex >= history.length - 1) {
          return null;
        }

        const nextSnapshot = history[historyIndex + 1];
        set({
          historyIndex: historyIndex + 1,
          elements: nextSnapshot.elements,
          backgroundColor: nextSnapshot.backgroundColor,
          canvasWidth: nextSnapshot.canvasWidth,
          canvasHeight: nextSnapshot.canvasHeight,
          printArea: nextSnapshot.printArea ?? null,
          previewImage: nextSnapshot.previewImage ?? null,
        });
        return nextSnapshot;
      },

      addUploadedImage: (url) =>
        set((state) => ({
          uploadedImages: state.uploadedImages.includes(url) ? state.uploadedImages : [...state.uploadedImages, url],
        })),

      removeUploadedImage: (url) =>
        set((state) => ({
          uploadedImages: state.uploadedImages.filter((item) => item !== url),
        })),

      resetCustomizer: () => set(initialState),
      resetCanvas: () =>
        set((state) => ({
          elements: [],
          selectedElementId: null,
          backgroundColor: '#FFFFFF',
          previewImage: null,
          uploadedImages: [],
          history: [createSnapshot([], '#FFFFFF', state.canvasWidth, state.canvasHeight, state.printArea, null)],
          historyIndex: 0,
        })),

      getSelectedElement: () => {
        const { elements, selectedElementId } = get();
        return elements.find((element) => element.id === selectedElementId) ?? null;
      },
    }),
    {
      name: 'sun-sales-customizer',
      partialize: (state) => ({
        step: state.step,
        selectedBrandId: state.selectedBrandId,
        selectedBrandSlug: state.selectedBrandSlug,
        selectedBrandName: state.selectedBrandName,
        selectedModelId: state.selectedModelId,
        selectedModelSlug: state.selectedModelSlug,
        selectedModelName: state.selectedModelName,
        selectedCaseType: state.selectedCaseType,
        selectedFrameStyleId: state.selectedFrameStyleId,
        selectedFrameSize: state.selectedFrameSize,
        selectedFrameColor: state.selectedFrameColor,
        elements: state.elements,
        selectedElementId: state.selectedElementId,
        backgroundColor: state.backgroundColor,
        canvasWidth: state.canvasWidth,
        canvasHeight: state.canvasHeight,
        printArea: state.printArea,
        previewImage: state.previewImage,
        uploadedImages: state.uploadedImages,
      }),
    }
  )
);

