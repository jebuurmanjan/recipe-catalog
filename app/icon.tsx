import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default async function Icon() {
  const fontData = await fetch(
    'https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvUDQ.woff2'
  ).then((res) => res.arrayBuffer())

  return new ImageResponse(
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: '#D4734A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{ color: 'white', fontSize: 22, fontWeight: 700, fontFamily: 'Playfair Display', lineHeight: 1 }}>
        R
      </span>
    </div>,
    {
      ...size,
      fonts: [{ name: 'Playfair Display', data: fontData, weight: 700 }],
    }
  )
}
