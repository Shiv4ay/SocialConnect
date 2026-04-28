import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Profile } from '@/types'
import { UserSearch } from './search'

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let query = supabase
    .from('profiles')
    .select('*')
    .neq('id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (q) {
    query = query.or(`username.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%`)
  }

  const { data: users } = await query

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-900">Discover People</h1>
      
      <UserSearch />

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
        {(users ?? []).map((profile: Profile) => {
          const initials = `${profile.first_name[0] ?? ''}${profile.last_name[0] ?? ''}`.toUpperCase()
          return (
            <Link key={profile.id} href={`/profile/${profile.id}`}
              className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors">
              <Avatar className="h-10 w-10 ring-2 ring-slate-100">
                <AvatarImage src={profile.avatar_url ?? undefined} />
                <AvatarFallback className="bg-slate-100 text-slate-600 text-sm font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900">
                  {profile.first_name} {profile.last_name}
                </p>
                <p className="text-xs text-slate-500">@{profile.username}</p>
                {profile.bio && (
                  <p className="mt-0.5 text-xs text-slate-400 truncate">{profile.bio}</p>
                )}
              </div>
            </Link>
          )
        })}
        {(users ?? []).length === 0 && (
          <p className="p-8 text-center text-sm text-slate-500">
            {q ? `No users found matching "${q}"` : "No other users yet."}
          </p>
        )}
      </div>
    </div>
  )
}
