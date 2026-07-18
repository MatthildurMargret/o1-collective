import Link from 'next/link'
import LogoStrip from './LogoStrip'
import SiteNav from './SiteNav'
import SiteFooter from './SiteFooter'
import ApplySection from './ApplySection'

// ─── sections ────────────────────────────────────────────────────────────────

function Hero() {
  const stats = [
    { value: '100+', label: 'Members' },
    { value: '25+', label: 'Countries' },
    { value: '$1B+', label: 'Raised' },
  ]

  return (
    <section style={{
      background: '#F4F1EB',
      padding: '48px 56px 80px',
    }}>
      <div style={{ maxWidth: 760 }}>
        <h1 style={{
          fontFamily: '"DM Serif Display", Georgia, serif',
          fontSize: 'clamp(52px, 7vw, 80px)',
          fontWeight: 400,
          color: '#1A1815',
          lineHeight: 1.08,
          letterSpacing: '-0.02em',
          margin: '0 0 28px',
        }}>
          European Builders.<br />
          One Trusted Network.
        </h1>
        <p style={{
          fontSize: 17,
          color: '#6B6760',
          lineHeight: 1.65,
          maxWidth: 520,
          margin: '0 0 48px',
        }}>
          Building the institution that connects Europe's most ambitious founders, operators, and investors across the United States.
        </p>

        <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap', marginBottom: 48 }}>
          {stats.map((s) => (
            <div key={s.label}>
              <p style={{
                fontFamily: '"DM Serif Display", Georgia, serif',
                fontSize: 30, fontWeight: 400, color: '#1A1815', margin: '0 0 4px',
              }}>
                {s.value}
              </p>
              <p style={{ fontSize: 12, color: '#A8A49C', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        <Link href="#membership" style={{
          display: 'inline-block', padding: '13px 28px',
          background: '#1A1815', color: '#F4F1EB',
          fontSize: 13, textDecoration: 'none', borderRadius: 4, letterSpacing: '0.01em',
        }}>
          Apply for Membership →
        </Link>
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
          lineHeight: 1.3,
          margin: '0 0 24px',
          letterSpacing: '-0.01em',
        }}>
          Building a great company is hard. You shouldn't have to do it alone.
        </p>
        <p style={{
          fontFamily: '"DM Serif Display", Georgia, serif',
          fontSize: 'clamp(24px, 3vw, 36px)',
          fontWeight: 400,
          color: '#F4F1EB',
          lineHeight: 1.45,
          margin: '0 0 40px',
          letterSpacing: '-0.01em',
        }}>
          The best opportunities come from surrounding yourself with exceptional people who challenge your thinking, share hard-earned experience, and support you throughout your journey.
        </p>
        <p style={{ fontSize: 14, color: '#6B6760', lineHeight: 1.7, margin: 0, maxWidth: 480 }}>
          That's why O1 brings together Europe's most ambitious founders, operators, and investors through curated gatherings, meaningful introductions, and a trusted community built for the long term.
        </p>
      </div>
    </section>
  )
}

function WhatWeDo() {
  const items = [
    { title: 'Curated Relationships', detail: 'Meet exceptional founders, operators, and investors who share your ambition.' },
    { title: 'Intimate Gatherings', detail: 'Private dinners, roundtables, and conversations designed for meaningful connections—not networking.' },
    { title: 'Lifelong Community', detail: 'Build relationships that compound throughout your career.' },
  ]

  return (
    <section style={{ background: '#F4F1EB', padding: '120px 56px' }}>
      <div style={{ maxWidth: 1040, margin: '0 auto' }}>
        <span style={{ fontSize: 11, letterSpacing: '0.12em', color: '#A8A49C', textTransform: 'uppercase', display: 'block', marginBottom: 48 }}>
          What We Do
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 48 }}>
          {items.map((it) => (
            <div key={it.title} style={{ borderTop: '1px solid #DDD9CF', paddingTop: 24 }}>
              <h3 style={{
                fontFamily: '"DM Serif Display", Georgia, serif',
                fontSize: 22, fontWeight: 400, color: '#1A1815', margin: '0 0 12px',
              }}>
                {it.title}
              </h3>
              <p style={{ fontSize: 14, color: '#6B6760', lineHeight: 1.7, margin: 0 }}>
                {it.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function MembershipTiers() {
  return (
    <section id="membership" style={{ background: '#F4F1EB', padding: '120px 56px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto 64px', textAlign: 'center' }}>
        <h2 style={{
          fontFamily: '"DM Serif Display", Georgia, serif',
          fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 400, color: '#1A1815',
          margin: '0 0 20px', lineHeight: 1.15,
        }}>
          Join O1 Collective
        </h2>
        <p style={{ fontSize: 14, color: '#6B6760', lineHeight: 1.75, margin: 0 }}>
          Membership is by invitation or application. We're looking for ambitious European founders, operators, and investors committed to helping one another build generational companies.
        </p>
      </div>
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

function WhoWeBringTogether() {
  const groups = [
    { title: 'Founders', detail: 'Building venture-backed technology companies.' },
    { title: 'Operators', detail: 'Scaling world-class technology businesses.' },
    { title: 'Investors', detail: 'Backing the next generation of global companies.' },
  ]

  return (
    <section style={{ background: '#EDEAE3', padding: '120px 56px' }}>
      <div style={{ maxWidth: 1040, margin: '0 auto' }}>
        <span style={{ fontSize: 11, letterSpacing: '0.12em', color: '#A8A49C', textTransform: 'uppercase', display: 'block', marginBottom: 48 }}>
          Who We Bring Together
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 48 }}>
          {groups.map((g) => (
            <div key={g.title} style={{ borderTop: '1px solid #D8D4CC', paddingTop: 24 }}>
              <h3 style={{
                fontFamily: '"DM Serif Display", Georgia, serif',
                fontSize: 24, fontWeight: 400, color: '#1A1815', margin: '0 0 12px',
              }}>
                {g.title}
              </h3>
              <p style={{ fontSize: 14, color: '#6B6760', lineHeight: 1.7, margin: 0 }}>
                {g.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


// ─── page ────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <>
      <SiteNav priority />
      <main>
        <Hero />
        <Manifesto />
        <WhatWeDo />
        <WhoWeBringTogether />
        <MembershipTiers />
        <LogoStrip />
        <ApplySection />
      </main>
      <SiteFooter />
    </>
  )
}
