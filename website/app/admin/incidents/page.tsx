'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const STATUS = {
  open:     {bg:'#fef3c7',text:'#92400e'},
  resolved: {bg:'#d8f3dc',text:'#1b4332'},
  deducted: {bg:'#fee2e2',text:'#991b1b'},
  waived:   {bg:'#f3f4f6',text:'#6b7280'},
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({booking_id:'',title:'',description:'',cost:0})

  async function load() {
    const [{data:i},{data:b}] = await Promise.all([
      supabase.from('incidents').select('*, bookings(booking_ref,guest_name,rooms(name))').order('created_at',{ascending:false}),
      supabase.from('bookings').select('id,booking_ref,guest_name').order('created_at',{ascending:false}).limit(50),
    ])
    setIncidents(i||[]); setBookings(b||[])
    if(b&&b.length&&!form.booking_id) setForm(f=>({...f,booking_id:b[0].id}))
  }
  useEffect(()=>{load()},[])

  async function addIncident() {
    if(!form.title) return
    await supabase.from('incidents').insert([{...form, status:'open', reported_by:'admin'}])
    await supabase.from('system_logs').insert([{action:'LOG_INCIDENT',module:'Bookings',description:`Incident reported: ${form.title} — ₱${form.cost}`}])
    setAdding(false); setForm(f=>({...f,title:'',description:'',cost:0})); load()
  }

  async function updateStatus(id:string, status:string) {
    await supabase.from('incidents').update({status, resolved_at: status!=='open'?new Date().toISOString():null}).eq('id',id)
    setIncidents(i=>i.map(x=>x.id===id?{...x,status}:x))
  }

  const totalCost = incidents.filter(i=>i.status==='deducted').reduce((s,i)=>s+(i.cost||0),0)

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-red-50 rounded-2xl px-5 py-3">
            <div className="text-xs font-semibold text-red-600 mb-0.5">Total Deducted</div>
            <div className="text-2xl font-bold text-red-700">₱{totalCost.toLocaleString()}</div>
          </div>
          <div className="bg-yellow-50 rounded-2xl px-5 py-3">
            <div className="text-xs font-semibold text-yellow-600 mb-0.5">Open Cases</div>
            <div className="text-2xl font-bold text-yellow-700">{incidents.filter(i=>i.status==='open').length}</div>
          </div>
        </div>
        <button onClick={()=>setAdding(!adding)} className="px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{background:'#dc2626'}}>
          {adding?'✕ Cancel':'⚠️ Log Incident'}
        </button>
      </div>

      {adding && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
          <h3 className="font-bold text-red-800 mb-4">Report Incident / Damage</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-bold text-red-600 mb-1.5 block">Booking</label>
              <select value={form.booking_id} onChange={e=>setForm({...form,booking_id:e.target.value})}
                className="w-full border border-red-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none">
                {bookings.map(b=><option key={b.id} value={b.id}>{b.booking_ref} — {b.guest_name}</option>)}
              </select></div>
            <div><label className="text-xs font-bold text-red-600 mb-1.5 block">Damage Cost (₱)</label>
              <input type="number" value={form.cost} onChange={e=>setForm({...form,cost:Number(e.target.value)})}
                className="w-full border border-red-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none"/></div>
            <div className="col-span-2"><label className="text-xs font-bold text-red-600 mb-1.5 block">Incident Title *</label>
              <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Broken window, Missing item..."
                className="w-full border border-red-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none"/></div>
            <div className="col-span-2"><label className="text-xs font-bold text-red-600 mb-1.5 block">Description</label>
              <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3}
                className="w-full border border-red-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none resize-none" placeholder="Describe what happened..."/></div>
          </div>
          <button onClick={addIncident} className="mt-4 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600">Log Incident</button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-50">
          {incidents.map(inc=>{
            const s = STATUS[inc.status as keyof typeof STATUS]||STATUS.open
            return (
              <div key={inc.id} className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{background:s.bg}}>
                  {inc.status==='open'?'⚠️':inc.status==='deducted'?'💸':inc.status==='resolved'?'✅':'🚫'}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-gray-900">{inc.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{inc.bookings?.guest_name} · {inc.bookings?.booking_ref} · {inc.bookings?.rooms?.name}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-lg font-bold" style={{color:'#dc2626'}}>₱{(inc.cost||0).toLocaleString()}</span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{background:s.bg,color:s.text}}>{inc.status}</span>
                    </div>
                  </div>
                  {inc.description&&<p className="text-sm text-gray-500 mt-1.5">{inc.description}</p>}
                  <div className="flex gap-2 mt-3">
                    {inc.status==='open'&&<>
                      <button onClick={()=>updateStatus(inc.id,'deducted')} className="text-xs px-3 py-1.5 rounded-lg font-semibold text-white bg-red-500">Deduct from Deposit</button>
                      <button onClick={()=>updateStatus(inc.id,'resolved')} className="text-xs px-3 py-1.5 rounded-lg font-semibold text-white" style={{background:'#059669'}}>Mark Resolved</button>
                      <button onClick={()=>updateStatus(inc.id,'waived')} className="text-xs px-3 py-1.5 rounded-lg font-semibold border border-gray-200 text-gray-500">Waive</button>
                    </>}
                    {inc.status!=='open'&&<span className="text-xs text-gray-400">{inc.resolved_at?new Date(inc.resolved_at).toLocaleDateString('en-PH'):''}</span>}
                  </div>
                </div>
              </div>
            )
          })}
          {incidents.length===0&&<div className="py-12 text-center text-sm text-gray-400">No incidents reported. Great!</div>}
        </div>
      </div>
    </div>
  )
}
