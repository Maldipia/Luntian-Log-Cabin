'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const TYPE_LABELS: Record<string,{label:string,icon:string,color:string}> = {
  payment_screenshot: {label:'Payment Screenshot',icon:'💳',color:'#059669'},
  valid_id_front:     {label:'Valid ID (Front)',   icon:'🪪',color:'#2563eb'},
  valid_id_back:      {label:'Valid ID (Back)',    icon:'🪪',color:'#2563eb'},
  other:              {label:'Other Document',    icon:'📄',color:'#6b7280'},
}

const STATUS_STYLE: Record<string,{bg:string,text:string}> = {
  pending:  {bg:'#fef3c7',text:'#92400e'},
  verified: {bg:'#d8f3dc',text:'#1b4332'},
  rejected: {bg:'#fee2e2',text:'#991b1b'},
}

export default function VerificationPage() {
  const [proofs, setProofs] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [filter, setFilter] = useState('all')
  const [viewer, setViewer] = useState<string|null>(null)
  const [rejecting, setRejecting] = useState<string|null>(null)
  const [rejectReason, setRejectReason] = useState('')

  async function load() {
    const [{data:p},{data:b}] = await Promise.all([
      supabase.from('payment_proofs').select('*, bookings(booking_ref,guest_name,check_in,rooms(name))').order('created_at',{ascending:false}),
      supabase.from('bookings').select('id,booking_ref,guest_name,payment_verified,id_verified,deposit_paid').order('created_at',{ascending:false}).limit(50),
    ])
    setProofs(p||[]); setBookings(b||[])
  }
  useEffect(()=>{load()},[])

  async function verify(id:string) {
    await supabase.from('payment_proofs').update({status:'verified',verified_at:new Date().toISOString(),verified_by:'admin'}).eq('id',id)
    setProofs(p=>p.map(x=>x.id===id?{...x,status:'verified'}:x))
    await supabase.from('system_logs').insert([{action:'VERIFY_PROOF',module:'Payments',description:`Payment proof ${id} verified`}])
    
    // Auto-update booking flags
    const proof = proofs.find(p=>p.id===id)
    if(proof?.bookings?.id) {
      const bookingProofs = proofs.filter(p=>p.booking_id===proof.booking_id&&p.status==='verified')
      const hasPayment = bookingProofs.some(p=>p.type==='payment_screenshot')
      const hasId = bookingProofs.some(p=>p.type==='valid_id_front'||p.type==='valid_id_back')
      if(hasPayment||hasId) {
        await supabase.from('bookings').update({
          payment_verified: hasPayment,
          id_verified: hasId,
        }).eq('id',proof.booking_id)
      }
    }
    load()
  }

  async function reject(id:string) {
    await supabase.from('payment_proofs').update({status:'rejected',rejection_reason:rejectReason,verified_at:new Date().toISOString(),verified_by:'admin'}).eq('id',id)
    setProofs(p=>p.map(x=>x.id===id?{...x,status:'rejected',rejection_reason:rejectReason}:x))
    setRejecting(null); setRejectReason('')
    load()
  }

  const pending = proofs.filter(p=>p.status==='pending')
  const filtered = filter==='all'?proofs:proofs.filter(p=>p.status===filter)

  return (
    <div className="max-w-7xl space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {label:'Pending Review',val:proofs.filter(p=>p.status==='pending').length,icon:'⏳',bg:'#fef3c7',color:'#92400e'},
          {label:'Verified',val:proofs.filter(p=>p.status==='verified').length,icon:'✅',bg:'#d8f3dc',color:'#1b4332'},
          {label:'Rejected',val:proofs.filter(p=>p.status==='rejected').length,icon:'❌',bg:'#fee2e2',color:'#991b1b'},
          {label:'Total Uploads',val:proofs.length,icon:'📁',bg:'#ede9fe',color:'#5b21b6'},
        ].map(m=>(
          <div key={m.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3" style={{background:m.bg}}>{m.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{m.val}</div>
            <div className="text-xs font-semibold mt-1" style={{color:m.color}}>{m.label}</div>
          </div>
        ))}
      </div>

      {pending.length>0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <div className="font-bold text-yellow-800">{pending.length} upload{pending.length>1?'s':''} pending review</div>
            <div className="text-xs text-yellow-600">Review payment screenshots and valid IDs before confirming bookings</div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        {['all','pending','verified','rejected'].map(s=>(
          <button key={s} onClick={()=>setFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${filter===s?'text-white':'text-gray-500 bg-white border border-gray-200'}`}
            style={filter===s?{background:'#2d6a4f'}:{}}>
            {s} {s==='all'?`(${proofs.length})`:s==='pending'?`(${proofs.filter(p=>p.status===s).length})`:''}
          </button>
        ))}
      </div>

      {/* Proofs grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(proof=>{
          const t=TYPE_LABELS[proof.type]||TYPE_LABELS.other
          const s=STATUS_STYLE[proof.status]||STATUS_STYLE.pending
          return (
            <div key={proof.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              {/* Image */}
              <div className="relative bg-gray-50 aspect-video flex items-center justify-center overflow-hidden cursor-zoom-in group"
                onClick={()=>setViewer(proof.file_url)}>
                <img src={proof.file_url} alt={t.label}
                  className="w-full h-full object-contain transition-transform group-hover:scale-105"
                  onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full w-12 h-12 flex items-center justify-center">🔍</div>
                </div>
                {/* Type badge */}
                <div className="absolute top-2 left-2 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{background:t.color}}>
                  {t.icon} {t.label}
                </div>
                {/* Status badge */}
                <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-xs font-bold" style={{background:s.bg,color:s.text}}>
                  {proof.status}
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="font-bold text-gray-900 text-sm">{proof.bookings?.guest_name||'Unknown guest'}</div>
                <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                  <span className="font-mono">{proof.bookings?.booking_ref||'No ref'}</span>
                  <span>·</span>
                  <span>{proof.bookings?.rooms?.name||'—'}</span>
                </div>
                {proof.reference_number&&<div className="text-xs text-gray-500 mt-1">Ref#: <span className="font-mono font-semibold">{proof.reference_number}</span></div>}
                {proof.amount&&<div className="text-sm font-bold text-green-700 mt-1">₱{proof.amount.toLocaleString()}</div>}
                <div className="text-xs text-gray-400 mt-1">{new Date(proof.created_at).toLocaleString('en-PH',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
                {proof.rejection_reason&&<div className="text-xs text-red-500 mt-1 bg-red-50 rounded-lg p-2">Rejected: {proof.rejection_reason}</div>}

                {proof.status==='pending' && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={()=>verify(proof.id)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold text-white" style={{background:'#059669'}}>
                      ✅ Verify
                    </button>
                    <button onClick={()=>setRejecting(proof.id)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold text-white" style={{background:'#dc2626'}}>
                      ❌ Reject
                    </button>
                  </div>
                )}
                {proof.status!=='pending' && (
                  <div className="mt-3 text-xs text-gray-400">
                    {proof.verified_at?`${proof.status} on ${new Date(proof.verified_at).toLocaleDateString('en-PH',{month:'short',day:'numeric'})}`:''} by {proof.verified_by||'admin'}
                  </div>
                )}
              </div>
            </div>
          )
        })}
        {filtered.length===0&&<div className="col-span-3 bg-white rounded-2xl border border-dashed border-gray-200 py-16 text-center text-gray-400"><div className="text-4xl mb-3">📁</div>No uploads yet</div>}
      </div>

      {/* Lightbox / Image Zoom Viewer */}
      {viewer && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={()=>setViewer(null)}>
          <div className="relative max-w-5xl max-h-full" onClick={e=>e.stopPropagation()}>
            <button onClick={()=>setViewer(null)}
              className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-800 font-bold text-lg shadow-lg hover:bg-gray-100 z-10">
              ×
            </button>
            <img src={viewer} alt="Document" className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl"/>
            <div className="flex justify-center mt-4 gap-3">
              <a href={viewer} target="_blank" rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-sm font-bold text-white" style={{background:'#2d6a4f'}}>
                🔗 Open Full Size
              </a>
              <a href={viewer} download
                className="px-4 py-2 rounded-xl text-sm font-bold border border-white/30 text-white hover:bg-white/10">
                ⬇️ Download
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {rejecting && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Reject Document</h3>
            <div className="mb-4">
              <label className="text-xs font-bold text-gray-500 mb-1.5 block">Reason for rejection</label>
              <textarea value={rejectReason} onChange={e=>setRejectReason(e.target.value)} rows={3}
                placeholder="e.g. ID is expired, image is blurry, wrong payment amount..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-red-400"/>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>reject(rejecting)} className="flex-1 py-2.5 rounded-xl font-bold text-white" style={{background:'#dc2626'}}>Reject</button>
              <button onClick={()=>{setRejecting(null);setRejectReason('')}} className="flex-1 py-2.5 rounded-xl font-bold border border-gray-200 text-gray-600">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
