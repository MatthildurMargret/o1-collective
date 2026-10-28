'use client'

// Real wordmark/logotype assets — the image already contains the company name.
const wordmarks = [
  { name: 'NFX',                 src: '/logos/nfx.svg' },
  // Circular badge mark with "crv" lettering inside — needs extra height for the lettering to read.
  { name: 'CRV',                 src: '/logos/crv.svg', h: 34 },
  // Two-line stacked wordmark — needs extra height so each line matches the others' scale.
  { name: 'Andreessen Horowitz', src: '/logos/a16z-wordmark.svg', h: 36 },
  { name: 'Starcloud',           src: '/logos/starcloud.png' },
  { name: 'Radical Health',      src: '/logos/radicalhealth.svg' },
  { name: 'ClassDojo',           src: '/logos/classdojo.svg' },
  { name: 'Alaris Security',     src: '/logos/alarissecurity.svg' },
  { name: 'Crosslink',           src: '/logos/crosslinkcapital.svg' },
  // Two-line stacked wordmark — needs extra height so each line matches the others' scale.
  { name: 'Montage Ventures',    src: '/logos/montageventures.svg', h: 36 },
  { name: 'Creandum',            src: '/logos/creandum.svg' },
  { name: 'Meta',                src: '/logos/meta.svg' },
  { name: 'OnMe',                src: '/logos/onme.svg' },
  { name: 'Mercury',             src: '/logos/mercury-v3.png' },
  { name: 'Legora',              src: '/logos/legora.svg' },
  { name: 'Lumos',               src: '/logos/lumos.svg' },
  { name: 'Uncork Capital',      src: '/logos/uncorkcapital.png' },
]

// No standalone wordmark available — pair the icon mark with typed company name.
const iconsWithName = [
  { name: 'Clera',       src: '/logos/clera.png' },
  { name: 'Nexxa.ai',    src: '/logos/nexxa.png' },
]

const items = [
  ...wordmarks.map((l) => ({ ...l, type: 'wordmark' })),
  ...iconsWithName.map((l) => ({ ...l, type: 'icon' })),
]

const track = [...items, ...items]

export default function LogoStrip() {
  return (
    <section style={{ background: '#EDEAE3', padding: '48px 0 100px', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1040, padding: '0 var(--px)' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.1em', color: '#B8B4AC', textTransform: 'uppercase', margin: '0 0 36px' }}>
          Members from
        </p>
      </div>

      <div style={{ overflow: 'hidden', width: '100%', maskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)' }}>
        <div className="logo-marquee-track" style={{ display: 'flex', width: 'max-content', gap: 80, alignItems: 'center' }}>
          {track.map((l, i) =>
            l.type === 'wordmark' ? (
              <img
                key={i}
                src={l.src}
                alt={l.name}
                style={{ height: l.h || 20, width: 'auto', display: 'block', flexShrink: 0, filter: 'grayscale(1)', opacity: 0.45 }}
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
          animation: logo-marquee 55s linear infinite;
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
