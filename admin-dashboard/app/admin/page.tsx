'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase, Booking, Room } from '@/lib/supabase'
import Link from 'next/link'

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: b }, { data: r }] = await Promise.all([
        supabase.from('bookings').select('*, rooms(name)').order('created_at', { ascending: false }).limit(5),
        supabase.from('rooms').select('*').order('sort_order'),
      ])
      setBookings(b || [])
      setRooms(r || [])
      setLoading(false)
    }
    load()
  }, [])

  const thisMonth = bookings.filter(b => {
    const d = new Date(b.created_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const totalRevenue = thisMonth.reduce((s, b) => s + (b.total_revenue || 0), 0)

  const statusColor: Record<string, string> = {
    confirmed: 'bg-green-50 text-green-700',
    pending: 'bg-yellow-50 text-yellow-700',
    cancelled: 'bg-red-50 text-red-700',
    completed: 'bg-gray-100 text-gray-600',
  }

  if (loading) return <div className="text-sm text-gray-400">Loading...</div>

  return (
    <div className="space-y-5">
      {/* Metrics */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'This month revenue', value: `₱${totalRevenue.toLocaleString()}`, sub: `${thisMonth.length} bookings` },
          { label: 'Total bookings', value: bookings.length.toString(), sub: 'all time' },
          { label: 'Rooms', value: rooms.length.toString(), sub: 'properties' },
          { label: 'Active platform', value: 'Airbnb', sub: '+ Agoda, Website' },
        ].map(m => (
          <div key={m.label} className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1.5">{m.label}</div>
            <div className="text-2xl font-medium text-gray-900">{m.value}</div>
            <div className="text-xs text-gray-400 mt-1">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-medium">Recent bookings</h2>
          <Link href="/admin/bookings" className="text-xs text-blue-600 hover:underline">View all →</Link>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="text-xs text-gray-400 border-b border-gray-100">
            {['Guest', 'Room', 'Check-in', 'Platform', 'Total', 'Status'].map(h => (
              <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {bookings.slice(0, 5).map(b => (
              <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-5 py-3">{b.guest_name}</td>
                <td className="px-5 py-3 text-gray-500">{(b.rooms as any)?.name || '—'}</td>
                <td className="px-5 py-3 text-gray-500">{new Date(b.check_in).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}</td>
                <td className="px-5 py-3 text-gray-500">{b.platform}</td>
                <td className="px-5 py-3 font-medium">₱{(b.total_revenue || 0).toLocaleString()}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full ${statusColor[b.status] || 'bg-gray-100 text-gray-600'}`}>
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-400">No bookings yet. Add your first booking!</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Room status */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="text-sm font-medium mb-4">Rooms</h2>
        <div className="grid grid-cols-3 gap-3">
          {rooms.map(r => (
            <div key={r.id} className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-800">{r.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">{r.description}</div>
              <div className="text-sm font-medium text-gray-900 mt-2">₱{r.price_weekday.toLocaleString()} <span className="text-xs text-gray-400 font-normal">/ weeknight</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
