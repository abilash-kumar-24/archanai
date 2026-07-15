import { ImageResponse } from "next/og"

export const alt = "Archanai — Book Trusted Priests Online"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #fdf8f0 0%, #fbe9d5 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 96 }}>🕉️</div>
        <div
          style={{
            fontSize: 76,
            fontWeight: 600,
            color: "#8a3a10",
            marginTop: 16,
          }}
        >
          Archanai
        </div>
        <div style={{ fontSize: 32, color: "#7a5a3a", marginTop: 12 }}>
          Book a trusted priest for every ceremony
        </div>
      </div>
    ),
    { ...size }
  )
}
