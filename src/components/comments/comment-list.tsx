'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Trash2 } from 'lucide-react'
import { Comment, Profile } from '@/types'
import { formatDistanceToNow } from 'date-fns'

interface CommentListProps {
  postId: string
  initialComments: Comment[]
  currentUser: Profile
  onCommentAdded?: (comment: Comment) => void
  onCommentDeleted?: (commentId: string) => void
}

export function CommentList({ postId, initialComments, currentUser, onCommentAdded, onCommentDeleted }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)

  async function submitComment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!newComment.trim()) return
    setLoading(true)

    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newComment.trim() }),
    })

    if (res.ok) {
      const comment: Comment = { ...await res.json(), author: currentUser }
      setComments(prev => [...prev, comment])
      setNewComment('')
      onCommentAdded?.(comment)
    }
    setLoading(false)
  }

  async function deleteComment(commentId: string) {
    const res = await fetch(`/api/posts/${postId}/comments/${commentId}`, { method: 'DELETE' })
    if (res.ok) {
      setComments(prev => prev.filter(c => c.id !== commentId))
      onCommentDeleted?.(commentId)
    }
  }

  const initials = `${currentUser.first_name[0] ?? ''}${currentUser.last_name[0] ?? ''}`.toUpperCase()

  return (
    <div className="space-y-4">
      <form onSubmit={submitComment} className="flex gap-3">
        <Avatar className="h-8 w-8 shrink-0 ring-2 ring-slate-100">
          <AvatarImage src={currentUser.avatar_url ?? undefined} />
          <AvatarFallback className="bg-slate-100 text-slate-600 text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Write a comment…"
            className="min-h-[64px] resize-none text-sm border-slate-200 focus-visible:ring-indigo-500"
            maxLength={280}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={loading || !newComment.trim()} size="sm"
              className="bg-slate-800 hover:bg-slate-700 text-white">
              {loading ? 'Posting…' : 'Comment'}
            </Button>
          </div>
        </div>
      </form>

      {comments.length === 0 ? (
        <p className="text-center text-sm text-slate-400 py-4">No comments yet. Start the conversation!</p>
      ) : (
        <div className="space-y-3">
          {comments.map(comment => {
            const cInitials = `${comment.author?.first_name[0] ?? ''}${comment.author?.last_name[0] ?? ''}`.toUpperCase()
            return (
              <div key={comment.id} className="flex gap-3">
                <Link href={`/profile/${comment.author?.id}`}>
                  <Avatar className="h-7 w-7 shrink-0 ring-1 ring-slate-100">
                    <AvatarImage src={comment.author?.avatar_url ?? undefined} />
                    <AvatarFallback className="bg-slate-100 text-slate-500 text-xs">{cInitials}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 rounded-lg bg-slate-50 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <Link href={`/profile/${comment.author?.id}`}
                      className="text-xs font-semibold text-slate-800 hover:text-indigo-600">
                      {comment.author?.first_name} {comment.author?.last_name}
                    </Link>
                    <div className="flex items-center gap-2">
                      <span suppressHydrationWarning className="text-xs text-slate-400">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                      {comment.user_id === currentUser.id && (
                        <button onClick={() => deleteComment(comment.id)}
                          className="text-slate-300 hover:text-red-400 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="mt-0.5 text-sm text-slate-700">{comment.content}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
