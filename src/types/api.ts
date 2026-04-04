// ============ API RESPONSE TYPES ============

export interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}
