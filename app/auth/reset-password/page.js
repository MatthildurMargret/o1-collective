'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase'

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

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirm) {
      setError("Passwords don't match.")
      return
    }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    router.push('/directory')
    router.refresh()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F4F1EB', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ display: 'flex', alignItems: 'center', padding: '32px 56px' }}>
        <span style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 18, color: '#1A1815', letterSpacing: '-0.01em' }}>
          O1 Collective
        </span>
      </nav>

      <main style={{ flex: 1, display: 'flex', alignItems: 'flex-start', padding: '80px 56px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h1 style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 400, color: '#1A1815', lineHeight: 1.1, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
            Set new password
          </h1>
          <p style={{ fontSize: 14, color: '#A8A49C', lineHeight: 1.7, margin: '0 0 48px' }}>
            Choose a new password for your account.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div>
              <label style={labelStyle}>New password</label>
              <input
                type="password"
                required
                autoFocus
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Confirm password</label>
              <input
                type="password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter password"
                style={inputStyle}
              />
            </div>
            {error && (
              <p style={{ fontSize: 13, color: '#B85C5C', margin: 0, lineHeight: 1.6 }}>{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '13px 28px', background: '#1A1815', color: '#F4F1EB', fontSize: 13, border: 'none', borderRadius: 4, letterSpacing: '0.01em', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.6 : 1, alignSelf: 'flex-start' }}
            >
              {loading ? 'Saving…' : 'Save password →'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
