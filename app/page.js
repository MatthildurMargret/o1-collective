import Image from 'next/image'
import Link from 'next/link'
import LogoStrip from './LogoStrip'

// ─── nav ─────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '32px 56px',
    }}>
      <Image src="/logo_black.png" alt="O1 Collective" width={180} height={40} style={{ display: 'block' }} priority unoptimized />
      <Link href="/directory" style={{ fontSize: 13, color: '#6B6760', textDecoration: 'none', letterSpacing: '0.01em' }}>
        Member login →
      </Link>
    </nav>
  )
}

// ─── sections ────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section style={{
      background: '#F4F1EB',
      padding: '48px 56px 80px',
    }}>
      <div style={{ maxWidth: 800 }}>
        <h1 style={{
          fontFamily: '"DM Serif Display", Georgia, serif',
          fontSize: 'clamp(52px, 7vw, 88px)',
          fontWeight: 400,
          color: '#1A1815',
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          margin: '0 0 40px',
        }}>
          A private circle for<br />
          Europeans building<br />
          the next chapter of tech.
        </h1>
      </div>
    </section>
  )
}

function Manifesto() {
  return (
    <section style={{
      background: '#1A1815',
      padding: '120px 56px',
    }}>
      <div style={{ maxWidth: 680 }}>
        <p style={{
          fontFamily: '"DM Serif Display", Georgia, serif',
          fontSize: 'clamp(24px, 3vw, 36px)',
          fontWeight: 400,
          color: '#F4F1EB',
          lineHeight: 1.45,
          margin: '0 0 40px',
          letterSpacing: '-0.01em',
        }}>
          We provide the network and infrastructure for Europe's most ambitious founders to scale faster, surrounded by those who have already navigated the path.
        </p>
        <p style={{ fontSize: 14, color: '#6B6760', lineHeight: 1.7, margin: 0, maxWidth: 480 }}>
          O1 Collective is a private network for European founders, investors, and operators building the future from Silicon Valley. A community designed for those who value signal over noise, providing a vetted environment for the valley's most impactful European voices.
        </p>
      </div>
    </section>
  )
}

function MembershipTiers() {
  return (
    <section style={{ background: '#F4F1EB', padding: '120px 56px' }}>
      <div style={{ maxWidth: 1040, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>

        {/* Founder Circle */}
        <div style={{
          background: '#1A1815',
          padding: '56px 48px',
          display: 'flex', flexDirection: 'column',
        }}>
          <span style={{ fontSize: 11, letterSpacing: '0.12em', color: '#6B6760', textTransform: 'uppercase', display: 'block', marginBottom: 32 }}>
            Founder Circle
          </span>
          <h3 style={{
            fontFamily: '"DM Serif Display", Georgia, serif',
            fontSize: 32, fontWeight: 400, color: '#F4F1EB',
            margin: '0 0 20px', lineHeight: 1.15,
          }}>
            A curated cohort for<br />ambitious founders.
          </h3>
          <p style={{ fontSize: 14, color: '#6B6760', lineHeight: 1.75, margin: '0 0 40px' }}>
            A high-conviction, invitation-reviewed circle. Small by design. High-trust by default.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 48 }}>
            {[
              { label: 'Service provider discounts', detail: 'Pebble, Deel, OpenAI credits, immigration lawyers' },
              { label: 'First priority access', detail: 'All events, dinners, and curated programming' },
              { label: 'Advisor & mentor network', detail: 'Exclusive introductions to seasoned operators and investors' },
            ].map((b) => (
              <div key={b.label} style={{ borderTop: '1px solid #2C2A27', paddingTop: 20 }}>
                <p style={{ fontSize: 13, color: '#F4F1EB', margin: '0 0 4px', letterSpacing: '0.01em' }}>{b.label}</p>
                <p style={{ fontSize: 12, color: '#6B6760', margin: 0, lineHeight: 1.6 }}>{b.detail}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 'auto' }}>
            <Link href="/apply/founder" style={{
              display: 'inline-block', padding: '12px 24px',
              border: '1px solid #3D3A34', color: '#F4F1EB',
              fontSize: 13, textDecoration: 'none', borderRadius: 4, letterSpacing: '0.01em',
            }}>
              Apply for Founder Circle →
            </Link>
          </div>
        </div>

        {/* General Membership */}
        <div style={{
          background: '#EDEAE3',
          padding: '56px 48px',
          display: 'flex', flexDirection: 'column',
        }}>
          <span style={{ fontSize: 11, letterSpacing: '0.12em', color: '#A8A49C', textTransform: 'uppercase', display: 'block', marginBottom: 32 }}>
            General Membership
          </span>
          <h3 style={{
            fontFamily: '"DM Serif Display", Georgia, serif',
            fontSize: 32, fontWeight: 400, color: '#1A1815',
            margin: '0 0 20px', lineHeight: 1.15,
          }}>
            The broader European<br />ecosystem in the Valley.
          </h3>
          <p style={{ fontSize: 14, color: '#6B6760', lineHeight: 1.75, margin: '0 0 40px' }}>
            For operators, investors, and others who are part of the European tech community across the US.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 48 }}>
            {[
              { label: 'Community access', detail: 'Curated communications and member directory' },
              { label: 'Events & programming', detail: 'Dinners, meetups, and talks across SF and New York' },
              { label: 'Network of peers', detail: 'European founders, investors, and operators in the US' },
            ].map((b) => (
              <div key={b.label} style={{ borderTop: '1px solid #DDD9CF', paddingTop: 20 }}>
                <p style={{ fontSize: 13, color: '#1A1815', margin: '0 0 4px', letterSpacing: '0.01em' }}>{b.label}</p>
                <p style={{ fontSize: 12, color: '#A8A49C', margin: 0, lineHeight: 1.6 }}>{b.detail}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 'auto' }}>
            <Link href="/apply/general" style={{
              display: 'inline-block', padding: '12px 24px',
              background: '#1A1815', color: '#F4F1EB',
              fontSize: 13, textDecoration: 'none', borderRadius: 4, letterSpacing: '0.01em',
            }}>
              Join as a Member →
            </Link>
          </div>
        </div>

      </div>
    </section>
  )
}

