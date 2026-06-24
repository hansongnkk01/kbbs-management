// Layout utama app - wrap semua halaman
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'KBBS Management',
  description: 'Sistem pengurusan bilik sewa KBBS',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ms">
      <body className="min-h-screen" style={{ backgroundColor: 'var(--bg-cream)' }}>
        {children}
      </body>
    </html>
  )
}
