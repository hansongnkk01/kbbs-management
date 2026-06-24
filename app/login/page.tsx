'use client'

// Halaman login
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, LogIn } from 'lucide-react'

const USERNAME_MAP: Record<string, string> = {
  koolin:  'koolin@kbbs.local',
  saimah:  'saimah@kbbs.local',
  bennly:  'bennly@kbbs.local',
  bettny:  'bettny@kbbs.local',
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
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) { setError('Username atau password salah. Cuba lagi.'); setLoading(false); return }
    router.push('/dashboard'); router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{backgroundColor:'var(--bg-cream)'}}>

      <div className="w-full max-w-xs animate-slide-up">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-4 shadow-2xl"
            style={{background:'linear-gradient(135deg,#F97316,#C2500A)'}}>
            <span className="text-white font-black text-4xl tracking-tighter">KB</span>
          </div>
          <h1 className="font-black text-4xl tracking-widest" style={{color:'var(--brown-dark)'}}>KBBS</h1>
          <p className="font-black text-xs tracking-widest mt-1" style={{color:'var(--orange-mid)'}}>
            MANAGEMENT SYSTEM
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl shadow-2xl overflow-hidden"
          style={{background:'linear-gradient(160deg,#F97316 0%,#C2500A 100%)'}}>

          {/* Tab header */}
          <div className="px-6 pt-6 pb-4 flex items-center gap-2">
            <LogIn size={18} className="text-white/70"/>
            <h2 className="text-white font-black text-xl tracking-widest">LOG IN</h2>
          </div>

          <form onSubmit={handleLogin} className="px-6 pb-7 space-y-4">
            {/* Username */}
            <div>
              <label className="text-white/70 font-black text-xs tracking-widest block mb-1.5">USERNAME</label>
              <input type="text" value={username} onChange={e=>setUsername(e.target.value)}
                placeholder="Masukkan username..." required
                className="w-full rounded-2xl px-4 py-3.5 font-bold text-sm outline-none placeholder:text-brown-dark/40"
                style={{backgroundColor:'rgba(255,255,255,0.2)',color:'white'}}/>
            </div>

            {/* Password */}
            <div>
              <label className="text-white/70 font-black text-xs tracking-widest block mb-1.5">PASSWORD</label>
              <div className="relative">
                <input type={showPass?'text':'password'} value={password}
                  onChange={e=>setPassword(e.target.value)}
                  placeholder="Masukkan password..." required
                  className="w-full rounded-2xl px-4 py-3.5 pr-12 font-bold text-sm outline-none"
                  style={{backgroundColor:'rgba(255,255,255,0.2)',color:'white'}}/>
                <button type="button" onClick={()=>setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors">
                  {showPass?<EyeOff size={18}/>:<Eye size={18}/>}
                </button>
              </div>
            </div>

            {/* Error */}
            {error&&(
              <div className="bg-red-900/50 border border-red-500/50 text-white text-sm font-bold rounded-2xl px-4 py-3 text-center">
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-2xl font-black text-sm tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60 shadow-xl mt-2"
              style={{backgroundColor:'var(--brown-dark)',color:'white'}}>
              {loading?(
                <span className="animate-pulse">TUNGGU SEKEJAP...</span>
              ):(
                <><LogIn size={18}/>MASUK</>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-5 font-bold tracking-wider" style={{color:'var(--orange-mid)'}}>
          KBBS © 2026
        </p>
      </div>
    </div>
  )
}
