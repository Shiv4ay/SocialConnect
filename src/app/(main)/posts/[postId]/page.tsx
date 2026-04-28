import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PostCard } from '@/components/posts/post-card'
import { CommentList } from '@/components/comments/comment-list'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>
}) {
  const { postId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: post }, { data: comments }, { data: profile }] = await Promise.all([
    supabase.from('posts').select('*, author:profiles(*)').eq('id', postId).eq('is_active', true).single(),
    supabase.from('comments').select('*, author:profiles(*)').eq('post_id', postId).order('created_at', { ascending: true }),
    supabase.from('profiles').select('*').eq('id', user.id).single(),
  ])

  if (!post) notFound()

  const { data: like } = await supabase
    .from('likes').select('id').eq('user_id', user.id).eq('post_id', postId).single()

  return (
    <div className="space-y-4">
      <Link href="/feed"
        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <ChevronLeft className="h-4 w-4" /> Back to feed
      </Link>
      <PostCard 
        post={{ ...post, is_liked: !!like }} 
        currentUser={profile!} 
        initiallyShowComments={true}
        initialComments={comments ?? []}
      />
    </div>
  )
}
