'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

const METHOD_META: Record<string,{icon:string,color:string,bg:string}> = {
  gcash:  {icon:'💚', color:'#059669', bg:'#d1fae5'},
  maya:   {icon:'💜', color:'#7c3aed', bg:'#ede9fe'},
  bank:   {icon:'🏦', color:'#1d4ed8', bg:'#dbeafe'},
  cash:   {icon:'💵', color:'#92400e', bg:'#fef3c7'},
}

const METHOD_LABELS = [
  {value:'gcash',  label:'GCash'},
  {value:'maya',   label:'InstaPay / Maya'},
  {value:'bank',   label:'Bank Transfer'},
  {value:'cash',   label:'Cash on Arrival'},
  {value:'other',  label:'Other'},
]

export default function PaymentsPage() {
  const [methods, setMethods] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [adding, setAdding] = useState(false)
  const [newMethod, setNewMethod] = useState({method:'gcash',label:'',account_name:'',account_number:'',instructions:'',is_active:true,show_on_booking:true})

  async function load() {
    const {data} = await supabase.from('payment_settings').select('*').order('sort_order')
    setMethods(data||[])
    if (data?.length && !selected) setSelected(data[0])
    else if (selected) setSelected(data?.find(x=>x.id===selected.id)||data?.[0])
  }
  useEffect(()=>{load()},[])

  function update(field:string, value:any) {
    if (!selected) return
    const updated = {...selected,[field]:value}
    setSelected(updated)
    setMethods(m=>m.map(x=>x.id===selected.id?updated:x))
  }

  async function save() {
    if (!selected) return
    setSaving(true)
    await supabase.from('payment_settings').update({
      label: selected.label,
      account_name: selected.account_name,
      account_number: selected.account_number,
      qr_url: selected.qr_url,
      qr_image_url: selected.qr_image_url,
      bank_name: selected.bank_name,
      instructions: selected.instructions,
      is_active: selected.is_active,
      show_on_booking: selected.show_on_booking,
    }).eq('id', selected.id)
    await supabase.from('system_logs').insert([{action:'UPDATE_PAYMENT',module:'Payments',description:`Updated ${selected.label} payment settings`}])
    setSaving(false); setSaved(true); setTimeout(()=>setSaved(false),2500)
    load()
  }

  async function uploadQR(file: File) {
    if (!selected) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `qr-${selected.id}-${Date.now()}.${ext}`
    const {data, error} = await supabase.storage.from('payment-qr').upload(path, file, {upsert:true})
    if (!error && data) {
      const {data:url} = supabase.storage.from('payment-qr').getPublicUrl(data.path)
      update('qr_image_url', url.publicUrl)
      update('qr_url', url.publicUrl)
    }
    setUploading(false)
  }

  async function addMethod() {
    if (!newMethod.label) return
    await supabase.from('payment_settings').insert([{...newMethod, sort_order: methods.length+1}])
    setAdding(false)
    setNewMethod({method:'gcash',label:'',account_name:'',account_number:'',instructions:'',is_active:true,show_on_booking:true})
    load()
  }

  async function deleteMethod(id:string) {
    if (!confirm('Remove this payment method?')) return
    await supabase.from('payment_settings').delete().eq('id',id)
    setSelected(null); load()
  }

  const inp = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 bg-gray-50 focus:bg-white"

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">QR codes and payment details shown to guests at checkout</p>
        <button onClick={()=>setAdding(!adding)} className="px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{background:'linear-gradient(135deg,#2d6a4f,#40916c)'}}>
          {adding?'✕ Cancel':'+ Add Method'}
        </button>
      </div>

      {adding && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-4">New Payment Method</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div><label className="text-xs font-bold text-gray-500 mb-1.5 block">Type</label>
              <select value={newMethod.method} onChange={e=>setNewMethod({...newMethod,method:e.target.value})} className={inp}>
                {METHOD_LABELS.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}
              </select></div>
            <div><label className="text-xs font-bold text-gray-500 mb-1.5 block">Display Label</label>
              <input value={newMethod.label} onChange={e=>setNewMethod({...newMethod,label:e.target.value})} placeholder="e.g. GCash" className={inp}/></div>
            <div><label className="text-xs font-bold text-gray-500 mb-1.5 block">Account Name</label>
              <input value={newMethod.account_name} onChange={e=>setNewMethod({...newMethod,account_name:e.target.value})} placeholder="e.g. Pia N." className={inp}/></div>
            <div><label className="text-xs font-bold text-gray-500 mb-1.5 block">Account Number</label>
              <input value={newMethod.account_number} onChange={e=>setNewMethod({...newMethod,account_number:e.target.value})} placeholder="09XX XXX XXXX" className={inp}/></div>
          </div>
          <button onClick={addMethod} className="mt-4 px-5 py-2.5 rounded-xl text-sm font-bold text-white" style={{background:'#2d6a4f'}}>Add Payment Method</button>
        </div>
      )}

      <div className="flex gap-5">
        {/* Method list */}
        <div className="w-52 flex-shrink-0 space-y-2">
          {methods.map(m => {
            const meta = METHOD_META[m.method]||{icon:'💳',color:'#374151',bg:'#f3f4f6'}
            const active = selected?.id === m.id
            return (
              <button key={m.id} onClick={()=>setSelected(m)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${active?'border-green-400 shadow-sm':'border-gray-100 bg-white hover:border-gray-200'}`}
                style={active?{background:'linear-gradient(135deg,#f0faf2,#fff)',borderColor:'#52b788'}:{}}>
                <div className="flex items-center justify-between mb-2">
                  <span style={{fontSize:'1.6rem'}}>{meta.icon}</span>
                  <div className={`w-2 h-2 rounded-full ${m.is_active?'bg-green-500':'bg-gray-300'}`}/>
                </div>
                <div className="font-bold text-sm text-gray-900">{m.label||m.method}</div>
                {m.account_number && <div className="text-xs text-gray-400 mt-0.5 truncate">{m.account_number}</div>}
                {m.qr_image_url && <div className="text-xs text-green-600 mt-1">✓ QR uploaded</div>}
              </button>
            )
          })}
        </div>

        {/* Edit panel */}
        {selected && (
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100" style={{background:'linear-gradient(135deg,#f9fafb,#fff)'}}>
              <div className="flex items-center gap-3">
                <span style={{fontSize:'1.8rem'}}>{METHOD_META[selected.method]?.icon||'💳'}</span>
                <div>
                  <div className="font-bold text-gray-900">{selected.label||selected.method}</div>
                  <div className="text-xs text-gray-400">Payment method settings</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-semibold text-gray-600">Show at checkout</span>
                  <div className="relative">
                    <input type="checkbox" checked={selected.show_on_booking||false} onChange={e=>update('show_on_booking',e.target.checked)} className="sr-only peer"/>
                    <div className="w-10 h-6 bg-gray-200 peer-checked:bg-green-500 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4"/>
                  </div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-semibold text-gray-600">Active</span>
                  <div className="relative">
                    <input type="checkbox" checked={selected.is_active||false} onChange={e=>update('is_active',e.target.checked)} className="sr-only peer"/>
                    <div className="w-10 h-6 bg-gray-200 peer-checked:bg-green-500 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4"/>
                  </div>
                </label>
                <button onClick={()=>deleteMethod(selected.id)} className="p-2 rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-50">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                </button>
                <button onClick={save} disabled={saving} className="px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-60" style={{background:saved?'#059669':'#2d6a4f'}}>
                  {saving?'Saving...':saved?'✓ Saved!':'Save'}
                </button>
              </div>
            </div>

            <div className="p-6 grid grid-cols-2 gap-6">
              {/* Left - QR Upload */}
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">QR Code</div>
                
                {/* QR Preview */}
                <div className="relative mb-4 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center" style={{height:220}}>
                  {selected.qr_image_url ? (
                    <>
                      <img src={selected.qr_image_url} alt="QR Code" className="max-h-full max-w-full object-contain p-3"/>
                      <button onClick={()=>{update('qr_image_url','');update('qr_url','')}}
                        className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-red-600">
                        ×
                      </button>
                    </>
                  ) : (
                    <div className="text-center">
                      <div className="text-4xl mb-2">📷</div>
                      <div className="text-sm text-gray-400 font-medium">No QR code uploaded</div>
                      <div className="text-xs text-gray-400 mt-1">Upload your payment QR image</div>
                    </div>
                  )}
                </div>

                {/* Upload button */}
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e=>e.target.files?.[0]&&uploadQR(e.target.files[0])}/>
                <button onClick={()=>fileRef.current?.click()} disabled={uploading}
                  className="w-full py-3 rounded-xl text-sm font-bold border-2 border-dashed border-green-300 text-green-700 hover:bg-green-50 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
                  {uploading ? (
                    <><span className="animate-spin">⏳</span> Uploading...</>
                  ) : (
                    <><span>⬆️</span> {selected.qr_image_url ? 'Replace QR Image' : 'Upload QR Image'}</>
                  )}
                </button>
                <p className="text-xs text-gray-400 text-center mt-2">JPG, PNG · Max 5MB</p>

                {/* Or paste URL */}
                <div className="mt-4">
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Or paste image URL</label>
                  <input value={selected.qr_url||''} onChange={e=>{update('qr_url',e.target.value);update('qr_image_url',e.target.value)}}
                    placeholder="https://..." className={`${inp} font-mono text-xs`}/>
                </div>
              </div>

              {/* Right - Account details */}
              <div className="space-y-4">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Account Details</div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Display Label</label>
                  <input value={selected.label||''} onChange={e=>update('label',e.target.value)} className={inp} placeholder="e.g. GCash"/>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Account Name</label>
                  <input value={selected.account_name||''} onChange={e=>update('account_name',e.target.value)} className={inp} placeholder="e.g. Pia N."/>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Account Number / Mobile Number</label>
                  <input value={selected.account_number||''} onChange={e=>update('account_number',e.target.value)} className={inp} placeholder="09XX XXX XXXX or 0126-000-XXXXX"/>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Bank Name (for bank transfers)</label>
                  <input value={selected.bank_name||''} onChange={e=>update('bank_name',e.target.value)} className={inp} placeholder="e.g. BDO, BPI, UnionBank"/>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Payment Instructions</label>
                  <textarea value={selected.instructions||''} onChange={e=>update('instructions',e.target.value)} rows={4}
                    className={`${inp} resize-none`}
                    placeholder="Send payment to the number above and screenshot as proof. Include your booking reference number."/>
                </div>
              </div>
            </div>

            {/* Preview how it looks to guests */}
            <div className="mx-6 mb-6 p-4 rounded-2xl border border-blue-100 bg-blue-50">
              <div className="text-xs font-bold text-blue-700 mb-3">👁 Guest Preview — How this appears at checkout</div>
              <div className="flex items-start gap-4 bg-white rounded-xl p-4">
                {selected.qr_image_url && (
                  <img src={selected.qr_image_url} alt="QR" className="w-20 h-20 object-contain rounded-lg border border-gray-100 flex-shrink-0"/>
                )}
                <div>
                  <div className="font-bold text-gray-900">{selected.label||selected.method}</div>
                  {selected.account_name && <div className="text-sm text-gray-600">{selected.account_name}</div>}
                  {selected.account_number && <div className="text-sm font-mono font-bold text-green-700">{selected.account_number}</div>}
                  {selected.bank_name && <div className="text-xs text-gray-400">{selected.bank_name}</div>}
                  {selected.instructions && <div className="text-xs text-gray-500 mt-1">{selected.instructions}</div>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-xs text-green-700">
        💡 QR codes and payment details show automatically on the booking confirmation page and checkout. Guests upload their payment proof and valid ID during booking.
      </div>
    </div>
  )
}
