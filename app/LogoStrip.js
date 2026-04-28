'use client'

const JSDELIVR = 'https://cdn.jsdelivr.net/npm/simple-icons@14/icons'

const logos = [
  { type: 'icon',  name: 'OpenAI',           src: `${JSDELIVR}/openai.svg` },
  { type: 'icon',  name: 'Anthropic',         src: `${JSDELIVR}/anthropic.svg` },
  { type: 'icon',  name: 'Slack',             src: `${JSDELIVR}/slack.svg` },
  { type: 'icon',  name: 'Linear',            src: `${JSDELIVR}/linear.svg` },
  { type: 'icon',  name: 'NFX',               src: '/logos/nfx.svg' },
  { type: 'icon',  name: 'CRV',               src: '/logos/crv.svg' },
  { type: 'icon',  name: 'Sana',              src: '/logos/sana.svg' },
]

export default function LogoStrip() {
  return (
    <section style={{ background: '#EDEAE3', padding: '0 56px 100px' }}>
      <div style={{ maxWidth: 1040, borderTop: '1px solid #D8D4CC', paddingTop: 48 }}>
        <p style={{ fontSize: 11, letterSpacing: '0.1em', color: '#B8B4AC', textTransform: 'uppercase', margin: '0 0 36px' }}>
          Members from
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px 48px' }}>
          {logos.map((l) => (
            <img
              key={l.name}
              src={l.src}
              alt={l.name}
              style={{ height: 20, width: 'auto', display: 'block', filter: 'grayscale(1)', opacity: 0.4 }}
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
