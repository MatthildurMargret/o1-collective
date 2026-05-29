import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { writeFileSync, readFileSync, mkdirSync } from 'fs'
import Anthropic from '@anthropic-ai/sdk'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env') })

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SF_BAY_KEYWORDS = [
  'san francisco', 'sf,', 'bay area', 'palo alto', 'mountain view',
  'menlo park', 'redwood city', 'sunnyvale', 'san jose', 'santa clara',
  'oakland', 'berkeley', 'south san francisco', 'san mateo', 'foster city',
  'burlingame', 'san carlos', 'campbell', 'los altos', 'cupertino',
  'fremont', 'emeryville', 'walnut creek', 'alameda', 'half moon bay',
  'pleasanton', 'livermore', 'milpitas', 'saratoga', 'los gatos',
]

function isInSFBayArea(location) {
  if (!location) return false
  const l = location.toLowerCase()
  return SF_BAY_KEYWORDS.some((k) => l.includes(k))
}

// ── Claude Haiku batch: does this person have European background? ─────────────
// Returns indices (into the batch) Claude thinks are likely European by background.
async function claudeEuropeanBackgroundBatch(items) {
  const list = items.map((it, idx) =>
    `${idx}. ${it.name || '(no name)'} | ${it.title || '(no title)'}`
  ).join('\n')

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: `Below are startup founders based in the SF Bay Area (name | LinkedIn headline).
Identify which ones likely have a European background — signals include:
- A distinctly European name (French, German, Scandinavian, Dutch, Iberian, Italian, Eastern European, etc.)
- Mentions a European company in their title (Spotify, SAP, HSBC, Revolut, Zalando, BNP, etc.)
- Mentions a European university (LSE, Oxford, Cambridge, HEC, INSEAD, ETH Zurich, LMU, TU Berlin, etc.)
- Mentions a European city or country

Do NOT flag names that are clearly American, Indian, East Asian, Latin American, or Middle Eastern.
Be conservative — only flag when there's a clear signal.

Founders:
${list}

Reply with ONLY a JSON array of the 0-based index numbers that are likely European. Example: [0, 3, 7]
If none, reply: []`,
    }],
  })

  const raw = response.content[0].text.trim()
  try {
    const match = raw.match(/\[[\d,\s]*\]/)
    if (match) return JSON.parse(match[0])
  } catch { /* skip */ }
  return []
}

async function main() {
  const companies = JSON.parse(readFileSync(resolve(__dirname, 'output/db-founders.json'), 'utf8'))
  console.log(`Loaded ${companies.length.toLocaleString()} companies\n`)

  // Step 1: find all founders currently in SF/Bay Area
  // Build a flat list: { companyId, founderIdx, name, title, location }
  const sfFounders = []
  for (const c of companies) {
    for (let i = 0; i < (c.founders || []).length; i++) {
      const f = c.founders[i]
      if (isInSFBayArea(f.location)) {
        sfFounders.push({ companyId: c.id, founderIdx: i, name: f.name, title: f.title, location: f.location })
      }
    }
  }

  console.log(`Step 1: ${sfFounders.length} founders currently in SF/Bay Area`)

  // Step 2: run Claude on all of them to detect European background
  const BATCH = 30
  const europeanFounderKeys = new Set() // "companyId:founderIdx"

  for (let i = 0; i < sfFounders.length; i += BATCH) {
    const batch = sfFounders.slice(i, i + BATCH)
    const hits = await claudeEuropeanBackgroundBatch(batch)
    for (const idx of hits) {
      if (batch[idx]) europeanFounderKeys.add(`${batch[idx].companyId}:${batch[idx].founderIdx}`)
    }
    process.stdout.write(`  Analyzed ${Math.min(i + BATCH, sfFounders.length)} / ${sfFounders.length}\r`)
  }
  console.log()

  console.log(`Step 2: Claude flagged ${europeanFounderKeys.size} founders as European background\n`)

  // Step 3: build output — one record per company that has at least one EU-background SF founder
  const companyMap = Object.fromEntries(companies.map((c) => [c.id, c]))
  const results = []
  const seenCompanies = new Set()

  for (const key of europeanFounderKeys) {
    const [companyId, founderIdxStr] = key.split(':')
    const company = companyMap[companyId]
    if (!company || seenCompanies.has(companyId)) {
      if (!seenCompanies.has(companyId)) seenCompanies.add(companyId)
      // Still need to tag the founder on the already-added company
      continue
    }
    seenCompanies.add(companyId)

    // Collect all EU-background founders for this company
    const euFounderIndices = [...europeanFounderKeys]
      .filter((k) => k.startsWith(companyId + ':'))
      .map((k) => parseInt(k.split(':')[1], 10))

    results.push({
      ...company,
      eu_founders: euFounderIndices.map((i) => company.founders[i]),
    })
  }

  const outDir = resolve(__dirname, 'output')
  mkdirSync(outDir, { recursive: true })
  writeFileSync(resolve(outDir, 'european-founders.json'), JSON.stringify(results, null, 2))

  console.log(`─── Done ───`)
  console.log(`Companies with EU-background founders in SF : ${results.length}`)
  console.log(`Total EU-background founders flagged        : ${europeanFounderKeys.size}`)
  console.log(`Output: scripts/output/european-founders.json`)
}

main().catch((err) => { console.error(err); process.exit(1) })
