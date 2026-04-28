import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPagination } from '@/lib/pagination'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { page, perPage, from, to } = getPagination(new URL(request.url).searchParams)

  const { data, error, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    data,
    page,
    per_page: perPage,
    total: count ?? 0,
    has_more: (count ?? 0) > to + 1,
  })
}