function WhoIsIt() {
  const roles = ['Founders', 'General Partners', 'Operators', 'Angels', 'CEOs']

  return (
    <section style={{ background: '#EDEAE3', padding: '120px 56px' }}>
      <div style={{ maxWidth: 1040, display: 'flex', gap: 120, alignItems: 'flex-start' }}>
        <div style={{ flex: '0 0 auto' }}>
          <p style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 42, fontWeight: 400, color: '#1A1815', margin: 0, lineHeight: 1.1 }}>
            $1B+ raised<br />by our members.
          </p>
        </div>
        <div style={{ flex: 1, paddingTop: 4 }}>
          <p style={{ fontSize: 14, color: '#6B6760', lineHeight: 1.75, margin: '0 0 40px', maxWidth: 440 }}>
            Every member is European-born and US-based, working at the frontier of technology. We review applications carefully and keep the community deliberately small.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 24px' }}>
            {roles.map((r) => (
              <span key={r} style={{ fontSize: 13, color: '#A8A49C', borderBottom: '1px solid #C0BCB4', paddingBottom: 2 }}>
                {r}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Founders() {
  return (
    <section style={{ background: '#F4F1EB', padding: '120px 56px', borderTop: '1px solid #DDD9CF' }}>
      <div style={{ maxWidth: 1040 }}>
        <p style={{ fontSize: 11, letterSpacing: '0.1em', color: '#A8A49C', textTransform: 'uppercase', margin: '0 0 48px' }}>
          Founded by
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, maxWidth: 720 }}>
          {[
            { name: 'Valerie Osband Mahoney', role: 'Partner, NFX' },
            { name: 'Tobias Nilsson-Roos', role: 'Partner, Crosslink Capital' },
          ].map((f) => (
            <div key={f.name}>
              <p style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 22, color: '#1A1815', margin: '0 0 6px', lineHeight: 1.2 }}>
                {f.name}
              </p>
              <p style={{ fontSize: 13, color: '#6B6760', margin: 0 }}>{f.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Apply() {
  return (
    <section style={{ background: '#1A1815', padding: '140px 56px' }}>
      <div style={{ maxWidth: 800 }}>
        <h2 style={{
          fontFamily: '"DM Serif Display", Georgia, serif',
          fontSize: 'clamp(36px, 5vw, 56px)',
          fontWeight: 400, color: '#F4F1EB',
          lineHeight: 1.1, margin: '0 0 24px',
          letterSpacing: '-0.02em',
        }}>
          Applications are open.
        </h2>
        <p style={{ fontSize: 14, color: '#6B6760', lineHeight: 1.7, margin: '0 0 56px', maxWidth: 400 }}>
          We review each application personally and respond within two weeks.
        </p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <Link href="/apply/founder" style={{
              display: 'inline-block', padding: '13px 28px',
              border: '1px solid #3D3A34', color: '#F4F1EB',
              fontSize: 13, textDecoration: 'none', borderRadius: 4, letterSpacing: '0.01em',
            }}>
              Apply for Founder Circle →
            </Link>
            <p style={{ fontSize: 11, color: '#3D3A34', margin: '10px 0 0', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Curated cohort
            </p>
          </div>
          <div>
            <Link href="/apply/general" style={{
              display: 'inline-block', padding: '13px 28px',
              background: '#2C2A27', color: '#A8A49C',
              fontSize: 13, textDecoration: 'none', borderRadius: 4, letterSpacing: '0.01em',
            }}>
              Join as a Member →
            </Link>
            <p style={{ fontSize: 11, color: '#3D3A34', margin: '10px 0 0', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              General membership
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

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
        <Link href="/directory" style={{ fontSize: 12, color: '#6B6760', textDecoration: 'none' }}>
          Member login
        </Link>
      </div>
    </footer>
  )
}

// ─── page ────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Manifesto />
        <MembershipTiers />
        <WhoIsIt />
        <LogoStrip />
        <Founders />
        <Apply />
      </main>
      <Footer />
    </>
  )
}
