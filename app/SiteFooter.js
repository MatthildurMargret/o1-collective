import Link from 'next/link'

export default function SiteFooter() {
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
        <a href="mailto:community@o1-collective.com" style={{ fontSize: 14, color: '#6B6760', textDecoration: 'none' }}>
          community@o1-collective.com
        </a>
        <Link href="/about" style={{ fontSize: 14, color: '#6B6760', textDecoration: 'none' }}>
          About
        </Link>
        <Link href="/past-events" style={{ fontSize: 14, color: '#6B6760', textDecoration: 'none' }}>
          Events
        </Link>
        <Link href="/directory" style={{ fontSize: 14, color: '#6B6760', textDecoration: 'none' }}>
          Member login
        </Link>
      </div>
    </footer>
  )
}
