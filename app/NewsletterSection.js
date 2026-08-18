import GrainOverlay from './GrainOverlay'

export default function NewsletterSection({ background = '#1A1815', line = '#3D3A34', inset = false }) {
  const box = (
    <div style={{
      position: 'relative', overflow: 'hidden', background,
      borderRadius: inset ? 12 : 0,
      padding: inset ? '48px 40px' : '56px 56px',
    }}>
      <GrainOverlay />
      <div style={{ position: 'relative', maxWidth: 440, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{
          fontFamily: '"DM Serif Display", Georgia, serif',
          fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 400, color: '#F4F1EB',
          margin: '0 0 24px', lineHeight: 1.15,
        }}>
          Stay in the loop
        </h2>
        <form
          action="https://o1collectivehq.substack.com/api/v1/free"
          method="post"
          target="_blank"
          style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <input
            type="email"
            name="email"
            required
            placeholder="you@email.com"
            style={{
              flex: '1 1 220px', maxWidth: 260,
              background: 'transparent', border: 'none', borderBottom: `1px solid ${line}`,
              padding: '8px 4px', fontSize: 14, color: '#F4F1EB', outline: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '10px 20px', background: 'transparent', color: '#F4F1EB',
              fontSize: 13, border: `1px solid ${line}`, borderRadius: 4, letterSpacing: '0.01em', cursor: 'pointer',
            }}
          >
            Subscribe →
          </button>
        </form>
      </div>
    </div>
  )

  if (!inset) {
    return <section>{box}</section>
  }

  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: '#1A1815', padding: '48px 56px' }}>
      <GrainOverlay />
      <div style={{ position: 'relative', maxWidth: 1040, margin: '0 auto' }}>{box}</div>
    </section>
  )
}
