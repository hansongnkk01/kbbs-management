'use client'

// Halaman login - masuk guna username & password
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, LogIn } from 'lucide-react'

// Map username ke email Supabase
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Check sama ada username wujud
    const email = USERNAME_MAP[username.toLowerCase().trim()]
    if (!email) {
      setError('Username tidak wujud.')
      setLoading(false)
      return
    }

    // Cuba login guna Supabase Auth
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError('Username atau password salah. Cuba lagi.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--bg-cream)' }}
    >
      {/* Card login */}
      <div className="w-full max-w-sm animate-slide-up">
        {/* Header logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 shadow-lg"
            style={{ backgroundColor: 'var(--orange-primary)' }}
          >
            <span className="text-white text-3xl font-black">KB</span>
          </div>
          <h1
            className="text-3xl font-black tracking-wide"
            style={{ color: 'var(--brown-dark)' }}
          >
            KBBS
          </h1>
          <p className="text-sm font-semibold mt-1" style={{ color: 'var(--brown-mid)' }}>
            MANAGEMENT SYSTEM
          </p>
        </div>

        {/* Form card */}
        <div
          className="rounded-3xl p-7 shadow-xl"
          style={{ backgroundColor: 'var(--orange-primary)' }}
        >
          <h2 className="text-white font-black text-xl mb-6 text-center tracking-wider">
            LOG IN
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <div>
              <label className="text-white font-bold text-sm mb-1 block tracking-wider">
                USERNAME
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username..."
                required
                className="w-full rounded-xl px-4 py-3 font-semibold text-sm outline-none focus:ring-2"
                  style={{
                    backgroundColor: '#FDE8C8',
                    color: 'var(--brown-dark)',
                  }}
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-white font-bold text-sm mb-1 block tracking-wider">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password..."
                  required
                  className="w-full rounded-xl px-4 py-3 pr-12 font-semibold text-sm outline-none"
                  style={{
                    backgroundColor: '#FDE8C8',
                    color: 'var(--brown-dark)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
                  style={{ color: 'var(--brown-dark)' }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-600 text-white text-sm font-semibold rounded-xl px-4 py-3 text-center">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-black text-sm tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60 mt-2"
              style={{
                backgroundColor: 'var(--brown-dark)',
                color: 'white',
              }}
            >
              {loading ? (
                <span>Tunggu sekejap...</span>
              ) : (
                <>
                  <LogIn size={18} />
                  MASUK
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-4 font-semibold" style={{ color: 'var(--brown-mid)' }}>
          KBBS © 2026
        </p>
      </div>
    </div>
  )
}
