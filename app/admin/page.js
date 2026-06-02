'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// ─── shared styles ────────────────────────────────────────────────────────────

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

// ─── shared components ────────────────────────────────────────────────────────

function Section({ title, count, children, muted }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <p style={{ fontSize: 10, letterSpacing: '0.1em', color: muted ? '#C0BCB4' : '#A8A49C', textTransform: 'uppercase', margin: '0 0 4px' }}>
        {title} · {count}
      </p>
      <div style={{ borderTop: '1px solid #DDD9CF' }}>{children}</div>
    </div>
  )
}

function SaveCancel({ saving, onCancel, label = 'Save →' }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <button type="submit" disabled={saving} style={{ padding: '10px 22px', background: '#1A1815', color: '#F4F1EB', fontSize: 12, border: 'none', borderRadius: 4, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1 }}>
        {saving ? 'Saving…' : label}
      </button>
      {onCancel && <button type="button" onClick={onCancel} style={{ background: 'none', border: 'none', fontSize: 12, color: '#A8A49C', cursor: 'pointer', padding: 0 }}>Cancel</button>}
    </div>
  )
}

function RowActions({ isEditing, hidden, onEdit, onToggleHidden }) {
  return (
    <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
      <button onClick={onEdit} style={{ background: 'none', border: '1px solid #DDD9CF', borderRadius: 4, padding: '5px 12px', fontSize: 12, color: '#6B6760', cursor: 'pointer' }} onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#1A1815')} onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#DDD9CF')}>
        {isEditing ? 'Cancel' : 'Edit'}
      </button>
      <button onClick={onToggleHidden} style={{ background: 'none', border: '1px solid #DDD9CF', borderRadius: 4, padding: '5px 12px', fontSize: 12, color: '#6B6760', cursor: 'pointer' }} onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#1A1815')} onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#DDD9CF')}>
        {hidden ? 'Show' : 'Hide'}
      </button>
    </div>
  )
}

function AddBox({ title, open, onToggle, children }) {
  return (
    <div style={{ marginBottom: 56, padding: '24px 28px', border: '1px solid #DDD9CF', borderRadius: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: open ? 28 : 0 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#1A1815' }}>{title}</span>
        <button onClick={onToggle} style={{ background: 'none', border: 'none', fontSize: 12, color: '#A8A49C', cursor: 'pointer', padding: 0 }}>
          {open ? 'Cancel' : '+ New'}
        </button>
      </div>
      {open && children}
    </div>
  )
}

// ─── events tab ───────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

const EMPTY_EVENT = { title: '', event_date: '', location: '', spots: '', link: '' }

function EventForm({ initial = EMPTY_EVENT, onSave, onCancel, saving, error, label }) {
  const [form, setForm] = useState(initial)
  const u = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }))
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form) }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div><label style={labelStyle}>Title</label><input type="text" required value={form.title} onChange={u('title')} style={inputStyle} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div><label style={labelStyle}>Date</label><input type="date" required value={form.event_date} onChange={u('event_date')} style={inputStyle} /></div>
        <div><label style={labelStyle}>Location</label><input type="text" required value={form.location} onChange={u('location')} placeholder="San Francisco" style={inputStyle} /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div><label style={labelStyle}>Spots</label><input type="text" value={form.spots} onChange={u('spots')} placeholder="Open · Invite only · 8 spots left" style={inputStyle} /></div>
        <div><label style={labelStyle}>Link</label><input type="url" value={form.link} onChange={u('link')} placeholder="https://lu.ma/…" style={inputStyle} /></div>
      </div>
      {error && <p style={{ fontSize: 12, color: '#B85C5C', margin: 0 }}>{error}</p>}
      <SaveCancel saving={saving} onCancel={onCancel} label={label} />
    </form>
  )
}

