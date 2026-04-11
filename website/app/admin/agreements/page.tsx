'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const DEFAULT_AGREEMENT = `By confirming this booking, I agree to all house rules and policies of Luntian Log Cabin.

I understand that:
1. A security deposit of ₱1,000 is required and refundable upon checkout pending inspection.
2. Check-in is at 2:00 PM and check-out is at 10:00 AM.
3. Any damages to the property will be charged against the security deposit.
4. Violations of house rules may result in early termination of stay without refund.

I have read and agree to all rules listed above.`

const DEFAULT_RULES = `• No parties or events without prior written approval
• No smoking inside the cabin — designated smoking area outside
• Strictly no bringing of additional guests beyond booked capacity
• No loud music or noise after 10:00 PM
• Pets must be declared prior to check-in
• Guests are responsible for keeping the property clean
• Parking available on designated area only
• Lost keys or access codes will incur a ₱500 replacement fee
• Check-in: 2:00 PM | Check-out: 10:00 AM`

export default function AgreementsPage() {
  const [rooms, setRooms] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [rules, setRules] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(()=>{
    supabase.from('rooms').select('*').order('sort_order').then(({data})=>{
      setRooms(data||[])
      if(data&&data.length) loadRoom(data[0])
    })
  },[])

  async function loadRoom(room:any) {
    setSelected(room)
    const {data} = await supabase.from('room_rules').select('*').eq('room_id',room.id).single()
    if(data) {
      setRules(data)
    } else {
      setRules({room_id:room.id,agreement_text:DEFAULT_AGREEMENT,house_rules:DEFAULT_RULES,allow_pets:false,allow_parking:true,allow_party:false,allow_smoking:false,checkin_time:'14:00',checkout_time:'10:00',max_guests:room.capacity||2,id:null})
    }
  }

  function updateRule(field:string, value:any) {
    setRules((r:any)=>({...r,[field]:value}))
  }

  async function save() {
    if(!rules) return
    setSaving(true)
    if(rules.id) {
      await supabase.from('room_rules').update({...rules,updated_at:new Date().toISOString()}).eq('id',rules.id)
    } else {
      const {data}=await supabase.from('room_rules').insert([rules]).select().single()
      if(data) setRules(data)
    }
    await supabase.from('system_logs').insert([{action:'UPDATE_AGREEMENT',module:'Bookings',description:`Updated rules/agreement for ${selected?.name}`}])
    setSaving(false); setSaved(true); setTimeout(()=>setSaved(false),2500)
  }

  const ROOM_ICONS: Record<string,string> = {'Sunrise Room':'🌅','Leaf Room':'🍃','2BR Suite':'🏡'}

  return (
    <div className="max-w-6xl">
      <div className="flex gap-5">
        <div className="w-44 flex-shrink-0 space-y-2">
          {rooms.map(r=>(
            <button key={r.id} onClick={()=>loadRoom(r)}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all ${selected?.id===r.id?'border-green-300 shadow-sm':'border-gray-100 bg-white'}`}
              style={selected?.id===r.id?{background:'linear-gradient(135deg,#f0faf2,#fff)',borderColor:'#52b788'}:{}}>
              <div className="text-xl mb-1.5">{ROOM_ICONS[r.name]||'🏠'}</div>
              <div className="font-semibold text-sm text-gray-900">{r.name}</div>
            </button>
          ))}
        </div>

        {selected&&rules&&(
          <div className="flex-1 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">⏰ Check-in / Check-out Times</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="text-xs font-bold text-gray-500 mb-1.5 block">Check-in Time</label>
                  <input type="time" value={rules.checkin_time||'14:00'} onChange={e=>updateRule('checkin_time',e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 bg-gray-50 font-semibold"/></div>
                <div><label className="text-xs font-bold text-gray-500 mb-1.5 block">Check-out Time</label>
                  <input type="time" value={rules.checkout_time||'10:00'} onChange={e=>updateRule('checkout_time',e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 bg-gray-50 font-semibold"/></div>
                <div><label className="text-xs font-bold text-gray-500 mb-1.5 block">Max Guests</label>
                  <input type="number" value={rules.max_guests||2} onChange={e=>updateRule('max_guests',Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-400 bg-gray-50"/></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-4">📋 Policies</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {key:'allow_pets',label:'🐾 Pets Allowed',desc:'Guests can bring pets'},
                  {key:'allow_parking',label:'🚗 Parking Available',desc:'Parking area accessible'},
                  {key:'allow_party',label:'🎉 Events / Parties',desc:'Guests can host events'},
                  {key:'allow_smoking',label:'🚬 Smoking Inside',desc:'Smoking allowed inside'},
                ].map(p=>(
                  <div key={p.key} className={`flex items-center justify-between p-4 rounded-xl border ${rules[p.key]?'border-green-200':'border-gray-100'}`}
                    style={{background:rules[p.key]?'#f0faf2':'#fafafa'}}>
                    <div>
                      <div className="font-semibold text-sm text-gray-800">{p.label}</div>
                      <div className="text-xs text-gray-400">{p.desc}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-3">
                      <input type="checkbox" checked={rules[p.key]||false} onChange={e=>updateRule(p.key,e.target.checked)} className="sr-only peer"/>
                      <div className="w-10 h-6 bg-gray-200 peer-checked:bg-green-500 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4"/>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-1">📜 House Rules</h3>
              <p className="text-xs text-gray-400 mb-3">Shown to guests before booking. Be specific and clear.</p>
              <textarea value={rules.house_rules||''} onChange={e=>updateRule('house_rules',e.target.value)} rows={10}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 bg-gray-50 resize-none"/>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-1">📝 Guest Agreement Text</h3>
              <p className="text-xs text-gray-400 mb-3">This is the legal agreement guests must accept before confirming their booking. Includes security deposit terms.</p>
              <div className="mb-3 p-3 rounded-xl border border-yellow-200 bg-yellow-50 flex items-start gap-2">
                <span className="text-lg flex-shrink-0">⚠️</span>
                <div className="text-xs text-yellow-800">
                  <strong>Security Deposit: ₱1,000 (PHP)</strong> — This is required from all guests before check-in and is fully refundable after inspection upon checkout. Make sure this is clearly stated in your agreement.
                </div>
              </div>
              <textarea value={rules.agreement_text||''} onChange={e=>updateRule('agreement_text',e.target.value)} rows={12}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 bg-gray-50 resize-none"/>
            </div>

            <div className="flex justify-end">
              <button onClick={save} disabled={saving}
                className="px-6 py-3 rounded-xl font-bold text-white disabled:opacity-60"
                style={{background:saved?'#059669':'linear-gradient(135deg,#2d6a4f,#40916c)'}}>
                {saving?'Saving...':saved?'✓ Saved!':'Save Agreement & Rules'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
