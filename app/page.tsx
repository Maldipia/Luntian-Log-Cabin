import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

async function getData() {
  const [{ data: rooms }, { data: food }, { data: addons }, { data: content }, { data: payments }] = await Promise.all([
    supabase.from('rooms').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('food_menu').select('*').eq('is_available', true).order('category').order('sort_order'),
    supabase.from('addons').select('*').eq('is_available', true).order('sort_order'),
    supabase.from('content').select('key,value'),
    supabase.from('payment_settings').select('*').eq('is_active', true).order('sort_order'),
  ])
  const cms: Record<string,string> = {}
  ;(content||[]).forEach((c: any) => { cms[c.key] = c.value })
  return { rooms: rooms||[], food: food||[], addons: addons||[], cms, payments: payments||[] }
}

const ROOM_IMAGES: Record<string, string> = {
  'Sunrise Room': 'https://www.luntian.net/SUNRISE3.0.jpg',
  'Leaf Room':    'https://www.luntian.net/LEAF3.0.jpg',
  '2BR Suite':    'https://www.luntian.net/YANI.jpg',
}

const AMENITY_ICONS: Record<string, string> = {
  'Air Conditioning': '❄️', 'Free WiFi': '📶', 'Private Bathroom': '🚿',
  '2 Private Bathrooms': '🚿', 'Kitchen Access': '🍳', 'Full Kitchen': '🍳',
  'Bonfire Area': '🔥', 'Karaoke': '🎤', 'Living Area': '🛋️',
}

const TYPE_BADGE: Record<string, { label: string; color: string }> = {
  private_room: { label: 'Private Room', color: '#2d6a4f' },
  suite:        { label: 'Suite',        color: '#6b3fa0' },
  cabin:        { label: 'Cabin',        color: '#92400e' },
}

