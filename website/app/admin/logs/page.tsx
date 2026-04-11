'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const MODULE_COLORS: Record<string,{bg:string,text:string}> = {
  Bookings:{bg:'#d8f3dc',text:'#1b4332'},
  Pricing:{bg:'#e0f2fe',text:'#075985'},
  CRM:{bg:'#ede9fe',text:'#5b21b6'},
  Promotions:{bg:'#fef3c7',text:'#92400e'},
  Payments:{bg:'#d8f3dc',text:'#1b4332'},
  CMS:{bg:'#fce7f3',text:'#9d174d'},
  Calendar:{bg:'#fee2e2',text:'#991b1b'},
  Media:{bg:'#f3f4f6',text:'#374151'},
  Staff:{bg:'#e0f2fe',text:'#075985'},
}

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [filter, setFilter] = useState('all')

  async function load() {
    const {data}=await supabase.from('system_logs').select('*').order('created_at',{ascending:false}).limit(200)
    setLogs(data||[])
  }
  useEffect(()=>{load()},[])

  const modules=['all',...[...new Set(logs.map(l=>l.module).filter(Boolean))]]
  const filtered=filter==='all'?logs:logs.filter(l=>l.module===filter)

  async function clearLogs() {
    if(!confirm('Clear all logs older than 30 days?')) return
    const cutoff=new Date(Date.now()-30*24*60*60*1000).toISOString()
    await supabase.from('system_logs').delete().lt('created_at',cutoff)
    load()
  }

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {modules.map(m=>(
            <button key={m} onClick={()=>setFilter(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize ${filter===m?'text-white':'text-gray-500 bg-white border border-gray-200 hover:bg-gray-50'}`}
              style={filter===m?{background:'linear-gradient(135deg,#1b4332,#2d6a4f)'}:{}}>
              {m}
            </button>
          ))}
        </div>
        <button onClick={clearLogs} className="text-xs text-gray-400 hover:text-red-500 font-medium">Clear old logs</button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Activity Log</span>
          <span className="text-xs text-gray-400">{filtered.length} entries</span>
        </div>
        <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
          {filtered.map(log=>{
            const mc=MODULE_COLORS[log.module]||{bg:'#f3f4f6',text:'#374151'}
            const d=new Date(log.created_at)
            return (
              <div key={log.id} className="flex items-start gap-4 px-5 py-3.5 hover:bg-gray-50/50">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="text-xs font-bold px-2 py-1 rounded-lg" style={{background:mc.bg,color:mc.text}}>{log.module||'System'}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900">{log.action?.replace(/_/g,' ')}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{log.description}</div>
                  {log.performed_by&&<div className="text-xs text-gray-400 mt-0.5">by {log.performed_by}</div>}
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="text-xs text-gray-400">{d.toLocaleDateString('en-PH',{month:'short',day:'numeric'})}</div>
                  <div className="text-xs text-gray-400">{d.toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit'})}</div>
                </div>
              </div>
            )
          })}
          {filtered.length===0&&<div className="py-12 text-center text-sm text-gray-400">No activity logs yet</div>}
        </div>
      </div>
    </div>
  )
}
