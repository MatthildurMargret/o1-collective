'use client'

import Link from 'next/link'

function Nav() {
  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '32px 56px',
    }}>
      <Link href="/" style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: 18, color: '#1A1815', letterSpacing: '-0.01em', textDecoration: 'none' }}>
        O1 Collective
      </Link>
      <Link href="/directory" style={{ fontSize: 13, color: '#6B6760', textDecoration: 'none', letterSpacing: '0.01em' }}>
        Member login →
      </Link>
    </nav>
  )
}

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

function Field({ label, required, children }) {
  return (
    <div>
      <label style={labelStyle}>
        {label}{required && <span style={{ color: '#C0BCB4', marginLeft: 4 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

export default function ApplyPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F4F1EB' }}>
      <Nav />

      <main style={{ maxWidth: 640, margin: '0 auto', padding: '64px 48px 120px' }}>
        <div style={{ marginBottom: 64 }}>
          <h1 style={{
            fontFamily: '"DM Serif Display", Georgia, serif',
            fontSize: 'clamp(36px, 5vw, 52px)',
            fontWeight: 400,
            color: '#1A1815',
            lineHeight: 1.1,
            margin: '0 0 16px',
            letterSpacing: '-0.02em',
          }}>
            Apply for membership
          </h1>
          <p style={{ fontSize: 14, color: '#A8A49C', lineHeight: 1.7, margin: 0 }}>
            We review each application personally and respond within two weeks.
          </p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

          {/* Name row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            <Field label="First Name" required>
              <input type="text" name="firstName" required autoComplete="given-name" style={inputStyle} />
            </Field>
            <Field label="Last Name" required>
              <input type="text" name="lastName" required autoComplete="family-name" style={inputStyle} />
            </Field>
          </div>

          <Field label="Email" required>
            <input type="email" name="email" required autoComplete="email" style={inputStyle} />
          </Field>

          <Field label="Nationality" required>
            <input type="text" name="nationality" required style={inputStyle} />
          </Field>

          <Field label="Current Location" required>
            <input type="text" name="location" required autoComplete="address-level2" style={inputStyle} />
          </Field>

          <Field label="LinkedIn Profile" required>
            <input type="url" name="linkedin" required placeholder="https://linkedin.com/in/…" style={{ ...inputStyle, color: '#1A1815' }} />
          </Field>

          <div>
            <Field label="Referred By">
              <input type="text" name="referredBy" placeholder="First and Last Name" style={inputStyle} />
            </Field>
            <p style={{ fontSize: 12, color: '#C0BCB4', marginTop: 10, lineHeight: 1.6 }}>
              If a member didn't refer you, please let us know how you heard about O1 Collective.
            </p>
          </div>

          <Field label="Why are you excited to join O1 Collective?" required>
            <textarea
              name="motivation"
              required
              rows={6}
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

          <div style={{ paddingTop: 8 }}>
            <button
              type="submit"
              style={{
                padding: '13px 32px',
                background: '#1A1815',
                color: '#F4F1EB',
                fontSize: 13,
                border: 'none',
                borderRadius: 4,
                letterSpacing: '0.01em',
                cursor: 'pointer',
              }}
            >
              Submit application
            </button>
          </div>

        </form>
      </main>
    </div>
  )
}
