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

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }
    if (data.user) {
      const { data: staffData } = await supabase.from('staff').select('role').eq('email', email).single()
      if (!staffData) {
        setError('Access denied. Contact the owner.')
        await supabase.auth.signOut()
        setLoading(false)
        return
      }
      localStorage.setItem('luntian_role', staffData.role)
      router.push('/admin')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 w-full max-w-sm shadow-sm">
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">🌿</div>
          <h1 className="text-xl font-medium text-gray-900">Luntian Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Property Management Dashboard</p>
        </div>

        <div className="flex gap-2 mb-6">
          {(['owner', 'admin'] as const).map(r => (
            <button key={r} onClick={() => setRole(r)}
              className={`flex-1 py-2 text-sm rounded-lg border transition-all ${role === r ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              placeholder="you@luntian.net" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              placeholder="••••••••" />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="text-xs text-gray-400 text-center mt-4">Access restricted to authorized staff only</p>
      </div>
    </div>
  )
}
