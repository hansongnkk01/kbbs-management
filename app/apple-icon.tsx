// Icon khas untuk iOS Apple devices
import { ImageResponse } from 'next/og'

export const size        = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width:           180,
          height:          180,
          background:      'linear-gradient(135deg, #F97316 0%, #C2500A 100%)',
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          flexDirection:   'column',
          gap:             2,
        }}
      >
        <div style={{
          color:       'white',
          fontSize:    80,
          fontWeight:  900,
          lineHeight:  1,
          fontFamily:  'sans-serif',
        }}>
          KB
        </div>
        <div style={{
          color:      'rgba(255,255,255,0.7)',
          fontSize:   20,
          fontWeight: 700,
          letterSpacing: 4,
          fontFamily: 'sans-serif',
        }}>
          BS
        </div>
      </div>
    ),
    { ...size }
  )
}
