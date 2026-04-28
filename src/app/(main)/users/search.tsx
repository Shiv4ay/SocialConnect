'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

export function UserSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/users?q=${encodeURIComponent(query.trim())}`)
    } else {
      router.push('/users')
    }
  }

  return (
    <form onSubmit={handleSearch} className="flex gap-2 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name or username..."
          className="pl-9 border-slate-200 focus-visible:ring-indigo-500"
        />
      </div>
      <Button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white">
        Search
      </Button>
    </form>
  )
}
