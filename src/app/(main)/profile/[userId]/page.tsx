import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ProfileHeader } from '@/components/profile/profile-header'
import { PostCard } from '@/components/posts/post-card'
import { ProfileWithStats } from '@/types'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const resolvedId = userId === 'me' ? user.id : userId

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', resolvedId)
    .single()

  if (profileError || !profile) notFound()

  const [{ count: postsCount }, { count: followersCount }, { count: followingCount }] =
    await Promise.all([
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('author_id', resolvedId).eq('is_active', true),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', resolvedId),
      supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', resolvedId),
    ])

  let isFollowing = false
  if (user.id !== resolvedId) {
    const { data: follow } = await supabase
      .from('follows').select('id').eq('follower_id', user.id).eq('following_id', resolvedId).single()
    isFollowing = !!follow
  }

  const profileWithStats: ProfileWithStats = {
    ...profile,
    posts_count: postsCount ?? 0,
    followers_count: followersCount ?? 0,
    following_count: followingCount ?? 0,
    is_following: isFollowing,
  }

  const { data: posts } = await supabase
    .from('posts')
    .select('*, author:profiles(*)')
    .eq('author_id', resolvedId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(0, 19)

  const isOwnProfile = user.id === resolvedId
  let viewerProfile = profileWithStats
  if (!isOwnProfile) {
    const { data: vProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (vProfile) viewerProfile = vProfile as any
  }

  return (
    <div className="space-y-4">
      <ProfileHeader profile={profileWithStats} isOwnProfile={isOwnProfile} />
      {isOwnProfile && (
        <div className="flex justify-end">
          <Link href="/profile/edit">
            <Button variant="outline" size="sm" className="border-slate-200 text-slate-700">
              Edit profile
            </Button>
          </Link>
        </div>
      )}
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide px-1">Posts</h2>
      {(posts ?? []).length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">No posts yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(posts ?? []).map(post => (
            <PostCard key={post.id} post={post} currentUser={viewerProfile} />
          ))}
        </div>
      )}
    </div>
  )
}
