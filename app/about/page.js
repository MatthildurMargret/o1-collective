import Image from 'next/image'
import SiteNav from '../SiteNav'
import SiteFooter from '../SiteFooter'
import ApplySection from '../ApplySection'

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
  {
    name: 'Matthildur Árnadóttir',
    tagline: 'Icelander in the US',
    detail: 'Electrical engineer and Venture Capital Investor at Montage Ventures.',
    linkedin: 'https://www.linkedin.com/in/matthildur-arnadottir/',
    photo: '/founders/matthildur.png',
    zoom: 1.35,
    offsetY: 7,
  },
]

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F4F1EB', display: 'flex', flexDirection: 'column' }}>
      <SiteNav />
      <main style={{ flex: 1 }}>
        <section style={{ padding: '48px 56px 96px' }}>
          <div style={{ maxWidth: 640 }}>
            <h1 style={{
              fontFamily: '"DM Serif Display", Georgia, serif',
              fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 400, color: '#1A1815',
              margin: '0 0 28px', lineHeight: 1.1, letterSpacing: '-0.02em',
            }}>
              About O1 Collective
            </h1>
            <p style={{ fontSize: 15, color: '#6B6760', lineHeight: 1.75, margin: '0 0 20px' }}>
              O1 Collective is an invite-only community of Europe's most ambitious founders, operators, and investors building across the United States.
            </p>
            <p style={{ fontSize: 15, color: '#6B6760', lineHeight: 1.75, margin: 0 }}>
              Our mission is to help exceptional people build generational global companies through trusted relationships, shared experiences, and a willingness to help one another succeed.
            </p>
          </div>
        </section>

        <section style={{ background: '#1A1815', padding: '100px 56px' }}>
          <div style={{ maxWidth: 680 }}>
            <span style={{ fontSize: 11, letterSpacing: '0.12em', color: '#6B6760', textTransform: 'uppercase', display: 'block', marginBottom: 32 }}>
              Our Belief
            </span>
            <p style={{
              fontFamily: '"DM Serif Display", Georgia, serif',
              fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 400, color: '#F4F1EB',
              lineHeight: 1.45, margin: 0, letterSpacing: '-0.01em',
            }}>
              The strongest founder ecosystems are built on trust. When exceptional founders, operators, and investors build lasting relationships, knowledge compounds, perspectives expand, and ambitious people help one another build enduring companies.
            </p>
          </div>
        </section>

        <section style={{ maxWidth: 1040, padding: '96px 56px 140px' }}>
          <span style={{ fontSize: 11, letterSpacing: '0.12em', color: '#A8A49C', textTransform: 'uppercase', display: 'block', marginBottom: 40 }}>
            Meet the Team
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40 }}>
          {founders.map((f) => (
            <div key={f.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ width: 88, height: 88, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                <Image src={f.photo} alt={f.name} width={88} height={88} unoptimized style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  transform: [f.zoom && `scale(${f.zoom})`, f.offsetY && `translateY(${f.offsetY}%)`].filter(Boolean).join(' ') || undefined,
                }} />
              </div>
              <div>
                <a href={f.linkedin} target="_blank" rel="noopener noreferrer" style={{
                  fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 20, color: '#1A1815',
                  margin: '0 0 6px', lineHeight: 1.2, display: 'block', textDecoration: 'none',
                }}>
                  {f.name}
                </a>
                <p style={{ fontSize: 13, color: '#6B6760', margin: '0 0 4px', lineHeight: 1.6 }}>{f.tagline}</p>
                <p style={{ fontSize: 13, color: '#6B6760', margin: 0, lineHeight: 1.6 }}>{f.detail}</p>
              </div>
            </div>
          ))}
          </div>
        </section>

        <ApplySection />
      </main>
      <SiteFooter />
    </div>
  )
}
