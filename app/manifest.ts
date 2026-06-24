// Web App Manifest - supaya bole install kat phone
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KBBS Management',
    short_name: 'KBBS',
    description: 'Sistem pengurusan bilik sewa KBBS',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#FDF6ED',
    theme_color: '#F97316',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
