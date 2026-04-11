'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const PERM_META: Record<string, { label: string; desc: string; icon: string }> = {
  perm_admin_cms:       { label: 'Website CMS',       desc: 'Edit homepage text, about, contact, packages', icon: '🌐' },
  perm_admin_settings:  { label: 'System Settings',   desc: 'Edit global settings and property config',     icon: '⚙️' },
  perm_admin_pricing:   { label: 'Room Pricing',       desc: 'Change weekday, weekend, and holiday rates',   icon: '💲' },
  perm_admin_analytics: { label: 'Analytics',          desc: 'View revenue and occupancy reports',           icon: '📈' },
  perm_admin_deposits:  { label: 'Security Deposits',  desc: 'Process, refund, and forfeit deposits',        icon: '🔒' },
  perm_admin_incidents: { label: 'Incidents',          desc: 'Log and resolve damage incidents',             icon: '⚠️' },
  perm_admin_channels:  { label: 'Channel Manager',    desc: 'Connect and sync iCal from platforms',         icon: '🔗' },
  perm_admin_logs:      { label: 'System Logs',        desc: 'View activity and audit logs',                 icon: '🧾' },
  perm_admin_god_mode:  { label: 'God Mode 🔥',        desc: 'System toggles, price multiplier, emergency shutdown', icon: '🔥' },
  perm_admin_staff:     { label: 'Staff Management',   desc: 'Add, edit, and remove team members',          icon: '👤' },
}

