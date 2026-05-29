'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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

export default function LoginPage() {
  const router = useRouter()

  // step: 'email' | 'signin' | 'do-signin' | 'create' | 'forgot'
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  function resetToEmail() {
    setStep('email')
    setError('')
    setInfo('')
    setPassword('')
    setConfirm('')
  }

  async function handleEmailSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch(`/api/auth/check-member?email=${encodeURIComponent(email.trim())}`)
    const data = await res.json()

    setLoading(false)

    if (!data.found) {
      setError("This email isn't associated with an O1 Collective membership.")
      return
    }

    setMember(data)
    // hasAccount: true → sign in, false → create, null → show choice
    if (data.hasAccount === true) setStep('do-signin')
    else if (data.hasAccount === false) setStep('create')
    else setStep('signin')
  }

  async function handleSignIn(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    setLoading(false)

    if (!signInError) {
      router.push('/directory')
      router.refresh()
      return
    }

    setError(signInError.message)
  }

  async function handleCreateAccount(e) {
    e.preventDefault()
    if (password !== confirm) {
      setError("Passwords don't match.")
      return
    }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?type=signup`,
        data: {
          name: member?.name ?? '',
          attio_id: member?.attioId ?? '',
        },
      },
    })

    setLoading(false)

    if (signUpError) {
      if (signUpError.message.toLowerCase().includes('already registered')) {
        setStep('do-signin')
        setError('You already have an account. Sign in with your password.')
        setPassword('')
      } else {
        setError(signUpError.message)
      }
      return
    }

    if (data.session) {
      router.push('/welcome')
      router.refresh()
    } else {
      setInfo("We've sent a confirmation link to your email. Click it to finish setting up your account.")
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })

    setLoading(false)

    if (resetError) {
      setError(resetError.message)
      return
    }

    setInfo("Check your email — we've sent a password reset link.")
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F4F1EB', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '32px 56px' }}>
        <Link href="/" style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 18, color: '#1A1815', letterSpacing: '-0.01em', textDecoration: 'none' }}>
          O1 Collective
        </Link>
      </nav>

      <main style={{ flex: 1, display: 'flex', alignItems: 'flex-start', padding: '80px 56px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* ── Step 1: Email ── */}
          {step === 'email' && (
            <>
              <h1 style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 400, color: '#1A1815', lineHeight: 1.1, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
                Member login
              </h1>
              <p style={{ fontSize: 14, color: '#A8A49C', lineHeight: 1.7, margin: '0 0 48px' }}>
                Enter your email to continue.
              </p>
              <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                {error && (
                  <div>
                    <p style={{ fontSize: 13, color: '#B85C5C', margin: 0, lineHeight: 1.6 }}>{error}</p>
                    <Link href="/apply/general" style={{ fontSize: 12, color: '#A8A49C', textDecoration: 'underline', marginTop: 6, display: 'inline-block' }}>
                      Apply for membership →
                    </Link>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  style={{ padding: '13px 28px', background: '#1A1815', color: '#F4F1EB', fontSize: 13, border: 'none', borderRadius: 4, letterSpacing: '0.01em', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.6 : 1, alignSelf: 'flex-start' }}
                >
                  {loading ? 'Checking…' : 'Continue →'}
                </button>
              </form>
            </>
          )}

          {/* ── Step 2: Choose path ── */}
          {step === 'signin' && (
            <>
              <button onClick={resetToEmail} style={{ background: 'none', border: 'none', padding: 0, fontSize: 12, color: '#A8A49C', cursor: 'pointer', marginBottom: 32, letterSpacing: '0.02em' }}>
                ← {email}
              </button>

              {member?.name ? (
                <>
                  <p style={{ fontSize: 12, letterSpacing: '0.1em', color: '#A8A49C', textTransform: 'uppercase', margin: '0 0 12px' }}>Member found</p>
                  <h1 style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 400, color: '#1A1815', lineHeight: 1.1, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
                    {member.name}
                  </h1>
                  {(member.jobTitle || member.company) && (
                    <p style={{ fontSize: 14, color: '#6B6760', lineHeight: 1.7, margin: '0 0 40px' }}>
                      {[member.jobTitle, member.company].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </>
              ) : (
                <h1 style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 400, color: '#1A1815', lineHeight: 1.1, margin: '0 0 40px', letterSpacing: '-0.02em' }}>
                  How would you like to continue?
                </h1>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button
                  onClick={() => { setStep('do-signin'); setError('') }}
                  style={{ padding: '16px 24px', background: '#1A1815', color: '#F4F1EB', fontSize: 13, border: 'none', borderRadius: 4, letterSpacing: '0.01em', cursor: 'pointer', textAlign: 'left' }}
                >
                  Sign in — I already have an account →
                </button>
                <button
                  onClick={() => { setStep('create'); setError(''); setPassword(''); setConfirm('') }}
                  style={{ padding: '16px 24px', background: 'transparent', color: '#1A1815', fontSize: 13, border: '1px solid #DDD9CF', borderRadius: 4, letterSpacing: '0.01em', cursor: 'pointer', textAlign: 'left' }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#1A1815')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#DDD9CF')}
                >
                  Create account — first time here →
                </button>
              </div>
            </>
          )}

          {/* ── Step 2a: Sign in form ── */}
          {step === 'do-signin' && (
            <>
              <button onClick={() => { setStep('signin'); setError(''); setInfo('') }} style={{ background: 'none', border: 'none', padding: 0, fontSize: 12, color: '#A8A49C', cursor: 'pointer', marginBottom: 32, letterSpacing: '0.02em' }}>
                ← {email}
              </button>

              <h1 style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 400, color: '#1A1815', lineHeight: 1.1, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
                Welcome back.
              </h1>
              <p style={{ fontSize: 14, color: '#A8A49C', lineHeight: 1.7, margin: '0 0 48px' }}>
                Enter your password to continue.
              </p>

              {info ? (
                <div style={{ padding: '20px 24px', background: '#EDEAE3', borderRadius: 4 }}>
                  <p style={{ fontSize: 14, color: '#6B6760', lineHeight: 1.7, margin: 0 }}>{info}</p>
                </div>
              ) : (
                <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                  <div>
                    <label style={labelStyle}>Password</label>
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
                  {error && (
                    <p style={{ fontSize: 13, color: '#B85C5C', margin: 0, lineHeight: 1.6 }}>{error}</p>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{ padding: '13px 28px', background: '#1A1815', color: '#F4F1EB', fontSize: 13, border: 'none', borderRadius: 4, letterSpacing: '0.01em', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.6 : 1, alignSelf: 'flex-start' }}
                    >
                      {loading ? 'Signing in…' : 'Sign in →'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setStep('forgot'); setError(''); setInfo('') }}
                      style={{ background: 'none', border: 'none', padding: 0, fontSize: 12, color: '#A8A49C', cursor: 'pointer', textDecoration: 'underline', alignSelf: 'flex-start' }}
                    >
                      Forgot password?
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* ── Step 2b: Create account ── */}
          {step === 'create' && (
            <>
              <button onClick={resetToEmail} style={{ background: 'none', border: 'none', padding: 0, fontSize: 12, color: '#A8A49C', cursor: 'pointer', marginBottom: 32, letterSpacing: '0.02em' }}>
                ← {email}
              </button>

              <p style={{ fontSize: 12, letterSpacing: '0.1em', color: '#A8A49C', textTransform: 'uppercase', margin: '0 0 12px' }}>You're in</p>
              <h1 style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 400, color: '#1A1815', lineHeight: 1.1, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
                {member?.name ? `Welcome, ${member.name.split(' ')[0]}.` : 'Create your account.'}
              </h1>
              <p style={{ fontSize: 14, color: '#6B6760', lineHeight: 1.7, margin: '0 0 48px' }}>
                Choose a password to access the member portal.
              </p>

              {info ? (
                <div style={{ padding: '20px 24px', background: '#EDEAE3', borderRadius: 4 }}>
                  <p style={{ fontSize: 14, color: '#6B6760', lineHeight: 1.7, margin: 0 }}>{info}</p>
                </div>
              ) : (
                <form onSubmit={handleCreateAccount} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                  <div>
                    <label style={labelStyle}>Password</label>
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{ padding: '13px 28px', background: '#1A1815', color: '#F4F1EB', fontSize: 13, border: 'none', borderRadius: 4, letterSpacing: '0.01em', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.6 : 1, alignSelf: 'flex-start' }}
                    >
                      {loading ? 'Creating account…' : 'Create account →'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setStep('do-signin'); setError(''); setPassword(''); setConfirm('') }}
                      style={{ background: 'none', border: 'none', padding: 0, fontSize: 12, color: '#A8A49C', cursor: 'pointer', textDecoration: 'underline', alignSelf: 'flex-start' }}
                    >
                      Already have an account? Sign in →
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* ── Step 3: Forgot password ── */}
          {step === 'forgot' && (
            <>
              <button onClick={() => { setStep('do-signin'); setError(''); setInfo('') }} style={{ background: 'none', border: 'none', padding: 0, fontSize: 12, color: '#A8A49C', cursor: 'pointer', marginBottom: 32, letterSpacing: '0.02em' }}>
                ← Back to sign in
              </button>

              <h1 style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 400, color: '#1A1815', lineHeight: 1.1, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
                Reset password
              </h1>
              <p style={{ fontSize: 14, color: '#A8A49C', lineHeight: 1.7, margin: '0 0 48px' }}>
                We'll send a reset link to <strong style={{ color: '#6B6760', fontWeight: 500 }}>{email}</strong>.
              </p>

              {info ? (
                <div style={{ padding: '20px 24px', background: '#EDEAE3', borderRadius: 4 }}>
                  <p style={{ fontSize: 14, color: '#6B6760', lineHeight: 1.7, margin: 0 }}>{info}</p>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                  {error && (
                    <p style={{ fontSize: 13, color: '#B85C5C', margin: 0, lineHeight: 1.6 }}>{error}</p>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    style={{ padding: '13px 28px', background: '#1A1815', color: '#F4F1EB', fontSize: 13, border: 'none', borderRadius: 4, letterSpacing: '0.01em', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.6 : 1, alignSelf: 'flex-start' }}
                  >
                    {loading ? 'Sending…' : 'Send reset link →'}
                  </button>
                </form>
              )}
            </>
          )}

        </div>
      </main>
    </div>
  )
}
