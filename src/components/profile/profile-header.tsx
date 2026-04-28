'use client'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ProfileWithStats } from '@/types'
import { MapPin, LinkIcon } from 'lucide-react'

interface ProfileHeaderProps {
  profile: ProfileWithStats
  isOwnProfile: boolean
}

export function ProfileHeader({ profile, isOwnProfile }: ProfileHeaderProps) {
  const [following, setFollowing] = useState(profile.is_following ?? false)
  const [followerCount, setFollowerCount] = useState(profile.followers_count)
  const [loading, setLoading] = useState(false)

  const initials = `${profile.first_name[0] ?? ''}${profile.last_name[0] ?? ''}`.toUpperCase()

  async function toggleFollow() {
    setLoading(true)
    const method = following ? 'DELETE' : 'POST'
    const res = await fetch(`/api/users/${profile.id}/follow`, { method })
    if (res.ok) {
      setFollowing(!following)
      setFollowerCount(c => following ? c - 1 : c + 1)
    }
    setLoading(false)
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <Avatar className="h-16 w-16 ring-2 ring-slate-100">
          <AvatarImage src={profile.avatar_url ?? undefined} />
          <AvatarFallback className="bg-slate-100 text-slate-600 text-xl font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        {!isOwnProfile && (
          <Button
            onClick={toggleFollow}
            disabled={loading}
            variant={following ? 'outline' : 'default'}
            size="sm"
            className={following
              ? 'border-slate-200 text-slate-700 hover:border-red-200 hover:text-red-600'
              : 'bg-slate-800 hover:bg-slate-700 text-white'
            }
          >
            {following ? 'Following' : 'Follow'}
          </Button>
        )}
      </div>
      <div className="mt-3">
        <h1 className="text-lg font-semibold text-slate-900">
          {profile.first_name} {profile.last_name}
        </h1>
        <p className="text-sm text-slate-500">@{profile.username}</p>
        {profile.bio && (
          <p className="mt-2 text-sm text-slate-700 leading-relaxed">{profile.bio}</p>
        )}
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
          {profile.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />{profile.location}
            </span>
          )}
          {profile.website && (
            <a href={profile.website} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700">
              <LinkIcon className="h-3.5 w-3.5" />{profile.website.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>
        <div className="mt-4 flex gap-5 text-sm">
          <span><strong className="font-semibold text-slate-900">{profile.posts_count}</strong>
            <span className="ml-1 text-slate-500">Posts</span></span>
          <span><strong className="font-semibold text-slate-900">{followerCount}</strong>
            <span className="ml-1 text-slate-500">Followers</span></span>
          <span><strong className="font-semibold text-slate-900">{profile.following_count}</strong>
            <span className="ml-1 text-slate-500">Following</span></span>
        </div>
      </div>
    </div>
  )
}
