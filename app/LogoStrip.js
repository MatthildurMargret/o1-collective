'use client'

const JSDELIVR = 'https://cdn.jsdelivr.net/npm/simple-icons@14/icons'

// Real wordmark/logotype assets — the image already contains the company name.
const wordmarks = [
  { name: 'OpenAI',            src: '/logos/openai-wordmark.svg' },
  { name: 'Anthropic',         src: '/logos/anthropic-wordmark.svg' },
  { name: 'Slack',             src: '/logos/slack-wordmark.svg' },
  { name: 'NFX',                src: '/logos/nfx.svg' },
  { name: 'CRV',                src: '/logos/crv.svg' },
  { name: 'Andreessen Horowitz', src: '/logos/a16z-wordmark.svg' },
  { name: 'Carta',              src: '/logos/carta-wordmark.svg' },
  { name: 'General Catalyst',   src: '/logos/generalcatalyst-wordmark.svg' },
  { name: 'Emergence Capital',  src: '/logos/emergencecapital-wordmark.png' },
]

// No standalone wordmark available — pair the icon mark with typed company name.
const iconsWithName = [
  { name: 'Linear',      src: `${JSDELIVR}/linear.svg` },
  { name: 'Airbyte',     src: `${JSDELIVR}/airbyte.svg` },
  { name: 'Sana',        src: '/logos/sana.svg' },
  { name: 'Valar Labs',  src: '/logos/valarlabs.png' },
  { name: 'Rillet',      src: '/logos/rillet.png' },
  { name: 'Listen Labs', src: '/logos/listenlabs.png' },
]

const items = [
  ...wordmarks.map((l) => ({ ...l, type: 'wordmark' })),
  ...iconsWithName.map((l) => ({ ...l, type: 'icon' })),
]

const track = [...items, ...items]

export default function LogoStrip() {
  return (
    <section style={{ background: '#EDEAE3', padding: '48px 0 100px', overflow: 'hidden' }}>
      <div style={{ borderTop: '1px solid #D8D4CC', paddingTop: 48 }}>
        <div style={{ maxWidth: 1040, padding: '0 56px' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.1em', color: '#B8B4AC', textTransform: 'uppercase', margin: '0 0 36px' }}>
            Members from
          </p>
        </div>
      </div>

      <div style={{ overflow: 'hidden', width: '100%', maskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)' }}>
        <div className="logo-marquee-track" style={{ display: 'flex', width: 'max-content', gap: 48, alignItems: 'center' }}>
          {track.map((l, i) =>
            l.type === 'wordmark' ? (
              <img
                key={i}
                src={l.src}
                alt={l.name}
                style={{ height: 20, width: 'auto', display: 'block', flexShrink: 0, filter: 'grayscale(1)', opacity: 0.45 }}
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            ) : (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <img
                  src={l.src}
                  alt=""
                  style={{ height: 22, width: 'auto', display: 'block', filter: 'grayscale(1)', opacity: 0.45 }}
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
                <span style={{ fontSize: 15, fontWeight: 500, color: '#A8A49C', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
                  {l.name}
                </span>
              </div>
            )
          )}
        </div>
      </div>

      <style jsx>{`
        .logo-marquee-track {
          animation: logo-marquee 32s linear infinite;
        }
        .logo-marquee-track:hover {
          animation-play-state: paused;
        }
        @keyframes logo-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )
}
