import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'SPECTER-LINK — Browser-native Peer-to-Peer Communication';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const [orbitronData, monoData] = await Promise.all([
    fetchGoogleFont('Orbitron', 700),
    fetchGoogleFont('JetBrains+Mono', 400),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          backgroundImage: 'linear-gradient(135deg, #050505 0%, #0d1117 100%)',
          fontFamily: '"JetBrains Mono"',
          position: 'relative',
          padding: '60px',
        }}
      >
        {/* Corner accents */}
        <div style={{ position: 'absolute', top: 32, left: 32, width: 48, height: 48, borderTop: '1px solid rgba(0,243,255,0.4)', borderLeft: '1px solid rgba(0,243,255,0.4)', display: 'flex' }} />
        <div style={{ position: 'absolute', top: 32, right: 32, width: 48, height: 48, borderTop: '1px solid rgba(0,243,255,0.4)', borderRight: '1px solid rgba(0,243,255,0.4)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: 32, left: 32, width: 48, height: 48, borderBottom: '1px solid rgba(0,243,255,0.4)', borderLeft: '1px solid rgba(0,243,255,0.4)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: 32, right: 32, width: 48, height: 48, borderBottom: '1px solid rgba(0,243,255,0.4)', borderRight: '1px solid rgba(0,243,255,0.4)', display: 'flex' }} />

        {/* P2P diagram */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '48px' }}>
          {/* Peer A */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              backgroundColor: '#0a0a0a',
              border: '1.5px solid #00f3ff',
              boxShadow: '0 0 28px rgba(0,243,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 32, height: 24, border: '1.5px solid rgba(0,243,255,0.8)', borderRadius: '3px', display: 'flex' }} />
            </div>
            <span style={{ color: 'rgba(0,243,255,0.6)', fontSize: 13, letterSpacing: '0.12em', marginTop: 10 }}>Peer A</span>
          </div>

          {/* Connection lines */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 32, marginRight: 32, marginBottom: 22 }}>
            <div style={{ width: 260, height: 1, backgroundImage: 'linear-gradient(to right, rgba(0,243,255,0.15), #00f3ff, rgba(0,243,255,0.15))', display: 'flex' }} />
            <div style={{ width: 260, height: 1, backgroundColor: 'rgba(0,243,255,0.08)', marginTop: 7, display: 'flex' }} />
            <div style={{ width: 260, height: 1, backgroundColor: 'rgba(0,243,255,0.08)', marginTop: 7, display: 'flex' }} />
          </div>

          {/* Peer B */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              backgroundColor: '#0a0a0a',
              border: '1.5px solid #00f3ff',
              boxShadow: '0 0 28px rgba(0,243,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 32, height: 24, border: '1.5px solid rgba(0,243,255,0.8)', borderRadius: '3px', display: 'flex' }} />
            </div>
            <span style={{ color: 'rgba(0,243,255,0.6)', fontSize: 13, letterSpacing: '0.12em', marginTop: 10 }}>Peer B</span>
          </div>
        </div>

        {/* Title */}
        <span style={{
          fontFamily: '"Orbitron"',
          fontSize: 88,
          fontWeight: 700,
          color: '#00f3ff',
          letterSpacing: '2px',
          marginBottom: 18,
        }}>
          SPECTER-LINK
        </span>

        {/* Tagline */}
        <span style={{
          fontSize: 14,
          color: 'rgba(0,243,255,0.4)',
          letterSpacing: '5px',
          textTransform: 'uppercase',
          marginBottom: 40,
        }}>
          Browser-Native  ·  Peer-to-Peer  ·  No Accounts
        </span>

        {/* Feature pills */}
        <div style={{ display: 'flex' }}>
          {(['video', 'audio', 'screen share', 'chat'] as const).map((label, i) => (
            <div
              key={label}
              style={{
                padding: '7px 18px',
                backgroundColor: '#0d1117',
                border: '1px solid #1a1a1a',
                color: 'rgba(0,243,255,0.5)',
                fontSize: 11,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                display: 'flex',
                marginLeft: i > 0 ? 10 : 0,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Orbitron', data: orbitronData, weight: 700, style: 'normal' },
        { name: 'JetBrains Mono', data: monoData, weight: 400, style: 'normal' },
      ],
    },
  );
}

async function fetchGoogleFont(family: string, weight: number): Promise<ArrayBuffer> {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&display=swap`,
    {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    },
  ).then((r) => r.text());

  const url = css.match(/src: url\((.+?)\) format/)?.[1];
  if (!url) throw new Error(`Font URL not found for ${family}`);
  return fetch(url).then((r) => r.arrayBuffer());
}
