'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/past-events', label: 'Events' },
]

export default function SiteNav({ priority = false }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px var(--px)' }}>
      <Link href="/" style={{ display: 'block' }}>
        <Image className="nav-logo" src="/logo_black.png" alt="O1 Collective" width={180} height={40} priority={priority} unoptimized />
      </Link>

      <button
        className="nav-toggle"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        style={{ background: 'none', border: 'none', padding: 8, margin: '-8px', cursor: 'pointer' }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          {open ? (
            <path d="M4 4l12 12M16 4L4 16" stroke="#1A1815" strokeWidth="1.4" strokeLinecap="round" />
          ) : (
            <path d="M3 6h14M3 10h14M3 14h14" stroke="#1A1815" strokeWidth="1.4" strokeLinecap="round" />
          )}
        </svg>
      </button>

      <div className={`site-nav-links${open ? ' nav-open' : ''}`}>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{ fontSize: 14, color: pathname === link.href ? '#A8A49C' : '#6B6760', textDecoration: 'none', letterSpacing: '0.01em' }}
          >
            {link.label}
          </Link>
        ))}
        <Link href="/directory" style={{ fontSize: 14, color: '#6B6760', textDecoration: 'none', letterSpacing: '0.01em' }}>
          Member login →
        </Link>
      </div>
    </nav>
  )
}
