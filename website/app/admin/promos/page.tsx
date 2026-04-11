'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function PromosPage() {
  const [promos, setPromos] = useState<any[]>([])
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({code:'',name:'',type:'percent',value:10,min_nights:1,valid_from:'',valid_until:'',usage_limit:100,is_active:true})

  async function load() {
    const {data}=await supabase.from('promos').select('*').order('created_at',{ascending:false})
    setPromos(data||[])
  }
  useEffect(()=>{load()},[])

  async function addPromo() {
    if(!form.code||!form.value) return
    await supabase.from('promos').insert([form])
    await supabase.from('system_logs').insert([{action:'CREATE_PROMO',module:'Promotions',description:`Created promo code: ${form.code}`}])
    setAdding(false); setForm({code:'',name:'',type:'percent',value:10,min_nights:1,valid_from:'',valid_until:'',usage_limit:100,is_active:true}); load()
  }

  async function togglePromo(id:string, val:boolean) {
    await supabase.from('promos').update({is_active:val}).eq('id',id)
    setPromos(p=>p.map(x=>x.id===id?{...x,is_active:val}:x))
  }

  async function deletePromo(id:string) {
    if(!confirm('Delete this promo?')) return
    await supabase.from('promos').delete().eq('id',id)
    setPromos(p=>p.filter(x=>x.id!==id))
  }

  function genCode() {
    const words=['SUMMER','LUNTIAN','TAGAYTAY','NATURE','CABIN','ESCAPE','GREEN']
    const nums=Math.floor(Math.random()*90+10)
    setForm({...form,code:`${words[Math.floor(Math.random()*words.length)]}${nums}`})
  }

  const isExpired=(p:any)=>p.valid_until&&new Date(p.valid_until)<new Date()
  const isLimitReached=(p:any)=>p.usage_limit&&p.usage_count>=p.usage_limit

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex justify-end">
        <button onClick={()=>setAdding(!adding)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{background:'linear-gradient(135deg,#2d6a4f,#40916c)'}}>
          {adding?'✕ Cancel':'🎟 Create Promo'}
        </button>
      </div>

      {adding && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 mb-4">New Promotion</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="text-xs font-bold text-gray-500 mb-1.5 block">Promo Code *</label>
              <div className="flex gap-2">
                <input value={form.code} onChange={e=>setForm({...form,code:e.target.value.toUpperCase()})}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono font-bold focus:outline-none focus:border-green-400 bg-gray-50 uppercase" placeholder="SUMMER20"/>
                <button onClick={genCode} className="px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-500 hover:bg-gray-50">⚡ Gen</button>
              </div>
            </div>
            <div><label className="text-xs font-bold text-gray-500 mb-1.5 block">Name / Label</label>
              <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Summer Sale" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400 bg-gray-50"/></div>
            <div><label className="text-xs font-bold text-gray-500 mb-1.5 block">Type</label>
              <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400 bg-gray-50">
                <option value="percent">% Discount</option>
                <option value="fixed">Fixed ₱ Amount</option>
                <option value="bundle">Bundle Deal</option>
              </select></div>
            <div><label className="text-xs font-bold text-gray-500 mb-1.5 block">{form.type==='percent'?'Discount %':'Discount ₱'}</label>
              <input type="number" value={form.value} onChange={e=>setForm({...form,value:Number(e.target.value)})} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400 bg-gray-50"/></div>
            <div><label className="text-xs font-bold text-gray-500 mb-1.5 block">Min Nights</label>
              <input type="number" value={form.min_nights} onChange={e=>setForm({...form,min_nights:Number(e.target.value)})} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400 bg-gray-50"/></div>
            <div><label className="text-xs font-bold text-gray-500 mb-1.5 block">Usage Limit</label>
              <input type="number" value={form.usage_limit} onChange={e=>setForm({...form,usage_limit:Number(e.target.value)})} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400 bg-gray-50"/></div>
            <div><label className="text-xs font-bold text-gray-500 mb-1.5 block">Valid From</label>
              <input type="date" value={form.valid_from} onChange={e=>setForm({...form,valid_from:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400 bg-gray-50"/></div>
            <div><label className="text-xs font-bold text-gray-500 mb-1.5 block">Valid Until</label>
              <input type="date" value={form.valid_until} onChange={e=>setForm({...form,valid_until:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-400 bg-gray-50"/></div>
          </div>
          <button onClick={addPromo} className="mt-4 px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{background:'#2d6a4f'}}>Create Promo</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promos.map(p=>{
          const expired=isExpired(p), limitHit=isLimitReached(p)
          const statusText=!p.is_active?'Disabled':expired?'Expired':limitHit?'Limit Reached':'Active'
          const statusBg=!p.is_active||expired||limitHit?'#f3f4f6':'#d8f3dc'
          const statusColor=!p.is_active||expired||limitHit?'#6b7280':'#1b4332'
          return (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-mono font-bold text-xl text-gray-900 tracking-wider">{p.code}</div>
                  {p.name&&<div className="text-sm text-gray-500 mt-0.5">{p.name}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{background:statusBg,color:statusColor}}>{statusText}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={p.is_active} onChange={e=>togglePromo(p.id,e.target.checked)} className="sr-only peer"/>
                    <div className="w-9 h-5 bg-gray-200 peer-checked:bg-green-500 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"/>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                  <div className="font-bold text-gray-900">{p.type==='percent'?`${p.value}%`:`₱${p.value}`}</div>
                  <div className="text-xs text-gray-400">{p.type}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                  <div className="font-bold text-gray-900">{p.usage_count||0}/{p.usage_limit||'∞'}</div>
                  <div className="text-xs text-gray-400">uses</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                  <div className="font-bold text-gray-900">{p.min_nights||1}N</div>
                  <div className="text-xs text-gray-400">min stay</div>
                </div>
              </div>
              {(p.valid_from||p.valid_until)&&<div className="text-xs text-gray-400 mb-3">📅 {p.valid_from||'—'} → {p.valid_until||'—'}</div>}
              <button onClick={()=>deletePromo(p.id)} className="text-xs text-red-400 hover:text-red-600 font-medium">Delete promo</button>
            </div>
          )
        })}
        {promos.length===0&&<div className="col-span-2 bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">No promotions yet. Create your first promo code!</div>}
      </div>
    </div>
  )
}
