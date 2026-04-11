'use client'
import { useEffect } from 'react'
export default function AdminRedirect() {
  useEffect(() => { window.location.href = 'https://admin.luntian.net' }, [])
  return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'#888'}}>Redirecting to admin...</div>
}
