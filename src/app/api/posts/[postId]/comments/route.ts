import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCommentSchema, fieldErrors } from '@/lib/validations'
import { getPagination } from '@/lib/pagination'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ postId: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  const { postId } = await params
  const supabase = await createClient()
  const { page, perPage, from, to } = getPagination(new URL(request.url).searchParams)

  const { data, error, count } = await supabase
    .from('comments')
    .select('*, author:profiles(*)', { count: 'exact' })
    .eq('post_id', postId)
    .range(from, to)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    data: data ?? [],
    page,
    per_page: perPage,
    total: count ?? 0,
    has_more: (count ?? 0) > to + 1,
  })
}

export async function POST(request: NextRequest, { params }: Params) {
  const { postId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = createCommentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: fieldErrors(parsed.error) },
      { status: 400 }
    )
  }

  const { data: comment, error } = await supabase
    .from('comments')
    .insert({ content: parsed.data.content, user_id: user.id, post_id: postId })
    .select('*, author:profiles(*)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.rpc('increment_comment_count', { post_id: postId })

  return NextResponse.json(comment, { status: 201 })
}
