export interface ApiException {
  status: number;
  message?: string;
  /** Raw response body from the backend, if any. */
  data?: unknown;
  /** Field-level validation errors, when the backend sends them. */
  fields?: Record<string, string>;
}

export type HttpResponseHeaders = Record<string, string> & {
  'content-disposition'?: string;
  'content-type'?: string;
  'content-length'?: string;
};

export interface IResponse<T> {
  status: number;
  data: T;
  headers: HttpResponseHeaders;
}

export interface IPageable {
  pageNumber: number;
  pageSize: number;
  sort: string[];
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

export interface IRequestList {
  page: number;
  size: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
}

export interface IMeta<T = unknown> {
  data: T;
  pageable: IPageable;
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: string[];
  numberOfElements: number;
  first: boolean;
  empty: boolean;
  currentPage: number;
}
