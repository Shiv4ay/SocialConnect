import { Navbar } from '@/components/layout/navbar'
import { InactivityGuard } from '@/components/layout/inactivity-guard'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <InactivityGuard />
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6">
        {children}
      </main>
    </div>
  )
}
