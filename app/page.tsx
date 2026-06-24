// Halaman utama - redirect terus ke dashboard
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/dashboard')
}
