'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const STATUS_BG: Record<string,string> = { confirmed:'#2d6a4f', pending:'#b7791f', cancelled:'#c53030', completed:'#5a67d8' }
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function CalendarPage() {
  const [date, setDate] = useState(new Date())
  const [bookings, setBookings] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [blocked, setBlocked] = useState<any[]>([])
  const [blocking, setBlocking] = useState(false)
  const [blockForm, setBlockForm] = useState({ room_id: '', date_from: '', date_to: '', reason: '' })

  async function load() {
    const [{data:b},{data:r},{data:bl}] = await Promise.all([
      supabase.from('bookings').select('*, rooms(name)').not('status','eq','cancelled'),
      supabase.from('rooms').select('id,name').order('sort_order'),
      supabase.from('blocked_dates').select('*'),
    ])
    setBookings(b||[]); setRooms(r||[]); setBlocked(bl||[])
    if(r&&r.length&&!blockForm.room_id) setBlockForm(f=>({...f,room_id:r[0].id}))
  }
  useEffect(()=>{load()},[])

  const y=date.getFullYear(), m=date.getMonth()
  const firstDay=new Date(y,m,1).getDay(), daysInM=new Date(y,m+1,0).getDate()
  const cells=Array.from({length:firstDay+daysInM},(_,i)=>i<firstDay?null:i-firstDay+1)

  function getDayBookings(day:number) {
    const d=new Date(y,m,day)
    return bookings.filter(b=>d>=new Date(b.check_in)&&d<new Date(b.check_out))
  }
  function isDayBlocked(day:number) {
    const d=new Date(y,m,day)
    return blocked.some(b=>d>=new Date(b.date_from)&&d<=new Date(b.date_to))
  }

  async function addBlock() {
    if(!blockForm.room_id||!blockForm.date_from||!blockForm.date_to) return
    await supabase.from('blocked_dates').insert([blockForm])
    await supabase.from('system_logs').insert([{action:'BLOCK_DATES',module:'Calendar',description:`Blocked ${blockForm.date_from} to ${blockForm.date_to}`}])
    setBlocking(false); load()
  }

  return (
    <div className="max-w-6xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={()=>setDate(new Date(y,m-1,1))} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 font-bold text-lg">‹</button>
          <h2 className="font-bold text-gray-900 text-xl w-48 text-center">{MONTHS[m]} {y}</h2>
          <button onClick={()=>setDate(new Date(y,m+1,1))} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 font-bold text-lg">›</button>
          <button onClick={()=>setDate(new Date())} className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50">Today</button>
        </div>
        <button onClick={()=>setBlocking(!blocking)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{background:'#c53030'}}>
          {blocking?'✕ Cancel':'🚫 Block Dates'}
        </button>
      </div>

      {blocking && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
          <h3 className="font-semibold text-red-800 mb-3">Block Dates</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div><label className="text-xs font-bold text-red-600 mb-1 block">Room</label>
              <select value={blockForm.room_id} onChange={e=>setBlockForm({...blockForm,room_id:e.target.value})} className="w-full border border-red-200 rounded-xl px-3 py-2 text-sm bg-white">
                {rooms.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
              </select></div>
            <div><label className="text-xs font-bold text-red-600 mb-1 block">From</label>
              <input type="date" value={blockForm.date_from} onChange={e=>setBlockForm({...blockForm,date_from:e.target.value})} className="w-full border border-red-200 rounded-xl px-3 py-2 text-sm bg-white"/></div>
            <div><label className="text-xs font-bold text-red-600 mb-1 block">To</label>
              <input type="date" value={blockForm.date_to} onChange={e=>setBlockForm({...blockForm,date_to:e.target.value})} className="w-full border border-red-200 rounded-xl px-3 py-2 text-sm bg-white"/></div>
            <div><label className="text-xs font-bold text-red-600 mb-1 block">Reason</label>
              <input value={blockForm.reason} onChange={e=>setBlockForm({...blockForm,reason:e.target.value})} placeholder="Maintenance..." className="w-full border border-red-200 rounded-xl px-3 py-2 text-sm bg-white"/></div>
          </div>
          <button onClick={addBlock} className="mt-3 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-red-600">Block Dates</button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
          {DAYS.map(d=><div key={d} className="py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wide">{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day,i)=>{
            if(!day) return <div key={i} className="h-28 border-b border-r border-gray-50 bg-gray-50/30"/>
            const db=getDayBookings(day), bl=isDayBlocked(day)
            const isToday=new Date().getDate()===day&&new Date().getMonth()===m&&new Date().getFullYear()===y
            return (
              <div key={i} className={`h-28 border-b border-r border-gray-50 p-1.5 ${bl?'bg-red-50/60':''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${isToday?'text-white':'text-gray-500'}`} style={isToday?{background:'#2d6a4f'}:{}}>
                  {day}
                </div>
                {bl&&<div className="text-xs text-red-400 font-medium truncate">🚫 Blocked</div>}
                {db.slice(0,2).map(b=>(
                  <div key={b.id} className="text-white text-xs px-1.5 py-0.5 rounded-md mb-0.5 truncate font-medium leading-tight"
                    style={{background:STATUS_BG[b.status]||'#2d6a4f'}}>
                    {b.guest_name?.split(' ')[0]} · {b.rooms?.name?.replace(' Room','').replace('2BR ','') || '?'}
                  </div>
                ))}
                {db.length>2&&<div className="text-xs text-gray-400">+{db.length-2}</div>}
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[{label:'Confirmed',color:'#2d6a4f',bg:'#d8f3dc'},{label:'Pending',color:'#b7791f',bg:'#fef3c7'},{label:'Cancelled',color:'#c53030',bg:'#fee2e2'},{label:'Blocked',color:'#6b7280',bg:'#f3f4f6'}].map(s=>(
          <div key={s.label} className="flex items-center gap-2 p-3 rounded-xl" style={{background:s.bg}}>
            <div className="w-3 h-3 rounded-full" style={{background:s.color}}/>
            <span className="text-xs font-semibold" style={{color:s.color}}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
