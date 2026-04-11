'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const PLATFORMS = [
  { value:'airbnb',  label:'Airbnb',       icon:'🏠', color:'#FF5A5F', bg:'#FFF0F0' },
  { value:'agoda',   label:'Agoda',         icon:'🅰️', color:'#5392FF', bg:'#F0F4FF' },
  { value:'booking', label:'Booking.com',   icon:'🔵', color:'#003580', bg:'#EFF4FF' },
  { value:'google',  label:'Google Calendar',icon:'📅', color:'#4285F4', bg:'#F0F4FF' },
  { value:'other',   label:'Other',         icon:'🔗', color:'#6B7280', bg:'#F3F4F6' },
]

const SYNC_STATUS: Record<string,{color:string,label:string,icon:string}> = {
  pending: {color:'#6B7280',label:'Never synced',icon:'⏳'},
  syncing: {color:'#D97706',label:'Syncing...',icon:'🔄'},
  success: {color:'#059669',label:'Synced',icon:'✅'},
  error:   {color:'#DC2626',label:'Error',icon:'❌'},
}

export default function ChannelsPage() {
  const [rooms, setRooms] = useState<any[]>([])
  const [calendars, setCalendars] = useState<any[]>([])
  const [blocks, setBlocks] = useState<any[]>([])
  const [syncing, setSyncing] = useState(false)
  const [adding, setAdding] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<string>('')
  const [form, setForm] = useState({ room_id:'', platform:'airbnb', label:'', ical_url:'' })

  async function load() {
    const [{data:r},{data:c},{data:b}] = await Promise.all([
      supabase.from('rooms').select('id,name,accommodation_type').order('sort_order'),
      supabase.from('external_calendars').select('*, rooms(name)').order('created_at',{ascending:false}),
      supabase.from('availability_blocks').select('*').gte('end_date', new Date().toISOString().split('T')[0]).order('start_date'),
    ])
    setRooms(r||[]); setCalendars(c||[]); setBlocks(b||[])
    if(r&&r.length&&!form.room_id) setForm(f=>({...f,room_id:r[0].id}))
  }
  useEffect(()=>{load()},[])

  async function addCalendar() {
    if(!form.ical_url||!form.room_id) return
    const platform = PLATFORMS.find(p=>p.value===form.platform)
    await supabase.from('external_calendars').insert([{
      ...form,
      label: form.label||`${platform?.label} - ${rooms.find(r=>r.id===form.room_id)?.name}`,
      sync_status:'pending'
    }])
    await supabase.from('system_logs').insert([{action:'ADD_CALENDAR',module:'Calendar',description:`Added ${form.platform} iCal for room ${form.room_id}`}])
    setAdding(false); setForm(f=>({...f,label:'',ical_url:''})); load()
  }

  async function deleteCalendar(id:string) {
    if(!confirm('Remove this calendar connection?')) return
    await supabase.from('availability_blocks').delete().eq('external_calendar_id',id)
    await supabase.from('external_calendars').delete().eq('id',id)
    load()
  }

  async function syncNow() {
    setSyncing(true)
    try {
      const res = await fetch('https://hajjuiqwgzwmrbqpihli.supabase.co/functions/v1/sync-ical',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
      })
      const data = await res.json()
      console.log('Sync result:', data)
      load()
    } catch(e) { console.error(e) }
    setSyncing(false)
  }

  async function toggleCalendar(id:string, active:boolean) {
    await supabase.from('external_calendars').update({is_active:active}).eq('id',id)
    setCalendars(c=>c.map(x=>x.id===id?{...x,is_active:active}:x))
  }

  const getPlatform = (val:string) => PLATFORMS.find(p=>p.value===val)||PLATFORMS[4]
  const filteredBlocks = selectedRoom ? blocks.filter(b=>b.room_id===selectedRoom) : blocks
  const groupedByRoom = rooms.map(r=>({
    room:r,
    cals: calendars.filter(c=>c.room_id===r.id),
    blocks: blocks.filter(b=>b.room_id===r.id&&new Date(b.end_date)>=new Date()),
  }))

  const SOURCE_COLORS: Record<string,string> = {
    internal:'#2d6a4f', airbnb:'#FF5A5F', agoda:'#5392FF', booking:'#003580',
    google:'#4285F4', manual:'#6B7280', other:'#9333ea'
  }

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Connect Airbnb, Agoda, and Booking.com via iCal to prevent double bookings</p>
        </div>
        <div className="flex gap-2">
          <button onClick={syncNow} disabled={syncing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            {syncing?<span className="animate-spin">🔄</span>:'🔄'} {syncing?'Syncing...':'Sync Now'}
          </button>
          <button onClick={()=>setAdding(!adding)}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{background:'linear-gradient(135deg,#2d6a4f,#40916c)'}}>
            {adding?'✕ Cancel':'+ Connect Calendar'}
          </button>
        </div>
      </div>

      {/* Add form */}
      {adding && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Connect External Calendar</h3>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div><label className="text-xs font-bold text-gray-500 mb-1.5 block">Accommodation</label>
              <select value={form.room_id} onChange={e=>setForm({...form,room_id:e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-green-400">
                {rooms.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
              </select></div>
            <div><label className="text-xs font-bold text-gray-500 mb-1.5 block">Platform</label>
              <select value={form.platform} onChange={e=>setForm({...form,platform:e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-green-400">
                {PLATFORMS.map(p=><option key={p.value} value={p.value}>{p.icon} {p.label}</option>)}
              </select></div>
            <div><label className="text-xs font-bold text-gray-500 mb-1.5 block">Label (optional)</label>
              <input value={form.label} onChange={e=>setForm({...form,label:e.target.value})}
                placeholder="e.g. Airbnb - Sunrise Room"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-green-400"/></div>
            <div className="flex items-end">
              <button onClick={addCalendar} className="w-full py-2.5 rounded-xl text-sm font-bold text-white" style={{background:'#2d6a4f'}}>Connect</button>
            </div>
          </div>
          <div><label className="text-xs font-bold text-gray-500 mb-1.5 block">iCal URL (.ics link from the platform)</label>
            <input value={form.ical_url} onChange={e=>setForm({...form,ical_url:e.target.value})}
              placeholder="https://www.airbnb.com/calendar/ical/XXXXX.ics?s=XXXXX"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono bg-gray-50 focus:outline-none focus:border-green-400"/></div>
          <div className="mt-4 bg-blue-50 rounded-xl p-4 text-xs text-blue-700">
            <strong>How to get iCal URL:</strong><br/>
            • <strong>Airbnb:</strong> Calendar → Export Calendar → Copy link<br/>
            • <strong>Agoda:</strong> Ycs.agoda.com → Calendar → iCal Export<br/>
            • <strong>Booking.com:</strong> Extranet → Calendar → Export → iCal<br/>
            • <strong>Google Calendar:</strong> Settings → Export → Copy iCal URL
          </div>
        </div>
      )}

      {/* Room-based calendar view */}
      <div className="space-y-4">
        {groupedByRoom.map(({room,cals,blocks:rblocks})=>(
          <div key={room.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100" style={{background:'linear-gradient(135deg,#f9fafb,#fff)'}}>
              <div className="flex items-center gap-3">
                <div className="font-bold text-gray-900">{room.name}</div>
                <span className="text-xs text-gray-400">{cals.length} connected · {rblocks.length} upcoming blocks</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {['internal','airbnb','agoda','booking','manual'].map(s=>(
                  <span key={s} className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full text-white capitalize" style={{background:SOURCE_COLORS[s]||'#9333ea'}}>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/70 inline-block"/>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Connected calendars */}
            {cals.length>0 && (
              <div className="divide-y divide-gray-50">
                {cals.map(cal=>{
                  const p=getPlatform(cal.platform)
                  const s=SYNC_STATUS[cal.sync_status]||SYNC_STATUS.pending
                  return (
                    <div key={cal.id} className="flex items-center gap-4 px-5 py-3.5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{background:p.bg}}>{p.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-gray-900">{cal.label||p.label}</span>
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{background:p.bg,color:p.color}}>{p.label}</span>
                        </div>
                        <div className="text-xs font-mono text-gray-400 truncate mt-0.5 max-w-md">{cal.ical_url}</div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-xs font-semibold" style={{color:s.color}}>{s.icon} {s.label}</div>
                        <div className="text-xs text-gray-400">{cal.last_synced_at?`Last: ${new Date(cal.last_synced_at).toLocaleString('en-PH',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}`:''}</div>
                        {cal.events_count>0&&<div className="text-xs text-gray-400">{cal.events_count} events</div>}
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer ml-2">
                        <input type="checkbox" checked={cal.is_active} onChange={e=>toggleCalendar(cal.id,e.target.checked)} className="sr-only peer"/>
                        <div className="w-9 h-5 bg-gray-200 peer-checked:bg-green-500 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"/>
                      </label>
                      <button onClick={()=>deleteCalendar(cal.id)} className="text-gray-300 hover:text-red-400 text-xl ml-1">×</button>
                    </div>
                  )
                })}
              </div>
            )}

            {cals.length===0 && (
              <div className="px-5 py-4 text-sm text-gray-400 flex items-center gap-2">
                <span>No external calendars connected.</span>
                <button onClick={()=>{setAdding(true);setForm(f=>({...f,room_id:room.id}))}} className="text-green-700 font-semibold hover:underline">+ Connect one</button>
              </div>
            )}

            {/* Upcoming blocks */}
            {rblocks.length>0 && (
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
                <div className="text-xs font-bold text-gray-400 uppercase mb-2">Upcoming Blocks</div>
                <div className="flex flex-wrap gap-2">
                  {rblocks.slice(0,8).map(b=>(
                    <span key={b.id} className="text-xs px-2.5 py-1 rounded-full font-medium text-white" style={{background:SOURCE_COLORS[b.source]||'#6B7280'}}>
                      {b.source.toUpperCase()} · {b.start_date} → {b.end_date}
                    </span>
                  ))}
                  {rblocks.length>8&&<span className="text-xs text-gray-400 py-1">+{rblocks.length-8} more</span>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-green-50 border border-green-100 rounded-2xl p-5 text-sm text-green-800">
        <div className="font-bold mb-2">🔄 How the sync works</div>
        <div className="space-y-1 text-xs leading-relaxed">
          <div>1. External platforms (Airbnb, Agoda) publish bookings as iCal feeds</div>
          <div>2. Click <strong>Sync Now</strong> or wait for auto-sync every 15 minutes</div>
          <div>3. New bookings from other platforms appear as <strong>Availability Blocks</strong></div>
          <div>4. Your calendar and website automatically show these dates as unavailable</div>
          <div>5. ❌ Guests cannot book blocked dates — double bookings are prevented</div>
        </div>
      </div>
    </div>
  )
}
