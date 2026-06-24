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
          color:         'white',
          fontSize:      58,
          fontWeight:    900,
          lineHeight:    1,
          letterSpacing: -2,
          fontFamily:    'sans-serif',
        }}>
          KBBS
        </div>
      </div>
    ),
    { ...size }
  )
}
