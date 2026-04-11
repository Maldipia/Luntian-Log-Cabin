'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const METHOD_ICONS: Record<string,string> = { gcash:'💚', maya:'💜', bank:'🏦', cash:'💵' }

export default function PaymentsPage() {
  const [methods, setMethods] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [saved, setSaved] = useState(false)

  async function load() {
    const {data}=await supabase.from('payment_settings').select('*').order('sort_order')
    setMethods(data||[])
    if(data&&data.length&&!selected) setSelected(data[0])
  }
  useEffect(()=>{load()},[])

  function updateSelected(field:string, value:any) {
    if(!selected) return
    const updated={...selected,[field]:value}
    setSelected(updated)
    setMethods(m=>m.map(x=>x.id===selected.id?updated:x))
  }

  async function save() {
    if(!selected) return
    await supabase.from('payment_settings').update({
      label:selected.label, account_name:selected.account_name,
      account_number:selected.account_number, qr_url:selected.qr_url,
      instructions:selected.instructions, is_active:selected.is_active
    }).eq('id',selected.id)
    await supabase.from('system_logs').insert([{action:'UPDATE_PAYMENT',module:'Payments',description:`Updated ${selected.method} payment settings`}])
    setSaved(true); setTimeout(()=>setSaved(false),2500)
  }

  async function addMethod(method:string) {
    const {data}=await supabase.from('payment_settings').insert([{method,label:method,is_active:true,sort_order:methods.length+1}]).select().single()
    if(data){setMethods(m=>[...m,data]); setSelected(data)}
  }

  const AVAILABLE=['gcash','maya','bank','cash']
  const existing=methods.map(m=>m.method)

  return (
    <div className="max-w-4xl space-y-5">
      <p className="text-sm text-gray-400">Configure payment methods shown to guests at checkout</p>
      <div className="flex gap-5">
        <div className="w-48 flex-shrink-0 space-y-2">
          {methods.map(m=>(
            <button key={m.id} onClick={()=>setSelected(m)}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all ${selected?.id===m.id?'border-green-300 shadow-sm':'border-gray-100 bg-white hover:border-gray-200'}`}
              style={selected?.id===m.id?{background:'linear-gradient(135deg,#f0faf2,#fff)',borderColor:'#52b788'}:{}}>
              <div className="text-xl mb-1">{METHOD_ICONS[m.method]||'💳'}</div>
              <div className="font-semibold text-sm text-gray-900 capitalize">{m.label||m.method}</div>
              <div className="flex items-center gap-1 mt-1">
                <div className={`w-1.5 h-1.5 rounded-full ${m.is_active?'bg-green-500':'bg-gray-300'}`}/>
                <span className="text-xs text-gray-400">{m.is_active?'Active':'Off'}</span>
              </div>
            </button>
          ))}
          {AVAILABLE.filter(m=>!existing.includes(m)).map(m=>(
            <button key={m} onClick={()=>addMethod(m)}
              className="w-full text-left p-3.5 rounded-2xl border border-dashed border-gray-200 text-gray-400 hover:border-green-300 hover:text-green-700 transition-all">
              <div className="text-xl mb-1">{METHOD_ICONS[m]}</div>
              <div className="text-xs font-medium capitalize">+ Add {m}</div>
            </button>
          ))}
        </div>

        {selected && (
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100" style={{background:'linear-gradient(135deg,#f0faf2,#fff)'}}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{METHOD_ICONS[selected.method]||'💳'}</span>
                <div><div className="font-bold text-gray-900 capitalize">{selected.method}</div><div className="text-xs text-gray-400">Payment method settings</div></div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-medium text-gray-600">Active</span>
                  <div className="relative">
                    <input type="checkbox" checked={selected.is_active} onChange={e=>updateSelected('is_active',e.target.checked)} className="sr-only peer"/>
                    <div className="w-9 h-5 bg-gray-200 peer-checked:bg-green-500 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"/>
                  </div>
                </label>
                <button onClick={save} className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{background:saved?'#059669':'#2d6a4f'}}>
                  {saved?'✓ Saved':'Save'}
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {[['Display Label','label','e.g. GCash'],['Account Name','account_name','e.g. Pia N.'],['Account Number / QR Code Number','account_number','e.g. 09XX XXX XXXX']].map(([l,f,ph])=>(
                <div key={f}><label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">{l}</label>
                  <input value={selected[f]||''} onChange={e=>updateSelected(f,e.target.value)} placeholder={ph}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 bg-gray-50"/></div>
              ))}
              <div><label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">QR Code Image URL</label>
                <input value={selected.qr_url||''} onChange={e=>updateSelected('qr_url',e.target.value)} placeholder="https://..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 bg-gray-50 font-mono"/>
                {selected.qr_url&&<img src={selected.qr_url} alt="QR" className="mt-2 w-32 h-32 object-contain rounded-xl border border-gray-200"/>}
              </div>
              <div><label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Payment Instructions</label>
                <textarea value={selected.instructions||''} onChange={e=>updateSelected('instructions',e.target.value)} rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 bg-gray-50 resize-none"
                  placeholder="Instructions shown to guests on checkout page..."/></div>
              <div className="bg-blue-50 rounded-xl p-4 text-xs text-blue-700">
                💡 These settings auto-reflect on your website checkout page and booking confirmation.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
