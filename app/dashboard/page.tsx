// Halaman dashboard - server component untuk check auth dulu
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Ambil info user yang login
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Kalau belum login, halau pergi login page
  if (!user) {
    redirect('/login')
  }

  // Ambil username dari email (cth: koolin@kbbs.local → koolin)
  const username = user.email?.split('@')[0] ?? 'Admin'

  return <DashboardClient username={username} />
}
