// Layout utama - PWA support supaya bole install kat phone
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'KBBS Management',
  description: 'Sistem pengurusan bilik sewa KBBS',
  appleWebApp: {
    capable:         true,
    statusBarStyle:  'black-translucent',
    title:           'KBBS',
  },
}

export const viewport: Viewport = {
  themeColor:   '#F97316',
  width:        'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ms">
      <head>
        <meta name="mobile-web-app-capable"           content="yes" />
        <meta name="apple-mobile-web-app-capable"     content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title"       content="KBBS" />
        <link rel="manifest"                          href="/manifest.webmanifest" />
      </head>
      <body style={{ backgroundColor: '#FDF6ED', margin: 0 }}>
        {children}

        {/* Daftar Service Worker untuk PWA standalone mode */}
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js')
                .then(function(reg) { console.log('SW registered'); })
                .catch(function(err) { console.log('SW failed:', err); });
            });
          }
        `}} />
      </body>
    </html>
  )
}
