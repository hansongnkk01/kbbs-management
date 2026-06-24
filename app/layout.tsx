// Layout utama - include PWA meta tags supaya bole install kat phone
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'KBBS Management',
  description: 'Sistem pengurusan bilik sewa KBBS',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'KBBS',
  },
}

export const viewport: Viewport = {
  themeColor:          '#F97316',
  width:               'device-width',
  initialScale:        1,
  maximumScale:        1,
  userScalable:        false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ms">
      <head>
        {/* iOS PWA - supaya full screen bila install */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="KBBS" />
      </head>
      <body style={{ backgroundColor: '#FDF6ED', margin: 0 }}>
        {children}
      </body>
    </html>
  )
}
