'use client'
import { useEffect, useState, Suspense, useRef } from 'react'
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
  const [agreement, setAgreement] = useState('')
  const [cms, setCms] = useState<Record<string,string>>({})
  const [payments, setPayments] = useState<any[]>([])
  const [selectedPayment, setSelectedPayment] = useState<string>('')

  // File upload refs
  const paymentRef = useRef<HTMLInputElement>(null)
  const idFrontRef = useRef<HTMLInputElement>(null)
  const idBackRef = useRef<HTMLInputElement>(null)

  // Upload state
  const [uploads, setUploads] = useState<{payment?:File, idFront?:File, idBack?:File}>({})
  const [uploadPreviews, setUploadPreviews] = useState<{payment?:string, idFront?:string, idBack?:string}>({})
  const [uploading, setUploading] = useState(false)
  const [bookingId, setBookingId] = useState<string>('')

  const [form, setForm] = useState({
    room_id:'', check_in:'', check_out:'', num_guests:1, has_pet:false,
    guest_name:'', guest_email:'', guest_phone:'', special_requests:'',
    promo_code:'', agree:false,
  })

  useEffect(() => {
    Promise.all([
      supabase.from('rooms').select('*').eq('is_active',true).order('sort_order'),
      supabase.from('content').select('key,value'),
      supabase.from('payment_settings').select('*').eq('is_active',true).eq('show_on_booking',true).order('sort_order'),
    ]).then(([{data:r},{data:c},{data:p}]) => {
      setRooms(r||[])
      const m:Record<string,string>={}; (c||[]).forEach((x:any)=>{m[x.key]=x.value}); setCms(m)
      setPayments(p||[])
      if(p?.length) setSelectedPayment(p[0].id)
      const rid = params.get('room')||(r?.length?r[0].id:'')
      setForm(f=>({...f,room_id:rid}))
    })
  },[])

  useEffect(()=>{
    if(!form.room_id) return
    supabase.from('room_rules').select('agreement_text,house_rules,checkin_time,checkout_time').eq('room_id',form.room_id).single()
      .then(({data})=>{ if(data) setAgreement(`${data.agreement_text}\n\nHOUSE RULES:\n${data.house_rules}\n\nCheck-in: ${data.checkin_time} · Check-out: ${data.checkout_time}`) })
  },[form.room_id])

  const selectedRoom = rooms.find(r=>r.id===form.room_id)
  const selectedPaymentMethod = payments.find(p=>p.id===selectedPayment)

  function calcNights() {
    if(!form.check_in||!form.check_out) return 0
    return Math.max(0,Math.round((new Date(form.check_out).getTime()-new Date(form.check_in).getTime())/86400000))
  }

  function calcPrice() {
    if(!selectedRoom||!form.check_in||!form.check_out) return 0
    const nights=calcNights(); const ci=new Date(form.check_in); let total=0
    for(let i=0;i<nights;i++){
      const d=new Date(ci); d.setDate(d.getDate()+i); const dow=d.getDay()
      total+=dow===0||dow===6?Number(selectedRoom.price_weekend):Number(selectedRoom.price_weekday)
    }
    if(form.has_pet) total+=Number(selectedRoom.fee_pet||300)
    const extra=Math.max(0,form.num_guests-selectedRoom.capacity)
    if(extra>0) total+=extra*nights*Number(selectedRoom.fee_extra_guest||500)
    return total
  }

  function calcTotal() {
    const base=calcPrice()
    if(promoType==='percent') return base-(base*promoDiscount/100)
    if(promoType==='fixed') return base-promoDiscount
    return base
  }

  async function checkAvailability() {
    const [{data:blocks},{data:bookings}] = await Promise.all([
      supabase.from('availability_blocks').select('id').eq('room_id',form.room_id).lt('start_date',form.check_out).gt('end_date',form.check_in),
      supabase.from('bookings').select('id').eq('room_id',form.room_id).neq('status','cancelled').lt('check_in',form.check_out).gt('check_out',form.check_in),
    ])
    return !((blocks&&blocks.length>0)||(bookings&&bookings.length>0))
  }

  async function validatePromo() {
    if(!form.promo_code.trim()) return
    const {data}=await supabase.from('promos').select('*').eq('code',form.promo_code.toUpperCase()).eq('is_active',true).single()
    if(!data){setPromoMsg('❌ Invalid promo code');return}
    if(data.valid_until&&new Date(data.valid_until)<new Date()){setPromoMsg('❌ Promo expired');return}
    if(data.usage_limit&&data.usage_count>=data.usage_limit){setPromoMsg('❌ Usage limit reached');return}
    setPromoDiscount(data.value); setPromoType(data.type)
    setPromoMsg(`✅ ${data.type==='percent'?data.value+'% off':'₱'+Number(data.value).toLocaleString()+' off'} applied!`)
  }

  function handleFileSelect(type:'payment'|'idFront'|'idBack', file:File) {
    setUploads(u=>({...u,[type]:file}))
    const url = URL.createObjectURL(file)
    setUploadPreviews(p=>({...p,[type]:url}))
  }

  async function uploadFiles(bid:string) {
    const results:string[] = []
    for(const [type, file] of Object.entries(uploads) as [string,File][]) {
      if(!file) continue
      const ext = file.name.split('.').pop()
      const path = `${bid}-${type}-${Date.now()}.${ext}`
      const {data,error} = await supabase.storage.from('luntian-uploads').upload(path,file,{upsert:true})
      if(!error&&data){
        const {data:url}=supabase.storage.from('luntian-uploads').getPublicUrl(data.path)
        const proofType = type==='payment'?'payment_screenshot':type==='idFront'?'valid_id_front':'valid_id_back'
        await supabase.from('payment_proofs').insert([{
          booking_id:bid, type:proofType, file_url:url.publicUrl,
          file_name:file.name, status:'pending'
        }])
        results.push(proofType)
      }
    }
    return results
  }

  async function handleStep1() {
    setError('')
    if(!form.room_id||!form.check_in||!form.check_out){setError('Please select a room and dates.');return}
    if(calcNights()<1){setError('Check-out must be after check-in.');return}
    if(form.check_in<new Date().toISOString().split('T')[0]){setError('Check-in date cannot be in the past.');return}
    setLoading(true)
    const avail=await checkAvailability()
    setLoading(false)
    if(!avail){setError('Sorry, this room is not available for selected dates. Please choose different dates.');return}
    setStep(2)
  }

  async function handleStep2() {
    setError('')
    if(!form.guest_name.trim()){setError('Please enter your full name.');return}
    if(!form.guest_email.trim()||!form.guest_email.includes('@')){setError('Please enter a valid email.');return}
    if(!form.guest_phone.trim()){setError('Please enter your phone number.');return}
    setStep(3)
  }

  async function handleSubmit() {
    if(!form.agree){setError('Please accept the house rules and agreement.');return}
    if(!uploads.payment){setError('Please upload your payment screenshot.');return}
    if(!uploads.idFront){setError('Please upload your valid ID (front).');return}
    setLoading(true); setError(''); setUploading(true)
    try {
      const ref='LNT-'+Date.now().toString().slice(-6)+Math.random().toString(36).slice(2,5).toUpperCase()
      const total=calcTotal()
      const {data:booking,error:bErr}=await supabase.from('bookings').insert([{
        booking_ref:ref, room_id:form.room_id, guest_name:form.guest_name.trim(),
        guest_email:form.guest_email.trim(), guest_phone:form.guest_phone.trim(),
        platform:'Website', check_in:form.check_in, check_out:form.check_out,
        num_guests:form.num_guests, has_pet:form.has_pet, base_price:calcPrice(),
        total_revenue:total, status:'pending', special_requests:form.special_requests.trim(),
      }]).select().single()
      if(bErr) throw bErr

      await supabase.from('security_deposits').insert([{booking_id:booking.id,amount:1000,currency:'PHP',status:'pending'}])
      await uploadFiles(booking.id)
      setUploading(false)
      window.location.href=`/booking/confirmation?ref=${ref}`
    } catch(e:any) {
      setError('Booking failed: '+(e.message||'Please try again.'))
    }
    setLoading(false); setUploading(false)
  }

  const nights=calcNights(), basePrice=calcPrice(), total=calcTotal()
  const ROOM_IMAGES:Record<string,string>={'Sunrise Room':'https://www.luntian.net/SUNRISE3.0.jpg','Leaf Room':'https://www.luntian.net/LEAF3.0.jpg','2BR Suite':'https://www.luntian.net/YANI.jpg'}

  const UploadBox = ({label,type,icon,required=false}:{label:string,type:'payment'|'idFront'|'idBack',icon:string,required?:boolean}) => {
    const preview = uploadPreviews[type]
    const file = uploads[type]
    const ref = type==='payment'?paymentRef:type==='idFront'?idFrontRef:idBackRef
    return (
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {icon} {label} {required&&<span className="text-red-500">*</span>}
        </label>
        <input ref={ref} type="file" accept="image/*,application/pdf" className="hidden"
          onChange={e=>e.target.files?.[0]&&handleFileSelect(type,e.target.files[0])}/>
        <div onClick={()=>ref.current?.click()}
          className="relative border-2 border-dashed rounded-xl cursor-pointer transition-all overflow-hidden"
          style={{borderColor:preview?'#2d6a4f':'#d1d5db', background:preview?'#f0faf2':'#fafafa', minHeight:120, display:'flex',alignItems:'center',justifyContent:'center'}}>
          {preview ? (
            <>
              <img src={preview} alt="preview" style={{maxHeight:150,maxWidth:'100%',objectFit:'contain',padding:8}}/>
              <div style={{position:'absolute',bottom:8,left:0,right:0,textAlign:'center'}}>
                <span style={{background:'rgba(45,106,79,0.9)',color:'white',padding:'3px 12px',borderRadius:100,fontSize:'0.75rem',fontWeight:600}}>
                  ✓ {file?.name}
                </span>
              </div>
              <button onClick={e=>{e.stopPropagation();setUploads(u=>({...u,[type]:undefined}));setUploadPreviews(p=>({...p,[type]:undefined}))}}
                style={{position:'absolute',top:8,right:8,width:24,height:24,background:'#dc2626',color:'white',borderRadius:'50%',border:'none',cursor:'pointer',fontSize:'1rem',display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1}}>
                ×
              </button>
            </>
          ) : (
            <div style={{textAlign:'center',padding:16}}>
              <div style={{fontSize:'1.8rem',marginBottom:6}}>{icon}</div>
              <div style={{fontSize:'0.8rem',color:'#6b7280',fontWeight:500}}>Click to upload</div>
              <div style={{fontSize:'0.72rem',color:'#9ca3af'}}>JPG, PNG, PDF</div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh',background:'var(--cream)'}}>
      <Navbar/>
      <div style={{paddingTop:80}}>
        <div style={{background:'linear-gradient(135deg,#1b4332,#2d6a4f)',padding:'48px 24px 40px',textAlign:'center',color:'white'}}>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(1.8rem,4vw,2.6rem)',marginBottom:8}}>Book Your Stay</h1>
          <p style={{opacity:0.8,fontSize:'0.95rem'}}>Direct booking · Best rates guaranteed · Instant confirmation</p>
          <div style={{display:'flex',justifyContent:'center',gap:0,marginTop:32}}>
            {[['1','Dates & Room'],['2','Your Details'],['3','Payment & ID'],['4','Confirm']].map(([num,label],i)=>(
              <div key={num} style={{display:'flex',alignItems:'center'}}>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
                  <div style={{width:36,height:36,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'0.9rem',
                    background:step>i+1?'#52b788':step===i+1?'white':'rgba(255,255,255,0.2)',
                    color:step>i+1?'white':step===i+1?'#1b4332':'rgba(255,255,255,0.6)'}}>
                    {step>i+1?'✓':num}
                  </div>
                  <span style={{fontSize:'0.7rem',opacity:step===i+1?1:0.6,whiteSpace:'nowrap'}}>{label}</span>
                </div>
                {i<3&&<div style={{width:40,height:2,background:'rgba(255,255,255,0.25)',margin:'0 4px',marginBottom:20}}/>}
              </div>
            ))}
          </div>
        </div>

        <div className="container" style={{paddingTop:40,paddingBottom:60}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 360px',gap:28,alignItems:'start'}}>
            <div style={{background:'white',borderRadius:20,padding:36,boxShadow:'0 4px 24px rgba(0,0,0,0.07)'}}>

              {/* STEP 1 */}
              {step===1&&(
                <div>
                  <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.5rem',color:'#1a1d23',marginBottom:28}}>Select Room & Dates</h2>
                  <div style={{marginBottom:24}}>
                    <label style={{display:'block',fontWeight:600,marginBottom:10,fontSize:'0.9rem',color:'#444'}}>Choose Accommodation</label>
                    <div style={{display:'flex',flexDirection:'column',gap:12}}>
                      {rooms.map(room=>{
                        const img=room.images?.[0]||ROOM_IMAGES[room.name]||''
                        const price=[5,6].includes(new Date().getDay())?room.price_weekend:room.price_weekday
                        return (
                          <label key={room.id} style={{display:'flex',alignItems:'center',gap:16,padding:16,border:`2px solid ${form.room_id===room.id?'#2d6a4f':'#f0f0f0'}`,borderRadius:14,cursor:'pointer',background:form.room_id===room.id?'#f0faf2':'white',transition:'all 0.2s'}}>
                            <input type="radio" name="room" value={room.id} checked={form.room_id===room.id} onChange={e=>setForm({...form,room_id:e.target.value})} style={{display:'none'}}/>
                            {img&&<img src={img} alt={room.name} style={{width:72,height:56,objectFit:'cover',borderRadius:10,flexShrink:0}}/>}
                            <div style={{flex:1}}>
                              <div style={{fontWeight:700,color:'#1a1d23',fontSize:'0.95rem'}}>{room.name}</div>
                              <div style={{color:'#888',fontSize:'0.78rem'}}>🛏 {room.bedroom_count}BR · 👥 Up to {room.max_capacity} · {room.bed_type}</div>
                            </div>
                            <div style={{textAlign:'right',flexShrink:0}}>
                              <div style={{fontWeight:700,color:'var(--green)',fontSize:'1.05rem'}}>₱{Number(price).toLocaleString()}</div>
                              <div style={{fontSize:'0.72rem',color:'#aaa'}}>/night</div>
                            </div>
                            {form.room_id===room.id&&<div style={{width:20,height:20,background:'#2d6a4f',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:'0.7rem',flexShrink:0}}>✓</div>}
                          </label>
                        )
                      })}
                    </div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>
                    <div><label style={{display:'block',fontWeight:600,marginBottom:8,fontSize:'0.88rem',color:'#444'}}>Check-in</label>
                      <input type="date" value={form.check_in} min={new Date().toISOString().split('T')[0]} onChange={e=>setForm({...form,check_in:e.target.value})} className="inp"/></div>
                    <div><label style={{display:'block',fontWeight:600,marginBottom:8,fontSize:'0.88rem',color:'#444'}}>Check-out</label>
                      <input type="date" value={form.check_out} min={form.check_in||new Date().toISOString().split('T')[0]} onChange={e=>setForm({...form,check_out:e.target.value})} className="inp"/></div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:24}}>
                    <div><label style={{display:'block',fontWeight:600,marginBottom:8,fontSize:'0.88rem',color:'#444'}}>Guests</label>
                      <select value={form.num_guests} onChange={e=>setForm({...form,num_guests:parseInt(e.target.value)})} className="inp">
                        {Array.from({length:selectedRoom?.max_capacity||6},(_,i)=><option key={i+1} value={i+1}>{i+1} Guest{i>0?'s':''}</option>)}
                      </select></div>
                    <div style={{display:'flex',alignItems:'center',paddingTop:28}}>
                      <label style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',fontWeight:500,fontSize:'0.9rem'}}>
                        <input type="checkbox" checked={form.has_pet} onChange={e=>setForm({...form,has_pet:e.target.checked})} style={{width:18,height:18,accentColor:'#2d6a4f'}}/>
                        🐾 Bringing a pet? <span style={{fontSize:'0.75rem',color:'#888'}}>(+₱300)</span>
                      </label>
                    </div>
                  </div>
                  {error&&<div style={{background:'#fee2e2',color:'#991b1b',padding:'12px 16px',borderRadius:10,marginBottom:16,fontSize:'0.88rem'}}>⚠️ {error}</div>}
                  <button onClick={handleStep1} disabled={loading} className="btn-primary" style={{width:'100%',justifyContent:'center',padding:'14px',fontSize:'1rem'}}>
                    {loading?'⏳ Checking availability...':'Continue → Guest Details'}
                  </button>
                </div>
              )}

              {/* STEP 2 */}
              {step===2&&(
                <div>
                  <button onClick={()=>setStep(1)} style={{background:'none',border:'none',color:'#888',cursor:'pointer',fontSize:'0.85rem',marginBottom:20,display:'flex',alignItems:'center',gap:4}}>← Back</button>
                  <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.5rem',color:'#1a1d23',marginBottom:28}}>Guest Information</h2>
                  <div style={{display:'flex',flexDirection:'column',gap:18}}>
                    <div><label style={{display:'block',fontWeight:600,marginBottom:8,fontSize:'0.88rem',color:'#444'}}>Full Name * <span style={{color:'#888',fontWeight:400,fontSize:'0.78rem'}}>(as it appears on your valid ID)</span></label>
                      <input value={form.guest_name} onChange={e=>setForm({...form,guest_name:e.target.value})} className="inp"/></div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                      <div><label style={{display:'block',fontWeight:600,marginBottom:8,fontSize:'0.88rem',color:'#444'}}>Email *</label>
                        <input type="email" value={form.guest_email} onChange={e=>setForm({...form,guest_email:e.target.value})} className="inp"/></div>
                      <div><label style={{display:'block',fontWeight:600,marginBottom:8,fontSize:'0.88rem',color:'#444'}}>Phone *</label>
                        <input value={form.guest_phone} onChange={e=>setForm({...form,guest_phone:e.target.value})} placeholder="09XX XXX XXXX" className="inp"/></div>
                    </div>
                    <div><label style={{display:'block',fontWeight:600,marginBottom:8,fontSize:'0.88rem',color:'#444'}}>Special Requests</label>
                      <textarea value={form.special_requests} onChange={e=>setForm({...form,special_requests:e.target.value})} rows={3} style={{resize:'none'}} className="inp"/></div>
                    <div><label style={{display:'block',fontWeight:600,marginBottom:8,fontSize:'0.88rem',color:'#444'}}>Promo Code</label>
                      <div style={{display:'flex',gap:10}}>
                        <input value={form.promo_code} onChange={e=>{setForm({...form,promo_code:e.target.value.toUpperCase()});setPromoMsg('')}} placeholder="Enter promo code" className="inp" style={{flex:1}}/>
                        <button onClick={validatePromo} style={{padding:'12px 18px',background:'#f0faf2',border:'1.5px solid #2d6a4f',color:'#2d6a4f',borderRadius:12,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap',fontSize:'0.85rem'}}>Apply</button>
                      </div>
                      {promoMsg&&<p style={{marginTop:8,fontSize:'0.82rem',color:promoMsg.startsWith('✅')?'#059669':'#dc2626'}}>{promoMsg}</p>}
                    </div>
                  </div>
                  {error&&<div style={{background:'#fee2e2',color:'#991b1b',padding:'12px 16px',borderRadius:10,marginTop:16,fontSize:'0.88rem'}}>⚠️ {error}</div>}
                  <button onClick={handleStep2} className="btn-primary" style={{width:'100%',justifyContent:'center',padding:'14px',fontSize:'1rem',marginTop:24}}>
                    Continue → Payment & ID
                  </button>
                </div>
              )}

              {/* STEP 3 - PAYMENT */}
              {step===3&&(
                <div>
                  <button onClick={()=>setStep(2)} style={{background:'none',border:'none',color:'#888',cursor:'pointer',fontSize:'0.85rem',marginBottom:20,display:'flex',alignItems:'center',gap:4}}>← Back</button>
                  <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.5rem',color:'#1a1d23',marginBottom:8}}>Send Payment</h2>
                  <p style={{color:'#888',fontSize:'0.88rem',marginBottom:24}}>Scan the QR code below to send your payment, then upload your screenshot as proof.</p>

                  {/* Full-width QR image — fetched from payment_settings */}
                  {payments[0]?.qr_image_url ? (
                    <div style={{marginBottom:28,borderRadius:20,overflow:'hidden',border:'1px solid #e5e7eb',background:'#f9fafb'}}>
                      <img
                        src={payments[0].qr_image_url}
                        alt="Payment QR Code"
                        style={{width:'100%',display:'block',objectFit:'contain',maxHeight:420}}
                      />
                      {/* Amount box */}
                      <div style={{padding:'20px 24px',textAlign:'center',borderTop:'1px solid #e5e7eb'}}>
                        <div style={{fontSize:'0.82rem',color:'#888',marginBottom:4}}>Total amount to pay</div>
                        <div style={{fontSize:'2rem',fontWeight:800,color:'#1b4332',letterSpacing:'-0.5px'}}>
                          ₱{(total+1000).toLocaleString()}
                        </div>
                        <div style={{fontSize:'0.78rem',color:'#aaa',marginTop:4}}>
                          ₱{total.toLocaleString()} booking + ₱1,000 security deposit
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{marginBottom:28,padding:32,borderRadius:16,border:'1px dashed #d1d5db',textAlign:'center',color:'#aaa'}}>
                      No payment QR uploaded yet. Please contact the property.
                    </div>
                  )}

                  {/* Proof of payment upload */}
                  <div style={{marginBottom:24}}>
                    <label style={{display:'block',fontWeight:700,marginBottom:4,fontSize:'0.9rem',color:'#1a1d23'}}>
                      Upload Payment Screenshot <span style={{color:'#ef4444'}}>*</span>
                    </label>
                    <p style={{fontSize:'0.8rem',color:'#888',marginBottom:12}}>After sending payment, take a screenshot and upload it here.</p>
                    <UploadBox label="Payment Screenshot" type="payment" icon="📸" required/>
                  </div>

                  {/* ID uploads */}
                  <div style={{marginBottom:24}}>
                    <label style={{display:'block',fontWeight:700,marginBottom:4,fontSize:'0.9rem',color:'#1a1d23'}}>
                      Valid Government ID <span style={{color:'#ef4444'}}>*</span>
                    </label>
                    <p style={{fontSize:'0.78rem',color:'#888',marginBottom:12}}>
                      PhilHealth, SSS, UMID, Driver's License, Passport, Voter's ID, or National ID
                    </p>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                      <UploadBox label="ID Front" type="idFront" icon="🪪" required/>
                      <UploadBox label="ID Back" type="idBack" icon="🪪"/>
                    </div>
                  </div>

                  {error&&<div style={{background:'#fee2e2',color:'#991b1b',padding:'12px 16px',borderRadius:10,marginBottom:16,fontSize:'0.88rem'}}>⚠️ {error}</div>}
                  <button onClick={()=>{
                    if(!uploads.payment){setError('Please upload your payment screenshot.');return}
                    if(!uploads.idFront){setError('Please upload your valid ID (front).');return}
                    setError(''); setStep(4)
                  }} className="btn-primary" style={{width:'100%',justifyContent:'center',padding:'14px',fontSize:'1rem'}}>
                    Continue → Review & Confirm
                  </button>
                </div>
              )}

              {/* STEP 4 - CONFIRM */}
              {step===4&&(
                <div>
                  <button onClick={()=>setStep(3)} style={{background:'none',border:'none',color:'#888',cursor:'pointer',fontSize:'0.85rem',marginBottom:20,display:'flex',alignItems:'center',gap:4}}>← Back</button>
                  <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.5rem',color:'#1a1d23',marginBottom:24}}>Review & Confirm</h2>

                  <div style={{background:'#f9fafb',borderRadius:14,padding:20,marginBottom:24}}>
                    <div style={{fontWeight:600,color:'#444',marginBottom:12,fontSize:'0.88rem'}}>BOOKING SUMMARY</div>
                    {[['Guest',form.guest_name],['Email',form.guest_email],['Phone',form.guest_phone],['Room',selectedRoom?.name],
                      ['Check-in',new Date(form.check_in).toLocaleDateString('en-PH',{weekday:'short',month:'long',day:'numeric',year:'numeric'})],
                      ['Check-out',new Date(form.check_out).toLocaleDateString('en-PH',{weekday:'short',month:'long',day:'numeric',year:'numeric'})],
                      ['Nights',nights],['Guests',form.num_guests+(form.has_pet?' + pet':'')],
                      ['Payment via',selectedPaymentMethod?.label||'—'],
                    ].map(([k,v])=>(
                      <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid #f0f0f0',fontSize:'0.88rem'}}>
                        <span style={{color:'#888'}}>{k}</span><span style={{fontWeight:500}}>{v}</span>
                      </div>
                    ))}
                    <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',fontSize:'0.88rem'}}><span style={{color:'#888'}}>Base price</span><span>₱{basePrice.toLocaleString()}</span></div>
                    {promoDiscount>0&&<div style={{display:'flex',justifyContent:'space-between',padding:'4px 0',color:'#059669',fontSize:'0.88rem'}}><span>Promo</span><span>- ₱{(basePrice-total).toLocaleString()}</span></div>}
                    <div style={{display:'flex',justifyContent:'space-between',fontWeight:700,color:'var(--green)',fontSize:'1.05rem',borderTop:'2px solid #e5e7eb',paddingTop:10,marginTop:4}}>
                      <span>Total</span><span>₱{total.toLocaleString()}</span>
                    </div>
                    <div style={{background:'#fef3c7',borderRadius:10,padding:'8px 14px',marginTop:8,fontSize:'0.8rem',color:'#92400e'}}>💰 + ₱1,000 refundable deposit at check-in</div>
                  </div>

                  {/* Uploaded files preview */}
                  <div style={{marginBottom:24}}>
                    <div style={{fontWeight:600,color:'#444',marginBottom:12,fontSize:'0.88rem'}}>UPLOADED DOCUMENTS</div>
                    <div style={{display:'flex',gap:12}}>
                      {Object.entries(uploadPreviews).filter(([,v])=>v).map(([type,url])=>(
                        <div key={type} style={{textAlign:'center'}}>
                          <img src={url} alt={type} style={{width:72,height:72,objectFit:'cover',borderRadius:10,border:'2px solid #2d6a4f'}}/>
                          <div style={{fontSize:'0.7rem',color:'#2d6a4f',fontWeight:600,marginTop:4}}>
                            {type==='payment'?'Payment':type==='idFront'?'ID Front':'ID Back'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {agreement&&(
                    <div style={{marginBottom:24}}>
                      <div style={{fontWeight:600,color:'#444',marginBottom:10,fontSize:'0.88rem'}}>HOUSE RULES & AGREEMENT</div>
                      <div style={{background:'#f9fafb',border:'1px solid #e5e7eb',borderRadius:12,padding:16,maxHeight:160,overflowY:'auto',fontSize:'0.8rem',color:'#555',lineHeight:1.7,whiteSpace:'pre-line'}}>{agreement}</div>
                    </div>
                  )}

                  <label style={{display:'flex',alignItems:'flex-start',gap:12,cursor:'pointer',marginBottom:24,padding:'14px',background:form.agree?'#f0faf2':'#f9fafb',borderRadius:12,border:`1.5px solid ${form.agree?'#2d6a4f':'#e5e7eb'}`,transition:'all 0.2s'}}>
                    <input type="checkbox" checked={form.agree} onChange={e=>setForm({...form,agree:e.target.checked})} style={{width:18,height:18,accentColor:'#2d6a4f',marginTop:1,flexShrink:0}}/>
                    <span style={{fontSize:'0.88rem',color:'#444',lineHeight:1.5}}>
                      I confirm my payment has been sent. I agree to all <strong>house rules</strong> and <strong>security deposit terms</strong> (₱1,000 refundable). All details are correct.
                    </span>
                  </label>

                  {error&&<div style={{background:'#fee2e2',color:'#991b1b',padding:'12px 16px',borderRadius:10,marginBottom:16,fontSize:'0.88rem'}}>⚠️ {error}</div>}
                  <button onClick={handleSubmit} disabled={loading||!form.agree} className="btn-primary"
                    style={{width:'100%',justifyContent:'center',padding:'16px',fontSize:'1.05rem',opacity:(!form.agree||loading)?0.6:1}}>
                    {uploading?'⏳ Uploading documents...':loading?'⏳ Confirming booking...':'✅ Confirm Booking'}
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div style={{position:'sticky',top:100}}>
              {selectedRoom&&(
                <div style={{background:'white',borderRadius:20,overflow:'hidden',boxShadow:'0 4px 24px rgba(0,0,0,0.08)',marginBottom:16}}>
                  <img src={selectedRoom.images?.[0]||ROOM_IMAGES[selectedRoom.name]||'https://www.luntian.net/sala.jpg'} alt={selectedRoom.name} style={{width:'100%',height:160,objectFit:'cover'}}/>
                  <div style={{padding:20}}>
                    <div style={{fontWeight:700,fontSize:'1.1rem',marginBottom:4,fontFamily:"'Playfair Display',serif",color:'#1a1d23'}}>{selectedRoom.name}</div>
                    <div style={{color:'#888',fontSize:'0.8rem',marginBottom:16}}>🛏 {selectedRoom.bedroom_count}BR · 👥 Up to {selectedRoom.max_capacity}</div>
                    {nights>0&&(
                      <div style={{borderTop:'1px solid #f0f0f0',paddingTop:14}}>
                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:6,fontSize:'0.85rem'}}><span style={{color:'#888'}}>Price × {nights} night{nights>1?'s':''}</span><span>₱{basePrice.toLocaleString()}</span></div>
                        {promoDiscount>0&&<div style={{display:'flex',justifyContent:'space-between',marginBottom:6,fontSize:'0.85rem',color:'#059669'}}><span>Discount</span><span>-₱{(basePrice-total).toLocaleString()}</span></div>}
                        <div style={{display:'flex',justifyContent:'space-between',fontWeight:700,color:'var(--green)',fontSize:'1.1rem',borderTop:'1px solid #f0f0f0',paddingTop:10,marginTop:4}}><span>Total</span><span>₱{total.toLocaleString()}</span></div>
                        <div style={{fontSize:'0.75rem',color:'#999',marginTop:6}}>+ ₱1,000 deposit at check-in</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div style={{background:'#f0faf2',borderRadius:16,padding:18,fontSize:'0.82rem',color:'#2d6a4f'}}>
                <div style={{fontWeight:700,marginBottom:10}}>📋 What you'll need</div>
                {['✓ Government-issued valid ID','✓ Payment screenshot/proof','✓ ₱1,000 deposit at check-in','✓ Check-in: 2:00 PM','✓ Check-out: 11:00 AM'].map(p=>(
                  <div key={p} style={{marginBottom:5,lineHeight:1.5}}>{p}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer cms={cms}/>
      <style>{`@media(max-width:900px){.container>div{grid-template-columns:1fr!important}}`}</style>
    </div>
  )
}

export default function BookingPage() {
  return <Suspense fallback={<div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'#888'}}>Loading...</div>}>
    <BookingForm/>
  </Suspense>
}
