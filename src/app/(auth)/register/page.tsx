'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    email: '', username: '', password: '', first_name: '', last_name: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    if (!res.ok) {
      if (data.details) {
        // Format object of field errors into a single string
        const errorMessages = Object.entries(data.details)
          .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
          .join(' | ')
        setError(errorMessages)
      } else {
        setError(data.error ?? 'Registration failed')
      }
      setLoading(false)
      return
    }

    router.push('/feed')
    router.refresh()
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-center text-lg font-medium">Create your account</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="first_name" className="text-sm text-slate-700">First name</Label>
              <Input id="first_name" value={form.first_name} onChange={update('first_name')}
                placeholder="First Name" className="border-slate-200" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="last_name" className="text-sm text-slate-700">Last name</Label>
              <Input id="last_name" value={form.last_name} onChange={update('last_name')}
                placeholder="Last Name" className="border-slate-200" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-sm text-slate-700">Username</Label>
            <Input id="username" value={form.username} onChange={update('username')}
              placeholder="Username" className="border-slate-200" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm text-slate-700">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={update('email')}
              placeholder="Enter Your Email" className="border-slate-200" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm text-slate-700">Password</Label>
            <Input id="password" type="password" value={form.password} onChange={update('password')}
              placeholder="Min. 8 characters" className="border-slate-200" required />
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-3 pt-2">
          <Button type="submit" disabled={loading}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white">
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
          <p className="text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
