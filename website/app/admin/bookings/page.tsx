'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase, Booking, Room } from '@/lib/supabase'

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-green-50 text-green-700',
  pending: 'bg-yellow-50 text-yellow-700',
  cancelled: 'bg-red-50 text-red-700',
  completed: 'bg-gray-100 text-gray-600',
}
const PLATFORMS = ['Airbnb','Agoda','Website','Direct','Other']
const STATUSES = ['confirmed','pending','cancelled','completed']

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [adding, setAdding] = useState(false)
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState({ guest_name: '', guest_email: '', guest_phone: '', room_id: '', platform: 'Airbnb', check_in: '', check_out: '', num_guests: 1, base_price: 0, status: 'confirmed', special_requests: '', notes: '', has_pet: false })

  async function load() {
    const [{ data: b }, { data: r }] = await Promise.all([
      supabase.from('bookings').select('*, rooms(name)').order('check_in', { ascending: false }),
      supabase.from('rooms').select('*').order('sort_order')
    ])
    setBookings(b || []); setRooms(r || [])
    if (r && r.length > 0 && !form.room_id) setForm(f => ({ ...f, room_id: r[0].id }))
  }
  useEffect(() => { load() }, [])

  async function addBooking() {
    if (!form.guest_name || !form.check_in || !form.check_out || !form.room_id) return
    const ref = 'LNT-' + Date.now().toString().slice(-6)
    await supabase.from('bookings').insert([{ ...form, booking_ref: ref, total_revenue: form.base_price }])
    setAdding(false); load()
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('bookings').update({ status }).eq('id', id)
    setBookings(b => b.map(x => x.id === id ? { ...x, status } : x))
  }

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['all', ...STATUSES].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${filter === s ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={() => setAdding(!adding)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          {adding ? 'Cancel' : '+ Add booking'}
        </button>
      </div>

      {adding && (
        <div className="bg-white border border-blue-100 rounded-xl p-5">
          <div className="text-sm font-medium mb-4">New booking</div>
          <div className="grid grid-cols-3 gap-3">
            {[['Guest name','guest_name','text'],['Email','guest_email','email'],['Phone','guest_phone','text']].map(([label, field, type]) => (
              <div key={field}><label className="text-xs text-gray-500 mb-1 block">{label}</label>
                <input type={type} value={(form as any)[field]} onChange={e => setForm({...form, [field]: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" /></div>
            ))}
            <div><label className="text-xs text-gray-500 mb-1 block">Room</label>
              <select value={form.room_id} onChange={e => setForm({...form, room_id: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
                {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Platform</label>
              <select value={form.platform} onChange={e => setForm({...form, platform: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
                {PLATFORMS.map(p => <option key={p}>{p}</option>)}
              </select></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Check-in</label>
              <input type="date" value={form.check_in} onChange={e => setForm({...form, check_in: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" /></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Check-out</label>
              <input type="date" value={form.check_out} onChange={e => setForm({...form, check_out: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" /></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Base price (₱)</label>
              <input type="number" value={form.base_price} onChange={e => setForm({...form, base_price: Number(e.target.value)})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" /></div>
            <div className="col-span-3"><label className="text-xs text-gray-500 mb-1 block">Special requests</label>
              <input value={form.special_requests} onChange={e => setForm({...form, special_requests: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" /></div>
          </div>
          <button onClick={addBooking} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Save booking</button>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-xs text-gray-400 border-b border-gray-100">
            {['Ref','Guest','Room','Check-in','Check-out','Platform','Total','Status'].map(h => <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map(b => (
              <tr key={b.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                <td className="px-4 py-3 text-gray-400 text-xs font-mono">{b.booking_ref}</td>
                <td className="px-4 py-3 font-medium">{b.guest_name}</td>
                <td className="px-4 py-3 text-gray-500">{(b.rooms as any)?.name || '—'}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(b.check_in).toLocaleDateString('en-PH',{month:'short',day:'numeric'})}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(b.check_out).toLocaleDateString('en-PH',{month:'short',day:'numeric'})}</td>
                <td className="px-4 py-3 text-gray-500">{b.platform}</td>
                <td className="px-4 py-3 font-medium">₱{(b.total_revenue||0).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <select value={b.status} onChange={e => updateStatus(b.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-lg border-0 font-medium cursor-pointer focus:outline-none ${STATUS_COLORS[b.status] || 'bg-gray-100'}`}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={8} className="px-5 py-8 text-center text-sm text-gray-400">No bookings found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
