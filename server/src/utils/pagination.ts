export type PaginationQuery = {
  page?: string;
  limit?: string;
};

export function getPagination(query: PaginationQuery, defaultLimit = 9) {
  const page = Math.max(1, Number.parseInt(query.page || '1', 10) || 1);
  const rawLimit = Number.parseInt(query.limit || String(defaultLimit), 10) || defaultLimit;
  const limit = Math.min(50, Math.max(1, rawLimit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function paginationMeta(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
}
