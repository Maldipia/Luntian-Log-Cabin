'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const SECTION_META: Record<string,{label:string,icon:string,desc:string}> = {
  homepage: {label:'Homepage',    icon:'🏠', desc:'Hero banner, announcement, taglines'},
  about:    {label:'About',       icon:'ℹ️', desc:'About section text and bullets'},
  packages: {label:'Packages',    icon:'📦', desc:'Package prices and details'},
  contact:  {label:'Contact',     icon:'📞', desc:'Phone, address, WiFi, check-in times'},
  general:  {label:'General/SEO', icon:'🔍', desc:'Footer, page title, meta description'},
}

export default function CMSPage() {
  const [content, setContent] = useState<any[]>([])
  const [activeSection, setActiveSection] = useState('homepage')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [changed, setChanged] = useState<Set<string>>(new Set())

  async function load() {
    const {data} = await supabase.from('content').select('*').order('section').order('sort_order')
    setContent(data||[])
  }
  useEffect(()=>{load()},[])

  function updateItem(id:string, value:string) {
    setContent(c=>c.map(x=>x.id===id?{...x,value}:x))
    setChanged(s=>{const n=new Set(s);n.add(id);return n})
  }

  async function saveSection() {
    setSaving(true)
    const sectionItems = content.filter(x=>x.section===activeSection&&changed.has(x.id))
    for(const item of sectionItems) {
      await supabase.from('content').update({value:item.value,updated_at:new Date().toISOString()}).eq('id',item.id)
    }
    await supabase.from('system_logs').insert([{action:'UPDATE_CMS',module:'CMS',description:`Updated ${activeSection} content (${sectionItems.length} items)`}])
    setChanged(s=>{const n=new Set(s);sectionItems.forEach(i=>n.delete(i.id));return n})
    setSaving(false); setSaved(true); setTimeout(()=>setSaved(false),2500)
  }

  const sections = [...new Set(content.map(c=>c.section))]
  const sectionItems = content.filter(x=>x.section===activeSection)
  const groupedItems: Record<string,any[]> = {}
  sectionItems.forEach(item=>{
    const g = item.group_label||'General'
    if(!groupedItems[g]) groupedItems[g]=[]
    groupedItems[g].push(item)
  })
  const unsavedCount = content.filter(x=>x.section===activeSection&&changed.has(x.id)).length

  return (
    <div className="max-w-5xl space-y-5">
      <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">🔗</span>
        <div>
          <div className="font-bold text-green-800 text-sm">How this works</div>
          <div className="text-xs text-green-700 mt-1">
            Edit any content here → Save → Visit <a href="https://www.luntian.net" target="_blank" className="font-bold underline">luntian.net</a> and refresh — your changes are live instantly. No redeploy needed.
          </div>
          <div className="text-xs text-green-600 mt-1 font-mono">Admin → Supabase DB → luntian-cms.js → Website DOM → Guest sees it</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <a href="https://www.luntian.net" target="_blank"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50">
          🌐 Preview Website
        </a>
        <button onClick={saveSection} disabled={saving||unsavedCount===0}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
          style={{background:saved?'#059669':'linear-gradient(135deg,#2d6a4f,#40916c)'}}>
          {saving?'Saving...':saved?'✓ Saved!':unsavedCount>0?`Save ${unsavedCount} change${unsavedCount>1?'s':''}`:' Save Changes'}
        </button>
      </div>

      {/* Section tabs */}
      <div className="flex gap-2 flex-wrap">
        {sections.map(s=>{
          const meta = SECTION_META[s]||{label:s,icon:'📄',desc:''}
          const sectionChanged = content.filter(x=>x.section===s&&changed.has(x.id)).length
          return (
            <button key={s} onClick={()=>setActiveSection(s)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all relative ${activeSection===s?'text-white shadow-sm':'text-gray-500 bg-white border border-gray-200 hover:bg-gray-50'}`}
              style={activeSection===s?{background:'linear-gradient(135deg,#2d6a4f,#40916c)'}:{}}>
              <span>{meta.icon}</span>
              <span>{meta.label}</span>
              {sectionChanged>0&&<span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0"/>}
            </button>
          )
        })}
      </div>

      {/* Section description */}
      {SECTION_META[activeSection]&&(
        <div className="text-sm text-gray-400">{SECTION_META[activeSection].desc}</div>
      )}

      {/* Content groups */}
      <div className="space-y-4">
        {Object.entries(groupedItems).map(([group, items])=>(
          <div key={group} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{group}</span>
            </div>
            <div className="divide-y divide-gray-50">
              {items.map(item=>{
                const isDirty = changed.has(item.id)
                return (
                  <div key={item.id} className={`p-5 transition-colors ${isDirty?'bg-amber-50/40':''}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <label className="text-sm font-semibold text-gray-700">{item.label}</label>
                        <span className="ml-2 text-xs font-mono text-gray-400">{item.key}</span>
                        {isDirty&&<span className="ml-2 text-xs font-semibold text-orange-500">● unsaved</span>}
                      </div>
                      {item.type==='boolean'&&(
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={item.value==='true'} onChange={e=>updateItem(item.id,e.target.checked?'true':'false')} className="sr-only peer"/>
                          <div className="w-10 h-6 bg-gray-200 peer-checked:bg-green-500 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4"/>
                        </label>
                      )}
                    </div>
                    {item.type!=='boolean'&&(
                      item.value?.length>100||item.type==='html'
                        ? <textarea value={item.value||''} onChange={e=>updateItem(item.id,e.target.value)} rows={item.type==='html'?6:3}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 bg-gray-50 resize-none transition-colors focus:bg-white"/>
                        : <input value={item.value||''} onChange={e=>updateItem(item.id,e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 bg-gray-50 transition-colors focus:bg-white"/>
                    )}
                    {item.type==='boolean'&&(
                      <div className="text-xs text-gray-400 mt-1">
                        {item.value==='true'?'✅ Currently shown on website':'❌ Currently hidden on website'}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-3">
        <div className="font-bold text-blue-800 text-sm">🏗️ Architecture — How to add MORE editable content</div>
        <div className="text-xs text-blue-700 space-y-1.5 font-mono">
          <div>1. Add content key to Supabase: <code className="bg-blue-100 px-1.5 py-0.5 rounded">INSERT INTO content (key, value, label, section) VALUES (...);</code></div>
          <div>2. Tag HTML element: <code className="bg-blue-100 px-1.5 py-0.5 rounded">&lt;span data-cms="your_key"&gt;default text&lt;/span&gt;</code></div>
          <div>3. luntian-cms.js auto-replaces the text from DB on every page load</div>
          <div>4. Edit here in admin → save → refresh luntian.net → done ✅</div>
        </div>
      </div>
    </div>
  )
}