const SETTING_GROUPS: Record<string, string[]> = {
  'Property': ['brand_name', 'brand_tagline', 'social_facebook', 'social_instagram'],
  'Booking Rules': ['min_stay_nights', 'booking_advance_days', 'price_multiplier'],
  'Security Deposit': ['security_deposit_amount', 'deposit_required', 'agreement_required'],
  'Check-in / Check-out': ['default_checkin_time', 'default_checkout_time'],
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [userRole, setUserRole] = useState<string>('admin')
  const [tab, setTab] = useState<'general' | 'permissions'>('general')

  useEffect(() => {
    const role = typeof window !== 'undefined' ? localStorage.getItem('luntian_role') || 'admin' : 'admin'
    setUserRole(role)
    supabase.from('settings').select('*').order('key').then(({ data }) => setSettings(data || []))
  }, [])

  const isOwner = userRole === 'owner'

  function updateSetting(id: string, value: string) {
    setSettings(s => s.map(x => x.id === id ? { ...x, value } : x))
  }

  async function saveAll() {
    setSaving(true)
    const toSave = tab === 'permissions'
      ? settings.filter(s => s.key.startsWith('perm_'))
      : settings.filter(s => !s.key.startsWith('perm_'))
    for (const s of toSave) {
      await supabase.from('settings').update({ value: s.value, updated_at: new Date().toISOString() }).eq('id', s.id)
    }
    await supabase.from('system_logs').insert([{ action: 'UPDATE_SETTINGS', module: 'Staff', description: `Updated ${tab} settings` }])
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500)
  }

  const permSettings = settings.filter(s => s.key.startsWith('perm_'))
  const generalSettings = settings.filter(s => !s.key.startsWith('perm_'))

  // Build groups for general settings
  const groupedGeneral: Record<string, any[]> = {}
  Object.entries(SETTING_GROUPS).forEach(([group, keys]) => {
    const items = generalSettings.filter(s => keys.includes(s.key))
    if (items.length) groupedGeneral[group] = items
  })
  const ungrouped = generalSettings.filter(s =>
    !Object.values(SETTING_GROUPS).flat().includes(s.key)
  )
  if (ungrouped.length) groupedGeneral['Other'] = ungrouped

  return (
    <div className="max-w-3xl space-y-5">
      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'general' as const, label: '⚙️ General Settings' },
          { id: 'permissions' as const, label: '🔐 Admin Permissions' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === t.id ? 'text-white shadow-sm' : 'text-gray-500 bg-white border border-gray-200 hover:bg-gray-50'}`}
            style={tab === t.id ? { background: 'linear-gradient(135deg,#2d6a4f,#40916c)' } : {}}>
            {t.label}
          </button>
        ))}
        <button onClick={saveAll} disabled={saving}
          className="ml-auto px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
          style={{ background: saved ? '#059669' : 'linear-gradient(135deg,#2d6a4f,#40916c)' }}>
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save'}
        </button>
      </div>

      {/* PERMISSIONS TAB */}
      {tab === 'permissions' && (
        <div className="space-y-4">
          <div className={`rounded-2xl p-4 border text-sm ${isOwner ? 'bg-green-50 border-green-100 text-green-800' : 'bg-yellow-50 border-yellow-100 text-yellow-800'}`}>
            {isOwner
              ? '👑 You are the Owner — toggle what Admins can access below.'
              : '⚠️ Only the Owner can change permission settings.'}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
              <div className="font-bold text-gray-900 text-sm">Admin Access Control</div>
              <div className="text-xs text-gray-400 mt-0.5">Toggle which features admins like Aira can access</div>
            </div>
            <div className="divide-y divide-gray-50">
              {permSettings.map(s => {
                const meta = PERM_META[s.key]
                if (!meta) return null
                const isOn = s.value === 'true'
                const isDangerous = s.key === 'perm_admin_god_mode' || s.key === 'perm_admin_staff'
                return (
                  <div key={s.id}
                    className={`flex items-center justify-between px-5 py-4 transition-colors ${isOn ? '' : 'opacity-60'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{meta.icon}</span>
                      <div>
                        <div className={`text-sm font-semibold ${isDangerous && isOn ? 'text-orange-700' : 'text-gray-900'}`}>
                          {meta.label}
                          {isDangerous && isOn && <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Sensitive</span>}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">{meta.desc}</div>
                      </div>
                    </div>
                    <label className={`relative inline-flex items-center ${isOwner ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                      <input type="checkbox" checked={isOn}
                        onChange={e => isOwner && updateSetting(s.id, e.target.checked ? 'true' : 'false')}
                        disabled={!isOwner}
                        className="sr-only peer" />
                      <div className={`w-12 h-6 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-6 peer-disabled:opacity-40 ${isOn ? (isDangerous ? 'bg-orange-500' : 'bg-green-500') : 'bg-gray-200'}`} />
                    </label>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Current state summary */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Admin Access Summary</span>
            </div>
            <div className="grid grid-cols-2 gap-0 divide-y divide-gray-50">
              {permSettings.map(s => {
                const meta = PERM_META[s.key]
                if (!meta) return null
                const isOn = s.value === 'true'
                return (
                  <div key={s.id} className={`flex items-center gap-3 px-5 py-3 ${isOn ? '' : 'opacity-40'}`}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isOn ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="text-xs text-gray-700">{meta.label}</span>
                    <span className={`ml-auto text-xs font-bold ${isOn ? 'text-green-600' : 'text-gray-400'}`}>{isOn ? 'ON' : 'OFF'}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* GENERAL SETTINGS TAB */}
      {tab === 'general' && (
        <div className="space-y-4">
          {!isOwner && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700">
              ℹ️ You can edit these settings — your Owner has granted you access.
            </div>
          )}
          {Object.entries(groupedGeneral).map(([group, items]) => (
            <div key={group} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{group}</span>
              </div>
              <div className="divide-y divide-gray-50">
                {items.map(s => (
                  <div key={s.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-700">{s.label || s.key}</div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">{s.key}</div>
                    </div>
                    {s.key === 'deposit_required' || s.key === 'agreement_required' ? (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={s.value === 'true'} onChange={e => updateSetting(s.id, e.target.checked ? 'true' : 'false')} className="sr-only peer" />
                        <div className="w-10 h-6 bg-gray-200 peer-checked:bg-green-500 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
                      </label>
                    ) : s.type === 'number' ? (
                      <input type="number" value={s.value || ''} onChange={e => updateSetting(s.id, e.target.value)}
                        className="w-32 border border-gray-200 rounded-xl px-3 py-2 text-sm text-right font-semibold focus:outline-none focus:border-green-400 bg-gray-50" />
                    ) : (
                      <input value={s.value || ''} onChange={e => updateSetting(s.id, e.target.value)}
                        className="w-56 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400 bg-gray-50" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
