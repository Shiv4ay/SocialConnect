'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, User, LogOut, Users } from 'lucide-react'

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const navLink = (href: string, label: string, icon: React.ReactNode) => (
    <Link
      href={href}
      className={`flex items-center gap-1.5 text-sm font-medium transition-colors px-2 py-1.5 rounded-md ${
        pathname === href
          ? 'text-slate-900 bg-slate-100'
          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Link>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/feed" className="text-lg font-semibold text-slate-900 tracking-tight">
          SocialConnect
        </Link>
        <nav className="flex items-center gap-1">
          {navLink('/feed', 'Feed', <Home className="h-4 w-4" />)}
          {navLink('/users', 'Discover', <Users className="h-4 w-4" />)}
          {navLink('/profile/me', 'Profile', <User className="h-4 w-4" />)}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-red-500 transition-colors px-2 py-1.5 rounded-md hover:bg-slate-50 ml-1"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </nav>
      </div>
    </header>
  )
}
