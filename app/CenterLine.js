import { useId } from 'react'

// A quiet, static seam mark between two same-background sections — a single
// soft hand-drawn line, distinct from the animated flowing dividers elsewhere
// on the page. No scroll-tied motion, just a gentle pen wobble.
const PATH = 'M-40,32 C120,20 220,44 340,30 C460,16 560,42 680,28 C800,14 900,40 1020,26 C1100,18 1160,32 1240,24'

export default function CenterLine({ background = '#F4F1EB' }) {
  const filterId = `pen-jitter-center-${useId().replace(/[^a-zA-Z0-9]/g, '')}`

  return (
    <section style={{ background, padding: '8px 56px' }}>
      <svg
        viewBox="0 0 1200 56"
        preserveAspectRatio="none"
        style={{ display: 'block', width: '100%', height: 56, maxWidth: 1040, margin: '0 auto' }}
      >
        <defs>
          <filter id={filterId} x="-20%" y="-60%" width="140%" height="220%">
            <feTurbulence type="fractalNoise" baseFrequency="0.015 0.05" numOctaves="2" seed="11" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <path
          d={PATH}
          fill="none"
          stroke="#1A1815"
          strokeOpacity="0.2"
          strokeWidth="1.1"
          strokeLinecap="round"
          filter={`url(#${filterId})`}
        />
      </svg>
    </section>
  )
}
