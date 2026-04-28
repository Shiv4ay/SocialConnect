import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FeedClient } from './feed-client'

export const dynamic = 'force-dynamic'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  let query = supabase
    .from('posts')
    .select('*, author:profiles(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(0, 19)

  const { data: following } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id)

  if (following && following.length > 0) {
    const followingIds = following.map(f => f.following_id)
    followingIds.push(user.id)
    query = query.in('author_id', followingIds)
  }

  const { data: feedData } = await query

  let postsWithLikes = feedData ?? []
  if (postsWithLikes.length > 0) {
    const postIds = postsWithLikes.map(p => p.id)
    const { data: userLikes } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', user.id)
      .in('post_id', postIds)
    const likedSet = new Set((userLikes ?? []).map(l => l.post_id))
    postsWithLikes = postsWithLikes.map(p => ({ ...p, is_liked: likedSet.has(p.id) }))
  }

  return <FeedClient initialProfile={profile} initialPosts={postsWithLikes} currentUserId={user.id} />
}
