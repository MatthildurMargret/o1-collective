const noiseSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`
const noiseDataUri = `data:image/svg+xml;utf8,${encodeURIComponent(noiseSvg)}`

// Consistent subtle grain for dark (#1A1815) sections across the site.
// Parent must be position:relative (or similar) with overflow:hidden;
// sibling content needs its own position:relative to paint above this.
export default function GrainOverlay({ opacity = 0.15 }) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      backgroundImage: `url("${noiseDataUri}")`,
      opacity,
      mixBlendMode: 'screen',
      pointerEvents: 'none',
    }} />
  )
}
