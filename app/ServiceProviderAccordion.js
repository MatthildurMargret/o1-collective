'use client'

import { useState } from 'react'

const POINTS = [
  '$5K in OpenAI credits.',
  'Up to $5,000 in Deel credits, plus free US payroll for founders for life for a limited time.',
  'Free ACH and USD wires, cashback credit cards from day one, up to 3.88% yield with Mercury Treasury, plus a $500 bonus after $10K of card spend in your first 90 days.',
  '$1,000 off your first immigration application with Ellis.',
]

export default function ServiceProviderAccordion() {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ borderTop: '1px solid #2C2A27', paddingTop: 20 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
          width: '100%', background: 'none', border: 'none', padding: 0, margin: 0,
          cursor: 'pointer', textAlign: 'left', font: 'inherit',
        }}
      >
        <span>
          <p style={{ fontSize: 13, color: '#F4F1EB', margin: '0 0 4px', letterSpacing: '0.01em' }}>
            Service provider discounts
          </p>
          <p style={{ fontSize: 12, color: '#6B6760', margin: 0, lineHeight: 1.6 }}>
            Mercury, Deel, OpenAI, Ellis
          </p>
        </span>
        <span
          aria-hidden="true"
          style={{
            position: 'relative', flexShrink: 0, width: 16, height: 16, marginTop: 3,
            transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 0.3s ease',
          }}
        >
          <span style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: 1, background: '#6B6760', transform: 'translateY(-50%)' }} />
          <span style={{ position: 'absolute', left: '50%', top: 0, width: 1, height: '100%', background: '#6B6760', transform: 'translateX(-50%)' }} />
        </span>
      </button>

      <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows 0.35s ease' }}>
        <div style={{ overflow: 'hidden' }}>
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 10,
            marginTop: 16, paddingLeft: 16, paddingTop: 2, paddingBottom: 2,
            borderLeft: '1px solid #3D3A34',
          }}>
            {POINTS.map((point, i) => (
              <p key={i} style={{ fontSize: 12, color: '#8A867E', margin: 0, lineHeight: 1.6 }}>
                {point}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