function EventsTab() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [addSaving, setAddSaving] = useState(false)
  const [addError, setAddError] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const data = await fetch('/api/admin/events').then((r) => r.json())
    setEvents(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function handleAdd(form) {
    setAddSaving(true); setAddError('')
    const res = await fetch('/api/admin/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setAddSaving(false)
    if (!res.ok) { setAddError((await res.json()).error); return }
    setAddOpen(false); load()
  }

  async function handleEdit(id, form) {
    setEditSaving(true); setEditError('')
    const res = await fetch('/api/admin/events', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...form }) })
    setEditSaving(false)
    if (!res.ok) { setEditError((await res.json()).error); return }
    const updated = await res.json()
    setEvents((prev) => prev.map((e) => e.id === id ? updated : e))
    setEditingId(null)
  }

  async function toggleHidden(event) {
    const res = await fetch('/api/admin/events', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: event.id, hidden: !event.hidden }) })
    if (res.ok) { const u = await res.json(); setEvents((prev) => prev.map((e) => e.id === event.id ? u : e)) }
  }

  if (loading) return <p style={{ fontSize: 14, color: '#A8A49C' }}>Loading…</p>

  const visible = events.filter((e) => !e.hidden)
  const hidden = events.filter((e) => e.hidden)

  return (
    <>
      <AddBox title="Add new event" open={addOpen} onToggle={() => { setAddOpen((v) => !v); setAddError('') }}>
        <EventForm onSave={handleAdd} saving={addSaving} error={addError} label="Add event →" />
      </AddBox>
      <Section title="Upcoming" count={visible.length}>
        {visible.length === 0 && <p style={{ fontSize: 13, color: '#C0BCB4', padding: '16px 0' }}>No upcoming events.</p>}
        {visible.map((event) => (
          <div key={event.id} style={{ borderBottom: '1px solid #EDE9E2' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', gap: 16 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#1A1815' }}>{event.title}</div>
                <div style={{ fontSize: 12, color: '#A8A49C', marginTop: 3 }}>{formatDate(event.event_date)} · {event.location}{event.spots && ` · ${event.spots}`}{event.link && <span style={{ marginLeft: 6, color: '#C0BCB4' }}>↗</span>}</div>
              </div>
              <RowActions isEditing={editingId === event.id} hidden={event.hidden} onEdit={() => { setEditingId(editingId === event.id ? null : event.id); setEditError('') }} onToggleHidden={() => toggleHidden(event)} />
            </div>
            {editingId === event.id && (
              <div style={{ paddingBottom: 28 }}>
                <EventForm initial={{ title: event.title, event_date: event.event_date, location: event.location, spots: event.spots ?? '', link: event.link ?? '' }} onSave={(f) => handleEdit(event.id, f)} onCancel={() => setEditingId(null)} saving={editSaving} error={editError} />
              </div>
            )}
          </div>
        ))}
      </Section>
      {hidden.length > 0 && (
        <Section title="Hidden from members" count={hidden.length} muted>
          {hidden.map((event) => (
            <div key={event.id} style={{ borderBottom: '1px solid #EDE9E2', opacity: 0.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#1A1815' }}>{event.title}</div>
                  <div style={{ fontSize: 12, color: '#A8A49C', marginTop: 3 }}>{formatDate(event.event_date)} · {event.location}</div>
                </div>
                <RowActions isEditing={editingId === event.id} hidden={event.hidden} onEdit={() => { setEditingId(editingId === event.id ? null : event.id); setEditError('') }} onToggleHidden={() => toggleHidden(event)} />
              </div>
              {editingId === event.id && (
                <div style={{ paddingBottom: 28 }}>
                  <EventForm initial={{ title: event.title, event_date: event.event_date, location: event.location, spots: event.spots ?? '', link: event.link ?? '' }} onSave={(f) => handleEdit(event.id, f)} onCancel={() => setEditingId(null)} saving={editSaving} error={editError} />
                </div>
              )}
            </div>
          ))}
        </Section>
      )}
    </>
  )
}

// ─── advisors tab ─────────────────────────────────────────────────────────────

const EMPTY_ADVISOR = { name: '', topic: '', company: '', linkedin: '' }

function AdvisorForm({ initial = EMPTY_ADVISOR, onSave, onCancel, saving, error, label }) {
  const [form, setForm] = useState(initial)
  const u = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }))
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form) }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div><label style={labelStyle}>Name</label><input type="text" required value={form.name} onChange={u('name')} style={inputStyle} /></div>
        <div><label style={labelStyle}>Company</label><input type="text" value={form.company} onChange={u('company')} style={inputStyle} /></div>
      </div>
      <div><label style={labelStyle}>Topic</label><input type="text" required value={form.topic} onChange={u('topic')} placeholder="e.g. Early-stage fundraising" style={inputStyle} /></div>
      <div><label style={labelStyle}>LinkedIn</label><input type="url" value={form.linkedin} onChange={u('linkedin')} placeholder="https://linkedin.com/in/…" style={inputStyle} /></div>
      {error && <p style={{ fontSize: 12, color: '#B85C5C', margin: 0 }}>{error}</p>}
      <SaveCancel saving={saving} onCancel={onCancel} label={label} />
    </form>
  )
}

