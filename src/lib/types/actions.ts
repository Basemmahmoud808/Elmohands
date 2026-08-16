export type ActionResult<T = void> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; message?: string; data?: never };

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
