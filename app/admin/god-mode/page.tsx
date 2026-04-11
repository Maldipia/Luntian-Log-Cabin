'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function GodModePage() {
  const [content, setContent] = useState<any[]>([])
  const [settings, setSettings] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [multiplier, setMultiplier] = useState('1.00')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState('')

  useEffect(()=>{
    Promise.all([
      supabase.from('content').select('*').in('key',['booking_enabled','promos_enabled','payments_enabled']),
      supabase.from('settings').select('*').eq('key','price_multiplier'),
      supabase.from('rooms').select('id,name,is_active'),
    ]).then(([{data:c},{data:s},{data:r}])=>{
      setContent(c||[]); setSettings(s||[]); setRooms(r||[])
      if(s&&s[0]) setMultiplier(s[0].value||'1.00')
    })
  },[])

  function getToggle(key:string) {
    return content.find(c=>c.key===key)?.value==='true'
  }

  async function setToggle(key:string, value:boolean) {
    await supabase.from('content').update({value:value?'true':'false'}).eq('key',key)
    setContent(c=>c.map(x=>x.key===key?{...x,value:value?'true':'false'}:x))
    await supabase.from('system_logs').insert([{action:'GOD_MODE_TOGGLE',module:'Staff',description:`${key} set to ${value}`}])
    setSaved(key); setTimeout(()=>setSaved(''),1500)
  }

  async function applyMultiplier() {
    setSaving(true)
    const mult=parseFloat(multiplier)||1
    const {data:r}=await supabase.from('rooms').select('id,price_weekday,price_weekend,price_holiday')
    if(r) {
      for(const room of r) {
        await supabase.from('rooms').update({
          price_weekday:Math.round(room.price_weekday*mult),
          price_weekend:Math.round(room.price_weekend*mult),
          price_holiday:Math.round(room.price_holiday*mult),
        }).eq('id',room.id)
      }
    }
    await supabase.from('settings').update({value:multiplier}).eq('key','price_multiplier')
    await supabase.from('system_logs').insert([{action:'GLOBAL_PRICE_OVERRIDE',module:'Staff',description:`Applied ${multiplier}x price multiplier to all rooms`}])
    setSaving(false); setSaved('multiplier'); setTimeout(()=>setSaved(''),2500)
  }

  async function toggleRoom(id:string, active:boolean) {
    await supabase.from('rooms').update({is_active:active}).eq('id',id)
    setRooms(r=>r.map(x=>x.id===id?{...x,is_active:active}:x))
    await supabase.from('system_logs').insert([{action:'TOGGLE_ROOM',module:'Staff',description:`Room ${id} set to ${active?'active':'inactive'}`}])
  }

  async function emergencyShutdown() {
    if(!confirm('⚠️ EMERGENCY SHUTDOWN: This will disable all bookings, promos, and payments. Are you sure?')) return
    await Promise.all([
      supabase.from('content').update({value:'false'}).eq('key','booking_enabled'),
      supabase.from('content').update({value:'false'}).eq('key','promos_enabled'),
      supabase.from('content').update({value:'false'}).eq('key','payments_enabled'),
    ])
    setContent(c=>c.map(x=>({...x,value:'false'})))
    await supabase.from('system_logs').insert([{action:'EMERGENCY_SHUTDOWN',module:'Staff',description:'All systems disabled via Emergency Shutdown'}])
    alert('✅ Emergency shutdown complete. All systems disabled.')
  }

  const Toggle = ({label,desc,key:k,icon}:{label:string,desc:string,key:string,icon:string}) => {
    const on=getToggle(k)
    return (
      <div className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${on?'border-green-200':'border-gray-100'}`} style={{background:on?'#f0faf2':'#fff'}}>
        <div className="flex items-center gap-3">
          <div className="text-2xl">{icon}</div>
          <div>
            <div className="font-semibold text-gray-900">{label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saved===k&&<span className="text-xs text-green-600 font-medium">✓ Saved</span>}
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={on} onChange={e=>setToggle(k,e.target.checked)} className="sr-only peer"/>
            <div className="w-12 h-6 bg-gray-200 peer-checked:bg-green-500 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-6"/>
          </label>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="rounded-2xl p-5 text-white" style={{background:'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)'}}>
        <div className="text-2xl mb-2">🔥 God Mode</div>
        <p className="text-sm text-blue-200">Full system control panel. Changes here affect your live website and booking system instantly.</p>
      </div>

      <div className="space-y-3">
        <h2 className="font-bold text-gray-900">System Toggles</h2>
        <Toggle label="Bookings" desc="Allow guests to make new reservations" key="booking_enabled" icon="📅"/>
        <Toggle label="Promotions" desc="Enable promo codes at checkout" key="promos_enabled" icon="🎟"/>
        <Toggle label="Payments" desc="Show payment options to guests" key="payments_enabled" icon="💳"/>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <h2 className="font-bold text-gray-900">🏠 Room Availability</h2>
        <div className="space-y-2">
          {rooms.map(r=>(
            <div key={r.id} className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100">
              <div className="font-medium text-gray-700 text-sm">{r.name}</div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={r.is_active} onChange={e=>toggleRoom(r.id,e.target.checked)} className="sr-only peer"/>
                <div className="w-10 h-6 bg-gray-200 peer-checked:bg-green-500 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4"/>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-bold text-gray-900 mb-1">💲 Global Price Multiplier</h2>
        <p className="text-xs text-gray-400 mb-4">Applies a multiplier to ALL room prices. 1.2 = +20% peak season. 0.8 = -20% promo.</p>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <input type="number" value={multiplier} onChange={e=>setMultiplier(e.target.value)} step="0.1" min="0.1" max="5"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:border-green-400 bg-gray-50 text-center"/>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">×</div>
          </div>
          <button onClick={applyMultiplier} disabled={saving} className="px-5 py-3 rounded-xl font-semibold text-white disabled:opacity-60" style={{background:saved==='multiplier'?'#059669':'#2d6a4f'}}>
            {saving?'Applying...':saved==='multiplier'?'✓ Applied!':'Apply to All Rooms'}
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          {[['Peak (+20%)', '1.20'],['Normal', '1.00'],['Promo (-10%)', '0.90'],['Low (-20%)', '0.80']].map(([l,v])=>(
            <button key={v} onClick={()=>setMultiplier(v)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${multiplier===v?'border-green-400 text-green-700 bg-green-50':'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
        <h2 className="font-bold text-red-800 mb-1">⚠️ Emergency Shutdown</h2>
        <p className="text-xs text-red-600 mb-4">Instantly disables all bookings, promotions, and payments across the entire system. Use only in emergencies.</p>
        <button onClick={emergencyShutdown} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors">
          🚨 Emergency Shutdown
        </button>
      </div>
    </div>
  )
}
