'use client'

import { useEffect, useId, useRef, useState } from 'react'

// A quiet transition beat between sections: hand-drawn-feeling lines that
// draw themselves in as the user scrolls past, echoing movement/transition
// (Europe → US) without literally depicting a map.
const PATHS = [
  { d: 'M-40,42 C120,26 180,58 260,36 C360,10 430,68 520,44 C610,20 680,64 760,42 C860,16 940,60 1040,38 C1120,20 1180,46 1260,32', color: '#1A1815', opacity: 0.18, width: 1.2 },
  { d: 'M-40,82 C90,104 160,66 250,90 C350,116 420,64 520,88 C610,110 690,68 780,90 C870,112 950,70 1040,88 C1120,104 1190,76 1260,92', color: '#6B6760', opacity: 0.24, width: 1 },
  { d: 'M-40,122 C110,100 190,132 280,112 C380,90 450,138 540,116 C630,94 710,136 800,114 C890,92 970,132 1060,112 C1140,96 1200,118 1260,104', color: '#A8A49C', opacity: 0.32, width: 1 },
]

const PAD = 40
const CANVAS_H = 160

export default function FlowLines({ background = '#F4F1EB', mirror = false }) {
  const sectionRef = useRef(null)
  const pathRefs = useRef([])
  const [motionOk, setMotionOk] = useState(false)
  const filterId = `pen-jitter-${useId().replace(/[^a-zA-Z0-9]/g, '')}`

  useEffect(() => {
    setMotionOk(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const lengths = pathRefs.current.map((p) => (p ? p.getTotalLength() : 0))

    pathRefs.current.forEach((p, i) => {
      if (!p) return
      p.style.strokeDasharray = `${lengths[i]}`
      p.style.strokeDashoffset = reducedMotion ? '0' : `${lengths[i]}`
    })

    if (reducedMotion) return

    let ticking = false

    const update = () => {
      ticking = false
      const el = sectionRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const raw = (vh - rect.top) / (vh + rect.height)
      const progress = Math.min(1, Math.max(0, raw))

      pathRefs.current.forEach((p, i) => {
        if (!p) return
        const len = lengths[i]
        // stagger each line slightly so they don't draw in lockstep
        const start = i * 0.1
        const local = Math.min(1, Math.max(0, (progress - start) / (1 - start)))
        p.style.strokeDashoffset = `${len * (1 - local)}`
      })
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background,
        paddingTop: PAD,
        paddingBottom: PAD,
      }}
    >
      <svg
        viewBox={`0 0 1200 ${CANVAS_H}`}
        preserveAspectRatio="none"
        style={{ display: 'block', width: '100%', height: CANVAS_H, transform: mirror ? 'scaleX(-1)' : undefined }}
      >
        <defs>
          <filter id={filterId} x="-20%" y="-30%" width="140%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.05" numOctaves="2" seed="7" result="noise">
              {motionOk && (
                <animate attributeName="baseFrequency" values="0.012 0.05;0.017 0.065;0.012 0.05" dur="11s" repeatCount="indefinite" />
              )}
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        {PATHS.map((p, i) => (
          <path
            key={i}
            ref={(el) => (pathRefs.current[i] = el)}
            d={p.d}
            fill="none"
            stroke={p.color}
            strokeOpacity={p.opacity}
            strokeWidth={p.width}
            strokeLinecap="round"
            filter={`url(#${filterId})`}
          />
        ))}
      </svg>
    </section>
  )
}
