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
          color:       'white',
          fontSize:    220,
          fontWeight:  900,
          lineHeight:  1,
          letterSpacing: -8,
          fontFamily:  'sans-serif',
        }}>
          KB
        </div>
        <div style={{
          color:      'rgba(255,255,255,0.7)',
          fontSize:   54,
          fontWeight: 700,
          letterSpacing: 10,
          fontFamily: 'sans-serif',
        }}>
          BS
        </div>
      </div>
    ),
    { ...size }
  )
}
