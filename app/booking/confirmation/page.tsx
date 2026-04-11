'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

function ConfirmationContent() {
  const params = useSearchParams()
  const ref = params.get('ref')
  const [booking, setBooking] = useState<any>(null)
  const [room, setRoom] = useState<any>(null)
  const [msgs, setMsgs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [cms, setCms] = useState<Record<string,string>>({})

  useEffect(() => {
    if (!ref) return
    Promise.all([
      supabase.from('bookings').select('*, rooms(*)').eq('booking_ref', ref).single(),
      supabase.from('content').select('key,value'),
    ]).then(([{data:b},{data:c}]) => {
      if (b) {
        setBooking(b)
        setRoom(b.rooms)
        // Load welcome message
        supabase.from('welcome_messages').select('*').eq('room_id', b.room_id).eq('send_on','payment_confirmed').single()
          .then(({data:m}) => { if(m) setMsgs([m]) })
      }
      const m: Record<string,string> = {}
      ;(c||[]).forEach((x:any) => { m[x.key] = x.value })
      setCms(m)
      setLoading(false)
    })
  }, [ref])

  function parseWelcome(template: string) {
    if (!template || !booking || !room) return template
    return template
      .replace(/\{\{guest_name\}\}/g, booking.guest_name)
      .replace(/\{\{room_name\}\}/g, room.name)
      .replace(/\{\{checkin_date\}\}/g, new Date(booking.check_in).toLocaleDateString('en-PH',{weekday:'long',month:'long',day:'numeric',year:'numeric'}))
      .replace(/\{\{checkout_date\}\}/g, new Date(booking.check_out).toLocaleDateString('en-PH',{weekday:'long',month:'long',day:'numeric',year:'numeric'}))
      .replace(/\{\{checkin_time\}\}/g, '2:00 PM')
      .replace(/\{\{checkout_time\}\}/g, '11:00 AM')
      .replace(/\{\{num_guests\}\}/g, booking.num_guests)
      .replace(/\{\{booking_ref\}\}/g, booking.booking_ref)
      .replace(/\{\{access_details\}\}/g, '(Access details will be provided before check-in)')
      .replace(/\{\{location_details\}\}/g, cms.contact_address || 'Asisan, Tagaytay City, Cavite')
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', flexDirection:'column', gap:16 }}>
      <div style={{ width:48, height:48, border:'3px solid #d8f3dc', borderTop:'3px solid #2d6a4f', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
      <p style={{ color:'#888' }}>Loading your confirmation...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!booking) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'80vh', gap:16, padding:24, textAlign:'center' }}>
      <div style={{ fontSize:'3rem' }}>❌</div>
      <h2 style={{ fontFamily:"'Playfair Display',serif" }}>Booking not found</h2>
      <p style={{ color:'#888' }}>Reference number: {ref}</p>
      <Link href="/booking" className="btn-primary">Try Again</Link>
    </div>
  )

  const nights = Math.round((new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) / 86400000)

  return (
    <div style={{ minHeight:'100vh', background:'var(--cream)' }}>
      <Navbar />
      <div style={{ paddingTop:80 }}>
        {/* Success banner */}
        <div style={{ background:'linear-gradient(135deg,#1b4332,#2d6a4f)', padding:'48px 24px', textAlign:'center', color:'white' }}>
          <div style={{ width:72, height:72, background:'rgba(255,255,255,0.15)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', margin:'0 auto 16px' }}>✅</div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(1.8rem,4vw,2.6rem)', marginBottom:8 }}>Booking Confirmed!</h1>
          <p style={{ opacity:0.85 }}>Thank you, <strong>{booking.guest_name}</strong>! Your stay is reserved.</p>
          <div style={{ display:'inline-block', background:'rgba(255,255,255,0.15)', borderRadius:100, padding:'8px 24px', marginTop:16, fontFamily:'monospace', fontSize:'1.1rem', fontWeight:700, letterSpacing:2 }}>
            {booking.booking_ref}
          </div>
        </div>

        <div className="container" style={{ paddingTop:40, paddingBottom:60, maxWidth:900 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
            {/* Booking details */}
            <div style={{ background:'white', borderRadius:20, padding:28, boxShadow:'0 4px 20px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.3rem', marginBottom:20, color:'#1a1d23' }}>📋 Booking Details</h3>
              {[
                ['Reference', booking.booking_ref],
                ['Room', room?.name],
                ['Check-in', new Date(booking.check_in).toLocaleDateString('en-PH',{weekday:'long',month:'long',day:'numeric',year:'numeric'})],
                ['Check-out', new Date(booking.check_out).toLocaleDateString('en-PH',{weekday:'long',month:'long',day:'numeric',year:'numeric'})],
                ['Nights', nights],
                ['Guests', booking.num_guests + (booking.has_pet ? ' + pet 🐾' : '')],
                ['Status', booking.status.toUpperCase()],
              ].map(([k,v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #f5f5f5', fontSize:'0.88rem' }}>
                  <span style={{ color:'#888' }}>{k}</span>
                  <span style={{ fontWeight:600, color: k==='Status' ? '#2d6a4f' : '#1a1d23' }}>{v}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 0 0', fontWeight:700, color:'var(--green)', fontSize:'1.05rem' }}>
                <span>Total</span>
                <span>₱{Number(booking.total_revenue).toLocaleString()}</span>
              </div>
            </div>

            {/* Important info */}
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ background:'#fef3c7', borderRadius:16, padding:20, border:'1px solid #fde68a' }}>
                <div style={{ fontWeight:700, color:'#92400e', marginBottom:10 }}>💰 Security Deposit</div>
                <p style={{ color:'#78350f', fontSize:'0.88rem', lineHeight:1.6 }}>
                  A <strong>₱1,000 refundable</strong> security deposit is required upon check-in. This will be returned after inspection at checkout.
                </p>
              </div>
              <div style={{ background:'#f0faf2', borderRadius:16, padding:20, border:'1px solid #a7f3d0' }}>
                <div style={{ fontWeight:700, color:'#1b4332', marginBottom:10 }}>📅 What's Next</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8, fontSize:'0.85rem', color:'#2d6a4f' }}>
                  <div>✓ Check-in at 2:00 PM</div>
                  <div>✓ Check-out at 11:00 AM</div>
                  <div>✓ Confirmation email sent to {booking.guest_email}</div>
                  <div>✓ Access details provided before arrival</div>
                </div>
              </div>
              <div style={{ background:'white', borderRadius:16, padding:20, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ fontWeight:700, color:'#1a1d23', marginBottom:10 }}>📞 Contact Us</div>
                <div style={{ fontSize:'0.85rem', color:'#666', display:'flex', flexDirection:'column', gap:6 }}>
                  <div>📱 {cms.contact_phone1 || '0935-763-7498'}</div>
                  <div>📱 {cms.contact_phone2 || '0961-883-8060'}</div>
                  <div>📧 {cms.contact_email || 'luntianlogcabin@gmail.com'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Welcome message */}
          {msgs.length > 0 && msgs[0].message_template && (
            <div style={{ background:'white', borderRadius:20, padding:28, marginTop:24, boxShadow:'0 4px 20px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.2rem', marginBottom:16, color:'#1a1d23' }}>
                💌 {msgs[0].subject || 'Welcome Message'}
              </h3>
              <div style={{ background:'#f9fafb', borderRadius:12, padding:20, fontSize:'0.88rem', color:'#444', lineHeight:1.8, whiteSpace:'pre-line' }}>
                {parseWelcome(msgs[0].message_template)}
              </div>
            </div>
          )}

          <div style={{ textAlign:'center', marginTop:32, display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
            <Link href="/" className="btn-outline">← Back to Home</Link>
            <Link href="/booking" className="btn-primary">Book Another Room</Link>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:700px){.container>div{grid-template-columns:1fr!important}}`}</style>
    </div>
  )
}

export default function ConfirmationPage() {
  return <Suspense fallback={<div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh'}}>Loading...</div>}>
    <ConfirmationContent />
  </Suspense>
}
