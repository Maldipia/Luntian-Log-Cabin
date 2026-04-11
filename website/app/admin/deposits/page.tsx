'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const STATUS = {
  pending:   {bg:'#fef3c7',text:'#92400e',label:'Pending'},
  paid:      {bg:'#d8f3dc',text:'#1b4332',label:'Paid'},
  held:      {bg:'#e0f2fe',text:'#075985',label:'Held'},
  refunded:  {bg:'#ede9fe',text:'#5b21b6',label:'Refunded'},
  forfeited: {bg:'#fee2e2',text:'#991b1b',label:'Forfeited'},
  partial_refund:{bg:'#fef3c7',text:'#92400e',label:'Partial Refund'},
}

export default function DepositsPage() {
  const [deposits, setDeposits] = useState<any[]>([])
  const [filter, setFilter] = useState('all')
  const [modal, setModal] = useState<any>(null)
  const [refundAmount, setRefundAmount] = useState('')
  const [notes, setNotes] = useState('')

  async function load() {
    const {data} = await supabase
      .from('security_deposits')
      .select('*, bookings(booking_ref, guest_name, check_in, check_out, rooms(name))')
      .order('created_at', {ascending:false})
    setDeposits(data||[])
  }
  useEffect(()=>{load()},[])

  async function updateStatus(id:string, status:string, extra:any={}) {
    const upd:any = {status, notes, updated_at: new Date().toISOString(), ...extra}
    if(status==='refunded') upd.refunded_at = new Date().toISOString()
    if(status==='refunded'||status==='partial_refund') upd.refunded_amount = parseFloat(refundAmount)||0
    await supabase.from('security_deposits').update(upd).eq('id', id)
    await supabase.from('system_logs').insert([{action:`DEPOSIT_${status.toUpperCase()}`,module:'Payments',description:`Deposit ${id} marked as ${status}. Notes: ${notes}`}])
    setModal(null); setNotes(''); setRefundAmount(''); load()
  }

  const filtered = filter==='all' ? deposits : deposits.filter(d=>d.status===filter)
  const totalHeld = deposits.filter(d=>d.status==='paid'||d.status==='held').reduce((s,d)=>s+d.amount,0)
  const totalRefunded = deposits.filter(d=>d.status==='refunded'||d.status==='partial_refund').reduce((s,d)=>s+(d.refunded_amount||0),0)

  return (
    <div className="max-w-6xl space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {[
          {label:'Total Held',value:`₱${totalHeld.toLocaleString()}`,icon:'🔒',bg:'#e0f2fe',color:'#075985'},
          {label:'Total Refunded',value:`₱${totalRefunded.toLocaleString()}`,icon:'↩️',bg:'#d8f3dc',color:'#1b4332'},
          {label:'Pending',value:deposits.filter(d=>d.status==='pending').length,icon:'⏳',bg:'#fef3c7',color:'#92400e'},
        ].map(m=>(
          <div key={m.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3" style={{background:m.bg}}>{m.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{m.value}</div>
            <div className="text-xs font-medium mt-1" style={{color:m.color}}>{m.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {['all','pending','paid','held','refunded','forfeited'].map(s=>(
          <button key={s} onClick={()=>setFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${filter===s?'text-white':'text-gray-500 bg-white border border-gray-200'}`}
            style={filter===s?{background:'#2d6a4f'}:{}}>
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
            {['Booking','Guest','Room','Check-in','Amount','Status','Actions'].map(h=>
              <th key={h} className="text-left px-5 py-3 font-bold uppercase tracking-wide">{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map(d=>{
              const s = STATUS[d.status as keyof typeof STATUS]||STATUS.pending
              const b = d.bookings
              return (
                <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-400">{b?.booking_ref||'—'}</td>
                  <td className="px-5 py-3.5 font-semibold text-gray-900">{b?.guest_name||'—'}</td>
                  <td className="px-5 py-3.5 text-gray-500">{b?.rooms?.name||'—'}</td>
                  <td className="px-5 py-3.5 text-gray-500">{b?.check_in?new Date(b.check_in).toLocaleDateString('en-PH',{month:'short',day:'numeric'}):'-'}</td>
                  <td className="px-5 py-3.5 font-bold text-gray-900">₱{d.amount?.toLocaleString()}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{background:s.bg,color:s.text}}>{s.label}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    {(d.status==='paid'||d.status==='held') && (
                      <button onClick={()=>{setModal(d);setRefundAmount(String(d.amount))}}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white" style={{background:'#2d6a4f'}}>
                        Process
                      </button>
                    )}
                    {d.status==='pending' && (
                      <button onClick={()=>updateStatus(d.id,'paid')}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-green-300 text-green-700 hover:bg-green-50">
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
            {filtered.length===0&&<tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-400">No deposits found</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-gray-900 text-lg mb-1">Process Deposit</h3>
            <p className="text-sm text-gray-400 mb-4">{modal.bookings?.guest_name} — ₱{modal.amount?.toLocaleString()}</p>
            <div className="mb-4">
              <label className="text-xs font-bold text-gray-500 mb-1.5 block">Refund Amount (₱)</label>
              <input type="number" value={refundAmount} onChange={e=>setRefundAmount(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-lg font-bold focus:outline-none focus:border-green-400"/>
            </div>
            <div className="mb-5">
              <label className="text-xs font-bold text-gray-500 mb-1.5 block">Notes (optional)</label>
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} placeholder="e.g. Minor damage deducted..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-green-400"/>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={()=>updateStatus(modal.id,'refunded')} className="py-2.5 rounded-xl text-sm font-bold text-white" style={{background:'#059669'}}>Full Refund</button>
              <button onClick={()=>updateStatus(modal.id,'partial_refund')} className="py-2.5 rounded-xl text-sm font-bold text-white" style={{background:'#d97706'}}>Partial</button>
              <button onClick={()=>updateStatus(modal.id,'forfeited')} className="py-2.5 rounded-xl text-sm font-bold text-white" style={{background:'#dc2626'}}>Forfeit</button>
            </div>
            <button onClick={()=>setModal(null)} className="w-full mt-3 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-500 hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
