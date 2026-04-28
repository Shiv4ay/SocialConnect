import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPostSchema, fieldErrors } from '@/lib/validations'
import { getPagination } from '@/lib/pagination'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { page, perPage, from, to } = getPagination(new URL(request.url).searchParams)

  const { data, error, count } = await supabase
    .from('posts')
    .select('*, author:profiles(*)', { count: 'exact' })
    .eq('is_active', true)
    .range(from, to)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  let postsWithLikes = data ?? []
  if (user && postsWithLikes.length > 0) {
    const postIds = postsWithLikes.map(p => p.id)
    const { data: userLikes } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', user.id)
      .in('post_id', postIds)
    const likedSet = new Set((userLikes ?? []).map(l => l.post_id))
    postsWithLikes = postsWithLikes.map(p => ({ ...p, is_liked: likedSet.has(p.id) }))
  }

  return NextResponse.json({
    data: postsWithLikes,
    page,
    per_page: perPage,
    total: count ?? 0,
    has_more: (count ?? 0) > to + 1,
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = createPostSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: fieldErrors(parsed.error) },
      { status: 400 }
    )
  }

  const { data: post, error } = await supabase
    .from('posts')
    .insert({ ...parsed.data, author_id: user.id })
    .select('*, author:profiles(*)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(post, { status: 201 })
}
