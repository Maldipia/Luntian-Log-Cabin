'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const nav = [
  { href: '/admin', label: 'Dashboard', icon: '▦' },
  { href: '/admin/bookings', label: 'Bookings', icon: '📅' },
  { href: '/admin/rooms', label: 'Room Pricing', icon: '🏠' },
  { href: '/admin/food', label: 'Food Menu', icon: '🍽' },
  { href: '/admin/addons', label: 'Add-on Services', icon: '✦' },
  { href: '/admin/staff', label: 'Staff', icon: '👤' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [userEmail, setUserEmail] = useState('')
  const [userRole, setUserRole] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/'); return }
      setUserEmail(data.user.email || '')
      setUserRole(localStorage.getItem('luntian_role') || 'admin')
    })
  }, [router])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : 'LN'

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-52 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-100">
          <div className="text-xl mb-1">🌿</div>
          <div className="font-medium text-gray-900 text-sm">Luntian Admin</div>
          <div className="text-xs text-gray-400">luntian.net</div>
        </div>
        <nav className="flex-1 py-2">
          {nav.map(item => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all border-l-2 ${
                pathname === item.href
                  ? 'text-blue-600 border-blue-500 bg-blue-50'
                  : 'text-gray-500 border-transparent hover:bg-gray-50 hover:text-gray-800'
              }`}>
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700 flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-800 truncate">{userEmail}</div>
            <div className="text-xs text-gray-400 capitalize">{userRole}</div>
          </div>
          <button onClick={handleSignOut} className="text-xs text-gray-400 hover:text-gray-600">↩</button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
          <h1 className="font-medium text-gray-900">
            {nav.find(n => n.href === pathname)?.label || 'Dashboard'}
          </h1>
          <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full">● Live</span>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
