'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

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

function initials(name) {
  return (name || '')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function AvatarPicker({ name, avatarUrl, onUploaded }) {
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/profile/avatar', { method: 'POST', body: formData })
    const data = await res.json()

    setUploading(false)
    if (!res.ok) {
      setError(data.error || 'Could not upload image.')
      return
    }
    onUploaded(data.avatarUrl)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
        background: '#EDEAE3', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {avatarUrl ? (
          <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 20, fontWeight: 500, color: '#A8A49C' }}>{initials(name)}</span>
        )}
      </div>
      <div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            fontSize: 13, color: '#1A1815', background: 'none', border: '1px solid #DDD9CF',
            borderRadius: 4, padding: '9px 18px', cursor: uploading ? 'default' : 'pointer', letterSpacing: '0.01em',
          }}
        >
          {uploading ? 'Uploading…' : avatarUrl ? 'Change photo' : 'Upload photo'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        {error && <p style={{ fontSize: 12, color: '#B85C5C', margin: '8px 0 0' }}>{error}</p>}
      </div>
    </div>
  )
}

export default function ProfileForm({ initialData, headerLabel, headerTitle, headerSubtitle, submitLabel, redirectTo }) {
  const router = useRouter()
  const [form, setForm] = useState({
    name: initialData.name ?? '',
    jobTitle: initialData.jobTitle ?? '',
    company: initialData.company ?? '',
    location: initialData.location ?? '',
    linkedin: initialData.linkedin ?? '',
    bio: initialData.bio ?? '',
  })
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatarUrl ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

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

    router.push(redirectTo)
    router.refresh()
  }

  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: '64px 48px 120px' }}>
      <div style={{ marginBottom: 56 }}>
        <p style={{ fontSize: 12, letterSpacing: '0.1em', color: '#A8A49C', textTransform: 'uppercase', margin: '0 0 16px' }}>
          {headerLabel}
        </p>
        <h1 style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 400, color: '#1A1815', lineHeight: 1.1, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
          {headerTitle}
        </h1>
        <p style={{ fontSize: 14, color: '#6B6760', lineHeight: 1.7, margin: 0 }}>
          {headerSubtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
        <AvatarPicker name={form.name} avatarUrl={avatarUrl} onUploaded={setAvatarUrl} />

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
            {saving ? 'Saving…' : submitLabel}
          </button>
        </div>
      </form>
    </main>
  )
}
