export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  error: string | null;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
