'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/past-events', label: 'Events' },
]

export default function SiteNav({ priority = false }) {
  const pathname = usePathname()

  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '32px 56px' }}>
      <Link href="/" style={{ display: 'block' }}>
        <Image src="/logo_black.png" alt="O1 Collective" width={180} height={40} style={{ display: 'block' }} priority={priority} unoptimized />
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{ fontSize: 13, color: pathname === link.href ? '#A8A49C' : '#6B6760', textDecoration: 'none', letterSpacing: '0.01em' }}
          >
            {link.label}
          </Link>
        ))}
        <Link href="/directory" style={{ fontSize: 13, color: '#6B6760', textDecoration: 'none', letterSpacing: '0.01em' }}>
          Member login →
        </Link>
      </div>
    </nav>
  )
}
