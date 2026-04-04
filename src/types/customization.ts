export type DesignStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED';

export interface SavedDesign {
  id: string;
  userId: string;
  type: string;
  designData: DesignData;
  previewImage: string | null;
  uploadedImages: string[];
  phoneModelId: string | null;
  frameStyleId: string | null;
  status: DesignStatus;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  phoneModel?: PhoneModelBasic | null;
  frameStyle?: FrameStyleBasic | null;
}

export interface DesignData {
  elements: DesignElement[];
  backgroundColor: string;
  canvasWidth: number;
  canvasHeight: number;
}

export interface DesignElement {
  id: string;
  type: 'image' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  // Image-specific
  imageUrl?: string;
  // Text-specific
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontColor?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
}

export interface PhoneBrand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  models: PhoneModelBasic[];
}

export interface PhoneModelBasic {
  id: string;
  name: string;
  slug: string;
  mockupImage: string;
}

export interface PhoneModel extends PhoneModelBasic {
  brandId: string;
  printArea: PrintArea;
  caseTypes: string[];
  brand: { name: string; slug: string };
}

export interface PrintArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FrameStyleBasic {
  id: string;
  name: string;
  slug: string;
  mockupImage: string;
}

export interface FrameStyle extends FrameStyleBasic {
  photoArea: PrintArea;
  sizes: string[];
  materials: string[];
  colors: string[];
}

export interface ImageQuality {
  level: 'excellent' | 'acceptable' | 'poor';
  dpi: number;
  message: string;
}
