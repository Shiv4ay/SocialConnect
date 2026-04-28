'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera } from 'lucide-react'

export default function EditProfilePage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({ bio: '', website: '', location: '' })
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [initials, setInitials] = useState('')

  useEffect(() => {
    fetch('/api/users/me')
      .then(r => r.json())
      .then(profile => {
        setForm({ bio: profile.bio ?? '', website: profile.website ?? '', location: profile.location ?? '' })
        setAvatarUrl(profile.avatar_url)
        setInitials(`${profile.first_name[0] ?? ''}${profile.last_name[0] ?? ''}`.toUpperCase())
      })
  }, [])

  const update = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setError('Avatar must be smaller than 2MB'); return }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (avatarFile) {
      const fd = new FormData()
      fd.append('avatar', avatarFile)
      const uploadRes = await fetch('/api/users/me/avatar', { method: 'POST', body: fd })
      if (!uploadRes.ok) { setError('Avatar upload failed'); setLoading(false); return }
    }

    const res = await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bio: form.bio || null,
        website: form.website || null,
        location: form.location || null,
      }),
    })

    if (!res.ok) { setError('Failed to update profile'); setLoading(false); return }

    router.push('/profile/me')
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Edit Profile</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="h-20 w-20 ring-2 ring-slate-100">
                  <AvatarImage src={avatarPreview ?? avatarUrl ?? undefined} />
                  <AvatarFallback className="bg-slate-100 text-slate-600 text-xl font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="absolute bottom-0 right-0 rounded-full bg-slate-800 p-1.5 text-white hover:bg-slate-700 shadow">
                  <Camera className="h-3.5 w-3.5" />
                </button>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png"
                  onChange={handleAvatarChange} className="hidden" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-slate-700">Bio</Label>
              <Textarea value={form.bio} onChange={update('bio')} maxLength={160}
                placeholder="Tell people about yourself (max 160 characters)"
                className="resize-none border-slate-200 focus-visible:ring-indigo-500 text-sm" />
              <p className="text-xs text-slate-400 text-right">{form.bio.length}/160</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-slate-700">Website</Label>
              <Input value={form.website} onChange={update('website')}
                placeholder="https://yourwebsite.com"
                className="border-slate-200 focus-visible:ring-indigo-500 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-slate-700">Location</Label>
              <Input value={form.location} onChange={update('location')}
                placeholder="City, Country"
                className="border-slate-200 focus-visible:ring-indigo-500 text-sm" />
            </div>
          </CardContent>
          <CardFooter className="gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}
              className="flex-1 border-slate-200">
              Cancel
            </Button>
            <Button type="submit" disabled={loading}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white">
              {loading ? 'Saving…' : 'Save changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
