export interface Profile {
  id: string
  username: string
  first_name: string
  last_name: string
  bio: string | null
  avatar_url: string | null
  website: string | null
  location: string | null
  created_at: string
  updated_at: string
  last_login: string | null
  email?: string | null
}

export interface ProfileWithStats extends Profile {
  posts_count: number
  followers_count: number
  following_count: number
  is_following?: boolean
}

export interface Post {
  id: string
  author_id: string
  content: string
  image_url: string | null
  is_active: boolean
  like_count: number
  comment_count: number
  created_at: string
  updated_at: string
  author?: Profile
  is_liked?: boolean
}

export interface Comment {
  id: string
  user_id: string
  post_id: string
  content: string
  created_at: string
  updated_at: string
  author?: Profile
}

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export interface ApiError {
  error: string
  details?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  per_page: number
  total: number
  has_more: boolean
}

export interface AuthUser {
  id: string
  email: string
  profile: Profile
}