export default async function Home() {
  const { rooms, food, addons, cms, payments } = await getData()
  const foodByCategory: Record<string, any[]> = {}
  food.forEach(f => {
    if (!foodByCategory[f.category]) foodByCategory[f.category] = []
    foodByCategory[f.category].push(f)
  })

  return (
    <>
      <Navbar />

      {/* ── HERO ── */}
      <section id="home" style={{
        minHeight: '100vh', position: 'relative', display: 'flex',
        alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #0d2818 0%, #1b4332 40%, #2d6a4f 100%)',
        }}>
          <img src="https://www.luntian.net/cover2.0.png" alt="Luntian Log Cabin"
            style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.35, mixBlendMode:'multiply' }} />
        </div>
        <div style={{ position:'relative', zIndex:1, textAlign:'center', color:'white', padding:'0 24px', maxWidth:760 }}>
          <div className="badge" style={{ background:'rgba(255,255,255,0.15)', color:'white', backdropFilter:'blur(8px)', marginBottom:24, fontSize:'0.85rem' }}>
            🌿 Tagaytay's Nature Retreat
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2.4rem, 6vw, 4.2rem)',
            fontWeight: 600, lineHeight: 1.15, marginBottom: 20,
          }}>
            Luntian Log Cabin
          </h1>
          <p style={{ fontSize:'clamp(1rem, 2.5vw, 1.2rem)', opacity:0.9, marginBottom:12, fontWeight:300 }}>
            {cms.hero_subtitle || "Tagaytay's Hidden Gem for Rest & Wellness"}
          </p>
          <p style={{ fontSize:'0.95rem', opacity:0.75, marginBottom:40 }}>
            📍 {cms.contact_address || 'Asisan, Tagaytay'} · Pet-Friendly · AC & WiFi
          </p>
          <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
            <Link href="/booking" className="btn-primary" style={{ fontSize:'1rem', padding:'14px 32px' }}>
              📅 Book Now
            </Link>
            <a href="#rooms" className="btn-outline" style={{ borderColor:'rgba(255,255,255,0.7)', color:'white', padding:'14px 28px' }}>
              Explore Rooms
            </a>
          </div>
          <div style={{ display:'flex', gap:32, justifyContent:'center', marginTop:56, flexWrap:'wrap' }}>
            {[['🏡','3 Rooms','Private & Suite'],['🐾','Pet Friendly','With advance notice'],['⭐','Direct Booking','Best rates guaranteed']].map(([icon,label,sub])=>(
              <div key={label} style={{ textAlign:'center' }}>
                <div style={{ fontSize:'1.6rem', marginBottom:4 }}>{icon}</div>
                <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{label}</div>
                <div style={{ fontSize:'0.78rem', opacity:0.65 }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
        <a href="#rooms" style={{ position:'absolute', bottom:32, left:'50%', transform:'translateX(-50%)', color:'rgba(255,255,255,0.7)', animation:'bounce 2s infinite', fontSize:'1.5rem' }}>↓</a>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="section" style={{ background:'var(--cream)' }}>
        <div className="container">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center' }}>
            <div>
              <div className="badge" style={{ marginBottom:16 }}>🌱 About Us</div>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:600, lineHeight:1.2, marginBottom:20, color:'var(--green-dark)' }}>
                {cms.about_title || 'Your Nature Escape in Tagaytay'}
              </h2>
              <p style={{ color:'#555', lineHeight:1.8, marginBottom:20 }}>
                {cms.about_subtitle || 'A cozy cabin featuring 2 private rooms — your serene escape from city life.'}
              </p>
              <p style={{ color:'#666', lineHeight:1.8, marginBottom:32, fontSize:'0.95rem' }}>
                {cms.about_text || 'Luntian Log Cabin is Tagaytay\'s premier boutique nature retreat, offering sophisticated packages for romance, family adventures, and wellness experiences.'}
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                {[['🌿','Nature-Inspired','Authentic Filipino aesthetic'],['🔒','Private & Secure','Gated, 24/7 security'],['✨','Premium Packages','Romance, family & wellness'],['🐾','Pet Friendly','Up to 3 pets allowed']].map(([icon,title,sub])=>(
                  <div key={title} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'12px 16px', background:'white', borderRadius:14, boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
                    <span style={{ fontSize:'1.4rem' }}>{icon}</span>
                    <div>
                      <div style={{ fontWeight:600, fontSize:'0.85rem', color:'#1a1d23' }}>{title}</div>
                      <div style={{ fontSize:'0.78rem', color:'#888' }}>{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ position:'relative' }}>
              <img src="https://www.luntian.net/sala.jpg" alt="Luntian interior"
                style={{ width:'100%', borderRadius:24, boxShadow:'0 20px 60px rgba(0,0,0,0.15)', objectFit:'cover', height:460 }} />
              <div style={{ position:'absolute', bottom:-20, left:-20, background:'white', borderRadius:16, padding:'16px 20px', boxShadow:'0 8px 32px rgba(0,0,0,0.12)' }}>
                <div style={{ fontWeight:700, fontSize:'1.5rem', color:'var(--green)' }}>4.9★</div>
                <div style={{ fontSize:'0.78rem', color:'#666' }}>Guest Rating</div>
              </div>
              <div style={{ position:'absolute', top:-16, right:-16, background:'linear-gradient(135deg,#2d6a4f,#40916c)', borderRadius:16, padding:'16px 20px', color:'white' }}>
                <div style={{ fontWeight:700, fontSize:'1.4rem' }}>3</div>
                <div style={{ fontSize:'0.75rem', opacity:0.9 }}>Room Types</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ROOMS ── */}
      <section id="rooms" className="section" style={{ background:'white' }}>
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <div className="badge" style={{ marginBottom:16 }}>🏡 Accommodations</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(1.8rem,4vw,2.8rem)', color:'var(--green-dark)', marginBottom:12 }}>Our Rooms</h2>
            <p style={{ color:'#666', maxWidth:540, margin:'0 auto' }}>Each room is a private sanctuary designed for comfort, privacy, and connection with nature.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))', gap:28 }}>
            {rooms.map((room:any) => {
              const img = room.images?.[0] || ROOM_IMAGES[room.name] || 'https://www.luntian.net/sala.jpg'
              const badge = TYPE_BADGE[room.accommodation_type] || TYPE_BADGE.private_room
              const isWeekend = [5,6].includes(new Date().getDay())
              const price = isWeekend ? room.price_weekend : room.price_weekday
              return (
                <div key={room.id} className="card">
                  <div style={{ position:'relative', height:240, overflow:'hidden' }}>
                    <img src={img} alt={room.name} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.4s' }}
                       />
                    <div style={{ position:'absolute', top:16, left:16 }}>
                      <span style={{ background:'white', color:badge.color, padding:'5px 12px', borderRadius:100, fontSize:'0.75rem', fontWeight:700, boxShadow:'0 2px 8px rgba(0,0,0,0.15)' }}>
                        {badge.label}
                      </span>
                    </div>
                    <div style={{ position:'absolute', bottom:0, left:0, right:0, height:80, background:'linear-gradient(transparent,rgba(0,0,0,0.5))' }} />
                  </div>
                  <div style={{ padding:'24px' }}>
                    <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.4rem', color:'var(--green-dark)', marginBottom:6 }}>{room.name}</h3>
                    <p style={{ color:'#888', fontSize:'0.85rem', marginBottom:4 }}>
                      🛏 {room.bedroom_count}BR · 🚿 {room.bathroom_count}BA · 👥 Up to {room.max_capacity} guests · {room.bed_type}
                    </p>
                    <p style={{ color:'#666', fontSize:'0.88rem', fontStyle:'italic', marginBottom:16 }}>"{room.highlights}"</p>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:20 }}>
                      {(room.amenities||[]).slice(0,5).map((a:string) => (
                        <span key={a} style={{ fontSize:'0.75rem', padding:'4px 10px', background:'#f0faf2', color:'#2d6a4f', borderRadius:100, fontWeight:500 }}>
                          {AMENITY_ICONS[a]||'✓'} {a}
                        </span>
                      ))}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', borderTop:'1px solid #f0f0f0', paddingTop:16 }}>
                      <div>
                        <div style={{ fontSize:'1.6rem', fontWeight:700, color:'var(--green)' }}>
                          ₱{Number(price).toLocaleString()}
                        </div>
                        <div style={{ fontSize:'0.75rem', color:'#999' }}>
                          per night · wkend ₱{Number(room.price_weekend).toLocaleString()}
                        </div>
                      </div>
                      <Link href={`/booking?room=${room.id}`} className="btn-primary" style={{ padding:'10px 20px', fontSize:'0.88rem' }}>
                        Book Now →
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── PACKAGES ── */}
      <section id="packages" className="section" style={{ background:'var(--cream)' }}>
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <div className="badge" style={{ marginBottom:16 }}>✨ Premium Packages</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(1.8rem,4vw,2.8rem)', color:'var(--green-dark)', marginBottom:12 }}>Curated Experiences</h2>
            <p style={{ color:'#666', maxWidth:500, margin:'0 auto' }}>More than a stay — crafted moments for romance, family, and wellness.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:24 }}>
            {[
              { icon:'💕', title:'Romance Package', price: cms.pkg_romance_price||'₱12,000', pax: cms.pkg_romance_pax||'For 2 guests', advance: cms.pkg_romance_advance||'15-20 days advance', color:'#fce4ec', accent:'#c2185b',
                items:['1 night premium accommodation','Exclusive garden gazebo use','Professional romantic setup','Candlelight dinner experience','Welcome wine selection','Late checkout privileges'] },
              { icon:'👨‍👩‍👧‍👦', title:'Family Adventure', price: cms.pkg_family_price||'₱8,500', pax: cms.pkg_family_pax||'For 4 guests', advance: cms.pkg_family_advance||'2-3 days advance', color:'#e8f5e9', accent:'#2e7d32',
                items:['1 night family accommodation','Enhanced breakfast for all','Movie night with projector','Board games & karaoke','Nature exploration guide','Extended checkout until 2PM'] },
              { icon:'🧘‍♀️', title:'Wellness Retreat', price: cms.pkg_wellness_price||'₱15,000', pax: cms.pkg_wellness_pax||'2 nights for 2', advance: cms.pkg_wellness_advance||'15-20 days advance', color:'#e3f2fd', accent:'#1565c0',
                items:['2 nights premium accommodation','Daily wellness breakfast','Morning yoga sessions','Meditation & mindfulness','Nature therapy walks','Professional photography session'] },
            ].map(pkg => (
              <div key={pkg.title} style={{ background:pkg.color, borderRadius:20, padding:28, position:'relative', overflow:'hidden' }}>
                <div style={{ fontSize:'2.2rem', marginBottom:12 }}>{pkg.icon}</div>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.3rem', color:pkg.accent, marginBottom:4 }}>{pkg.title}</h3>
                <div style={{ fontSize:'1.8rem', fontWeight:700, color:pkg.accent, marginBottom:4 }}>{pkg.price}</div>
                <div style={{ fontSize:'0.8rem', color:pkg.accent, opacity:0.8, marginBottom:20 }}>{pkg.pax}</div>
                <ul style={{ listStyle:'none', padding:0, margin:'0 0 20px', display:'flex', flexDirection:'column', gap:8 }}>
                  {pkg.items.map(item => (
                    <li key={item} style={{ display:'flex', alignItems:'flex-start', gap:8, fontSize:'0.85rem', color:'#333' }}>
                      <span style={{ color:pkg.accent, fontWeight:700, flexShrink:0 }}>✓</span> {item}
                    </li>
                  ))}
                </ul>
                <div style={{ fontSize:'0.75rem', color:pkg.accent, background:'rgba(255,255,255,0.6)', borderRadius:8, padding:'6px 10px', marginBottom:16 }}>
                  ⏰ {pkg.advance}
                </div>
                <Link href={`/booking`} style={{ display:'block', textAlign:'center', background:pkg.accent, color:'white', padding:'10px 0', borderRadius:10, fontWeight:600, fontSize:'0.88rem', textDecoration:'none' }}>
                  Book This Package →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AMENITIES ── */}
      <section id="amenities" className="section" style={{ background:'var(--green-dark)' }}>
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:56, color:'white' }}>
            <div className="badge" style={{ background:'rgba(255,255,255,0.15)', color:'white', marginBottom:16 }}>🏠 What's Included</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(1.8rem,4vw,2.8rem)', marginBottom:12 }}>Property Amenities</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:20 }}>
            {[['❄️','Air Conditioning','All private rooms'],['📶','High-Speed WiFi','Complimentary'],['🔥','Bonfire Area','Evening gatherings'],['🎤','Karaoke System','Sing all night'],['🚴','Bike Riding','Explore nature'],['🏸','Badminton','Outdoor court'],['🎬','Movie Projector','Cinematic nights'],['🍳','Kitchen Facilities','Cook your meals'],['🚗','Free Parking','Multiple spaces'],['🐾','Pet Friendly','With prior notice'],['🛁','Private Bathrooms','En-suite'],['🌿','Garden Area','Relax outdoors']].map(([icon,title,sub])=>(
              <div key={title} style={{ background:'rgba(255,255,255,0.08)', borderRadius:16, padding:'20px 16px', textAlign:'center', backdropFilter:'blur(4px)', border:'1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize:'2rem', marginBottom:10 }}>{icon}</div>
                <div style={{ fontWeight:600, color:'white', fontSize:'0.9rem', marginBottom:4 }}>{title}</div>
                <div style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.75rem' }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOD MENU ── */}
      <section id="food-menu" className="section" style={{ background:'white' }}>
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <div className="badge" style={{ marginBottom:16 }}>🍽 Food & Dining</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(1.8rem,4vw,2.8rem)', color:'var(--green-dark)', marginBottom:12 }}>Order In Advance</h2>
            <p style={{ color:'#888', fontSize:'0.9rem' }}>All food items require 3-4 hours advance order · Breakfast: 8AM–2PM</p>
          </div>
          {Object.entries(foodByCategory).map(([cat, items]) => (
            <div key={cat} style={{ marginBottom:40 }}>
              <h3 style={{ fontFamily:"'Playfair Display',serif", color:'var(--green)', fontSize:'1.3rem', marginBottom:20, paddingBottom:10, borderBottom:'2px solid var(--green-pale)' }}>
                {cat === 'Breakfast' ? '🌅' : cat === 'Mains' ? '🍛' : cat === 'Drinks' ? '🥤' : cat === 'Snacks' ? '🍿' : '🎁'} {cat}
              </h3>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:14 }}>
                {items.map((item:any) => (
                  <div key={item.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 18px', background:'#f9fafb', borderRadius:14, border:'1px solid #f0f0f0' }}>
                    <div>
                      <div style={{ fontWeight:600, color:'#1a1d23', fontSize:'0.95rem' }}>{item.name}</div>
                      {item.description && <div style={{ color:'#888', fontSize:'0.78rem' }}>{item.description}</div>}
                    </div>
                    <div style={{ fontWeight:700, color:'var(--green)', fontSize:'1.05rem', whiteSpace:'nowrap', marginLeft:12 }}>₱{Number(item.price).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div style={{ textAlign:'center', marginTop:32 }}>
            <p style={{ color:'#888', fontSize:'0.85rem', marginBottom:16 }}>📋 Order when booking or contact us in advance</p>
            <a href={`tel:${cms.contact_phone1||'09357637498'}`} className="btn-outline">📱 Call to Order</a>
          </div>
        </div>
      </section>

      {/* ── ADD-ONS ── */}
      {addons.length > 0 && (
        <section className="section" style={{ background:'var(--warm)' }}>
          <div className="container">
            <div style={{ textAlign:'center', marginBottom:48 }}>
              <div className="badge" style={{ marginBottom:16 }}>✨ Add-On Services</div>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(1.6rem,3.5vw,2.4rem)', color:'var(--green-dark)' }}>Elevate Your Stay</h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:16 }}>
              {addons.map((a:any) => (
                <div key={a.id} style={{ background:'white', borderRadius:16, padding:'20px', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize:'1.8rem', marginBottom:10 }}>
                    {a.category==='Photography'?'📸':a.category==='Celebration'?'🎊':a.category==='Experience'?'🔥':a.category==='Wellness'?'🧘':'✨'}
                  </div>
                  <div style={{ fontWeight:600, color:'#1a1d23', marginBottom:4 }}>{a.name}</div>
                  <div style={{ color:'#888', fontSize:'0.8rem', marginBottom:12 }}>{a.description}</div>
                  <div style={{ fontWeight:700, color:'var(--green)', fontSize:'1.1rem' }}>₱{Number(a.price).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      <section id="faq" className="section" style={{ background:'white' }}>
        <div className="container" style={{ maxWidth:760 }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div className="badge" style={{ marginBottom:16 }}>❓ FAQ</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(1.8rem,4vw,2.4rem)', color:'var(--green-dark)' }}>Common Questions</h2>
          </div>
          {[
            ['Is each room private?', 'Yes. Each booking includes a private room and private bathroom. The living room may be shared with other guests.'],
            ['What is the check-in/check-out time?', `Check-in: ${cms.checkin_time||'2:00 PM'} · Check-out: ${cms.checkout_time||'11:00 AM'}. Late checkout available upon request.`],
            ['Is there a security deposit?', 'Yes, a refundable security deposit of ₱1,000 is required upon check-in. This is returned after inspection at checkout.'],
            ['Are pets allowed?', 'Yes! We welcome well-behaved pets (up to 2-3 small-medium pets). Advance notice required. Cleaning fee applies.'],
            ['What is the WiFi password?', `Network: ${cms.wifi_name||'LuntianLogCabin'} · Password: ${cms.wifi_password||'NatureLovesYou'}`],
            ['Is parking available?', 'Yes, free secure parking is available on-site for all guests.'],
            ['Can we cook or bring food?', 'Yes. You can bring your own food and use the shared kitchen for reheating. We also offer food packages with advance order.'],
            ['Where is Luntian located?', `${cms.contact_address||'Asisan, Tagaytay City, Cavite'}. 5-10 minutes from Sky Ranch and Mahogany Market.`],
          ].map(([q, a]) => (
            <details key={q} style={{ borderBottom:'1px solid #f0f0f0', padding:'18px 0' }}>
              <summary style={{ cursor:'pointer', fontWeight:600, color:'#1a1d23', fontSize:'0.95rem', listStyle:'none', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                {q} <span style={{ color:'var(--green)', fontSize:'1.2rem' }}>+</span>
              </summary>
              <p style={{ marginTop:12, color:'#666', lineHeight:1.7, fontSize:'0.9rem' }}>{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── PAYMENT METHODS ── */}
      <section className="section" style={{ background:'var(--cream)' }}>
        <div className="container" style={{ maxWidth:700, textAlign:'center' }}>
          <div className="badge" style={{ marginBottom:16 }}>💳 Payment</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(1.6rem,3vw,2.2rem)', color:'var(--green-dark)', marginBottom:12 }}>We Accept</h2>
          <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap', marginTop:32 }}>
            {payments.map((p:any) => (
              <div key={p.id} style={{ background:'white', borderRadius:16, padding:'16px 24px', boxShadow:'0 2px 12px rgba(0,0,0,0.08)', display:'flex', alignItems:'center', gap:12, minWidth:160 }}>
                <span style={{ fontSize:'1.8rem' }}>{p.method==='gcash'?'💚':p.method==='maya'?'💜':p.method==='bank'?'🏦':'💵'}</span>
                <div style={{ textAlign:'left' }}>
                  <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{p.label||p.method}</div>
                  {p.account_number && <div style={{ fontSize:'0.75rem', color:'#888' }}>{p.account_number}</div>}
                </div>
              </div>
            ))}
          </div>
          <p style={{ marginTop:24, color:'#888', fontSize:'0.85rem' }}>Security deposit of ₱1,000 required upon check-in (refundable)</p>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="section" style={{ background:'var(--green-dark)', color:'white' }}>
        <div className="container">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'start' }}>
            <div>
              <div className="badge" style={{ background:'rgba(255,255,255,0.15)', color:'white', marginBottom:16 }}>📞 Get in Touch</div>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(1.8rem,4vw,2.6rem)', marginBottom:20 }}>Contact Us</h2>
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {[
                  ['📱', 'Primary', cms.contact_phone1||'0935-763-7498'],
                  ['📱', 'Secondary', cms.contact_phone2||'0961-883-8060'],
                  ['📧', 'Email', cms.contact_email||'luntianlogcabin@gmail.com'],
                  ['📍', 'Address', cms.contact_address||'Asisan, Tagaytay City'],
                  ['⏰', 'Support', '24/7 Guest Support'],
                ].map(([icon,label,value]) => (
                  <div key={label} style={{ display:'flex', alignItems:'center', gap:16 }}>
                    <div style={{ width:40, height:40, background:'rgba(255,255,255,0.1)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', flexShrink:0 }}>{icon}</div>
                    <div>
                      <div style={{ fontSize:'0.75rem', opacity:0.6 }}>{label}</div>
                      <div style={{ fontWeight:500 }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:32 }}>
                <a href={cms.contact_waze_link||'https://waze.com'} target="_blank"
                  style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.15)', color:'white', padding:'12px 20px', borderRadius:10, fontWeight:500, textDecoration:'none', fontSize:'0.9rem' }}>
                  🗺 Open in Waze
                </a>
              </div>
            </div>
            <div style={{ background:'rgba(255,255,255,0.08)', borderRadius:20, padding:32 }}>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.4rem', marginBottom:24 }}>Quick Book</h3>
              <Link href="/booking" className="btn-primary" style={{ width:'100%', justifyContent:'center', marginBottom:16, fontSize:'1rem', padding:'14px 0' }}>
                📅 Book Your Stay
              </Link>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {[['WiFi', cms.wifi_name||'LuntianLogCabin'],['Password', cms.wifi_password||'NatureLovesYou'],['Check-in', cms.checkin_time||'2:00 PM'],['Check-out', cms.checkout_time||'11:00 AM']].map(([label,val])=>(
                  <div key={label} style={{ background:'rgba(255,255,255,0.08)', borderRadius:10, padding:'12px 14px' }}>
                    <div style={{ fontSize:'0.7rem', opacity:0.6, marginBottom:2 }}>{label}</div>
                    <div style={{ fontWeight:600, fontSize:'0.85rem' }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section" style={{ background:'linear-gradient(135deg,#1b4332,#2d6a4f)', textAlign:'center', color:'white', padding:'80px 24px' }}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(1.8rem,4vw,2.8rem)', marginBottom:16 }}>Ready to Escape?</h2>
          <p style={{ opacity:0.85, marginBottom:36, lineHeight:1.7 }}>Book directly for the best rates. No platform fees. Instant confirmation.</p>
          <Link href="/booking" className="btn-primary" style={{ fontSize:'1.05rem', padding:'16px 40px', background:'white', color:'var(--green-dark)' }}>
            📅 Book Your Stay Now
          </Link>
        </div>
      </section>

      <Footer cms={cms} />
      <style>{`
        @keyframes bounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-10px)} }
        details summary::-webkit-details-marker { display:none }
        details[open] summary span { transform:rotate(45deg) }
        details[open] summary span { display:inline-block; transform:rotate(45deg); }
        @media(max-width:768px){
          #about > div > div { grid-template-columns:1fr !important; }
          #contact > div > div { grid-template-columns:1fr !important; }
        }
      `}</style>
    </>
  )
}
