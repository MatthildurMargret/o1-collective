import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { writeFileSync, readFileSync, mkdirSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env') })

const BASE_URL = process.env.SUPABASE_URL
const KEY = process.env.SUPABASE_ANON_KEY
const HEADERS = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Accept': 'application/json' }

async function fetchInvestors(ids) {
  const map = {}
  for (let i = 0; i < ids.length; i += 100) {
    const batch = ids.slice(i, i + 100)
    const filter = `id=in.(${batch.map((id) => `"${id}"`).join(',')})`
    const res = await fetch(`${BASE_URL}/rest/v1/companies?select=id,source_investors&${filter}`, { headers: HEADERS })
    const rows = await res.json()
    rows.forEach((r) => { map[r.id] = r.source_investors || '' })
  }
  return map
}

function formatMoney(n) {
  if (!n) return ''
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

async function main() {
  const data = JSON.parse(readFileSync(resolve(__dirname, 'output/european-founders.json'), 'utf8'))
  console.log(`Loaded ${data.length} companies — fetching investor data…`)

  const investorMap = await fetchInvestors(data.map((c) => c.id))

  const header = ['Founder Name', 'LinkedIn Profile', 'Company Name', 'Location', 'Company Website', 'Stage', 'Total Funding', 'Investors']
  const rows = [header]
  const seen = new Set()

  data.forEach((c) => {
    const stage = c.latest_deal_type || c.financing_status || ''
    const funding = formatMoney(c.total_funding)
    const investors = investorMap[c.id] || ''

    for (const f of (c.eu_founders || c.founders || [])) {
      const name = (f.name || '').trim()
      if (!name || seen.has(name.toLowerCase())) continue
      seen.add(name.toLowerCase())
      rows.push([
        name,
        f.linkedin_url || f.profile_url || '',
        c.name || '',
        f.location || '',
        c.website || '',
        stage,
        funding,
        investors,
      ])
    }
  })

  const csv = rows
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  mkdirSync(resolve(__dirname, 'output'), { recursive: true })
  const outPath = resolve(__dirname, 'output/european-founders.csv')
  writeFileSync(outPath, csv)

  console.log(`Rows (excl. header) : ${rows.length - 1}`)
  console.log(`With investor data  : ${rows.slice(1).filter((r) => r[7]).length}`)
  console.log(`Output              : scripts/output/european-founders.csv`)
}

main().catch((err) => { console.error(err); process.exit(1) })
