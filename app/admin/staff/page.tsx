'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase, Staff } from '@/lib/supabase'

const ALWAYS_ON = [
  { label: 'View bookings',           icon: '📅' },
  { label: 'Add / edit bookings',     icon: '✏️' },
  { label: 'Manage food menu',        icon: '🍽' },
  { label: 'Manage add-on services',  icon: '✦'  },
  { label: 'Manage promotions',       icon: '🎟' },
  { label: 'View guests (CRM)',       icon: '👥' },
  { label: 'Manage accommodations',   icon: '🏡' },
  { label: 'Media library',           icon: '🖼️' },
  { label: 'Welcome messages',        icon: '💌' },
  { label: 'Rules & agreements',      icon: '📝' },
  { label: 'Payments config',         icon: '💳' },
  { label: 'Payment verification',    icon: '🔐' },
  { label: 'Calendar',                icon: '🗓' },
]

const TOGGLEABLE = [
  { key: 'perm_admin_pricing',   label: 'Room Pricing',      icon: '💲', danger: false },
  { key: 'perm_admin_cms',       label: 'Website CMS',       icon: '🌐', danger: false },
  { key: 'perm_admin_settings',  label: 'System Settings',   icon: '⚙️', danger: false },
  { key: 'perm_admin_analytics', label: 'Analytics',         icon: '📈', danger: false },
  { key: 'perm_admin_deposits',  label: 'Security Deposits', icon: '🔒', danger: false },
  { key: 'perm_admin_incidents', label: 'Incidents',         icon: '⚠️', danger: false },
  { key: 'perm_admin_channels',  label: 'Channel Manager',   icon: '🔗', danger: false },
  { key: 'perm_admin_logs',      label: 'System Logs',       icon: '🧾', danger: false },
  { key: 'perm_admin_god_mode',  label: 'God Mode 🔥',       icon: '🔥', danger: true  },
  { key: 'perm_admin_staff',     label: 'Staff Management',  icon: '👤', danger: true  },
]

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [perms, setPerms] = useState<Record<string, { id: string; value: boolean }>>({})
  const [adding, setAdding] = useState(false)
  const [newStaff, setNewStaff] = useState({ email: '', full_name: '', role: 'admin' })
  const [creating, setCreating] = useState(false)
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState<string | null>(null)

  async function load() {
    const [{ data: s }, { data: p }] = await Promise.all([
      supabase.from('staff').select('*').order('created_at'),
      supabase.from('settings').select('id,key,value').like('key', 'perm_%'),
    ])
    setStaff(s || [])
    const pm: Record<string, { id: string; value: boolean }> = {}
    ;(p || []).forEach((x: any) => { pm[x.key] = { id: x.id, value: x.value === 'true' } })
    setPerms(pm)
  }
  useEffect(() => { load() }, [])

  async function togglePerm(key: string) {
    const cur = perms[key]
    if (!cur) return
    const newVal = !cur.value
    setSaving(key)
    setPerms(p => ({ ...p, [key]: { ...cur, value: newVal } }))
    await supabase.from('settings').update({ value: newVal ? 'true' : 'false' }).eq('id', cur.id)
    await supabase.from('system_logs').insert([{
      action: 'TOGGLE_PERMISSION', module: 'Staff',
      description: `${key} set to ${newVal ? 'ON' : 'OFF'}`
    }])
    setSaving(null)
  }

  async function addStaff() {
    if (!newStaff.email || !newStaff.full_name) return
    setCreating(true)
    await supabase.from('staff').insert([{ ...newStaff, is_active: true }])
    await supabase.from('system_logs').insert([{ action: 'ADD_STAFF', module: 'Staff', description: `Added: ${newStaff.full_name}` }])
    setMsg(`✅ ${newStaff.full_name} added!`)
    setAdding(false)
    setNewStaff({ email: '', full_name: '', role: 'admin' })
    load()
    setCreating(false)
  }

  async function toggleActive(id: string, val: boolean) {
    const s = staff.find(x => x.id === id)
    if (s?.role === 'owner') return
    await supabase.from('staff').update({ is_active: val }).eq('id', id)
    setStaff(s => s.map(x => x.id === id ? { ...x, is_active: val } : x))
  }

  async function changeRole(id: string, role: string) {
    await supabase.from('staff').update({ role }).eq('id', id)
    setStaff(s => s.map(x => x.id === id ? { ...x, role } : x))
  }

  const initials = (n: string) => n.split(' ').map(c => c[0]).join('').slice(0, 2).toUpperCase()
  const avatarColors = [
    'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700',
    'bg-purple-100 text-purple-700', 'bg-orange-100 text-orange-700'
  ]

  const Toggle = ({ isOn, onToggle, disabled = false, danger = false, loading = false }: {
    isOn: boolean; onToggle: () => void; disabled?: boolean; danger?: boolean; loading?: boolean
  }) => (
    <button onClick={onToggle} disabled={disabled || loading}
      className={`relative inline-flex items-center w-12 h-6 rounded-full transition-all duration-200 focus:outline-none ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${isOn ? (danger ? 'bg-orange-500' : 'bg-green-500') : 'bg-gray-200'}`}>
      <span className={`inline-block w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${isOn ? 'translate-x-6' : 'translate-x-0.5'} ${loading ? 'animate-pulse' : ''}`} />
    </button>
  )

  return (
    <div className="max-w-5xl space-y-5">
      {/* Header */}
      <div className="flex justify-end">
        <button onClick={() => setAdding(!adding)}
          className="px-4 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#2d6a4f,#40916c)' }}>
          {adding ? '✕ Cancel' : '+ Invite Staff'}
        </button>
      </div>

      {/* Success message */}
      {msg && (
        <div className="p-4 rounded-2xl bg-green-50 border border-green-100 text-sm font-medium text-green-800">
          {msg}
          <div className="mt-2 p-3 bg-white rounded-xl border border-green-200 font-mono text-xs text-gray-700 space-y-1">
            <div>🔗 <strong>https://admin.luntian.net</strong></div>
            <div>🔑 Temp password: <strong>Luntian@2026</strong></div>
          </div>
        </div>
      )}

      {/* Add staff form */}
      {adding && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <h3 className="font-bold text-gray-900 mb-4">Add Team Member</h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[['Full Name *', 'full_name', 'text'], ['Email *', 'email', 'email']].map(([l, f, t]) => (
              <div key={f}>
                <label className="text-xs font-bold text-gray-500 mb-1.5 block">{l}</label>
                <input type={t} value={(newStaff as any)[f]} onChange={e => setNewStaff({ ...newStaff, [f]: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 bg-gray-50" />
              </div>
            ))}
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1.5 block">Role</label>
              <select value={newStaff.role} onChange={e => setNewStaff({ ...newStaff, role: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 bg-gray-50">
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
              </select>
            </div>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 mb-4">
            💡 Login: <strong>admin.luntian.net</strong> · Temp password: <strong>Luntian@2026</strong>
          </div>
          <button onClick={addStaff} disabled={creating}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
            style={{ background: '#2d6a4f' }}>
            {creating ? 'Adding...' : 'Add Member'}
          </button>
        </div>
      )}

      {/* Team members */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Team Members</span>
          <span className="text-xs text-gray-400">{staff.length} members</span>
        </div>
        {staff.map((s, i) => (
          <div key={s.id} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${avatarColors[i % avatarColors.length]}`}>
              {initials(s.full_name)}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm text-gray-900">{s.full_name}</div>
              <div className="text-xs text-gray-400">{s.email}</div>
            </div>
            <div className="flex items-center gap-3">
              {s.role === 'owner'
                ? <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700">👑 Owner</span>
                : <select value={s.role} onChange={e => changeRole(s.id, e.target.value)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-green-400">
                    <option value="admin">Admin</option>
                    <option value="owner">Owner</option>
                  </select>
              }
              <Toggle isOn={s.is_active} onToggle={() => toggleActive(s.id, !s.is_active)} disabled={s.role === 'owner'} />
            </div>
          </div>
        ))}
      </div>

      {/* ACCESS LEVELS — with live toggles */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
          <div className="font-bold text-gray-900 text-sm">Access Levels</div>
          <div className="text-xs text-gray-400 mt-0.5">Toggle permissions on/off for Admins. Owner always has full access.</div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 border-b border-gray-100">
              <th className="text-left px-5 py-3 font-bold w-full">Feature</th>
              <th className="px-5 py-3 font-bold text-center whitespace-nowrap">👑 Owner</th>
              <th className="px-5 py-3 font-bold text-center whitespace-nowrap">⚙️ Admin</th>
            </tr>
          </thead>
          <tbody>
            {/* Always-on features */}
            {ALWAYS_ON.map(a => (
              <tr key={a.label} className="border-b border-gray-50 hover:bg-gray-50/30">
                <td className="px-5 py-3 text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{a.icon}</span>
                    <span>{a.label}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100">
                    <span className="text-green-600 text-sm font-bold">✓</span>
                  </span>
                </td>
                <td className="px-5 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100">
                    <span className="text-green-600 text-sm font-bold">✓</span>
                  </span>
                </td>
              </tr>
            ))}

            {/* Divider */}
            <tr>
              <td colSpan={3} className="px-5 py-2.5 bg-gray-50 border-y border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Owner-controlled permissions</span>
                  <span className="text-xs text-gray-400">— toggle to grant or revoke admin access</span>
                </div>
              </td>
            </tr>

            {/* Toggleable permissions */}
            {TOGGLEABLE.map(t => {
              const perm = perms[t.key]
              const isOn = perm?.value ?? false
              const isLoading = saving === t.key
              return (
                <tr key={t.key} className={`border-b border-gray-50 transition-colors ${isOn ? 'hover:bg-gray-50/30' : 'hover:bg-gray-50/30 opacity-70'}`}>
                  <td className="px-5 py-3 text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{t.icon}</span>
                      <span>{t.label}</span>
                      {t.danger && isOn && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">Sensitive</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100">
                      <span className="text-green-600 text-sm font-bold">✓</span>
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex justify-center">
                      <Toggle
                        isOn={isOn}
                        onToggle={() => togglePerm(t.key)}
                        danger={t.danger}
                        loading={isLoading}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-700">
        💡 Changes take effect immediately — no need to save. Admin sees updated access on their next action.
      </div>
    </div>
  )
}
