'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])
  const links = [['#rooms','Rooms'],['#packages','Packages'],['#food-menu','Food'],['#amenities','Amenities'],['#faq','FAQ'],['#contact','Contact']]
  return (
    <nav style={{
      position:'fixed', top:0, left:0, right:0, zIndex:100,
      padding: scrolled ? '12px 24px' : '18px 24px',
      background: scrolled ? 'rgba(27,67,50,0.97)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      transition: 'all 0.3s',
      display:'flex', alignItems:'center', justifyContent:'space-between',
    }}>
      <Link href="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
        <div style={{ width:36, height:36, background:'linear-gradient(135deg,#52b788,#2d6a4f)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem' }}>🌿</div>
        <div>
          <div style={{ fontWeight:700, color:'white', fontSize:'0.95rem', lineHeight:1.2 }}>Luntian</div>
          <div style={{ color:'rgba(255,255,255,0.65)', fontSize:'0.68rem', lineHeight:1 }}>Log Cabin · Tagaytay</div>
        </div>
      </Link>
      <div style={{ display:'flex', gap:28, alignItems:'center' }} className="nav-links">
        {links.map(([href,label]) => (
          <a key={href} href={href} style={{ color:'rgba(255,255,255,0.85)', textDecoration:'none', fontSize:'0.88rem', fontWeight:500, transition:'color 0.2s' }}
            onMouseOver={e=>(e.target as HTMLElement).style.color='white'}
            onMouseOut={e=>(e.target as HTMLElement).style.color='rgba(255,255,255,0.85)'}>
            {label}
          </a>
        ))}
        <Link href="/booking" style={{ background:'white', color:'#1b4332', padding:'8px 20px', borderRadius:100, fontWeight:700, textDecoration:'none', fontSize:'0.85rem', transition:'all 0.2s' }}>
          Book Now
        </Link>
      </div>
      <button onClick={() => setOpen(!open)} style={{ display:'none', background:'none', border:'none', color:'white', fontSize:'1.4rem', cursor:'pointer' }} className="hamburger">
        {open ? '✕' : '☰'}
      </button>
      {open && (
        <div style={{ position:'fixed', inset:0, top:64, background:'#1b4332', padding:24, display:'flex', flexDirection:'column', gap:8, zIndex:99 }}>
          {links.map(([href,label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}
              style={{ color:'white', textDecoration:'none', fontSize:'1.1rem', fontWeight:500, padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
              {label}
            </a>
          ))}
          <Link href="/booking" onClick={() => setOpen(false)}
            style={{ background:'white', color:'#1b4332', padding:'14px', borderRadius:12, fontWeight:700, textDecoration:'none', fontSize:'1rem', textAlign:'center', marginTop:12 }}>
            📅 Book Now
          </Link>
        </div>
      )}
      <style>{`
        @media(max-width:768px){ .nav-links{display:none!important} .hamburger{display:block!important} }
      `}</style>
    </nav>
  )
}
