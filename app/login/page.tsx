'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff } from 'lucide-react'

const USERNAME_MAP: Record<string, string> = {
  koolin: 'koolin@kbbs.local',
  saimah: 'saimah@kbbs.local',
  bennly: 'bennly@kbbs.local',
  bettny: 'bettny@kbbs.local',
}

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const router   = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    const email = USERNAME_MAP[username.toLowerCase().trim()]
    if (!email) { setError('Username tidak wujud.'); setLoading(false); return }
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError('Username atau password salah.'); setLoading(false); return }
    router.push('/dashboard'); router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 safe-top safe-bottom"
      style={{ backgroundColor: 'var(--bg)' }}>

      {/* Logo area */}
      <div className="mb-10 text-center anim-up">
        <div
          className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center mx-auto mb-4 shadow-lg gap-0.5"
          style={{ backgroundColor: 'var(--orange)' }}
        >
          <span className="text-white font-black text-xl tracking-tight leading-none">KBBS</span>
          <span className="text-white/80 font-semibold text-xs tracking-widest leading-none">ADMIN</span>
        </div>
        <h1 className="text-2xl font-bold tracking-widest" style={{ color: 'var(--brown)' }}>KBBS</h1>
        <p className="text-xs tracking-widest mt-0.5 font-medium" style={{ color: 'var(--text-soft)' }}>
          Management System
        </p>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm rounded-3xl shadow-xl p-7 anim-up"
        style={{ backgroundColor: 'var(--cream-card)', border: '1px solid var(--orange-soft)' }}
      >
        <h2 className="text-lg font-bold mb-6" style={{ color: 'var(--brown)' }}>Log Masuk</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 tracking-wider uppercase"
              style={{ color: 'var(--text-soft)' }}>Username</label>
            <input
              type="text" value={username} onChange={e => setUsername(e.target.value)}
              placeholder="Masukkan username..." required
              className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
              style={{
                backgroundColor: 'var(--bg)',
                border: '1.5px solid var(--orange-soft)',
                color: 'var(--text-main)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--orange)'}
              onBlur={e => e.target.style.borderColor = 'var(--orange-soft)'}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 tracking-wider uppercase"
              style={{ color: 'var(--text-soft)' }}>Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Masukkan password..." required
                className="w-full rounded-xl px-4 py-3 pr-11 text-sm font-medium outline-none transition-all"
                style={{
                  backgroundColor: 'var(--bg)',
                  border: '1.5px solid var(--orange-soft)',
                  color: 'var(--text-main)',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--orange)'}
                onBlur={e => e.target.style.borderColor = 'var(--orange-soft)'}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-100 opacity-40"
                style={{ color: 'var(--brown)' }}>
                {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl px-4 py-3 text-sm font-medium text-center"
              style={{ backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA' }}>
              {error}
            </div>
          )}

          {/* Button */}
          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl text-sm font-bold tracking-wide text-white transition-all active:scale-95 disabled:opacity-60 shadow-md mt-2"
            style={{ backgroundColor: loading ? 'var(--orange-dark)' : 'var(--orange)' }}>
            {loading ? 'Tunggu sebentar...' : 'Masuk'}
          </button>
        </form>
      </div>

      <div className="mt-8 text-center space-y-0.5">
        <p className="text-xs font-medium" style={{ color: 'var(--text-soft)' }}>KBBS © 2026</p>
        <p className="text-xs" style={{ color: '#C4A882' }}>Developed by Hanson Engineering</p>
      </div>
    </div>
  )
}
