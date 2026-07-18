'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

function formatDateParts(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return {
    month: d.toLocaleDateString('en-US', { month: 'short' }),
    day: d.getDate(),
    weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
    full: d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
  }
}

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/events')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setEvents(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#F4F1EB' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '32px 56px' }}>
        <Link href="/directory" style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 18, color: '#1A1815', letterSpacing: '-0.01em', textDecoration: 'none' }}>
          O1 Collective
        </Link>
        <Link href="/directory" style={{ fontSize: 14, color: '#A8A49C', textDecoration: 'none' }}>
          ← Directory
        </Link>
      </nav>

      <main style={{ maxWidth: 640, margin: '0 auto', padding: '48px 48px 120px' }}>
        <div style={{ marginBottom: 52 }}>
          <h1 style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 48, fontWeight: 400, color: '#1A1815', margin: 0, lineHeight: 1.1 }}>
            Upcoming events
          </h1>
          <p style={{ marginTop: 10, fontSize: 14, color: '#A8A49C' }}>
            Dinners, mixers, and gatherings for O1 members.
          </p>
        </div>

        <div style={{ borderTop: '1px solid #DDD9CF' }}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ padding: '24px 0', borderBottom: '1px solid #EDE9E2', display: 'flex', gap: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: 4, background: '#E8E3D8', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 16, background: '#E8E3D8', borderRadius: 4, width: 200, marginBottom: 10 }} />
                  <div style={{ height: 12, background: '#EDE9E2', borderRadius: 4, width: 140 }} />
                </div>
              </div>
            ))
          ) : events.length === 0 ? (
            <p style={{ padding: '48px 0', fontSize: 14, color: '#A8A49C' }}>No upcoming events at the moment.</p>
          ) : events.map((event) => {
            const { month, day, weekday, full } = formatDateParts(event.event_date)
            return (
              <div key={event.id} style={{ padding: '24px 0', borderBottom: '1px solid #EDE9E2', display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0, width: 48, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontFamily: '"DM Serif Display", Georgia, serif', color: '#1A1815', lineHeight: 1 }}>{day}</div>
                  <div style={{ fontSize: 10, letterSpacing: '0.06em', color: '#A8A49C', textTransform: 'uppercase', marginTop: 3 }}>{month}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontFamily: '"DM Serif Display", Georgia, serif', color: '#1A1815', marginBottom: 6 }}>{event.title}</div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, color: '#6B6760' }}>{full}</span>
                    <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#C0BCB4', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: '#6B6760' }}>{event.location}</span>
                    {event.spots && (
                      <>
                        <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#C0BCB4', flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: '#A8A49C' }}>{event.spots}</span>
                      </>
                    )}
                  </div>
                  {event.link && (
                    <a
                      href={event.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-block', marginTop: 12, fontSize: 12, color: '#1A1815', textDecoration: 'underline', textUnderlineOffset: 3 }}
                    >
                      View event →
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
