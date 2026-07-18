import Link from 'next/link'

export default function ApplySection() {
  return (
    <section style={{ background: '#1A1815', padding: '140px 56px' }}>
      <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', gap: 100, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 400px', maxWidth: 560 }}>
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

        <div style={{ flex: '1 1 320px', maxWidth: 380 }}>
          <p style={{ fontSize: 14, color: '#6B6760', lineHeight: 1.8, margin: '0 0 16px' }}>
            As we continue to grow, we're always on the lookout for folks who are deeply passionate about establishing the premier community for the next-generation of European leaders in the US.
          </p>
          <p style={{ fontSize: 14, color: '#6B6760', lineHeight: 1.8, margin: 0 }}>
            You can reach us at{' '}
            <a href="mailto:community@o1-collective.com" style={{ color: '#F4F1EB', textDecoration: 'underline' }}>
              community@o1-collective.com
            </a>{' '}
            or directly on our LinkedIns if you're interested in becoming more actively involved!
          </p>
        </div>
      </div>
    </section>
  )
}
