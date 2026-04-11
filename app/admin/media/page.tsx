'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const TAGS = ['general','bedroom','bathroom','exterior','food','amenities','banner']
const TAG_ICONS: Record<string,string> = {general:'📁',bedroom:'🛏',bathroom:'🚿',exterior:'🏡',food:'🍽',amenities:'✨',banner:'🖼️'}

export default function MediaPage() {
  const [media, setMedia] = useState<any[]>([])
  const [filter, setFilter] = useState('all')
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({url:'',filename:'',tag:'general'})

  async function load() {
    const {data}=await supabase.from('media').select('*').order('created_at',{ascending:false})
    setMedia(data||[])
  }
  useEffect(()=>{load()},[])

  async function addMedia() {
    if(!form.url) return
    await supabase.from('media').insert([{...form,filename:form.filename||form.url.split('/').pop()}])
    setForm({url:'',filename:'',tag:'general'}); setAdding(false); load()
  }

  async function deleteMedia(id:string) {
    if(!confirm('Remove this media?')) return
    await supabase.from('media').delete().eq('id',id)
    setMedia(m=>m.filter(x=>x.id!==id))
  }

  const filtered=filter==='all'?media:media.filter(m=>m.tag===filter)

  return (
    <div className="max-w-6xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {['all',...TAGS].map(t=>(
            <button key={t} onClick={()=>setFilter(t)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize ${filter===t?'text-white':'text-gray-500 bg-white border border-gray-200 hover:bg-gray-50'}`}
              style={filter===t?{background:'linear-gradient(135deg,#2d6a4f,#40916c)'}:{}}>
              {TAG_ICONS[t]||'📁'} {t}
            </button>
          ))}
        </div>
        <button onClick={()=>setAdding(!adding)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{background:'linear-gradient(135deg,#2d6a4f,#40916c)'}}>
          {adding?'✕ Cancel':'+ Add Media'}
        </button>
      </div>

      {adding && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Add Image / Media</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2"><label className="text-xs font-bold text-gray-500 mb-1.5 block">Image URL *</label>
              <input value={form.url} onChange={e=>setForm({...form,url:e.target.value})} placeholder="https://..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 bg-gray-50 font-mono"/></div>
            <div><label className="text-xs font-bold text-gray-500 mb-1.5 block">Tag / Category</label>
              <select value={form.tag} onChange={e=>setForm({...form,tag:e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 bg-gray-50">
                {TAGS.map(t=><option key={t} value={t} className="capitalize">{TAG_ICONS[t]} {t}</option>)}
              </select></div>
            <div className="col-span-2"><label className="text-xs font-bold text-gray-500 mb-1.5 block">Name / Label</label>
              <input value={form.filename} onChange={e=>setForm({...form,filename:e.target.value})} placeholder="e.g. Sunrise Room Bed" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 bg-gray-50"/></div>
          </div>
          {form.url&&<div className="mt-3"><img src={form.url} alt="preview" className="h-32 w-auto rounded-xl border border-gray-200 object-cover" onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/></div>}
          <button onClick={addMedia} className="mt-4 px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{background:'#2d6a4f'}}>Add to Library</button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filtered.map(m=>(
          <div key={m.id} className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-square bg-gray-50 overflow-hidden">
              <img src={m.url} alt={m.filename} className="w-full h-full object-cover" onError={e=>{(e.target as HTMLImageElement).src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23f0faf2" width="100" height="100"/><text x="50" y="55" text-anchor="middle" font-size="30">🖼️</text></svg>'}}/>
            </div>
            <div className="p-2.5">
              <div className="text-xs font-medium text-gray-700 truncate">{m.filename||'Untitled'}</div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-400 capitalize">{TAG_ICONS[m.tag]||'📁'} {m.tag}</span>
                <button onClick={()=>deleteMedia(m.id)} className="text-gray-300 hover:text-red-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length===0&&<div className="col-span-full bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center"><div className="text-4xl mb-3">🖼️</div><div className="text-sm text-gray-400 font-medium">No media yet</div><div className="text-xs text-gray-300 mt-1">Add image URLs to build your media library</div></div>}
      </div>
    </div>
  )
}
