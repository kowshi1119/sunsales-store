import { create } from 'zustand';
import type { DesignElement, PrintArea } from '@/types/customization';

interface CustomizerStore {
  // Selection state
  selectedBrandId: string | null;
  selectedModelId: string | null;
  selectedCaseType: string | null;
  selectedFrameStyleId: string | null;
  selectedFrameSize: string | null;
  selectedFrameColor: string | null;

  // Canvas state
  elements: DesignElement[];
  selectedElementId: string | null;
  backgroundColor: string;
  canvasWidth: number;
  canvasHeight: number;
  printArea: PrintArea | null;

  // Upload state
  uploadedImages: string[];

  // Actions — Selection
  setSelectedBrand: (id: string | null) => void;
  setSelectedModel: (id: string | null) => void;
  setSelectedCaseType: (type: string | null) => void;
  setSelectedFrameStyle: (id: string | null) => void;
  setSelectedFrameSize: (size: string | null) => void;
  setSelectedFrameColor: (color: string | null) => void;

  // Actions — Canvas
  addElement: (element: DesignElement) => void;
  updateElement: (id: string, updates: Partial<DesignElement>) => void;
  removeElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  setBackgroundColor: (color: string) => void;
  setCanvasSize: (width: number, height: number) => void;
  setPrintArea: (area: PrintArea | null) => void;
  moveElementUp: (id: string) => void;
  moveElementDown: (id: string) => void;

  // Actions — Upload
  addUploadedImage: (url: string) => void;
  removeUploadedImage: (url: string) => void;

  // Actions — Reset
  resetCustomizer: () => void;
  resetCanvas: () => void;

  // Getters
  getSelectedElement: () => DesignElement | null;
}

const initialState = {
  selectedBrandId: null,
  selectedModelId: null,
  selectedCaseType: null,
  selectedFrameStyleId: null,
  selectedFrameSize: null,
  selectedFrameColor: null,
  elements: [],
  selectedElementId: null,
  backgroundColor: '#FFFFFF',
  canvasWidth: 400,
  canvasHeight: 700,
  printArea: null,
  uploadedImages: [],
};

export const useCustomizerStore = create<CustomizerStore>((set, get) => ({
  ...initialState,

  // Selection
  setSelectedBrand: (id) => set({ selectedBrandId: id, selectedModelId: null }),
  setSelectedModel: (id) => set({ selectedModelId: id }),
  setSelectedCaseType: (type) => set({ selectedCaseType: type }),
  setSelectedFrameStyle: (id) => set({ selectedFrameStyleId: id }),
  setSelectedFrameSize: (size) => set({ selectedFrameSize: size }),
  setSelectedFrameColor: (color) => set({ selectedFrameColor: color }),

  // Canvas
  addElement: (element) =>
    set((state) => ({ elements: [...state.elements, element] })),

  updateElement: (id, updates) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
    })),

  removeElement: (id) =>
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
    })),

  selectElement: (id) => set({ selectedElementId: id }),

  setBackgroundColor: (color) => set({ backgroundColor: color }),

  setCanvasSize: (width, height) => set({ canvasWidth: width, canvasHeight: height }),

  setPrintArea: (area) => set({ printArea: area }),

  moveElementUp: (id) =>
    set((state) => {
      const index = state.elements.findIndex((el) => el.id === id);
      if (index < state.elements.length - 1) {
        const newElements = [...state.elements];
        [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]];
        return { elements: newElements };
      }
      return state;
    }),

  moveElementDown: (id) =>
    set((state) => {
      const index = state.elements.findIndex((el) => el.id === id);
      if (index > 0) {
        const newElements = [...state.elements];
        [newElements[index], newElements[index - 1]] = [newElements[index - 1], newElements[index]];
        return { elements: newElements };
      }
      return state;
    }),

  // Upload
  addUploadedImage: (url) =>
    set((state) => ({ uploadedImages: [...state.uploadedImages, url] })),

  removeUploadedImage: (url) =>
    set((state) => ({
      uploadedImages: state.uploadedImages.filter((u) => u !== url),
    })),

  // Reset
  resetCustomizer: () => set(initialState),

  resetCanvas: () =>
    set({
      elements: [],
      selectedElementId: null,
      backgroundColor: '#FFFFFF',
      uploadedImages: [],
    }),

  // Getters
  getSelectedElement: () => {
    const { elements, selectedElementId } = get();
    return elements.find((el) => el.id === selectedElementId) || null;
  },
}));
