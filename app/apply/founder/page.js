'use client'

import { useState } from 'react'
import Link from 'next/link'

const inputStyle = {
  width: '100%',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid #DDD9CF',
  outline: 'none',
  fontSize: 14,
  color: '#1A1815',
  padding: '10px 0',
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
  marginBottom: 8,
}

const STAGES = ['Pre-idea', 'Pre-seed', 'Seed', 'Series A', 'Series B+']

export default function FounderApplyPage() {
  const [form, setForm] = useState({
    name: '', email: '', company: '', role: '', stage: '', linkedin: '', website: '', building: '', referred_by: '', why: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  function update(field) { return (e) => setForm((f) => ({ ...f, [field]: e.target.value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'founder', ...form }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong. Please try again.')
      return
    }

    setDone(true)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F4F1EB' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '32px 56px' }}>
        <Link href="/" style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 18, color: '#1A1815', letterSpacing: '-0.01em', textDecoration: 'none' }}>
          O1 Collective
        </Link>
        <Link href="/login" style={{ fontSize: 13, color: '#A8A49C', textDecoration: 'none' }}>
          Member login →
        </Link>
      </nav>

      <main style={{ maxWidth: 560, margin: '0 auto', padding: '64px 48px 120px' }}>
        {done ? (
          <div>
            <p style={{ fontSize: 12, letterSpacing: '0.1em', color: '#A8A49C', textTransform: 'uppercase', margin: '0 0 16px' }}>Application received</p>
            <h1 style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 'clamp(36px, 5vw, 48px)', fontWeight: 400, color: '#1A1815', margin: '0 0 20px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              Thank you, {form.name.split(' ')[0]}.
            </h1>
            <p style={{ fontSize: 14, color: '#6B6760', lineHeight: 1.8, margin: '0 0 40px', maxWidth: 400 }}>
              We review each application personally and will be in touch within two weeks.
            </p>
            <Link href="/" style={{ fontSize: 13, color: '#A8A49C', textDecoration: 'none' }}>← Back to home</Link>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 52 }}>
              <p style={{ fontSize: 12, letterSpacing: '0.1em', color: '#A8A49C', textTransform: 'uppercase', margin: '0 0 16px' }}>Founder Circle</p>
              <h1 style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 'clamp(36px, 5vw, 48px)', fontWeight: 400, color: '#1A1815', margin: '0 0 16px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                Apply for Founder Circle.
              </h1>
              <p style={{ fontSize: 14, color: '#6B6760', lineHeight: 1.8, margin: 0 }}>
                A high-conviction circle for European founders building in the US. We review every application personally.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
                <div>
                  <label style={labelStyle}>Full name</label>
                  <input type="text" required value={form.name} onChange={update('name')} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" required value={form.email} onChange={update('email')} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
                <div>
                  <label style={labelStyle}>Company</label>
                  <input type="text" required value={form.company} onChange={update('company')} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Your role</label>
                  <input type="text" required value={form.role} onChange={update('role')} placeholder="CEO, CTO, Co-founder…" style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
                <div>
                  <label style={labelStyle}>Company stage</label>
                  <select required value={form.stage} onChange={update('stage')} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Select stage</option>
                    {STAGES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>LinkedIn</label>
                  <input type="url" required value={form.linkedin} onChange={update('linkedin')} placeholder="https://linkedin.com/in/…" style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Company website</label>
                <input type="url" value={form.website} onChange={update('website')} placeholder="https://…" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>What are you building?</label>
                <textarea required value={form.building} onChange={update('building')} rows={3} placeholder="Tell us about your company and what problem you're solving." style={{ ...inputStyle, borderBottom: 'none', border: '1px solid #DDD9CF', padding: '14px 16px', resize: 'vertical', lineHeight: 1.7 }} />
              </div>

              <div>
                <label style={labelStyle}>Were you referred by a member?</label>
                <input type="text" value={form.referred_by} onChange={update('referred_by')} placeholder="Full name of the member who referred you" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Why do you want to join O1 Collective?</label>
                <textarea required value={form.why} onChange={update('why')} rows={3} placeholder="What do you hope to get from the community?" style={{ ...inputStyle, borderBottom: 'none', border: '1px solid #DDD9CF', padding: '14px 16px', resize: 'vertical', lineHeight: 1.7 }} />
              </div>

              {error && <p style={{ fontSize: 13, color: '#B85C5C', margin: 0 }}>{error}</p>}

              <button
                type="submit"
                disabled={loading}
                style={{ padding: '14px 32px', background: '#1A1815', color: '#F4F1EB', fontSize: 13, border: 'none', borderRadius: 4, letterSpacing: '0.01em', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.6 : 1, alignSelf: 'flex-start' }}
              >
                {loading ? 'Submitting…' : 'Submit application →'}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  )
}
