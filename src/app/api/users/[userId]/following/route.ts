import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPagination } from '@/lib/pagination'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  const supabase = await createClient()
  const { page, perPage, from, to } = getPagination(new URL(request.url).searchParams)

  const { data, error, count } = await supabase
    .from('follows')
    .select('following:profiles!following_id(*)', { count: 'exact' })
    .eq('follower_id', userId)
    .range(from, to)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    data: (data ?? []).map(d => d.following),
    page, per_page: perPage, total: count ?? 0, has_more: (count ?? 0) > to + 1,
  })
}
