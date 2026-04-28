'use client'
import { useState, useRef } from 'react'
import { Image as ImageIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Post, Profile } from '@/types'

interface PostCreateFormProps {
  currentUser: Profile
  onPostCreated: (post: Post) => void
}

export function PostCreateForm({ currentUser, onPostCreated }: PostCreateFormProps) {
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const MAX = 280
  const remaining = MAX - content.length

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      setError('Only JPEG and PNG images are allowed')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be smaller than 2MB')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setError('')
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    setError('')

    let imageUrl: string | null = null

    if (imageFile) {
      const formData = new FormData()
      formData.append('image', imageFile)
      const uploadRes = await fetch('/api/posts/upload', { method: 'POST', body: formData })
      if (!uploadRes.ok) {
        setError('Image upload failed')
        setLoading(false)
        return
      }
      const uploadData = await uploadRes.json()
      imageUrl = uploadData.url
    }

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content.trim(), image_url: imageUrl }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Failed to create post')
      setLoading(false)
      return
    }

    onPostCreated(data)
    setContent('')
    removeImage()
    setLoading(false)
  }

  const initials = `${currentUser.first_name[0] ?? ''}${currentUser.last_name[0] ?? ''}`.toUpperCase()

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <Avatar className="h-9 w-9 ring-2 ring-slate-100 shrink-0">
            <AvatarImage src={currentUser.avatar_url ?? undefined} />
            <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <Textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="min-h-[80px] resize-none border-0 p-0 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:ring-0 shadow-none"
              maxLength={MAX}
            />
            {imagePreview && (
              <div className="relative inline-block">
                <img src={imagePreview} alt="Preview"
                  className="max-h-48 rounded-lg border border-slate-100 object-cover" />
                <button type="button" onClick={removeImage}
                  className="absolute -right-2 -top-2 rounded-full bg-slate-700 p-0.5 text-white hover:bg-slate-900">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <div className="flex items-center gap-2">
                <input ref={fileRef} type="file" accept="image/jpeg,image/png"
                  onChange={handleFileChange} className="hidden" />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="text-slate-400 hover:text-indigo-500 transition-colors">
                  <ImageIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs ${remaining < 20 ? 'text-amber-500' : 'text-slate-400'}`}>
                  {remaining}
                </span>
                <Button type="submit" disabled={loading || !content.trim()}
                  size="sm"
                  className="bg-slate-800 hover:bg-slate-700 text-white px-5">
                  {loading ? 'Posting…' : 'Post'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
