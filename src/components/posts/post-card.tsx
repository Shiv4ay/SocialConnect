'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, MessageCircle, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Post, Profile, Comment } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { CommentList } from '@/components/comments/comment-list'

interface PostCardProps {
  post: Post
  currentUser?: Profile
  onDelete?: (postId: string) => void
  initiallyShowComments?: boolean
  initialComments?: Comment[]
}

export function PostCard({ post, currentUser, onDelete, initiallyShowComments = false, initialComments = [] }: PostCardProps) {
  const [liked, setLiked] = useState(post.is_liked ?? false)
  const [likeCount, setLikeCount] = useState(post.like_count)
  const [loading, setLoading] = useState(false)
  const [showComments, setShowComments] = useState(initiallyShowComments)
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [commentsLoaded, setCommentsLoaded] = useState(initialComments.length > 0 || initiallyShowComments)
  const [commentCount, setCommentCount] = useState(post.comment_count)

  const author = post.author
  const initials = author
    ? `${author.first_name[0] ?? ''}${author.last_name[0] ?? ''}`.toUpperCase()
    : '?'

  async function toggleLike() {
    if (loading) return
    setLoading(true)
    try {
      const method = liked ? 'DELETE' : 'POST'
      const res = await fetch(`/api/posts/${post.id}/like`, { method })
      if (res.ok) {
        setLiked(!liked)
        setLikeCount(c => liked ? c - 1 : c + 1)
      } else {
        const err = await res.json()
        alert(`Failed to ${method === 'DELETE' ? 'unlike' : 'like'}: ${err.error || 'Unknown error'}`)
      }
    } catch (e) {
      alert('Network error')
    }
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm('Delete this post?')) return
    const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' })
    if (res.ok) onDelete?.(post.id)
  }

  async function toggleComments() {
    if (showComments) {
      setShowComments(false)
      return
    }
    setShowComments(true)
    if (!commentsLoaded) {
      const res = await fetch(`/api/posts/${post.id}/comments`)
      const data = await res.json()
      setComments(data.data)
      setCommentsLoaded(true)
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <Link href={`/profile/${author?.id}`}>
          <Avatar className="h-9 w-9 ring-2 ring-slate-100">
            <AvatarImage src={author?.avatar_url ?? undefined} />
            <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div>
              <Link href={`/profile/${author?.id}`}
                className="text-sm font-semibold text-slate-900 hover:text-indigo-600">
                {author?.first_name} {author?.last_name}
              </Link>
              <span className="ml-1.5 text-xs text-slate-400">@{author?.username}</span>
            </div>
            <span className="shrink-0 text-xs text-slate-400">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </span>
          </div>
          <p className="mt-1.5 text-sm text-slate-800 leading-relaxed">{post.content}</p>
          {post.image_url && (
            <div className="mt-3 overflow-hidden rounded-lg border border-slate-100">
              <Image
                src={post.image_url}
                alt="Post image"
                width={560}
                height={315}
                className="w-full object-cover"
              />
            </div>
          )}
          <div className="mt-3 flex items-center gap-4">
            <button
              onClick={toggleLike}
              disabled={loading}
              title={liked ? "Unlike" : "Like"}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                liked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
              <span>{likeCount}</span>
            </button>
            <button
              onClick={toggleComments}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                showComments ? 'text-indigo-500' : 'text-slate-400 hover:text-indigo-500'
              }`}
            >
              <MessageCircle className={`h-4 w-4 ${showComments ? 'fill-current opacity-20' : ''}`} />
              <span>{commentCount}</span>
            </button>
            {currentUser?.id === post.author_id && (
              <button
                onClick={handleDelete}
                title="Delete Post"
                className="ml-auto text-slate-300 hover:text-red-400 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {/* Inline Comments Section */}
          {showComments && currentUser && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              {commentsLoaded ? (
                <CommentList
                  postId={post.id}
                  initialComments={comments}
                  currentUser={currentUser}
                  onCommentAdded={(comment) => {
                    setCommentCount(c => c + 1)
                    setComments(prev => [...prev, comment])
                  }}
                  onCommentDeleted={(commentId) => {
                    setCommentCount(c => Math.max(0, c - 1))
                    setComments(prev => prev.filter(c => c.id !== commentId))
                  }}
                />
              ) : (
                <div className="flex justify-center py-4">
                  <span className="text-xs text-slate-400">Loading comments...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
