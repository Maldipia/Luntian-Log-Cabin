'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AnalyticsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    Promise.all([
      supabase.from('bookings').select('*, rooms(name)').not('status','eq','cancelled'),
      supabase.from('rooms').select('*'),
    ]).then(([{data:b},{data:r}])=>{
      setBookings(b||[]); setRooms(r||[]); setLoading(false)
    })
  },[])

  const now=new Date()
  const thisMonth=bookings.filter(b=>{const d=new Date(b.created_at);return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear()})
  const lastMonth=bookings.filter(b=>{const d=new Date(b.created_at);const lm=new Date(now.getFullYear(),now.getMonth()-1);return d.getMonth()===lm.getMonth()&&d.getFullYear()===lm.getFullYear()})
  const today=bookings.filter(b=>{const d=new Date(b.created_at);return d.toDateString()===now.toDateString()})

  const totalRevenue=bookings.reduce((s,b)=>s+(b.total_revenue||0),0)
  const monthRevenue=thisMonth.reduce((s,b)=>s+(b.total_revenue||0),0)
  const lastMonthRevenue=lastMonth.reduce((s,b)=>s+(b.total_revenue||0),0)
  const todayRevenue=today.reduce((s,b)=>s+(b.total_revenue||0),0)
  const avgBooking=bookings.length?Math.round(totalRevenue/bookings.length):0

  const platforms=[...new Set(bookings.map(b=>b.platform))].map(p=>({
    name:p, count:bookings.filter(b=>b.platform===p).length,
    revenue:bookings.filter(b=>b.platform===p).reduce((s,b)=>s+(b.total_revenue||0),0)
  })).sort((a,b)=>b.revenue-a.revenue)

  const roomStats=rooms.map(r=>({
    name:r.name,
    bookings:bookings.filter(b=>b.room_id===r.id).length,
    revenue:bookings.filter(b=>b.room_id===r.id).reduce((s,b)=>s+(b.total_revenue||0),0),
  })).sort((a,b)=>b.revenue-a.revenue)

  const statuses=(['confirmed','pending','completed','cancelled'] as string[]).map(s=>({
    status:s, count:bookings.filter(b=>b.status===s).length
  }))

  const mRevenue: Record<string,number>={}
  bookings.forEach(b=>{
    const d=new Date(b.check_in)
    const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
    mRevenue[key]=(mRevenue[key]||0)+(b.total_revenue||0)
  })
  const months=Object.entries(mRevenue).sort().slice(-6)
  const maxRev=Math.max(...months.map(([,v])=>v),1)

  const trend=lastMonthRevenue>0?Math.round(((monthRevenue-lastMonthRevenue)/lastMonthRevenue)*100):0

  if(loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-400 text-sm">Loading analytics...</div></div>

  return (
    <div className="max-w-6xl space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {label:'Today Revenue',value:`₱${todayRevenue.toLocaleString()}`,sub:'today',icon:'☀️',bg:'#fef3c7',color:'#92400e'},
          {label:'This Month',value:`₱${monthRevenue.toLocaleString()}`,sub:trend>=0?`↑ ${trend}% vs last month`:`↓ ${Math.abs(trend)}% vs last month`,icon:'📅',bg:'#d8f3dc',color:'#1b4332'},
          {label:'Total Revenue',value:`₱${totalRevenue.toLocaleString()}`,sub:`${bookings.length} bookings`,icon:'💰',bg:'#e0f2fe',color:'#075985'},
          {label:'Avg Booking',value:`₱${avgBooking.toLocaleString()}`,sub:'per booking',icon:'📊',bg:'#ede9fe',color:'#5b21b6'},
        ].map(m=>(
          <div key={m.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3" style={{background:m.bg}}>{m.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{m.value}</div>
            <div className="text-xs font-medium mt-1" style={{color:m.color}}>{m.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-4">Revenue by Month</h3>
          {months.length>0?(
            <div className="flex items-end gap-2 h-40">
              {months.map(([month,rev])=>(
                <div key={month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-xs font-semibold text-gray-600">₱{Math.round(rev/1000)}k</div>
                  <div className="w-full rounded-t-lg transition-all" style={{height:`${(rev/maxRev)*100}%`,background:'linear-gradient(180deg,#52b788,#2d6a4f)',minHeight:'4px'}}/>
                  <div className="text-xs text-gray-400 truncate w-full text-center">{month.slice(5)}</div>
                </div>
              ))}
            </div>
          ):<div className="flex items-center justify-center h-40 text-sm text-gray-400">No data yet</div>}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-4">By Platform</h3>
          <div className="space-y-3">
            {platforms.map(p=>{
              const pct=totalRevenue>0?Math.round((p.revenue/totalRevenue)*100):0
              return (
                <div key={p.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{p.name}</span>
                    <span className="text-gray-500">{p.count} bookings · ₱{p.revenue.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{width:`${pct}%`,background:'linear-gradient(90deg,#52b788,#2d6a4f)'}}/>
                  </div>
                </div>
              )
            })}
            {platforms.length===0&&<div className="text-sm text-gray-400 py-8 text-center">No booking data yet</div>}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-4">Room Performance</h3>
          <div className="space-y-3">
            {roomStats.map((r,i)=>(
              <div key={r.name} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{background:['#2d6a4f','#52b788','#74c69d'][i]||'#95d5b2'}}>
                  {i+1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{r.name}</span>
                    <span className="text-gray-500">₱{r.revenue.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{width:`${totalRevenue>0?Math.round((r.revenue/totalRevenue)*100):0}%`,background:'linear-gradient(90deg,#74c69d,#2d6a4f)'}}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-4">Booking Status</h3>
          <div className="grid grid-cols-2 gap-3">
            {statuses.map(s=>{
              const colors: Record<string,{bg:string,text:string,icon:string}> = {
                confirmed:{bg:'#d8f3dc',text:'#1b4332',icon:'✅'},
                pending:{bg:'#fef3c7',text:'#92400e',icon:'⏳'},
                completed:{bg:'#e0f2fe',text:'#075985',icon:'🎉'},
                cancelled:{bg:'#fee2e2',text:'#991b1b',icon:'❌'},
              }
              const c=colors[s.status]||{bg:'#f3f4f6',text:'#374151',icon:'•'}
              return (
                <div key={s.status} className="rounded-xl p-4 text-center" style={{background:c.bg}}>
                  <div className="text-2xl mb-1">{c.icon}</div>
                  <div className="text-2xl font-bold" style={{color:c.text}}>{s.count}</div>
                  <div className="text-xs font-semibold capitalize" style={{color:c.text}}>{s.status}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
