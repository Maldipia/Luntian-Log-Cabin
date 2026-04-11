'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const TAGS = ['VIP','Repeat Guest','High Spender','Problematic','Corporate','Local','Foreign']

export default function GuestsPage() {
  const [guests, setGuests] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [guestBookings, setGuestBookings] = useState<any[]>([])
  const [adding, setAdding] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({full_name:'',email:'',phone:'',nationality:'',notes:'',tags:[] as string[],is_vip:false})

  async function load() {
    const {data}=await supabase.from('guests').select('*').order('total_spent',{ascending:false})
    setGuests(data||[])
  }
  useEffect(()=>{load()},[])

  async function selectGuest(g:any) {
    setSelected(g)
    const {data}=await supabase.from('bookings').select('*, rooms(name)').eq('guest_id',g.id).order('check_in',{ascending:false})
    setGuestBookings(data||[])
  }

  async function addGuest() {
    if(!form.full_name) return
    await supabase.from('guests').insert([form])
    await supabase.from('system_logs').insert([{action:'CREATE_GUEST',module:'CRM',description:`Added guest: ${form.full_name}`}])
    setAdding(false); setForm({full_name:'',email:'',phone:'',nationality:'',notes:'',tags:[],is_vip:false}); load()
  }

  async function updateGuest(field:string, value:any) {
    if(!selected) return
    const updated={...selected,[field]:value}
    setSelected(updated)
    setGuests(g=>g.map(x=>x.id===selected.id?updated:x))
    await supabase.from('guests').update({[field]:value}).eq('id',selected.id)
  }

  function toggleTag(tag:string) {
    if(!selected) return
    const cur=selected.tags||[]
    updateGuest('tags', cur.includes(tag)?cur.filter((t:string)=>t!==tag):[...cur,tag])
  }

  const filtered = guests.filter(g=>g.full_name?.toLowerCase().includes(search.toLowerCase())||g.email?.toLowerCase().includes(search.toLowerCase())||g.phone?.includes(search))

  const tagColor: Record<string,{bg:string,text:string}> = {
    'VIP':{bg:'#fef3c7',text:'#92400e'},
    'Repeat Guest':{bg:'#d8f3dc',text:'#1b4332'},
    'High Spender':{bg:'#e0f2fe',text:'#075985'},
    'Problematic':{bg:'#fee2e2',text:'#991b1b'},
    'Corporate':{bg:'#ede9fe',text:'#5b21b6'},
    'Local':{bg:'#f0f9ff',text:'#0369a1'},
    'Foreign':{bg:'#fdf4ff',text:'#7e22ce'},
  }

  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between mb-5">
        <div className="relative flex-1 max-w-sm">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search guests..." className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-green-400 bg-white"/>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        </div>
        <button onClick={()=>setAdding(!adding)} className="ml-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{background:'linear-gradient(135deg,#2d6a4f,#40916c)'}}>
          {adding?'✕ Cancel':'+ Add Guest'}
        </button>
      </div>

      {adding && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-5">
          <h3 className="font-semibold text-gray-900 mb-4">New Guest Profile</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[['Full name*','full_name','text'],['Email','email','email'],['Phone','phone','text'],['Nationality','nationality','text']].map(([l,f,t])=>(
              <div key={f}><label className="text-xs font-semibold text-gray-500 mb-1 block">{l}</label>
                <input type={t} value={(form as any)[f]} onChange={e=>setForm({...form,[f]:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400 bg-gray-50"/></div>
            ))}
            <div className="col-span-2 md:col-span-3"><label className="text-xs font-semibold text-gray-500 mb-1 block">Notes</label>
              <textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400 bg-gray-50 resize-none"/></div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <input type="checkbox" id="vip" checked={form.is_vip} onChange={e=>setForm({...form,is_vip:e.target.checked})} className="rounded"/>
            <label htmlFor="vip" className="text-sm text-gray-700">Mark as VIP ⭐</label>
          </div>
          <button onClick={addGuest} className="mt-4 px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{background:'#2d6a4f'}}>Save Guest</button>
        </div>
      )}

      <div className="flex gap-5">
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="font-semibold text-gray-900">All Guests</span>
            <span className="text-xs text-gray-400">{filtered.length} guests</span>
          </div>
          <div className="divide-y divide-gray-50">
            {filtered.map(g=>(
              <div key={g.id} onClick={()=>selectGuest(g)}
                className={`flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-gray-50/50 transition-colors ${selected?.id===g.id?'bg-green-50/40':''}`}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{background:g.is_vip?'linear-gradient(135deg,#b7791f,#d69e2e)':'linear-gradient(135deg,#2d6a4f,#52b788)'}}>
                  {g.full_name?.slice(0,2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 flex items-center gap-1">{g.full_name}{g.is_vip&&<span>⭐</span>}</div>
                  <div className="text-xs text-gray-400 truncate">{g.email||g.phone||'No contact'}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-gray-900">₱{(g.total_spent||0).toLocaleString()}</div>
                  <div className="text-xs text-gray-400">{g.total_bookings||0} stays</div>
                </div>
              </div>
            ))}
            {filtered.length===0&&<div className="py-12 text-center text-sm text-gray-400">No guests found</div>}
          </div>
        </div>

        {selected && (
          <div className="w-80 flex-shrink-0 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold text-white" style={{background:selected.is_vip?'linear-gradient(135deg,#b7791f,#d69e2e)':'linear-gradient(135deg,#2d6a4f,#52b788)'}}>
                  {selected.full_name?.slice(0,2).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{selected.full_name}</div>
                  <div className="text-xs text-gray-400">Guest Profile</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-gray-900">₱{(selected.total_spent||0).toLocaleString()}</div>
                  <div className="text-xs text-gray-400">Total Spent</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-gray-900">{selected.total_bookings||0}</div>
                  <div className="text-xs text-gray-400">Total Stays</div>
                </div>
              </div>
              <div className="space-y-2 text-sm mb-4">
                {[['📧','email'],['📱','phone'],['🌏','nationality']].map(([icon,field])=>(
                  selected[field]&&<div key={field} className="flex items-center gap-2 text-gray-600"><span>{icon}</span><span className="truncate">{selected[field]}</span></div>
                ))}
              </div>
              <label className="flex items-center gap-2 cursor-pointer mb-4">
                <div className="relative">
                  <input type="checkbox" checked={selected.is_vip||false} onChange={e=>updateGuest('is_vip',e.target.checked)} className="sr-only peer"/>
                  <div className="w-9 h-5 bg-gray-200 peer-checked:bg-yellow-400 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"/>
                </div>
                <span className="text-sm font-medium text-gray-700">VIP Guest ⭐</span>
              </label>
              <div className="mb-3">
                <div className="text-xs font-bold text-gray-400 uppercase mb-2">Tags</div>
                <div className="flex flex-wrap gap-1.5">
                  {TAGS.map(t=>{
                    const active=(selected.tags||[]).includes(t)
                    const colors=tagColor[t]||{bg:'#f3f4f6',text:'#374151'}
                    return <button key={t} onClick={()=>toggleTag(t)} className="text-xs px-2.5 py-1 rounded-full font-medium border transition-all" style={active?{background:colors.bg,color:colors.text,borderColor:'transparent'}:{borderColor:'#e5e7eb',color:'#9ca3af'}}>{t}</button>
                  })}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase mb-1.5">Notes</div>
                <textarea value={selected.notes||''} onChange={e=>updateGuest('notes',e.target.value)} rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400 resize-none bg-gray-50" placeholder="Private notes..."/>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 font-semibold text-sm text-gray-900">Booking History</div>
              {guestBookings.length===0
                ? <div className="p-4 text-xs text-gray-400 text-center">No bookings linked yet</div>
                : guestBookings.map(b=>(
                  <div key={b.id} className="px-4 py-3 border-b border-gray-50 last:border-0">
                    <div className="text-xs font-bold text-gray-500 font-mono">{b.booking_ref}</div>
                    <div className="text-sm font-medium text-gray-900">{b.rooms?.name}</div>
                    <div className="text-xs text-gray-400">{b.check_in} → {b.check_out}</div>
                    <div className="text-xs font-semibold text-green-700 mt-0.5">₱{(b.total_revenue||0).toLocaleString()}</div>
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
