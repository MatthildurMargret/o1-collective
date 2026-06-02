'use client'

import { useEffect, useLayoutEffect, useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '../../lib/supabase'

function formatEventDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return {
    month: d.toLocaleDateString('en-US', { month: 'short' }),
    day: d.getDate(),
  }
}


// ─── directory helpers ───────────────────────────────────────────────────────

function initials(name) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

const AVATAR_TONES = ['#C8BFB0', '#B8C4B8', '#C4BCC8', '#C4BEB8', '#B8C0C4']

function Avatar({ member }) {
  const [err, setErr] = useState(false)
  const tone = AVATAR_TONES[member.name.charCodeAt(0) % AVATAR_TONES.length]
  const base = { width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }
  if (member.avatar && !err) {
    return <img src={member.avatar} alt={member.name} onError={() => setErr(true)} style={{ ...base, objectFit: 'cover' }} />
  }
  return (
    <div style={{ ...base, background: tone, color: '#4A4540', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500 }}>
      {initials(member.name)}
    </div>
  )
}

function LinkedInIcon() {
  return (
    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function MemberRow({ member, isOpen, onToggle }) {
  const detailRef = useRef(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (detailRef.current) setHeight(isOpen ? detailRef.current.scrollHeight : 0)
  }, [isOpen])

  return (
    <div style={{ borderBottom: '1px solid #DDD9CF' }}>
      <button
        onClick={onToggle}
        style={{ width: '100%', background: 'none', border: 'none', padding: '18px 0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left' }}
      >
        <Avatar member={member} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 19, color: '#1A1815', lineHeight: 1.2, display: 'block' }}>
            {member.name}
          </span>
          {(member.jobTitle || member.company) && (
            <p style={{ margin: '3px 0 0', fontSize: 13, color: '#6B6760' }}>
              {[member.jobTitle, member.company].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
          {member.location && <span style={{ fontSize: 12, color: '#A8A49C' }}>{member.location}</span>}
          <svg width="14" height="14" fill="none" stroke="#C0BCB4" strokeWidth="1.5" viewBox="0 0 24 24"
            style={{ transition: 'transform 300ms ease', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      <div style={{ height, overflow: 'hidden', transition: 'height 320ms cubic-bezier(0.4,0,0.2,1)' }}>
        <div ref={detailRef}>
          <div style={{ paddingBottom: 24, paddingLeft: 58, display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              {member.description
                ? <p style={{ fontSize: 13, lineHeight: 1.7, color: '#6B6760', margin: 0 }}>{member.description}</p>
                : <p style={{ fontSize: 13, fontStyle: 'italic', color: '#C0BCB4', margin: 0 }}>Bio coming soon.</p>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0, alignItems: 'flex-end' }}>
              {member.email && (
                <a href={`mailto:${member.email}`} onClick={(e) => e.stopPropagation()}
                  style={{ fontSize: 12, color: '#A8A49C', textDecoration: 'none' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#1A1815')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#A8A49C')}>
                  {member.email}
                </a>
              )}
              {member.linkedin && (
                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#A8A49C', textDecoration: 'none' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#1A1815')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#A8A49C')}>
                  <LinkedInIcon />LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterDropdown({ allRoles, activeRoles, onToggleRole, onClear }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const hasActive = activeRoles.size > 0

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 13px', background: 'transparent', border: `1px solid ${hasActive ? '#1A1815' : '#DDD9CF'}`, borderRadius: 4, cursor: 'pointer', fontSize: 13, color: hasActive ? '#1A1815' : '#6B6760' }}
      >
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 12h10M11 20h2" />
        </svg>
        Filter
        {hasActive && (
          <span style={{ background: '#1A1815', color: '#F4F1EB', borderRadius: '50%', width: 16, height: 16, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {activeRoles.size}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: '#FDFCF9', border: '1px solid #DDD9CF', borderRadius: 6, padding: '8px 0', minWidth: 160, zIndex: 50, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          {allRoles.map((role) => {
            const checked = activeRoles.has(role)
            return (
              <button key={role} onClick={() => onToggleRole(role)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: checked ? '#1A1815' : '#6B6760', textAlign: 'left' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#F4F1EB')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}>
                <span style={{ width: 14, height: 14, border: `1.5px solid ${checked ? '#1A1815' : '#C0BCB4'}`, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: checked ? '#1A1815' : 'transparent' }}>
                  {checked && (
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="#F4F1EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                {role}
              </button>
            )
          })}
          {hasActive && (
            <>
              <div style={{ height: 1, background: '#EDE9E2', margin: '6px 0' }} />
              <button onClick={() => { onClear(); setOpen(false) }}
                style={{ width: '100%', padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#A8A49C', textAlign: 'left' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#1A1815')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#A8A49C')}>
                Clear filters
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── sidebar modules ─────────────────────────────────────────────────────────

function SidebarModule({ title, children, action, borderRef }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 10, letterSpacing: '0.1em', color: '#A8A49C', textTransform: 'uppercase', fontWeight: 500 }}>
          {title}
        </span>
        {action && (
          <button style={{ fontSize: 11, color: '#A8A49C', background: 'none', border: 'none', cursor: 'pointer', padding: 0, letterSpacing: '0.02em' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#1A1815')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#A8A49C')}>
            {action}
          </button>
        )}
      </div>
      <div ref={borderRef} style={{ borderTop: '1px solid #DDD9CF' }}>
        {children}
      </div>
    </div>
  )
}

function EventsModule({ events, borderRef }) {
  return (
    <SidebarModule title="Upcoming Events" action={<Link href="/events" style={{ fontSize: 11, color: '#A8A49C', textDecoration: 'none' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#1A1815')} onMouseLeave={(e) => (e.currentTarget.style.color = '#A8A49C')}>View all →</Link>} borderRef={borderRef}>
      {events.length === 0 ? (
        <p style={{ fontSize: 13, color: '#C0BCB4', padding: '16px 0', margin: 0 }}>No upcoming events.</p>
      ) : events.slice(0, 4).map((e) => {
        const { month, day } = formatEventDate(e.event_date)
        const href = e.link || '/events'
        const isExternal = !!e.link
        return (
          <a
            key={e.id}
            href={href}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            style={{ padding: '12px 0', borderBottom: '1px solid #EDE9E2', display: 'flex', gap: 14, alignItems: 'flex-start', cursor: 'pointer', textDecoration: 'none' }}
            onMouseEnter={(ev) => (ev.currentTarget.style.opacity = '0.6')}
            onMouseLeave={(ev) => (ev.currentTarget.style.opacity = '1')}
          >
            <div style={{ flexShrink: 0, width: 36, textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontFamily: '"DM Serif Display", Georgia, serif', color: '#1A1815', lineHeight: 1 }}>{day}</div>
              <div style={{ fontSize: 10, letterSpacing: '0.06em', color: '#A8A49C', textTransform: 'uppercase', marginTop: 2 }}>{month}</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1815' }}>{e.title}</div>
              {e.spots && (
                <div style={{ marginTop: 3 }}>
                  <span style={{ fontSize: 11, color: '#C0BCB4' }}>{e.spots}</span>
                </div>
              )}
            </div>
          </a>
        )
      })}
    </SidebarModule>
  )
}

function AdvisorsModule({ advisors }) {
  return (
    <SidebarModule title="Open to Advising">
      {advisors.length === 0 ? (
        <p style={{ fontSize: 13, color: '#C0BCB4', padding: '16px 0', margin: 0 }}>None listed yet.</p>
      ) : advisors.slice(0, 4).map((a) => (
        <div key={a.id} style={{ padding: '12px 0', borderBottom: '1px solid #EDE9E2' }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1815' }}>{a.name}</div>
          <div style={{ fontSize: 12, color: '#A8A49C', marginTop: 2 }}>{a.topic}{a.company && ` · ${a.company}`}</div>
        </div>
      ))}
    </SidebarModule>
  )
}

function JobsModule({ jobs }) {
  return (
    <SidebarModule title="Job Board">
      {jobs.length === 0 ? (
        <p style={{ fontSize: 13, color: '#C0BCB4', padding: '16px 0', margin: 0 }}>No open roles.</p>
      ) : jobs.slice(0, 4).map((j) => {
        const inner = (
          <>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1815' }}>{j.title}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 3, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#6B6760' }}>{j.company}</span>
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#C0BCB4', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#A8A49C' }}>{j.location}</span>
            </div>
          </>
        )
        return j.link ? (
          <a key={j.id} href={j.link} target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '12px 0', borderBottom: '1px solid #EDE9E2', textDecoration: 'none' }} onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.6')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
            {inner}
          </a>
        ) : (
          <div key={j.id} style={{ padding: '12px 0', borderBottom: '1px solid #EDE9E2' }}>{inner}</div>
        )
      })}
    </SidebarModule>
  )
}

// ─── page ────────────────────────────────────────────────────────────────────

export default function DirectoryPage() {
  const router = useRouter()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState([])
  const [advisors, setAdvisors] = useState([])
  const [jobs, setJobs] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }
  const [search, setSearch] = useState('')
  const [activeRoles, setActiveRoles] = useState(new Set())
  const [openId, setOpenId] = useState(null)
  const [sidebarPaddingTop, setSidebarPaddingTop] = useState(0)
  const listBorderRef = useRef(null)
  const sidebarBorderRef = useRef(null)

  // Converges in one render: measures both border lines and closes the gap
  useLayoutEffect(() => {
    if (!listBorderRef.current || !sidebarBorderRef.current) return
    const delta = Math.round(
      listBorderRef.current.getBoundingClientRect().top -
      sidebarBorderRef.current.getBoundingClientRect().top
    )
    if (delta !== 0) setSidebarPaddingTop((p) => p + delta)
  })

  useEffect(() => {
    function onResize() { setSidebarPaddingTop(0) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    fetch('/api/events').then((r) => r.json()).then((d) => { if (Array.isArray(d)) setEvents(d) }).catch(() => {})
    fetch('/api/advisors').then((r) => r.json()).then((d) => { if (Array.isArray(d)) setAdvisors(d) }).catch(() => {})
    fetch('/api/jobs').then((r) => r.json()).then((d) => { if (Array.isArray(d)) setJobs(d) }).catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/admin/me')
      .then((r) => r.json())
      .then((data) => setIsAdmin(data.isAdmin))
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/members')
      .then((r) => r.json())
      .then((data) => { setMembers(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const allRoles = useMemo(() => {
    const roles = new Set()
    members.forEach((m) => m.roles.forEach((r) => roles.add(r)))
    return Array.from(roles).sort()
  }, [members])

  function toggleRole(role) {
    setActiveRoles((prev) => {
      const next = new Set(prev)
      next.has(role) ? next.delete(role) : next.add(role)
      return next
    })
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return members.filter((m) => {
      const matchSearch = !q ||
        m.name.toLowerCase().includes(q) ||
        m.company.toLowerCase().includes(q) ||
        m.jobTitle.toLowerCase().includes(q) ||
        m.location.toLowerCase().includes(q)
      const matchRole = activeRoles.size === 0 || m.roles.some((r) => activeRoles.has(r))
      return matchSearch && matchRole
    })
  }, [members, search, activeRoles])

  return (
    <div style={{ minHeight: '100vh', background: '#F4F1EB' }}>
      <div style={{ position: 'fixed', top: 32, right: 'max(48px, calc((100vw - 1160px) / 2 + 48px))', display: 'flex', alignItems: 'center', gap: 24, zIndex: 50 }}>
        {isAdmin && (
          <Link href="/admin" style={{ fontSize: 13, color: '#A8A49C', textDecoration: 'none', letterSpacing: '0.01em' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#1A1815')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#A8A49C')}>
            Admin
          </Link>
        )}
        <button onClick={handleSignOut} style={{ fontSize: 13, color: '#6B6760', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.01em' }}>
          Sign out →
        </button>
      </div>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '80px 48px 120px', display: 'flex', gap: 120, alignItems: 'flex-start' }}>

        {/* ── Left: directory ── */}
        <div style={{ flex: '1 1 0', minWidth: 0 }}>
          <div style={{ marginBottom: 52 }}>
            <Image src="/logo_black.png" alt="O1 Collective" width={200} height={44} style={{ display: 'block' }} priority unoptimized />
            <p style={{ marginTop: 10, fontSize: 14, color: '#A8A49C', letterSpacing: '0.01em' }}>
              A private community of founders, investors &amp; operators
            </p>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <svg width="13" height="13" fill="none" stroke="#C0BCB4" strokeWidth="1.5" viewBox="0 0 24 24"
                style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search members…" value={search} onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', paddingLeft: 22, paddingRight: 8, paddingBottom: 8, paddingTop: 4, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#1A1815', boxSizing: 'border-box' }} />
            </div>
            <FilterDropdown allRoles={allRoles} activeRoles={activeRoles} onToggleRole={toggleRole} onClear={() => setActiveRoles(new Set())} />
          </div>

          <p style={{ fontSize: 10, letterSpacing: '0.08em', color: '#C0BCB4', marginBottom: 4 }}>
            {loading ? 'LOADING…' : `${filtered.length} MEMBER${filtered.length !== 1 ? 'S' : ''}${members.length !== filtered.length ? ` OF ${members.length}` : ''}`}
          </p>

          <div ref={listBorderRef} style={{ borderTop: '1px solid #DDD9CF' }}>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ borderBottom: '1px solid #DDD9CF', padding: '18px 0', display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#E8E3D8', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 15, borderRadius: 4, background: '#E8E3D8', width: 160, marginBottom: 8 }} />
                    <div style={{ height: 11, borderRadius: 4, background: '#EDE9E2', width: 240 }} />
                  </div>
                </div>
              ))
            ) : filtered.length === 0 ? (
              <p style={{ padding: '64px 0', textAlign: 'center', fontSize: 14, color: '#C0BCB4' }}>No members match your search.</p>
            ) : (
              filtered.map((member) => (
                <MemberRow key={member.id} member={member} isOpen={openId === member.id} onToggle={() => setOpenId(openId === member.id ? null : member.id)} />
              ))
            )}
          </div>
        </div>

        {/* ── Right: sidebar ── */}
        <div style={{ width: 256, flexShrink: 0, paddingTop: sidebarPaddingTop }}>
          <EventsModule events={events} borderRef={sidebarBorderRef} />
          <AdvisorsModule advisors={advisors} />
          <JobsModule jobs={jobs} />
        </div>

      </div>
    </div>
  )
}
