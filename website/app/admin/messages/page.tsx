'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const VARIABLES = ['{{guest_name}}','{{room_name}}','{{checkin_date}}','{{checkout_date}}','{{checkin_time}}','{{checkout_time}}','{{num_guests}}','{{access_details}}','{{location_details}}','{{booking_ref}}']
const TRIGGERS = {
  payment_confirmed: {label:'After Payment Confirmed',icon:'✅',color:'#059669'},
  checkin_reminder:  {label:'24hr Before Check-in',icon:'🔔',color:'#d97706'},
  checkout_thanks:   {label:'After Checkout',icon:'💚',color:'#7c3aed'},
}

export default function MessagesPage() {
  const [rooms, setRooms] = useState<any[]>([])
  const [selectedRoom, setSelectedRoom] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [accessDetails, setAccessDetails] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [preview, setPreview] = useState(false)
  const [newAccess, setNewAccess] = useState({type:'door_code',label:'',value:'',notes:''})

  useEffect(()=>{
    supabase.from('rooms').select('*').order('sort_order').then(({data})=>{
      setRooms(data||[])
      if(data&&data.length) selectRoom(data[0])
    })
  },[])

  async function selectRoom(room:any) {
    setSelectedRoom(room)
    const [{data:m},{data:a}] = await Promise.all([
      supabase.from('welcome_messages').select('*').eq('room_id',room.id),
      supabase.from('access_details').select('*').eq('room_id',room.id),
    ])
    setMessages(m&&m.length?m:Object.keys(TRIGGERS).map(t=>({room_id:room.id,send_on:t,subject:'',message_template:'',is_active:t==='payment_confirmed',id:null})))
    setAccessDetails(a||[])
  }

  function updateMsg(trigger:string, field:string, value:any) {
    setMessages(msgs=>msgs.map(m=>m.send_on===trigger?{...m,[field]:value}:m))
  }

  async function save() {
    if(!selectedRoom) return
    setSaving(true)
    for(const msg of messages) {
      if(msg.id) {
        await supabase.from('welcome_messages').update({subject:msg.subject,message_template:msg.message_template,is_active:msg.is_active}).eq('id',msg.id)
      } else if(msg.message_template||msg.subject) {
        const {data}=await supabase.from('welcome_messages').insert([{room_id:selectedRoom.id,send_on:msg.send_on,subject:msg.subject,message_template:msg.message_template,is_active:msg.is_active}]).select().single()
        if(data) setMessages(msgs=>msgs.map(m=>m.send_on===msg.send_on?{...m,id:data.id}:m))
      }
    }
    await supabase.from('system_logs').insert([{action:'UPDATE_MESSAGES',module:'CMS',description:`Updated welcome messages for ${selectedRoom.name}`}])
    setSaving(false); setSaved(true); setTimeout(()=>setSaved(false),2500)
  }

  async function addAccess() {
    if(!newAccess.label||!newAccess.value) return
    const {data}=await supabase.from('access_details').insert([{...newAccess,room_id:selectedRoom.id}]).select().single()
    if(data) setAccessDetails(a=>[...a,data])
    setNewAccess({type:'door_code',label:'',value:'',notes:''})
  }

  async function deleteAccess(id:string) {
    await supabase.from('access_details').delete().eq('id',id)
    setAccessDetails(a=>a.filter(x=>x.id!==id))
  }

  const ROOM_ICONS: Record<string,string> = {'Sunrise Room':'🌅','Leaf Room':'🍃','2BR Suite':'🏡'}
  const ACCESS_ICONS: Record<string,string> = {door_code:'🔢',lockbox:'📦',wifi:'📶',parking:'🚗',gate_code:'🔐',other:'🔑'}

  function previewMessage(msg:any) {
    return (msg.message_template||'')
      .replace('{{guest_name}}','Maria Santos')
      .replace('{{room_name}}',selectedRoom?.name||'')
      .replace('{{checkin_date}}','April 20, 2026')
      .replace('{{checkout_date}}','April 21, 2026')
      .replace('{{checkin_time}}','2:00 PM')
      .replace('{{checkout_time}}','10:00 AM')
      .replace('{{num_guests}}','2')
      .replace('{{booking_ref}}','LNT-001234')
      .replace('{{access_details}}', accessDetails.map(a=>`${ACCESS_ICONS[a.type]||'🔑'} ${a.label}: ${a.value}${a.notes?` (${a.notes})`:''}`).join('\n')||'(Access details will appear here)')
      .replace('{{location_details}}','Tagaytay City, Cavite')
  }

  return (
    <div className="max-w-7xl">
      <div className="flex gap-5">
        {/* Room selector */}
        <div className="w-44 flex-shrink-0 space-y-2">
          {rooms.map(r=>(
            <button key={r.id} onClick={()=>selectRoom(r)}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all ${selectedRoom?.id===r.id?'border-green-300 shadow-sm':'border-gray-100 bg-white'}`}
              style={selectedRoom?.id===r.id?{background:'linear-gradient(135deg,#f0faf2,#fff)',borderColor:'#52b788'}:{}}>
              <div className="text-xl mb-1.5">{ROOM_ICONS[r.name]||'🏠'}</div>
              <div className="font-semibold text-sm text-gray-900">{r.name}</div>
            </button>
          ))}
        </div>

        {selectedRoom && (
          <div className="flex-1 space-y-5 min-w-0">
            {/* Access Details */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">🔑 Access Details</h3>
                  <p className="text-xs text-gray-400 mt-0.5">These are auto-injected into the welcome message via {'{{access_details}}'}</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                {accessDetails.map(a=>(
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-xl">{ACCESS_ICONS[a.type]||'🔑'}</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-800">{a.label}</div>
                      <div className="text-sm font-mono text-green-700 font-bold">{a.value}</div>
                      {a.notes&&<div className="text-xs text-gray-400">{a.notes}</div>}
                    </div>
                    <button onClick={()=>deleteAccess(a.id)} className="text-gray-300 hover:text-red-400 text-lg">×</button>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-2">
                <select value={newAccess.type} onChange={e=>setNewAccess({...newAccess,type:e.target.value})}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:border-green-400">
                  {Object.entries(ACCESS_ICONS).map(([k,v])=><option key={k} value={k}>{v} {k.replace('_',' ')}</option>)}
                </select>
                <input value={newAccess.label} onChange={e=>setNewAccess({...newAccess,label:e.target.value})} placeholder="Label (e.g. Door Code)"
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:border-green-400"/>
                <input value={newAccess.value} onChange={e=>setNewAccess({...newAccess,value:e.target.value})} placeholder="Value (e.g. 1234#)"
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 font-mono font-bold focus:outline-none focus:border-green-400"/>
                <button onClick={addAccess} className="rounded-xl text-sm font-bold text-white" style={{background:'#2d6a4f'}}>+ Add</button>
              </div>
            </div>

            {/* Message Templates */}
            {messages.map(msg=>{
              const t = TRIGGERS[msg.send_on as keyof typeof TRIGGERS]
              return (
                <div key={msg.send_on} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{t?.icon}</span>
                      <div>
                        <div className="font-bold text-gray-900">{t?.label}</div>
                        <div className="text-xs text-gray-400">Sent automatically when triggered</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={msg.is_active} onChange={e=>updateMsg(msg.send_on,'is_active',e.target.checked)} className="sr-only peer"/>
                      <div className="w-10 h-6 bg-gray-200 peer-checked:bg-green-500 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4"/>
                    </label>
                  </div>
                  <div className="p-5 space-y-3">
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">Subject Line</label>
                      <input value={msg.subject||''} onChange={e=>updateMsg(msg.send_on,'subject',e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 bg-gray-50"/>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 mb-1.5 block uppercase tracking-wide">Message</label>
                      <textarea value={msg.message_template||''} onChange={e=>updateMsg(msg.send_on,'message_template',e.target.value)}
                        rows={8} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 bg-gray-50 resize-none font-mono"/>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {VARIABLES.map(v=>(
                        <button key={v} onClick={()=>{
                          const el=document.querySelector(`textarea[data-trigger="${msg.send_on}"]`) as HTMLTextAreaElement
                          updateMsg(msg.send_on,'message_template',(msg.message_template||'')+v)
                        }} className="text-xs px-2.5 py-1 rounded-lg font-mono border border-green-200 text-green-700 hover:bg-green-50 transition-colors">
                          {v}
                        </button>
                      ))}
                    </div>
                    {msg.message_template&&(
                      <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                        <div className="text-xs font-bold text-green-700 mb-2">📱 Preview</div>
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{previewMessage(msg)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            <div className="flex justify-end">
              <button onClick={save} disabled={saving}
                className="px-6 py-3 rounded-xl font-bold text-white disabled:opacity-60"
                style={{background:saved?'#059669':'linear-gradient(135deg,#2d6a4f,#40916c)'}}>
                {saving?'Saving...':saved?'✓ Saved!':'Save All Messages'}
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700">
              💡 <strong>Available variables:</strong> These placeholders are automatically replaced with real booking data when messages are sent.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
