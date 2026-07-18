import Link from 'next/link'
import { getUpcomingEvents } from '../../lib/events'
import SiteNav from '../SiteNav'
import SiteFooter from '../SiteFooter'

const pastEvents = [
  {
    title: 'A Euro Midsommar Party',
    month: 'JUN',
    day: 17,
    date: 'Wednesday, June 17, 2026',
    time: '5:00 PM – 9:00 PM',
    collaboration: null,
    description: 'A Midsommar gathering for the best Euro founders, builders, and investors shaping the next generation of innovation in SF — drinks, music, and good people. With kind sponsorship from Mercury and NFX.',
    photos: [],
  },
  {
    title: 'Breaking Bread: Investor Edition',
    month: 'APR',
    day: 28,
    date: 'Tuesday, April 28, 2026',
    time: '6:30 PM – 9:30 PM',
    collaboration: null,
    description: 'An intimate, invite-only dinner with a small group of European investors — kept small and intentional by design.',
    photos: [],
  },
  {
    title: 'Euro Xmas in SF',
    month: 'DEC',
    day: 17,
    date: 'Wednesday, December 17, 2025',
    time: '5:30 PM – 8:00 PM',
    collaboration: null,
    description: 'A festive Christmas gathering bringing together the best and brightest European operators and founders in SF — drinks, snacks, and good company, made possible by our friends at Silicon Valley Bank.',
    photos: [],
  },
  {
    title: 'Building Without Borders: A Fireside Chat with the Founders of ClassDojo and Craft',
    month: 'SEP',
    day: 23,
    date: 'Tuesday, September 23, 2025',
    time: '5:30 PM – 8:00 PM',
    collaboration: 'Uncork Capital',
    description: 'A fireside chat with Sam Chaudhary (Co-Founder & CEO, ClassDojo) and Ilya Levtov (Co-Founder & CEO, Craft) on building and scaling companies in the U.S. as European founders, moderated by Andy McLoughlin (Uncork Capital).',
    photos: [],
  },
  {
    title: "Silicon Valley Decoded: The Insider's Playbook for International Founders",
    month: 'MAY',
    day: 19,
    date: 'Monday, May 19, 2025',
    time: '5:30 PM – 8:00 PM',
    collaboration: 'Entrepreneurs First',
    description: 'An exclusive panel and networking event for international founders, operators, and investors decoding the Silicon Valley ecosystem — featuring Alice Bentinck (Entrepreneurs First), Pete Flint (NFX), and Andy McLoughlin (Uncork Capital).',
    photos: [],
  },
]

function EventCard({ event }) {
  return (
    <div style={{ display: 'flex', gap: 40 }}>
      <div style={{ display: 'flex', gap: 28, padding: '40px 0', borderBottom: '1px solid #DDD9CF', width: 532, flexShrink: 0 }}>
        <div style={{ flexShrink: 0, width: 64, textAlign: 'center', paddingTop: 4 }}>
          <div style={{ fontSize: 30, fontFamily: '"DM Serif Display", Georgia, serif', color: '#1A1815', lineHeight: 1 }}>
            {event.day}
          </div>
          <div style={{ fontSize: 11, letterSpacing: '0.08em', color: '#A8A49C', textTransform: 'uppercase', marginTop: 6 }}>
            {event.month}
          </div>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#1A1815', margin: '14px auto 0', position: 'relative', zIndex: 1 }} />
        </div>

        <div style={{ flexShrink: 0, width: 440 }}>
          <h3 style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 24, fontWeight: 400, color: '#1A1815', margin: '0 0 8px', lineHeight: 1.25 }}>
            {event.title}
          </h3>
          {event.collaboration && (
            <p style={{ fontSize: 12, color: '#A8A49C', margin: '0 0 12px', letterSpacing: '0.01em' }}>
              In collaboration with {event.collaboration}
            </p>
          )}
          <p style={{ fontSize: 13, color: '#A8A49C', margin: '0 0 16px' }}>
            {event.date} · {event.time}
          </p>
          <p style={{ fontSize: 14, color: '#6B6760', lineHeight: 1.75, margin: 0 }}>
            {event.description}
          </p>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 12, flexWrap: 'wrap', alignContent: 'flex-start', paddingTop: 40 }}>
        {event.photos.map((src, i) => (
          <img key={i} src={src} alt="" style={{ width: 160, height: 160, objectFit: 'cover', borderRadius: 4 }} />
        ))}
      </div>
    </div>
  )
}

