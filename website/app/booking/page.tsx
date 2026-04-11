'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

function BookingForm() {
  const params = useSearchParams()
  const [rooms, setRooms] = useState<any[]>([])
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [promoMsg, setPromoMsg] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoType, setPromoType] = useState('')
  const [agreement, setAgreement] = useState<string>('')
  const [cms, setCms] = useState<Record<string,string>>({})

  const [form, setForm] = useState({
    room_id: '', check_in: '', check_out: '', num_guests: 1, has_pet: false,
    guest_name: '', guest_email: '', guest_phone: '', special_requests: '',
    promo_code: '', agree: false,
  })

  useEffect(() => {
    Promise.all([
      supabase.from('rooms').select('*').eq('is_active', true).order('sort_order'),
      supabase.from('content').select('key,value'),
    ]).then(([{data:r},{data:c}]) => {
      setRooms(r||[])
      const m: Record<string,string> = {}
      ;(c||[]).forEach((x:any) => { m[x.key] = x.value })
      setCms(m)
      const rid = params.get('room') || (r&&r.length ? r[0].id : '')
      setForm(f => ({ ...f, room_id: rid }))
    })
  }, [])

  // Load agreement when room changes
  useEffect(() => {
    if (!form.room_id) return
    supabase.from('room_rules').select('agreement_text,house_rules,checkin_time,checkout_time')
      .eq('room_id', form.room_id).single()
      .then(({ data }) => {
        if (data) setAgreement(`${data.agreement_text}\n\nHOUSE RULES:\n${data.house_rules}\n\nCheck-in: ${data.checkin_time} · Check-out: ${data.checkout_time}`)
      })
  }, [form.room_id])

  const selectedRoom = rooms.find(r => r.id === form.room_id)

  function calcNights() {
    if (!form.check_in || !form.check_out) return 0
    const diff = new Date(form.check_out).getTime() - new Date(form.check_in).getTime()
    return Math.max(0, Math.round(diff / 86400000))
  }

  function calcPrice() {
    if (!selectedRoom || !form.check_in || !form.check_out) return 0
    const nights = calcNights()
    const ci = new Date(form.check_in)
    let total = 0
    for (let i = 0; i < nights; i++) {
      const d = new Date(ci); d.setDate(d.getDate() + i)
      const dow = d.getDay()
      total += dow === 0 || dow === 6 ? Number(selectedRoom.price_weekend) : Number(selectedRoom.price_weekday)
    }
    if (form.has_pet) total += Number(selectedRoom.fee_pet || 300)
    const extra = Math.max(0, form.num_guests - selectedRoom.capacity)
    if (extra > 0) total += extra * nights * Number(selectedRoom.fee_extra_guest || 500)
    return total
  }

  function calcTotal() {
    const base = calcPrice()
    if (promoType === 'percent') return base - (base * promoDiscount / 100)
    if (promoType === 'fixed') return base - promoDiscount
    return base
  }

  async function checkAvailability() {
    if (!form.room_id || !form.check_in || !form.check_out) return false
    const [{ data: blocks }, { data: bookings }] = await Promise.all([
      supabase.from('availability_blocks').select('id')
        .eq('room_id', form.room_id)
        .lt('start_date', form.check_out)
        .gt('end_date', form.check_in),
      supabase.from('bookings').select('id')
        .eq('room_id', form.room_id)
        .neq('status', 'cancelled')
        .lt('check_in', form.check_out)
        .gt('check_out', form.check_in),
    ])
    return !((blocks && blocks.length > 0) || (bookings && bookings.length > 0))
  }

  async function validatePromo() {
    if (!form.promo_code.trim()) return
    const { data } = await supabase.from('promos').select('*').eq('code', form.promo_code.toUpperCase()).eq('is_active', true).single()
    if (!data) { setPromoMsg('❌ Invalid promo code'); return }
    const now = new Date()
    if (data.valid_until && new Date(data.valid_until) < now) { setPromoMsg('❌ Promo has expired'); return }
    if (data.usage_limit && data.usage_count >= data.usage_limit) { setPromoMsg('❌ Usage limit reached'); return }
    setPromoDiscount(data.value); setPromoType(data.type)
    setPromoMsg(`✅ ${data.type === 'percent' ? data.value + '% off' : '₱' + data.value + ' off'} applied!`)
  }

  async function handleStep1() {
    setError('')
    if (!form.room_id || !form.check_in || !form.check_out) { setError('Please select a room and dates.'); return }
    if (calcNights() < 1) { setError('Check-out must be after check-in.'); return }
    const today = new Date().toISOString().split('T')[0]
    if (form.check_in < today) { setError('Check-in date cannot be in the past.'); return }
    setLoading(true)
    const avail = await checkAvailability()
    setLoading(false)
    if (!avail) { setError('Sorry, this room is not available for the selected dates. Please choose different dates.'); return }
    setStep(2)
  }

  async function handleStep2() {
    setError('')
    if (!form.guest_name.trim()) { setError('Please enter your full name.'); return }
    if (!form.guest_email.trim() || !form.guest_email.includes('@')) { setError('Please enter a valid email address.'); return }
    if (!form.guest_phone.trim()) { setError('Please enter your phone number.'); return }
    setStep(3)
  }

  async function handleSubmit() {
    if (!form.agree) { setError('Please accept the house rules and agreement to proceed.'); return }
    setLoading(true); setError('')
    try {
      const ref = 'LNT-' + Date.now().toString().slice(-6) + Math.random().toString(36).slice(2,5).toUpperCase()
      const total = calcTotal()

      const { data: booking, error: bErr } = await supabase.from('bookings').insert([{
        booking_ref: ref,
        room_id: form.room_id,
        guest_name: form.guest_name.trim(),
        guest_email: form.guest_email.trim(),
        guest_phone: form.guest_phone.trim(),
        platform: 'Website',
        check_in: form.check_in,
        check_out: form.check_out,
        num_guests: form.num_guests,
        has_pet: form.has_pet,
        base_price: calcPrice(),
        total_revenue: total,
        status: 'pending',
        special_requests: form.special_requests.trim(),
      }]).select().single()

      if (bErr) throw bErr

      // Create security deposit record
      await supabase.from('security_deposits').insert([{
        booking_id: booking.id,
        amount: 1000,
        currency: 'PHP',
        status: 'pending',
      }])

      // Update promo usage
      if (form.promo_code.trim()) {
        await supabase.rpc('increment_promo_usage', { promo_code: form.promo_code.toUpperCase() })
      }

      window.location.href = `/booking/confirmation?ref=${ref}`
    } catch (e: any) {
      setError('Booking failed: ' + (e.message || 'Please try again.'))
    }
    setLoading(false)
  }

  const nights = calcNights()
  const basePrice = calcPrice()
  const total = calcTotal()

  const ROOM_IMAGES: Record<string, string> = {
    'Sunrise Room': 'https://www.luntian.net/SUNRISE3.0.jpg',
    'Leaf Room': 'https://www.luntian.net/LEAF3.0.jpg',
    '2BR Suite': 'https://www.luntian.net/YANI.jpg',
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--cream)' }}>
      <Navbar />
      <div style={{ paddingTop:80 }}>
        {/* Header */}
        <div style={{ background:'linear-gradient(135deg,#1b4332,#2d6a4f)', padding:'48px 24px 40px', textAlign:'center', color:'white' }}>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(1.8rem,4vw,2.6rem)', marginBottom:8 }}>Book Your Stay</h1>
          <p style={{ opacity:0.8, fontSize:'0.95rem' }}>Direct booking · Best rates guaranteed · Instant confirmation</p>
          {/* Steps */}
          <div style={{ display:'flex', justifyContent:'center', gap:0, marginTop:32 }}>
            {[['1','Dates & Room'],['2','Your Details'],['3','Review & Pay']].map(([num,label], i) => (
              <div key={num} style={{ display:'flex', alignItems:'center' }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.9rem',
                    background: step > i+1 ? '#52b788' : step === i+1 ? 'white' : 'rgba(255,255,255,0.2)',
                    color: step > i+1 ? 'white' : step === i+1 ? '#1b4332' : 'rgba(255,255,255,0.6)',
                  }}>{step > i+1 ? '✓' : num}</div>
                  <span style={{ fontSize:'0.72rem', opacity: step === i+1 ? 1 : 0.6, whiteSpace:'nowrap' }}>{label}</span>
                </div>
                {i < 2 && <div style={{ width:60, height:2, background:'rgba(255,255,255,0.25)', margin:'0 4px', marginBottom:20 }}/>}
              </div>
            ))}
          </div>
        </div>

        <div className="container" style={{ paddingTop:40, paddingBottom:60 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:28, alignItems:'start' }}>
            {/* Main form */}
            <div style={{ background:'white', borderRadius:20, padding:36, boxShadow:'0 4px 24px rgba(0,0,0,0.07)' }}>

              {/* STEP 1 */}
              {step === 1 && (
                <div>
                  <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.5rem', color:'#1a1d23', marginBottom:28 }}>Select Room & Dates</h2>
                  <div style={{ marginBottom:24 }}>
                    <label style={{ display:'block', fontWeight:600, marginBottom:10, fontSize:'0.9rem', color:'#444' }}>Choose Accommodation</label>
                    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                      {rooms.map(room => {
                        const img = room.images?.[0] || ROOM_IMAGES[room.name] || ''
                        const isWeekend = [5,6].includes(new Date().getDay())
                        const price = isWeekend ? room.price_weekend : room.price_weekday
                        return (
                          <label key={room.id} style={{ display:'flex', alignItems:'center', gap:16, padding:16, border:`2px solid ${form.room_id===room.id ? '#2d6a4f' : '#f0f0f0'}`, borderRadius:14, cursor:'pointer', background: form.room_id===room.id ? '#f0faf2' : 'white', transition:'all 0.2s' }}>
                            <input type="radio" name="room" value={room.id} checked={form.room_id===room.id} onChange={e=>setForm({...form,room_id:e.target.value})} style={{ display:'none' }}/>
                            {img && <img src={img} alt={room.name} style={{ width:72, height:56, objectFit:'cover', borderRadius:10, flexShrink:0 }}/>}
                            <div style={{ flex:1 }}>
                              <div style={{ fontWeight:700, color:'#1a1d23', fontSize:'0.95rem' }}>{room.name}</div>
                              <div style={{ color:'#888', fontSize:'0.78rem' }}>🛏 {room.bedroom_count}BR · 👥 Up to {room.max_capacity} · {room.bed_type}</div>
                            </div>
                            <div style={{ textAlign:'right', flexShrink:0 }}>
                              <div style={{ fontWeight:700, color:'var(--green)', fontSize:'1.05rem' }}>₱{Number(price).toLocaleString()}</div>
                              <div style={{ fontSize:'0.72rem', color:'#aaa' }}>/night</div>
                            </div>
                            {form.room_id===room.id && <div style={{ width:20, height:20, background:'#2d6a4f', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'0.7rem', flexShrink:0 }}>✓</div>}
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
                    <div>
                      <label style={{ display:'block', fontWeight:600, marginBottom:8, fontSize:'0.88rem', color:'#444' }}>Check-in Date</label>
                      <input type="date" value={form.check_in} min={new Date().toISOString().split('T')[0]}
                        onChange={e=>setForm({...form,check_in:e.target.value})} className="inp"/>
                    </div>
                    <div>
                      <label style={{ display:'block', fontWeight:600, marginBottom:8, fontSize:'0.88rem', color:'#444' }}>Check-out Date</label>
                      <input type="date" value={form.check_out} min={form.check_in||new Date().toISOString().split('T')[0]}
                        onChange={e=>setForm({...form,check_out:e.target.value})} className="inp"/>
                    </div>
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
                    <div>
                      <label style={{ display:'block', fontWeight:600, marginBottom:8, fontSize:'0.88rem', color:'#444' }}>Number of Guests</label>
                      <select value={form.num_guests} onChange={e=>setForm({...form,num_guests:parseInt(e.target.value)})} className="inp">
                        {Array.from({length: selectedRoom?.max_capacity || 6}, (_,i) => <option key={i+1} value={i+1}>{i+1} Guest{i>0?'s':''}</option>)}
                      </select>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', paddingTop:28 }}>
                      <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', fontWeight:500, fontSize:'0.9rem' }}>
                        <input type="checkbox" checked={form.has_pet} onChange={e=>setForm({...form,has_pet:e.target.checked})}
                          style={{ width:18, height:18, accentColor:'#2d6a4f' }}/>
                        🐾 Bringing a pet?
                        <span style={{ fontSize:'0.75rem', color:'#888' }}>(+₱300)</span>
                      </label>
                    </div>
                  </div>

                  {error && <div style={{ background:'#fee2e2', color:'#991b1b', padding:'12px 16px', borderRadius:10, marginBottom:16, fontSize:'0.88rem' }}>⚠️ {error}</div>}
                  <button onClick={handleStep1} disabled={loading} className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:'14px', fontSize:'1rem' }}>
                    {loading ? '⏳ Checking availability...' : 'Continue → Guest Details'}
                  </button>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div>
                  <button onClick={()=>setStep(1)} style={{ background:'none', border:'none', color:'#888', cursor:'pointer', fontSize:'0.85rem', marginBottom:20, display:'flex', alignItems:'center', gap:4 }}>
                    ← Back
                  </button>
                  <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.5rem', color:'#1a1d23', marginBottom:28 }}>Guest Information</h2>
                  <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
                    <div>
                      <label style={{ display:'block', fontWeight:600, marginBottom:8, fontSize:'0.88rem', color:'#444' }}>Full Name *</label>
                      <input value={form.guest_name} onChange={e=>setForm({...form,guest_name:e.target.value})} placeholder="As it appears on your valid ID" className="inp"/>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                      <div>
                        <label style={{ display:'block', fontWeight:600, marginBottom:8, fontSize:'0.88rem', color:'#444' }}>Email Address *</label>
                        <input type="email" value={form.guest_email} onChange={e=>setForm({...form,guest_email:e.target.value})} placeholder="you@email.com" className="inp"/>
                      </div>
                      <div>
                        <label style={{ display:'block', fontWeight:600, marginBottom:8, fontSize:'0.88rem', color:'#444' }}>Phone Number *</label>
                        <input value={form.guest_phone} onChange={e=>setForm({...form,guest_phone:e.target.value})} placeholder="09XX XXX XXXX" className="inp"/>
                      </div>
                    </div>
                    <div>
                      <label style={{ display:'block', fontWeight:600, marginBottom:8, fontSize:'0.88rem', color:'#444' }}>Special Requests</label>
                      <textarea value={form.special_requests} onChange={e=>setForm({...form,special_requests:e.target.value})}
                        placeholder="Dietary restrictions, accessibility needs, celebrations..." rows={3}
                        style={{ resize:'none' }} className="inp"/>
                    </div>
                    <div>
                      <label style={{ display:'block', fontWeight:600, marginBottom:8, fontSize:'0.88rem', color:'#444' }}>Promo Code</label>
                      <div style={{ display:'flex', gap:10 }}>
                        <input value={form.promo_code} onChange={e=>{setForm({...form,promo_code:e.target.value.toUpperCase()});setPromoMsg('')}}
                          placeholder="Enter promo code" className="inp" style={{ flex:1 }}/>
                        <button onClick={validatePromo} style={{ padding:'12px 18px', background:'#f0faf2', border:'1.5px solid #2d6a4f', color:'#2d6a4f', borderRadius:12, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', fontSize:'0.85rem' }}>
                          Apply
                        </button>
                      </div>
                      {promoMsg && <p style={{ marginTop:8, fontSize:'0.82rem', color: promoMsg.startsWith('✅') ? '#059669' : '#dc2626' }}>{promoMsg}</p>}
                    </div>
                  </div>
                  {error && <div style={{ background:'#fee2e2', color:'#991b1b', padding:'12px 16px', borderRadius:10, marginTop:16, fontSize:'0.88rem' }}>⚠️ {error}</div>}
                  <button onClick={handleStep2} className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:'14px', fontSize:'1rem', marginTop:24 }}>
                    Continue → Review Booking
                  </button>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div>
                  <button onClick={()=>setStep(2)} style={{ background:'none', border:'none', color:'#888', cursor:'pointer', fontSize:'0.85rem', marginBottom:20, display:'flex', alignItems:'center', gap:4 }}>
                    ← Back
                  </button>
                  <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.5rem', color:'#1a1d23', marginBottom:24 }}>Review & Confirm</h2>
                  <div style={{ background:'#f9fafb', borderRadius:14, padding:20, marginBottom:24 }}>
                    <div style={{ fontWeight:600, color:'#444', marginBottom:12, fontSize:'0.88rem' }}>BOOKING SUMMARY</div>
                    {[
                      ['Guest', form.guest_name],
                      ['Email', form.guest_email],
                      ['Phone', form.guest_phone],
                      ['Room', selectedRoom?.name],
                      ['Check-in', new Date(form.check_in).toLocaleDateString('en-PH',{weekday:'short',month:'long',day:'numeric',year:'numeric'})],
                      ['Check-out', new Date(form.check_out).toLocaleDateString('en-PH',{weekday:'short',month:'long',day:'numeric',year:'numeric'})],
                      ['Nights', nights],
                      ['Guests', form.num_guests + (form.has_pet ? ' + pet' : '')],
                    ].map(([k,v]) => (
                      <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #f0f0f0', fontSize:'0.88rem' }}>
                        <span style={{ color:'#888' }}>{k}</span>
                        <span style={{ fontWeight:500, color:'#1a1d23' }}>{v}</span>
                      </div>
                    ))}
                    <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', marginTop:4, fontSize:'0.88rem' }}>
                      <span style={{ color:'#888' }}>Base Price</span>
                      <span>₱{basePrice.toLocaleString()}</span>
                    </div>
                    {promoDiscount > 0 && (
                      <div style={{ display:'flex', justifyContent:'space-between', padding:'4px 0', color:'#059669', fontSize:'0.88rem' }}>
                        <span>Promo Discount</span>
                        <span>- ₱{(basePrice - total).toLocaleString()}</span>
                      </div>
                    )}
                    <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 0', marginTop:8, borderTop:'2px solid #e5e7eb', fontWeight:700, fontSize:'1.05rem', color:'var(--green)' }}>
                      <span>Total</span>
                      <span>₱{total.toLocaleString()}</span>
                    </div>
                    <div style={{ background:'#fef3c7', borderRadius:10, padding:'10px 14px', marginTop:8, fontSize:'0.8rem', color:'#92400e' }}>
                      💰 + ₱1,000 security deposit required at check-in (refundable)
                    </div>
                  </div>

                  {/* Agreement */}
                  {agreement && (
                    <div style={{ marginBottom:24 }}>
                      <div style={{ fontWeight:600, color:'#444', marginBottom:10, fontSize:'0.88rem' }}>HOUSE RULES & AGREEMENT</div>
                      <div style={{ background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:12, padding:16, maxHeight:180, overflowY:'auto', fontSize:'0.8rem', color:'#555', lineHeight:1.7, whiteSpace:'pre-line' }}>
                        {agreement}
                      </div>
                    </div>
                  )}

                  <label style={{ display:'flex', alignItems:'flex-start', gap:12, cursor:'pointer', marginBottom:24, padding:'14px', background: form.agree ? '#f0faf2' : '#f9fafb', borderRadius:12, border:`1.5px solid ${form.agree ? '#2d6a4f' : '#e5e7eb'}`, transition:'all 0.2s' }}>
                    <input type="checkbox" checked={form.agree} onChange={e=>setForm({...form,agree:e.target.checked})}
                      style={{ width:18, height:18, accentColor:'#2d6a4f', marginTop:1, flexShrink:0 }}/>
                    <span style={{ fontSize:'0.88rem', color:'#444', lineHeight:1.5 }}>
                      I have read and agree to the <strong>house rules</strong>, <strong>cancellation policy</strong>, and <strong>security deposit terms</strong> (₱1,000 refundable). I confirm all booking details are correct.
                    </span>
                  </label>

                  {error && <div style={{ background:'#fee2e2', color:'#991b1b', padding:'12px 16px', borderRadius:10, marginBottom:16, fontSize:'0.88rem' }}>⚠️ {error}</div>}
                  <button onClick={handleSubmit} disabled={loading || !form.agree} className="btn-primary"
                    style={{ width:'100%', justifyContent:'center', padding:'16px', fontSize:'1.05rem', opacity: (!form.agree || loading) ? 0.6 : 1 }}>
                    {loading ? '⏳ Confirming booking...' : '✅ Confirm Booking'}
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar summary */}
            <div style={{ position:'sticky', top:100 }}>
              {selectedRoom && (
                <div style={{ background:'white', borderRadius:20, overflow:'hidden', boxShadow:'0 4px 24px rgba(0,0,0,0.08)', marginBottom:16 }}>
                  <img src={selectedRoom.images?.[0] || ROOM_IMAGES[selectedRoom.name] || 'https://www.luntian.net/sala.jpg'}
                    alt={selectedRoom.name} style={{ width:'100%', height:160, objectFit:'cover' }}/>
                  <div style={{ padding:20 }}>
                    <div style={{ fontWeight:700, fontSize:'1.1rem', marginBottom:4, fontFamily:"'Playfair Display',serif", color:'#1a1d23' }}>{selectedRoom.name}</div>
                    <div style={{ color:'#888', fontSize:'0.8rem', marginBottom:16 }}>🛏 {selectedRoom.bedroom_count}BR · 👥 Up to {selectedRoom.max_capacity} · {selectedRoom.bed_type}</div>
                    {nights > 0 && (
                      <div style={{ borderTop:'1px solid #f0f0f0', paddingTop:14 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:'0.85rem' }}>
                          <span style={{ color:'#888' }}>Price × {nights} night{nights>1?'s':''}</span>
                          <span>₱{basePrice.toLocaleString()}</span>
                        </div>
                        {promoDiscount > 0 && (
                          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:'0.85rem', color:'#059669' }}>
                            <span>Promo discount</span>
                            <span>- ₱{(basePrice-total).toLocaleString()}</span>
                          </div>
                        )}
                        <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700, color:'var(--green)', fontSize:'1.1rem', borderTop:'1px solid #f0f0f0', paddingTop:10, marginTop:4 }}>
                          <span>Total</span>
                          <span>₱{total.toLocaleString()}</span>
                        </div>
                        <div style={{ fontSize:'0.75rem', color:'#999', marginTop:6 }}>+ ₱1,000 deposit at check-in</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div style={{ background:'#f0faf2', borderRadius:16, padding:18, fontSize:'0.82rem', color:'#2d6a4f' }}>
                <div style={{ fontWeight:700, marginBottom:10 }}>📋 Booking Policy</div>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {['✓ Free cancellation 7 days before check-in','✓ ₱1,000 security deposit (refundable)','✓ Check-in: 2:00 PM','✓ Check-out: 11:00 AM','✓ Confirmation sent to email'].map(p => (
                    <div key={p} style={{ color:'#2d6a4f', lineHeight:1.5 }}>{p}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer cms={cms} />
      <style>{`@media(max-width:900px){.container>div{grid-template-columns:1fr!important}}`}</style>
    </div>
  )
}

export default function BookingPage() {
  return <Suspense fallback={<div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontSize:'1rem',color:'#888'}}>Loading...</div>}>
    <BookingForm />
  </Suspense>
}
