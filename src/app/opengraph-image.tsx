import { ImageResponse } from 'next/og';

export const alt = 'TranzLife Biosciences – Innovating Life Beyond Limits';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: '#163323',
          color: '#F2F4E8',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <svg width="96" height="96" viewBox="0 0 64 64">
            <path d="M32 47 C27 40 22.5 39 19 39 A8 8 0 0 0 19 55 C22.5 55 27 54 32 47" stroke="#3F9A59" strokeWidth="4" fill="none" />
            <path d="M32 47 C37 54 41.5 55 45 55 A8 8 0 0 0 45 39 C41.5 39 37 40 32 47" stroke="#C49A3C" strokeWidth="4" fill="none" />
            <path d="M32 47 V20" stroke="#F2F4E8" strokeWidth="3" />
            <circle cx="32" cy="14" r="7" fill="#3F9A59" />
            <circle cx="24.5" cy="19" r="6" fill="#3F9A59" />
            <circle cx="39.5" cy="19" r="6" fill="#3F9A59" />
            <circle cx="41" cy="13" r="2.6" fill="#C49A3C" />
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 44, fontFamily: 'serif' }}>TranzLife</div>
            <div style={{ fontSize: 16, letterSpacing: 8, color: '#C49A3C' }}>BIOSCIENCES</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: 96, lineHeight: 1, letterSpacing: -3 }}>Innovating life beyond limits.</div>
          <div style={{ fontSize: 32, color: '#E2C784' }}>From the roots of Nature to the infinity of Science.</div>
        </div>
      </div>
    ),
    size
  );
}
