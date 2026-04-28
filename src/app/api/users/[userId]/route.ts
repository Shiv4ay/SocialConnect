import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !profile) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const [{ count: postsCount }, { count: followersCount }, { count: followingCount }] =
    await Promise.all([
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('author_id', userId).eq('is_active', true),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
    ])

  const { data: { user: authUser } } = await supabase.auth.getUser()
  let isFollowing = false
  if (authUser && authUser.id !== userId) {
    const { data: follow } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', authUser.id)
      .eq('following_id', userId)
      .single()
    isFollowing = !!follow
  }

  return NextResponse.json({
    ...profile,
    posts_count: postsCount ?? 0,
    followers_count: followersCount ?? 0,
    following_count: followingCount ?? 0,
    is_following: isFollowing,
  })
}
