import Link from 'next/link'
export default function Footer({ cms }: { cms: Record<string,string> }) {
  return (
    <footer style={{ background:'#0d1f14', color:'rgba(255,255,255,0.75)', padding:'48px 24px 24px' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:40, marginBottom:40 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
              <div style={{ width:36, height:36, background:'linear-gradient(135deg,#52b788,#2d6a4f)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>🌿</div>
              <div style={{ fontWeight:700, color:'white' }}>Luntian Log Cabin</div>
            </div>
            <p style={{ fontSize:'0.85rem', lineHeight:1.7 }}>{cms.footer_tagline || "Tagaytay's hidden gem for rest and premium nature experiences."}</p>
          </div>
          <div>
            <div style={{ fontWeight:600, color:'white', marginBottom:16, fontSize:'0.9rem' }}>Quick Links</div>
            {[['#rooms','Rooms'],['#packages','Packages'],['#food-menu','Food Menu'],['#amenities','Amenities'],['#faq','FAQ']].map(([href,label]) => (
              <a key={href} href={href} style={{ display:'block', color:'rgba(255,255,255,0.6)', textDecoration:'none', marginBottom:8, fontSize:'0.85rem', transition:'color 0.2s' }}
                
                >
                {label}
              </a>
            ))}
          </div>
          <div>
            <div style={{ fontWeight:600, color:'white', marginBottom:16, fontSize:'0.9rem' }}>Contact</div>
            {[[cms.contact_phone1||'0935-763-7498','📱'],[cms.contact_phone2||'0961-883-8060','📱'],[cms.contact_email||'luntianlogcabin@gmail.com','📧'],[cms.contact_address||'Asisan, Tagaytay','📍']].map(([val,icon]) => (
              <div key={val} style={{ display:'flex', gap:8, marginBottom:8, fontSize:'0.83rem', color:'rgba(255,255,255,0.65)' }}>
                <span>{icon}</span><span>{val}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontWeight:600, color:'white', marginBottom:16, fontSize:'0.9rem' }}>Book Direct</div>
            <Link href="/booking" style={{ display:'block', background:'linear-gradient(135deg,#2d6a4f,#40916c)', color:'white', padding:'12px 0', borderRadius:10, textAlign:'center', fontWeight:600, textDecoration:'none', marginBottom:12 }}>
              📅 Book Now
            </Link>
            <Link href="/admin" style={{ display:'block', color:'rgba(255,255,255,0.3)', fontSize:'0.75rem', textAlign:'center', textDecoration:'none', marginTop:8 }}>
              Admin Login
            </Link>
          </div>
        </div>
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:20, textAlign:'center', fontSize:'0.8rem', color:'rgba(255,255,255,0.4)' }}>
          {cms.footer_copyright || '© 2024 Luntian Log Cabin. All rights reserved.'}
        </div>
      </div>
    </footer>
  )
}
