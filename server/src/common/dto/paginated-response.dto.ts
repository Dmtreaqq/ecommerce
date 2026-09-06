export class PaginatedResponseDto<T> {
  items: T[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

/** Pages are 1-based, and an empty result still reports a single page. */
export const totalPagesFor = (total: number, perPage: number): number =>
  Math.max(1, Math.ceil(total / perPage));

export const clampPage = (page: number, totalPages: number): number =>
  Math.min(Math.max(1, page), totalPages);
