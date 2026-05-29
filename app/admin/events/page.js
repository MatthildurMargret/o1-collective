'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const inputStyle = {
  width: '100%',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid #DDD9CF',
  outline: 'none',
  fontSize: 13,
  color: '#1A1815',
  padding: '8px 0',
  boxSizing: 'border-box',
  borderRadius: 0,
  fontFamily: 'inherit',
}

const labelStyle = {
  display: 'block',
  fontSize: 10,
  letterSpacing: '0.1em',
  color: '#A8A49C',
  textTransform: 'uppercase',
  marginBottom: 6,
}

const EMPTY_FORM = { title: '', event_date: '', location: '', spots: '', link: '' }

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function EventForm({ initial = EMPTY_FORM, onSave, onCancel, saving, error, submitLabel = 'Save →' }) {
  const [form, setForm] = useState(initial)
  function update(field) { return (e) => setForm((f) => ({ ...f, [field]: e.target.value })) }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form) }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <label style={labelStyle}>Title</label>
        <input type="text" required value={form.title} onChange={update('title')} style={inputStyle} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <label style={labelStyle}>Date</label>
          <input type="date" required value={form.event_date} onChange={update('event_date')} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Location</label>
          <input type="text" required value={form.location} onChange={update('location')} placeholder="San Francisco" style={inputStyle} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <label style={labelStyle}>Spots</label>
          <input type="text" value={form.spots} onChange={update('spots')} placeholder="Open · Invite only · 8 spots left" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Link</label>
          <input type="url" value={form.link} onChange={update('link')} placeholder="https://lu.ma/…" style={inputStyle} />
        </div>
      </div>
      {error && <p style={{ fontSize: 12, color: '#B85C5C', margin: 0 }}>{error}</p>}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          type="submit"
          disabled={saving}
          style={{ padding: '10px 22px', background: '#1A1815', color: '#F4F1EB', fontSize: 12, border: 'none', borderRadius: 4, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1 }}
        >
          {saving ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} style={{ background: 'none', border: 'none', fontSize: 12, color: '#A8A49C', cursor: 'pointer', padding: 0 }}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [addSaving, setAddSaving] = useState(false)
  const [addError, setAddError] = useState('')

  useEffect(() => { loadEvents() }, [])

  async function loadEvents() {
    setLoading(true)
    const res = await fetch('/api/admin/events')
    if (res.status === 403) { setUnauthorized(true); setLoading(false); return }
    setEvents(await res.json())
    setLoading(false)
  }

  async function handleAdd(form) {
    setAddSaving(true)
    setAddError('')
    const res = await fetch('/api/admin/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setAddSaving(false)
    if (res.status === 403) { setUnauthorized(true); return }
    if (!res.ok) { setAddError((await res.json()).error); return }
    setAddOpen(false)
    loadEvents()
  }

  async function handleEdit(id, form) {
    setEditSaving(true)
    setEditError('')
    const res = await fetch('/api/admin/events', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...form }),
    })
    setEditSaving(false)
    if (!res.ok) { setEditError((await res.json()).error); return }
    const updated = await res.json()
    setEvents((prev) => prev.map((e) => e.id === id ? updated : e))
    setEditingId(null)
  }

  async function toggleHidden(event) {
    const res = await fetch('/api/admin/events', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: event.id, hidden: !event.hidden }),
    })
    if (res.ok) {
      const updated = await res.json()
      setEvents((prev) => prev.map((e) => e.id === event.id ? updated : e))
    }
  }

  if (unauthorized) {
    return (
      <div style={{ minHeight: '100vh', background: '#F4F1EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: 14, color: '#A8A49C' }}>You don't have access to this page.</p>
      </div>
    )
  }

  const visible = events.filter((e) => !e.hidden)
  const hidden = events.filter((e) => e.hidden)

  return (
    <div style={{ minHeight: '100vh', background: '#F4F1EB' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '32px 56px' }}>
        <Link href="/directory" style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 18, color: '#1A1815', letterSpacing: '-0.01em', textDecoration: 'none' }}>
          O1 Collective
        </Link>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Link href="/directory" style={{ fontSize: 13, color: '#A8A49C', textDecoration: 'none' }}>← Directory</Link>
          <Link href="/events" style={{ fontSize: 13, color: '#A8A49C', textDecoration: 'none' }}>View events page →</Link>
        </div>
      </nav>

      <main style={{ maxWidth: 680, margin: '0 auto', padding: '48px 48px 120px' }}>
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 12, letterSpacing: '0.1em', color: '#A8A49C', textTransform: 'uppercase', margin: '0 0 12px' }}>Admin</p>
          <h1 style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 40, fontWeight: 400, color: '#1A1815', margin: 0, lineHeight: 1.1 }}>
            Manage events
          </h1>
        </div>

        {/* ── Add new event ── */}
        <div style={{ marginBottom: 56, padding: '24px 28px', border: '1px solid #DDD9CF', borderRadius: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: addOpen ? 28 : 0 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#1A1815' }}>Add new event</span>
            <button
              onClick={() => { setAddOpen((v) => !v); setAddError('') }}
              style={{ background: 'none', border: 'none', fontSize: 12, color: '#A8A49C', cursor: 'pointer', padding: 0 }}
            >
              {addOpen ? 'Cancel' : '+ New event'}
            </button>
          </div>
          {addOpen && (
            <EventForm
              onSave={handleAdd}
              saving={addSaving}
              error={addError}
              submitLabel="Add event →"
            />
          )}
        </div>

        {loading ? (
          <p style={{ fontSize: 14, color: '#A8A49C' }}>Loading…</p>
        ) : (
          <>
            {/* ── Visible events ── */}
            <Section title="Upcoming" count={visible.length}>
              {visible.length === 0 && (
                <p style={{ fontSize: 13, color: '#C0BCB4', padding: '16px 0' }}>No upcoming events.</p>
              )}
              {visible.map((event) => (
                <EventRow
                  key={event.id}
                  event={event}
                  isEditing={editingId === event.id}
                  editSaving={editSaving}
                  editError={editError}
                  onEdit={() => { setEditingId(event.id); setEditError('') }}
                  onCancelEdit={() => setEditingId(null)}
                  onSaveEdit={(form) => handleEdit(event.id, form)}
                  onToggleHidden={() => toggleHidden(event)}
                />
              ))}
            </Section>

            {/* ── Hidden events ── */}
            {hidden.length > 0 && (
              <Section title="Hidden from members" count={hidden.length} muted>
                {hidden.map((event) => (
                  <EventRow
                    key={event.id}
                    event={event}
                    isEditing={editingId === event.id}
                    editSaving={editSaving}
                    editError={editError}
                    onEdit={() => { setEditingId(event.id); setEditError('') }}
                    onCancelEdit={() => setEditingId(null)}
                    onSaveEdit={(form) => handleEdit(event.id, form)}
                    onToggleHidden={() => toggleHidden(event)}
                    muted
                  />
                ))}
              </Section>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function Section({ title, count, children, muted }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <p style={{ fontSize: 10, letterSpacing: '0.1em', color: muted ? '#C0BCB4' : '#A8A49C', textTransform: 'uppercase', margin: '0 0 4px' }}>
        {title} · {count}
      </p>
      <div style={{ borderTop: '1px solid #DDD9CF' }}>
        {children}
      </div>
    </div>
  )
}

function EventRow({ event, isEditing, editSaving, editError, onEdit, onCancelEdit, onSaveEdit, onToggleHidden, muted }) {
  return (
    <div style={{ borderBottom: '1px solid #EDE9E2', opacity: muted ? 0.5 : 1 }}>
      {/* Summary row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, color: '#1A1815', fontWeight: 500 }}>{event.title}</div>
          <div style={{ fontSize: 12, color: '#A8A49C', marginTop: 3 }}>
            {formatDate(event.event_date)} · {event.location}
            {event.spots && ` · ${event.spots}`}
            {event.link && <span style={{ marginLeft: 6, color: '#C0BCB4' }}>↗</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <button
            onClick={isEditing ? onCancelEdit : onEdit}
            style={{ background: 'none', border: '1px solid #DDD9CF', borderRadius: 4, padding: '5px 12px', fontSize: 12, color: '#6B6760', cursor: 'pointer' }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#1A1815')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#DDD9CF')}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
          <button
            onClick={onToggleHidden}
            style={{ background: 'none', border: '1px solid #DDD9CF', borderRadius: 4, padding: '5px 12px', fontSize: 12, color: '#6B6760', cursor: 'pointer' }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#1A1815')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#DDD9CF')}
          >
            {event.hidden ? 'Show' : 'Hide'}
          </button>
        </div>
      </div>

      {/* Inline edit form */}
      {isEditing && (
        <div style={{ padding: '4px 0 28px' }}>
          <EventForm
            initial={{
              title: event.title,
              event_date: event.event_date,
              location: event.location,
              spots: event.spots ?? '',
              link: event.link ?? '',
            }}
            onSave={onSaveEdit}
            onCancel={onCancelEdit}
            saving={editSaving}
            error={editError}
          />
        </div>
      )}
    </div>
  )
}
