'use client'
import { useState } from 'react'
import { PostCreateForm } from '@/components/posts/post-create-form'
import { PostCard } from '@/components/posts/post-card'
import { Post, Profile } from '@/types'

interface FeedClientProps {
  initialProfile: Profile
  initialPosts: Post[]
  currentUserId: string
}

export function FeedClient({ initialProfile, initialPosts, currentUserId }: FeedClientProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialPosts.length === 20)

  function handlePostCreated(post: Post) {
    setPosts(prev => [{ ...post, author: initialProfile }, ...prev])
  }

  function handlePostDeleted(postId: string) {
    setPosts(prev => prev.filter(p => p.id !== postId))
  }

  async function loadMore() {
    setLoadingMore(true)
    const nextPage = page + 1
    const res = await fetch(`/api/feed?page=${nextPage}`)
    const data = await res.json()
    setPosts(prev => [...prev, ...data.data])
    setPage(nextPage)
    setHasMore(data.has_more)
    setLoadingMore(false)
  }

  return (
    <div className="space-y-4">
      <PostCreateForm currentUser={initialProfile} onPostCreated={handlePostCreated} />
      {posts.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">No posts yet. Be the first to share something!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
              <PostCard
              key={post.id}
              post={post}
              currentUser={initialProfile}
              onDelete={handlePostDeleted}
            />
          ))}
        </div>
      )}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button onClick={loadMore} disabled={loadingMore}
            className="text-sm text-indigo-600 hover:text-indigo-700 disabled:opacity-50">
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  )
}
