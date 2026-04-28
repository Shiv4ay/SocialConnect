import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPagination } from '@/lib/pagination'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { page, perPage, from, to } = getPagination(new URL(request.url).searchParams)

  let query = supabase
    .from('posts')
    .select('*, author:profiles(*)', { count: 'exact' })
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (user) {
    const { data: following } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)

    if (following && following.length > 0) {
      const followingIds = following.map(f => f.following_id)
      followingIds.push(user.id)
      query = query.in('author_id', followingIds)
    }
  }

  const { data, error, count } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

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