function AdvisorsTab() {
  const [advisors, setAdvisors] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [addSaving, setAddSaving] = useState(false)
  const [addError, setAddError] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const data = await fetch('/api/admin/advisors').then((r) => r.json())
    setAdvisors(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function handleAdd(form) {
    setAddSaving(true); setAddError('')
    const res = await fetch('/api/admin/advisors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setAddSaving(false)
    if (!res.ok) { setAddError((await res.json()).error); return }
    setAddOpen(false); load()
  }

  async function handleEdit(id, form) {
    setEditSaving(true); setEditError('')
    const res = await fetch('/api/admin/advisors', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...form }) })
    setEditSaving(false)
    if (!res.ok) { setEditError((await res.json()).error); return }
    const updated = await res.json()
    setAdvisors((prev) => prev.map((a) => a.id === id ? updated : a))
    setEditingId(null)
  }

  async function toggleHidden(advisor) {
    const res = await fetch('/api/admin/advisors', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: advisor.id, hidden: !advisor.hidden }) })
    if (res.ok) { const u = await res.json(); setAdvisors((prev) => prev.map((a) => a.id === advisor.id ? u : a)) }
  }

  if (loading) return <p style={{ fontSize: 14, color: '#A8A49C' }}>Loading…</p>

  const visible = advisors.filter((a) => !a.hidden)
  const hidden = advisors.filter((a) => a.hidden)

  return (
    <>
      <AddBox title="Add advisor" open={addOpen} onToggle={() => { setAddOpen((v) => !v); setAddError('') }}>
        <AdvisorForm onSave={handleAdd} saving={addSaving} error={addError} label="Add advisor →" />
      </AddBox>
      <Section title="Visible" count={visible.length}>
        {visible.length === 0 && <p style={{ fontSize: 13, color: '#C0BCB4', padding: '16px 0' }}>No advisors listed.</p>}
        {visible.map((a) => (
          <div key={a.id} style={{ borderBottom: '1px solid #EDE9E2' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#1A1815' }}>{a.name}</div>
                <div style={{ fontSize: 12, color: '#A8A49C', marginTop: 3 }}>{a.topic}{a.company && ` · ${a.company}`}</div>
              </div>
              <RowActions isEditing={editingId === a.id} hidden={a.hidden} onEdit={() => { setEditingId(editingId === a.id ? null : a.id); setEditError('') }} onToggleHidden={() => toggleHidden(a)} />
            </div>
            {editingId === a.id && (
              <div style={{ paddingBottom: 28 }}>
                <AdvisorForm initial={{ name: a.name, topic: a.topic, company: a.company ?? '', linkedin: a.linkedin ?? '' }} onSave={(f) => handleEdit(a.id, f)} onCancel={() => setEditingId(null)} saving={editSaving} error={editError} />
              </div>
            )}
          </div>
        ))}
      </Section>
      {hidden.length > 0 && (
        <Section title="Hidden" count={hidden.length} muted>
          {hidden.map((a) => (
            <div key={a.id} style={{ borderBottom: '1px solid #EDE9E2', opacity: 0.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#1A1815' }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: '#A8A49C', marginTop: 3 }}>{a.topic}{a.company && ` · ${a.company}`}</div>
                </div>
                <RowActions isEditing={editingId === a.id} hidden={a.hidden} onEdit={() => { setEditingId(editingId === a.id ? null : a.id); setEditError('') }} onToggleHidden={() => toggleHidden(a)} />
              </div>
              {editingId === a.id && (
                <div style={{ paddingBottom: 28 }}>
                  <AdvisorForm initial={{ name: a.name, topic: a.topic, company: a.company ?? '', linkedin: a.linkedin ?? '' }} onSave={(f) => handleEdit(a.id, f)} onCancel={() => setEditingId(null)} saving={editSaving} error={editError} />
                </div>
              )}
            </div>
          ))}
        </Section>
      )}
    </>
  )
}

// ─── jobs tab ─────────────────────────────────────────────────────────────────

const EMPTY_JOB = { title: '', company: '', location: '', type: 'Full-time', link: '' }

function JobForm({ initial = EMPTY_JOB, onSave, onCancel, saving, error, label }) {
  const [form, setForm] = useState(initial)
  const u = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }))
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form) }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div><label style={labelStyle}>Job title</label><input type="text" required value={form.title} onChange={u('title')} style={inputStyle} /></div>
        <div><label style={labelStyle}>Company</label><input type="text" required value={form.company} onChange={u('company')} style={inputStyle} /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div><label style={labelStyle}>Location</label><input type="text" required value={form.location} onChange={u('location')} placeholder="San Francisco · Remote" style={inputStyle} /></div>
        <div>
          <label style={labelStyle}>Type</label>
          <select value={form.type} onChange={u('type')} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
            <option>Internship</option>
          </select>
        </div>
      </div>
      <div><label style={labelStyle}>Link to apply</label><input type="url" value={form.link} onChange={u('link')} placeholder="https://…" style={inputStyle} /></div>
      {error && <p style={{ fontSize: 12, color: '#B85C5C', margin: 0 }}>{error}</p>}
      <SaveCancel saving={saving} onCancel={onCancel} label={label} />
    </form>
  )
}

