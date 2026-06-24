// Icon app yang dijana secara automatik oleh Next.js
import { ImageResponse } from 'next/og'

export const size      = { width: 512, height: 512 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width:           512,
          height:          512,
          background:      'linear-gradient(135deg, #F97316 0%, #C2500A 100%)',
          borderRadius:    80,
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          flexDirection:   'column',
          gap:             4,
        }}
      >
        <div style={{
          color:         'white',
          fontSize:      170,
          fontWeight:    900,
          lineHeight:    1,
          letterSpacing: -6,
          fontFamily:    'sans-serif',
        }}>
          KBBS
        </div>
        <div style={{
          color:         'rgba(255,255,255,0.75)',
          fontSize:      60,
          fontWeight:    600,
          letterSpacing: 18,
          fontFamily:    'sans-serif',
          marginTop:     8,
        }}>
          ADMIN
        </div>
      </div>
    ),
    { ...size }
  )
}
