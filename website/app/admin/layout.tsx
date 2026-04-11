'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const NAV = [
  { section: 'Overview', items: [
    { href: '/admin', label: 'Dashboard', emoji: '📊' },
    { href: '/admin/bookings', label: 'Bookings', emoji: '📅' },
    { href: '/admin/calendar', label: 'Calendar', emoji: '🗓' },
    { href: '/admin/channels', label: 'Channel Manager', emoji: '🔗' },
    { href: '/admin/analytics', label: 'Analytics', emoji: '📈' },
  ]},
  { section: 'Guest Flow', items: [
    { href: '/admin/agreements', label: 'Rules & Agreements', emoji: '📝' },
    { href: '/admin/messages', label: 'Welcome Messages', emoji: '💌' },
    { href: '/admin/deposits', label: 'Security Deposits', emoji: '🔒' },
    { href: '/admin/incidents', label: 'Incidents', emoji: '⚠️' },
    { href: '/admin/guests', label: 'Guests (CRM)', emoji: '👥' },
  ]},
  { section: 'Property', items: [
    { href: '/admin/accommodations', label: 'Accommodations', emoji: '🏡' },
    { href: '/admin/media', label: 'Media Library', emoji: '🖼️' },
    { href: '/admin/rooms', label: 'Room Pricing', emoji: '💲' },
    { href: '/admin/addons', label: 'Add-on Services', emoji: '✦' },
    { href: '/admin/food', label: 'Food Menu', emoji: '🍽' },
    { href: '/admin/promos', label: 'Promotions', emoji: '🎟' },
  ]},
  { section: 'Finance', items: [
    { href: '/admin/payments', label: 'Payments', emoji: '💳' },
    { href: '/admin/verification', label: 'Payment Verification', emoji: '🔐' },
  ]},
  { section: 'Management', items: [
    { href: '/admin/cms', label: 'Website CMS', emoji: '🌐' },
    { href: '/admin/staff', label: 'Staff & Roles', emoji: '👤' },
    { href: '/admin/logs', label: 'System Logs', emoji: '🧾' },
    { href: '/admin/settings', label: 'Settings', emoji: '⚙️' },
    { href: '/admin/god-mode', label: 'God Mode 🔥', emoji: '🔥' },
  ]},
]

const allItems = NAV.flatMap(g => g.items)

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userRole, setUserRole] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/admin/login'); return }
      setUserEmail(data.user.email || '')
      setUserRole(localStorage.getItem('luntian_role') || 'admin')
    })
  }, [router])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  async function handleSignOut() {
    await supabase.auth.signOut(); router.push('/admin/login')
  }

  const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : 'LN'
  const currentLabel = allItems.find(n => n.href === pathname)?.label || 'Dashboard'

  const SidebarInner = () => (
    <>
      <div className={`flex items-center gap-3 px-4 py-4 border-b border-gray-100 flex-shrink-0 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0" style={{background:'linear-gradient(135deg,#2d6a4f,#52b788)'}}>🌿</div>
        {!collapsed && <div><div className="font-bold text-gray-900 text-sm">Luntian OS</div><div className="text-xs text-gray-400">admin.luntian.net</div></div>}
      </div>

      <nav className="flex-1 overflow-y-auto py-2 space-y-0.5">
        {NAV.map(group => (
          <div key={group.section}>
            {!collapsed && <div className="px-4 pt-4 pb-1 text-xs font-bold text-gray-300 uppercase tracking-widest">{group.section}</div>}
            {collapsed && <div className="my-1 mx-3 border-t border-gray-100"/>}
            <div className="px-2 space-y-0.5">
              {group.items.map(item => {
                const active = pathname === item.href
                const isGod = item.href === '/admin/god-mode'
                return (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all group relative ${collapsed ? 'justify-center' : ''} ${active ? 'text-white shadow-sm' : isGod ? 'text-orange-600 hover:bg-orange-50' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
                    style={active ? {background:'linear-gradient(135deg,#1b4332,#2d6a4f)'} : {}}>
                    <span className="text-base leading-none flex-shrink-0">{item.emoji}</span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {collapsed && (
                      <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">{item.label}</span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className={`border-t border-gray-100 p-3 flex-shrink-0 ${collapsed ? 'flex justify-center' : ''}`}>
        {collapsed
          ? <button onClick={handleSignOut} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{background:'linear-gradient(135deg,#2d6a4f,#52b788)'}}>{initials}</button>
          : <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{background:'linear-gradient(135deg,#2d6a4f,#52b788)'}}>{initials}</div>
              <div className="flex-1 min-w-0"><div className="text-xs font-semibold text-gray-800 truncate">{userEmail}</div><div className="text-xs text-gray-400 capitalize">{userRole}</div></div>
              <button onClick={handleSignOut} className="text-gray-300 hover:text-red-400 p-1">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/></svg>
              </button>
            </div>
        }
      </div>
    </>
  )

  return (
    <div className="flex h-screen overflow-hidden" style={{background:'#f7f8fa'}}>
      {mobileOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileOpen(false)}/>}
      
      <aside className={`hidden lg:flex flex-col bg-white border-r border-gray-100 flex-shrink-0 transition-all duration-300 ${collapsed ? 'w-14' : 'w-56'}`}>
        <SidebarInner/>
      </aside>

      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-100 w-60 transform transition-transform duration-300 lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarInner/>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/></svg>
            </button>
            <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/></svg>
            </button>
            <div>
              <h1 className="font-bold text-gray-900 text-base leading-tight">{currentLabel}</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Luntian Log Cabin · Property OS</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/god-mode" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-orange-200 text-orange-600 hover:bg-orange-50 transition-colors">🔥 God Mode</Link>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{background:'#d8f3dc',color:'#2d6a4f'}}>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/>Live
            </div>
            <a href="https://www.luntian.net" target="_blank" className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 text-gray-500 hover:bg-gray-50">🌐 View Site</a>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-5">{children}</main>
      </div>
    </div>
  )
}
