'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase, Booking, Room } from '@/lib/supabase'
import Link from 'next/link'

const STATUS_COLORS: Record<string, {bg: string, text: string, dot: string}> = {
  confirmed: {bg:'#d8f3dc', text:'#2d6a4f', dot:'#52b788'},
  pending: {bg:'#fff3cd', text:'#856404', dot:'#ffc107'},
  cancelled: {bg:'#fde8e8', text:'#c0392b', dot:'#e74c3c'},
  completed: {bg:'#e8eaf6', text:'#3949ab', dot:'#5c6bc0'},
}

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: b }, { data: r }] = await Promise.all([
        supabase.from('bookings').select('*, rooms(name)').order('created_at', { ascending: false }),
        supabase.from('rooms').select('*').order('sort_order'),
      ])
      setBookings(b || [])
      setRooms(r || [])
      setLoading(false)
    }
    load()
  }, [])

  const now = new Date()
  const thisMonthBookings = bookings.filter(b => {
    const d = new Date(b.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const totalRevenue = thisMonthBookings.reduce((s, b) => s + (b.total_revenue || 0), 0)
  const activeBookings = bookings.filter(b => b.status === 'confirmed').length

  const metrics = [
    { label: 'Revenue this month', value: `₱${totalRevenue.toLocaleString()}`, sub: `${thisMonthBookings.length} bookings`, icon: '💰', color: '#2d6a4f', bg: '#d8f3dc' },
    { label: 'Active bookings', value: activeBookings.toString(), sub: 'confirmed stays', icon: '✅', color: '#1565c0', bg: '#e3f2fd' },
    { label: 'Total bookings', value: bookings.length.toString(), sub: 'all time', icon: '📋', color: '#6a1b9a', bg: '#f3e5f5' },
    { label: 'Properties', value: rooms.length.toString(), sub: 'Sunrise · Leaf · 2BR', icon: '🏡', color: '#e65100', bg: '#fff3e0' },
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{borderColor:'#2d6a4f', borderTopColor:'transparent'}}></div>
        <p className="text-sm text-gray-400">Loading dashboard...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Welcome banner */}
      <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{background:'linear-gradient(135deg,#1b4332,#2d6a4f,#40916c)'}}>
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-1">Welcome back! 🌿</h2>
          <p className="text-green-100 text-sm">Here's what's happening at Luntian Log Cabin today.</p>
        </div>
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-10 bg-white"></div>
        <div className="absolute -right-2 -bottom-8 w-24 h-24 rounded-full opacity-10 bg-white"></div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(m => (
          <div key={m.label} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{background:m.bg}}>{m.icon}</div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-0.5">{m.value}</div>
            <div className="text-xs text-gray-400">{m.sub}</div>
            <div className="text-xs font-medium mt-1" style={{color:m.color}}>{m.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h3 className="font-semibold text-gray-900">Recent Bookings</h3>
            <Link href="/admin/bookings" className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors hover:opacity-80" style={{background:'#d8f3dc', color:'#2d6a4f'}}>View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {bookings.slice(0, 5).map(b => {
              const s = STATUS_COLORS[b.status] || STATUS_COLORS.confirmed
              return (
                <div key={b.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/50 transition-colors">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{background:'linear-gradient(135deg,#2d6a4f,#52b788)'}}>
                    {b.guest_name.slice(0,2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{b.guest_name}</div>
                    <div className="text-xs text-gray-400">{(b.rooms as any)?.name || '—'} · {b.platform}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-semibold text-gray-900">₱{(b.total_revenue||0).toLocaleString()}</div>
                    <div className="text-xs text-gray-400">{new Date(b.check_in).toLocaleDateString('en-PH',{month:'short',day:'numeric'})}</div>
                  </div>
                  <span className="flex-shrink-0 flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full" style={{background:s.bg, color:s.text}}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{background:s.dot}}></span>
                    {b.status}
                  </span>
                </div>
              )
            })}
            {bookings.length === 0 && (
              <div className="flex flex-col items-center py-12 text-center">
                <div className="text-3xl mb-3">📋</div>
                <p className="text-sm text-gray-500 font-medium">No bookings yet</p>
                <p className="text-xs text-gray-400 mt-1">Add your first booking to get started</p>
                <Link href="/admin/bookings" className="mt-3 text-xs font-medium px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-80" style={{background:'#2d6a4f'}}>+ Add Booking</Link>
              </div>
            )}
          </div>
        </div>

        {/* Rooms card */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h3 className="font-semibold text-gray-900">Room Rates</h3>
            <Link href="/admin/rooms" className="text-xs text-gray-400 hover:text-gray-600">Edit →</Link>
          </div>
          <div className="p-4 space-y-3">
            {rooms.map((r, i) => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl" style={{background: i===0?'#f0faf2': i===1?'#fff8f0':'#f0f4ff'}}>
                <div className="text-xl">{i===0?'🌅':i===1?'🍃':'🏡'}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-800">{r.name}</div>
                  <div className="text-xs text-gray-400">{r.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">₱{r.price_weekday.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">weeknight</div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 pb-4">
            <Link href="/admin/rooms" className="block w-full text-center py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">Manage Pricing</Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {label:'Add Booking', href:'/admin/bookings', icon:'📅', color:'#d8f3dc', text:'#2d6a4f'},
            {label:'Update Prices', href:'/admin/rooms', icon:'💲', color:'#e3f2fd', text:'#1565c0'},
            {label:'Manage Menu', href:'/admin/food', icon:'🍽', color:'#fff3e0', text:'#e65100'},
            {label:'Add Staff', href:'/admin/staff', icon:'👤', color:'#f3e5f5', text:'#6a1b9a'},
          ].map(a => (
            <Link key={a.label} href={a.href} className="flex flex-col items-center gap-2 p-4 rounded-xl hover:opacity-80 transition-opacity" style={{background:a.color}}>
              <span className="text-2xl">{a.icon}</span>
              <span className="text-xs font-semibold" style={{color:a.text}}>{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
