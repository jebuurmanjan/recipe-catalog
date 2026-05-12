import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import { join } from 'path'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  const fontData = readFileSync(join(process.cwd(), 'public/fonts/playfair-bold.woff2'))

  return new ImageResponse(
    <div
      style={{
        width: 180,
        height: 180,
        borderRadius: 40,
        background: '#D4734A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{ color: 'white', fontSize: 112, fontWeight: 700, fontFamily: 'Playfair Display', lineHeight: 1 }}>
        R
      </span>
    </div>,
    {
      ...size,
      fonts: [{ name: 'Playfair Display', data: fontData, weight: 700 }],
    }
  )
}
