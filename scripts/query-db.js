import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { writeFileSync, mkdirSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env') })

const BASE_URL = process.env.SUPABASE_URL
const KEY = process.env.SUPABASE_ANON_KEY

if (!BASE_URL || !KEY) {
  console.error('SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env')
  process.exit(1)
}

const HEADERS = {
  'apikey': KEY,
  'Authorization': `Bearer ${KEY}`,
  'Accept': 'application/json',
}

// Only pull columns we actually want — skip embedding and historical blobs
const COLUMNS = [
  'id', 'name', 'description', 'tagline', 'status',
  'founded', 'country', 'region', 'locality',
  'website', 'linkedin_url', 'twitter_url', 'crunchbase_url',
  'industry_list', 'headcount',
  'financing_status', 'ownership_status',
  'latest_deal_type', 'latest_deal_date', 'latest_deal_amount', 'total_funding',
  'funding_round_count', 'investor_count',
  'source', 'source_deal_type', 'source_vertical', 'source_category',
  'founders',
].join(',')

// Filter: has founders + has raised some money
const FILTER = 'founders=not.is.null&total_funding=gt.0'

const PAGE_SIZE = 500

async function fetchPage(offset) {
  const url = `${BASE_URL}/rest/v1/companies?${FILTER}&select=${COLUMNS}&limit=${PAGE_SIZE}&offset=${offset}&order=id`
  const res = await fetch(url, { headers: { ...HEADERS, 'Prefer': 'count=exact' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  const total = parseInt(res.headers.get('content-range')?.split('/')[1] ?? '0', 10)
  const data = await res.json()
  return { data, total }
}

async function main() {
  const outDir = resolve(__dirname, 'output')
  mkdirSync(outDir, { recursive: true })

  console.log('Querying Supabase: companies with founders + funding > $0…\n')

  const { data: first, total } = await fetchPage(0)
  const pages = Math.ceil(total / PAGE_SIZE)
  console.log(`Total matching: ${total.toLocaleString()} companies across ${pages} page(s)\n`)

  const all = [...first]

  for (let page = 1; page < pages; page++) {
    const { data } = await fetchPage(page * PAGE_SIZE)
    all.push(...data)
    process.stdout.write(`  Fetched ${all.length.toLocaleString()} / ${total.toLocaleString()}\r`)
  }
  console.log()

  // Flatten founders to make it easier to work with downstream
  const records = all.map((c) => ({
    ...c,
    founder_names: (c.founders ?? []).map((f) => f.name).filter(Boolean),
    founder_linkedins: (c.founders ?? []).map((f) => f.linkedin_url || f.profile_url).filter(Boolean),
  }))

  const outPath = resolve(outDir, 'db-founders.json')
  writeFileSync(outPath, JSON.stringify(records, null, 2))

  // Quick summary
  const withLinkedin = records.filter((r) => r.founder_linkedins.length > 0).length
  const byStage = {}
  records.forEach((r) => {
    const stage = r.latest_deal_type || r.financing_status || 'unknown'
    byStage[stage] = (byStage[stage] || 0) + 1
  })

  console.log(`\n─── Done ───`)
  console.log(`Companies exported     : ${records.length.toLocaleString()}`)
  console.log(`With founder LinkedIn  : ${withLinkedin.toLocaleString()}`)
  console.log(`\nBreakdown by stage:`)
  Object.entries(byStage)
    .sort((a, b) => b[1] - a[1])
    .forEach(([k, v]) => console.log(`  ${k.padEnd(30)} ${v}`))
  console.log(`\nOutput: scripts/output/db-founders.json`)
}

main().catch((err) => { console.error(err); process.exit(1) })
