'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase, Staff } from '@/lib/supabase'

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [adding, setAdding] = useState(false)
  const [newStaff, setNewStaff] = useState({ email: '', full_name: '', role: 'admin' })

  async function load() {
    const { data } = await supabase.from('staff').select('*').order('created_at')
    setStaff(data || [])
  }
  useEffect(() => { load() }, [])

  async function addStaff() {
    if (!newStaff.email || !newStaff.full_name) return
    await supabase.from('staff').insert([{ ...newStaff, is_active: true }])
    setNewStaff({ email: '', full_name: '', role: 'admin' })
    setAdding(false); load()
  }

  async function toggleActive(id: string, val: boolean) {
    await supabase.from('staff').update({ is_active: val }).eq('id', id)
    setStaff(s => s.map(x => x.id === id ? { ...x, is_active: val } : x))
  }

  const ACCESS_TABLE = [
    ['View bookings', true, true],
    ['Add / edit bookings', true, true],
    ['Change room prices', true, false],
    ['Manage food menu', true, true],
    ['Manage add-on services', true, true],
    ['Manage staff', true, false],
  ]

  const initials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()
  const colors = ['bg-blue-100 text-blue-700','bg-green-100 text-green-700','bg-purple-100 text-purple-700','bg-orange-100 text-orange-700']

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => setAdding(!adding)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          {adding ? 'Cancel' : '+ Invite staff'}
        </button>
      </div>

      {adding && (
        <div className="bg-white border border-blue-100 rounded-xl p-5">
          <div className="text-sm font-medium mb-4">Add team member</div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Full name</label>
              <input value={newStaff.full_name} onChange={e => setNewStaff({...newStaff, full_name: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" /></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Email</label>
              <input type="email" value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" /></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Role</label>
              <select value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
              </select></div>
          </div>
          <button onClick={addStaff} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Add member</button>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        {staff.map((s, i) => (
          <div key={s.id} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${colors[i % colors.length]}`}>
              {initials(s.full_name)}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">{s.full_name}</div>
              <div className="text-xs text-gray-400">{s.email}</div>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${s.role === 'owner' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
              {s.role}
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={s.is_active} onChange={e => toggleActive(s.id, e.target.checked)} className="sr-only peer" disabled={s.role === 'owner'} />
              <div className="w-9 h-5 bg-gray-200 peer-checked:bg-blue-600 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4 peer-disabled:opacity-40"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Access levels</span>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="text-xs text-gray-400 border-b border-gray-100">
            <th className="text-left px-5 py-3 font-medium">Feature</th>
            <th className="px-5 py-3 font-medium text-center">Owner</th>
            <th className="px-5 py-3 font-medium text-center">Admin</th>
          </tr></thead>
          <tbody>
            {ACCESS_TABLE.map(([label, owner, admin]) => (
              <tr key={label as string} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-3 text-gray-600">{label as string}</td>
                <td className="px-5 py-3 text-center">{owner ? <span className="text-green-600 font-bold">✓</span> : <span className="text-gray-300">—</span>}</td>
                <td className="px-5 py-3 text-center">{admin ? <span className="text-green-600 font-bold">✓</span> : <span className="text-gray-300">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
