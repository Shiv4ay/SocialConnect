# SocialConnect

A social media web application built with Next.js 16, Supabase, and Tailwind CSS.

## Features

- **Authentication** — Register and log in with email or username (JWT via Supabase Auth)
- **Posts** — Create text posts with optional image uploads (JPEG/PNG, max 2 MB)
- **Feed** — Personalised chronological feed; shows posts from followed users
- **Likes & Comments** — Like/unlike posts, add and delete comments
- **Profiles** — Bio, avatar, website, location, follower/following stats
- **Follow System** — Follow and unfollow other users
- **Discover** — Search for users by name or username
- **Session timeout** — Auto-logout after 15 minutes of inactivity

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth (JWT, cookie-based) |
| Storage | Supabase Storage |
| UI | Tailwind CSS + shadcn/ui |
| Validation | Zod |
| Deployment | Vercel |

## Getting Started

1. Clone and install:
```bash
npm install
```

2. Create `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

3. Run the development server:
```bash
npm run dev
```

## Deployment

Import this repository into [Vercel](https://vercel.com) and add the three environment variables in project settings. Update your Supabase **Site URL** and **Redirect URLs** to include your Vercel domain.
