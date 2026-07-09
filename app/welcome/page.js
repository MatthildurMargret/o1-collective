'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'

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
}

const labelStyle = {
  display: 'block',
  fontSize: 10,
  letterSpacing: '0.1em',
  color: '#A8A49C',
  textTransform: 'uppercase',
  marginBottom: 8,
}

function Field({ label, children }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

export default function WelcomePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [attioData, setAttioData] = useState(null)
  const [form, setForm] = useState({ name: '', jobTitle: '', company: '', location: '', linkedin: '', bio: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const res = await fetch(`/api/auth/check-member?email=${encodeURIComponent(user.email)}`)
      const data = await res.json()

      if (data.found) {
        setAttioData(data)
        setForm({
          name: data.name ?? '',
          jobTitle: data.jobTitle ?? '',
          company: data.company ?? '',
          location: data.location ?? '',
          linkedin: data.linkedin ?? '',
          bio: data.description ?? '',
        })
      }
      setLoading(false)
    }
    init()
  }, [router])

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Something went wrong.')
      setSaving(false)
      return
    }

    router.push('/directory')
    router.refresh()
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F4F1EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 13, color: '#A8A49C' }}>Loading…</span>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F4F1EB' }}>
      <nav style={{ display: 'flex', alignItems: 'center', padding: '32px 56px' }}>
        <span style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 18, color: '#1A1815', letterSpacing: '-0.01em' }}>
          O1 Collective
        </span>
      </nav>

      <main style={{ maxWidth: 560, margin: '0 auto', padding: '64px 48px 120px' }}>
        <div style={{ marginBottom: 56 }}>
          <p style={{ fontSize: 12, letterSpacing: '0.1em', color: '#A8A49C', textTransform: 'uppercase', margin: '0 0 16px' }}>
            You're in
          </p>
          <h1 style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 400, color: '#1A1815', lineHeight: 1.1, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
            {form.name ? `Welcome, ${form.name.split(' ')[0]}.` : 'Welcome.'}
          </h1>
          <p style={{ fontSize: 14, color: '#6B6760', lineHeight: 1.7, margin: 0 }}>
            {attioData
              ? "We've pre-filled what we have from our records. Confirm or update anything below."
              : 'Tell us a bit about yourself so other members can find you.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          <Field label="Full name">
            <input type="text" required value={form.name} onChange={update('name')} style={inputStyle} />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
            <Field label="Job title">
              <input type="text" required value={form.jobTitle} onChange={update('jobTitle')} style={inputStyle} />
            </Field>
            <Field label="Company">
              <input type="text" required value={form.company} onChange={update('company')} style={inputStyle} />
            </Field>
          </div>

          <Field label="Location">
            <input type="text" required value={form.location} onChange={update('location')} placeholder="e.g. San Francisco" style={inputStyle} />
          </Field>

          <Field label="LinkedIn">
            <input type="url" value={form.linkedin} onChange={update('linkedin')} placeholder="https://linkedin.com/in/yourname" style={inputStyle} />
          </Field>

          <Field label="Bio">
            <textarea
              value={form.bio}
              onChange={update('bio')}
              rows={4}
              placeholder="A few lines about what you're working on…"
              style={{
                ...inputStyle,
                borderBottom: 'none',
                border: '1px solid #DDD9CF',
                padding: '14px 16px',
                resize: 'vertical',
                lineHeight: 1.7,
                fontFamily: 'inherit',
              }}
            />
          </Field>

          {error && (
            <p style={{ fontSize: 13, color: '#B85C5C', margin: 0 }}>{error}</p>
          )}

          <div style={{ paddingTop: 8 }}>
            <button
              type="submit"
              disabled={saving}
              style={{ padding: '13px 32px', background: '#1A1815', color: '#F4F1EB', fontSize: 13, border: 'none', borderRadius: 4, letterSpacing: '0.01em', cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1 }}
            >
              {saving ? 'Saving…' : 'Go to member directory →'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
