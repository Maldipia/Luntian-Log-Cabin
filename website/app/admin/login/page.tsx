'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'owner' | 'admin'>('owner')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPw, setShowPw] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Invalid email or password.'); setLoading(false); return }
    if (data.user) {
      const { data: staffData } = await supabase.from('staff').select('role').eq('email', email).single()
      if (!staffData) { setError('Access denied. Contact the owner.'); await supabase.auth.signOut(); setLoading(false); return }
      localStorage.setItem('luntian_role', staffData.role)
      router.push('/admin')
    }
  }

  return (
    <div className="min-h-screen flex" style={{background:'linear-gradient(135deg,#1b4332 0%,#2d6a4f 50%,#40916c 100%)'}}>
      {/* Left — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">🌿</div>
          <div>
            <div className="font-bold text-lg">Luntian Log Cabin</div>
            <div className="text-green-200 text-xs">Tagaytay, Philippines</div>
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight mb-4">Manage your<br/>property with ease.</h1>
          <p className="text-green-200 text-sm leading-relaxed">Track bookings, update pricing, manage your food menu and add-on services — all in one place.</p>
          <div className="flex gap-4 mt-8">
            {['Bookings','Pricing','Menu','Staff'].map(f => (
              <div key={f} className="bg-white/10 backdrop-blur rounded-xl px-4 py-2 text-xs font-medium">{f}</div>
            ))}
          </div>
        </div>
        <div className="text-green-300 text-xs">© 2026 Luntian Log Cabin. All rights reserved.</div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white lg:rounded-l-3xl">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{background:'linear-gradient(135deg,#2d6a4f,#52b788)'}}>🌿</div>
            <span className="font-bold text-gray-900">Luntian Admin</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-sm text-gray-400 mb-8">Sign in to your admin dashboard</p>

          {/* Role selector */}
          <div className="flex gap-2 p-1 rounded-xl mb-6" style={{background:'#f0faf2'}}>
            {(['owner','admin'] as const).map(r => (
              <button key={r} onClick={() => setRole(r)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all capitalize ${role===r ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
                {r === 'owner' ? '👑 Owner' : '⚙️ Admin'}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all bg-gray-50 focus:bg-white"
                style={{'--tw-ring-color':'#2d6a4f'} as any}
                placeholder="luntianlogcabin@gmail.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all bg-gray-50 focus:bg-white pr-11"
                  style={{'--tw-ring-color':'#2d6a4f'} as any}
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl text-sm" style={{background:'#fde8e8', color:'#c0392b'}}>
                <span>⚠️</span> {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 hover:opacity-90 active:scale-98 mt-2"
              style={{background:'linear-gradient(135deg,#2d6a4f,#40916c)'}}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                  Signing in...
                </span>
              ) : 'Sign in →'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">Access restricted to authorized staff of Luntian Log Cabin</p>
        </div>
      </div>
    </div>
  )
}