function UpcomingEventCard({ event }) {
  const d = new Date(event.event_date + 'T00:00:00')
  const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
  const day = d.getDate()

  return (
    <div style={{ display: 'flex', gap: 28, padding: '40px 0', borderBottom: '1px solid #DDD9CF', width: 532 }}>
      <div style={{ flexShrink: 0, width: 64, textAlign: 'center', paddingTop: 4 }}>
        <div style={{ fontSize: 30, fontFamily: '"DM Serif Display", Georgia, serif', color: '#1A1815', lineHeight: 1 }}>
          {day}
        </div>
        <div style={{ fontSize: 11, letterSpacing: '0.08em', color: '#A8A49C', textTransform: 'uppercase', marginTop: 6 }}>
          {month}
        </div>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#1A1815', margin: '14px auto 0', position: 'relative', zIndex: 1 }} />
      </div>

      <div style={{ flexShrink: 0, width: 440 }}>
        <h3 style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 24, fontWeight: 400, color: '#1A1815', margin: '0 0 8px', lineHeight: 1.25 }}>
          {event.title}
        </h3>
        <p style={{ fontSize: 13, color: '#A8A49C', margin: 0 }}>
          Details available to approved members — apply below to join us.
        </p>
      </div>
    </div>
  )
}

function Timeline({ children }) {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', left: 32, top: 56, bottom: 56, width: 1, background: '#DDD9CF' }} />
      {children}
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: 11, letterSpacing: '0.1em', color: '#A8A49C', textTransform: 'uppercase', margin: '0 0 8px' }}>
      {children}
    </p>
  )
}

export default async function PastEventsPage() {
  const upcomingEvents = await getUpcomingEvents()

  return (
    <div style={{ minHeight: '100vh', background: '#F4F1EB' }}>
      <SiteNav />
      <main style={{ maxWidth: 1040, padding: '48px 56px 0' }}>
        <div style={{ marginBottom: 40, paddingTop: 40 }}>
          <SectionLabel>Upcoming</SectionLabel>
          {upcomingEvents.length === 0 ? (
            <p style={{ fontSize: 14, color: '#C0BCB4', margin: 0, paddingTop: 8 }}>
              Nothing announced yet — check back soon.
            </p>
          ) : (
            <Timeline>{upcomingEvents.map((e) => <UpcomingEventCard key={e.id} event={e} />)}</Timeline>
          )}
        </div>

        <div style={{ marginBottom: 8 }}>
          <SectionLabel>Past</SectionLabel>
          <Timeline>{pastEvents.map((e) => <EventCard key={e.title} event={e} />)}</Timeline>
        </div>

        <div style={{ padding: '48px 0 96px' }}>
          <p style={{ fontSize: 14, color: '#6B6760', lineHeight: 1.7, margin: '0 0 24px', maxWidth: 440 }}>
            Apply for membership to get access to exclusive O1 Collective dinners, fireside chats, and gatherings.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/apply/founder" style={{
              display: 'inline-block', padding: '13px 28px',
              border: '1px solid #1A1815', color: '#1A1815',
              fontSize: 13, textDecoration: 'none', borderRadius: 4, letterSpacing: '0.01em',
            }}>
              Apply for Founder Circle →
            </Link>
            <Link href="/apply/general" style={{
              display: 'inline-block', padding: '13px 28px',
              background: '#1A1815', color: '#F4F1EB',
              fontSize: 13, textDecoration: 'none', borderRadius: 4, letterSpacing: '0.01em',
            }}>
              Join as a Member →
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
