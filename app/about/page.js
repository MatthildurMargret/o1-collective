import Image from 'next/image'
import Link from 'next/link'
import SiteNav from '../SiteNav'

function Footer() {
  return (
    <footer style={{
      background: '#1A1815', borderTop: '1px solid #2C2A27',
      padding: '40px 56px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
    }}>
      <span style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 16, color: '#3D3A34' }}>
        O1 Collective
      </span>
      <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
        <a href="mailto:community@o1-collective.com" style={{ fontSize: 12, color: '#6B6760', textDecoration: 'none' }}>
          community@o1-collective.com
        </a>
        <Link href="/" style={{ fontSize: 12, color: '#6B6760', textDecoration: 'none' }}>
          Home
        </Link>
      </div>
    </footer>
  )
}

const founders = [
  {
    name: 'Valerie Osband Mahoney',
    tagline: 'Brit in the US',
    detail: 'Experienced tech operator turned Venture Capital Investor at NFX.',
    linkedin: 'https://www.linkedin.com/in/valerie-osband-mahoney-40372669/',
    photo: '/founders/valerie.png',
  },
  {
    name: 'Tobias Nilsson-Roos',
    tagline: 'Swede in the US',
    detail: 'Former banker and operator, now Venture Capital Investor at Crosslink Capital.',
    linkedin: 'https://www.linkedin.com/in/tobiasnilssonroos/',
    photo: '/founders/tobias.jpeg',
  },
]

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F4F1EB', display: 'flex', flexDirection: 'column' }}>
      <SiteNav />
      <main style={{ flex: 1, maxWidth: 1040, padding: '48px 56px 140px' }}>
        <div style={{ maxWidth: 640, marginBottom: 48 }}>
          <p style={{ fontSize: 14, color: '#6B6760', lineHeight: 1.7, margin: '0 0 20px' }}>
            O1 Collective was founded by two Europeans in the US, who came together over a shared realization that Europeans face unique challenges when building companies, establishing community, and scaling their careers in the States.
          </p>
          <p style={{ fontSize: 14, color: '#6B6760', lineHeight: 1.7, margin: 0 }}>
            O1 Collective is the community we wish we had when we first arrived.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, maxWidth: 720 }}>
          {founders.map((f) => (
            <div key={f.name} style={{ display: 'flex', gap: 22, alignItems: 'center' }}>
              <Image src={f.photo} alt={f.name} width={88} height={88} unoptimized style={{
                width: 88, height: 88, borderRadius: '50%', flexShrink: 0, objectFit: 'cover',
              }} />
              <div style={{ width: 200 }}>
                <a href={f.linkedin} target="_blank" rel="noopener noreferrer" style={{
                  fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 20, color: '#1A1815',
                  margin: '0 0 6px', lineHeight: 1.2, minHeight: 48, display: 'block', textDecoration: 'none',
                }}>
                  {f.name}
                </a>
                <p style={{ fontSize: 13, color: '#6B6760', margin: '0 0 4px', lineHeight: 1.6 }}>{f.tagline}</p>
                <p style={{ fontSize: 13, color: '#6B6760', margin: 0, lineHeight: 1.6 }}>{f.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