function JobsTab() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [addSaving, setAddSaving] = useState(false)
  const [addError, setAddError] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const data = await fetch('/api/admin/jobs').then((r) => r.json())
    setJobs(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function handleAdd(form) {
    setAddSaving(true); setAddError('')
    const res = await fetch('/api/admin/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setAddSaving(false)
    if (!res.ok) { setAddError((await res.json()).error); return }
    setAddOpen(false); load()
  }

  async function handleEdit(id, form) {
    setEditSaving(true); setEditError('')
    const res = await fetch('/api/admin/jobs', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...form }) })
    setEditSaving(false)
    if (!res.ok) { setEditError((await res.json()).error); return }
    const updated = await res.json()
    setJobs((prev) => prev.map((j) => j.id === id ? updated : j))
    setEditingId(null)
  }

  async function toggleHidden(job) {
    const res = await fetch('/api/admin/jobs', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: job.id, hidden: !job.hidden }) })
    if (res.ok) { const u = await res.json(); setJobs((prev) => prev.map((j) => j.id === job.id ? u : j)) }
  }

  if (loading) return <p style={{ fontSize: 14, color: '#A8A49C' }}>Loading…</p>

  const visible = jobs.filter((j) => !j.hidden)
  const hidden = jobs.filter((j) => j.hidden)

  return (
    <>
      <AddBox title="Post a job" open={addOpen} onToggle={() => { setAddOpen((v) => !v); setAddError('') }}>
        <JobForm onSave={handleAdd} saving={addSaving} error={addError} label="Add job →" />
      </AddBox>
      <Section title="Active" count={visible.length}>
        {visible.length === 0 && <p style={{ fontSize: 13, color: '#C0BCB4', padding: '16px 0' }}>No jobs listed.</p>}
        {visible.map((j) => (
          <div key={j.id} style={{ borderBottom: '1px solid #EDE9E2' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#1A1815' }}>{j.title}</div>
                <div style={{ fontSize: 12, color: '#A8A49C', marginTop: 3 }}>{j.company} · {j.location} · {j.type}{j.link && <span style={{ marginLeft: 6, color: '#C0BCB4' }}>↗</span>}</div>
              </div>
              <RowActions isEditing={editingId === j.id} hidden={j.hidden} onEdit={() => { setEditingId(editingId === j.id ? null : j.id); setEditError('') }} onToggleHidden={() => toggleHidden(j)} />
            </div>
            {editingId === j.id && (
              <div style={{ paddingBottom: 28 }}>
                <JobForm initial={{ title: j.title, company: j.company, location: j.location, type: j.type ?? 'Full-time', link: j.link ?? '' }} onSave={(f) => handleEdit(j.id, f)} onCancel={() => setEditingId(null)} saving={editSaving} error={editError} />
              </div>
            )}
          </div>
        ))}
      </Section>
      {hidden.length > 0 && (
        <Section title="Hidden" count={hidden.length} muted>
          {hidden.map((j) => (
            <div key={j.id} style={{ borderBottom: '1px solid #EDE9E2', opacity: 0.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#1A1815' }}>{j.title}</div>
                  <div style={{ fontSize: 12, color: '#A8A49C', marginTop: 3 }}>{j.company} · {j.location}</div>
                </div>
                <RowActions isEditing={editingId === j.id} hidden={j.hidden} onEdit={() => { setEditingId(editingId === j.id ? null : j.id); setEditError('') }} onToggleHidden={() => toggleHidden(j)} />
              </div>
              {editingId === j.id && (
                <div style={{ paddingBottom: 28 }}>
                  <JobForm initial={{ title: j.title, company: j.company, location: j.location, type: j.type ?? 'Full-time', link: j.link ?? '' }} onSave={(f) => handleEdit(j.id, f)} onCancel={() => setEditingId(null)} saving={editSaving} error={editError} />
                </div>
              )}
            </div>
          ))}
        </Section>
      )}
    </>
  )
}

// ─── applications tab ─────────────────────────────────────────────────────────

function typeBadge(type) {
  const label = type === 'founder' ? 'Founder Circle' : 'General'
  const bg = type === 'founder' ? '#1A1815' : '#EDE9E2'
  const color = type === 'founder' ? '#F4F1EB' : '#6B6760'
  return <span style={{ display: 'inline-block', padding: '2px 8px', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', background: bg, color, borderRadius: 3 }}>{label}</span>
}

function statusBadge(status) {
  if (status === 'approved') return <span style={{ fontSize: 11, color: '#4A8C5C' }}>Approved</span>
  if (status === 'rejected') return <span style={{ fontSize: 11, color: '#A8A49C' }}>Passed</span>
  return null
}

function ApplicationsTab() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(null)
  const [emailError, setEmailError] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const data = await fetch('/api/admin/applications').then((r) => r.json())
    setApps(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function decide(id, status) {
    setActing(id)
    setEmailError('')
    const res = await fetch('/api/admin/applications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    setActing(null)
    if (res.ok) {
      const updated = await res.json()
      setApps((prev) => prev.map((a) => a.id === id ? updated : a))
      if (updated.emailError) setEmailError(`Status saved but email failed: ${updated.emailError}`)
    }
  }

  if (loading) return <p style={{ fontSize: 14, color: '#A8A49C' }}>Loading…</p>

  const pending = apps.filter((a) => a.status === 'pending')
  const decided = apps.filter((a) => a.status !== 'pending')

  function AppRow({ a }) {
    return (
      <div style={{ borderBottom: '1px solid #EDE9E2', padding: '20px 0', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#1A1815' }}>{a.name}</span>
            {typeBadge(a.type)}
          </div>
          <div style={{ fontSize: 12, color: '#A8A49C', marginBottom: a.why ? 8 : 0 }}>
            {a.email}{a.role && ` · ${a.role}`}{a.company && ` · ${a.company}`}
            {a.linkedin && <> · <a href={a.linkedin} target="_blank" rel="noreferrer" style={{ color: '#A8A49C' }}>LinkedIn ↗</a></>}
            {a.website && <> · <a href={a.website} target="_blank" rel="noreferrer" style={{ color: '#A8A49C' }}>Website ↗</a></>}
          </div>
          {a.building && <p style={{ fontSize: 13, color: '#6B6760', margin: '0 0 4px', lineHeight: 1.6 }}><span style={{ color: '#A8A49C', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Building: </span>{a.building}</p>}
          {a.why && <p style={{ fontSize: 13, color: '#6B6760', margin: 0, lineHeight: 1.6 }}><span style={{ color: '#A8A49C', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Why: </span>{a.why}</p>}
          {a.referred_by && <p style={{ fontSize: 12, color: '#A8A49C', margin: '6px 0 0' }}>Referred by: {a.referred_by}</p>}
          {a.how_heard && <p style={{ fontSize: 12, color: '#A8A49C', margin: '4px 0 0' }}>How they heard: {a.how_heard}</p>}
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, paddingTop: 2 }}>
          <button
            onClick={() => decide(a.id, 'approved')}
            disabled={acting === a.id}
            style={{ padding: '7px 14px', background: a.status === 'approved' ? '#4A8C5C' : '#1A1815', color: '#F4F1EB', fontSize: 12, border: 'none', borderRadius: 4, cursor: acting === a.id ? 'default' : 'pointer', opacity: acting === a.id ? 0.6 : 1 }}
          >
            {a.status === 'approved' ? 'Approved ✓' : 'Approve →'}
          </button>
          <button
            onClick={() => decide(a.id, 'rejected')}
            disabled={acting === a.id}
            style={{ padding: '7px 14px', background: 'none', border: `1px solid ${a.status === 'rejected' ? '#A8A49C' : '#DDD9CF'}`, fontSize: 12, color: a.status === 'rejected' ? '#A8A49C' : '#6B6760', borderRadius: 4, cursor: acting === a.id ? 'default' : 'pointer', opacity: acting === a.id ? 0.6 : 1 }}
          >
            {a.status === 'rejected' ? 'Passed' : 'Pass'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {emailError && <p style={{ fontSize: 12, color: '#B85C5C', margin: '0 0 24px', padding: '12px 16px', background: '#FDF2F2', border: '1px solid #F5C6C6', borderRadius: 4 }}>{emailError}</p>}
      <Section title="Pending review" count={pending.length}>
        {pending.length === 0 && <p style={{ fontSize: 13, color: '#C0BCB4', padding: '16px 0' }}>No pending applications.</p>}
        {pending.map((a) => <AppRow key={a.id} a={a} />)}
      </Section>
      {decided.length > 0 && (
        <Section title="Decided" count={decided.length} muted>
          {decided.map((a) => <AppRow key={a.id} a={a} />)}
        </Section>
      )}
    </>
  )
}

// ─── main page ────────────────────────────────────────────────────────────────

const TABS = ['Applications', 'Events', 'Advisors', 'Jobs']

export default function AdminPage() {
  const [tab, setTab] = useState('Applications')
  const [unauthorized, setUnauthorized] = useState(false)

  useEffect(() => {
    fetch('/api/admin/me').then((r) => r.json()).then((d) => { if (!d.isAdmin) setUnauthorized(true) })
  }, [])

  if (unauthorized) {
    return (
      <div style={{ minHeight: '100vh', background: '#F4F1EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: 14, color: '#A8A49C' }}>You don't have access to this page.</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F4F1EB' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '32px 56px' }}>
        <Link href="/directory" style={{ display: 'block', lineHeight: 0 }}>
          <Image src="/logo_black.png" alt="O1 Collective" width={120} height={27} priority unoptimized />
        </Link>
        <Link href="/directory" style={{ fontSize: 13, color: '#A8A49C', textDecoration: 'none' }}>← Directory</Link>
      </nav>

      <main style={{ maxWidth: 680, margin: '0 auto', padding: '48px 48px 120px' }}>
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 12, letterSpacing: '0.1em', color: '#A8A49C', textTransform: 'uppercase', margin: '0 0 12px' }}>Admin</p>
          <h1 style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 40, fontWeight: 400, color: '#1A1815', margin: 0, lineHeight: 1.1 }}>
            Manage content
          </h1>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 48, borderBottom: '1px solid #DDD9CF' }}>
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${tab === t ? '#1A1815' : 'transparent'}`,
                padding: '10px 20px 10px 0',
                marginRight: 8,
                fontSize: 13,
                color: tab === t ? '#1A1815' : '#A8A49C',
                cursor: 'pointer',
                letterSpacing: '0.01em',
                marginBottom: -1,
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'Applications' && <ApplicationsTab />}
        {tab === 'Events' && <EventsTab />}
        {tab === 'Advisors' && <AdvisorsTab />}
        {tab === 'Jobs' && <JobsTab />}
      </main>
    </div>
  )
}
