export interface PaginationParams {
  page: number
  perPage: number
  from: number
  to: number
}

export function getPagination(searchParams: URLSearchParams, perPage = 20): PaginationParams {
  const page = parseInt(searchParams.get('page') ?? '1') || 1
  const from = (page - 1) * perPage
  const to = from + perPage - 1
  return { page, perPage, from, to }
}
