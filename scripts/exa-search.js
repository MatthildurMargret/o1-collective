import Exa from 'exa-js'
import Anthropic from '@anthropic-ai/sdk'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { writeFileSync, mkdirSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env') })

const exa = new Exa(process.env.EXA_API_KEY)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── Article search queries — focused on funded / later-stage founders ─────────
const ARTICLE_QUERIES = [
  'European founder raised Series A San Francisco Silicon Valley 2023 2024',
  'European founder raised Series B funding San Francisco startup 2023 2024',
  'European startup founder Silicon Valley raised millions 2022 2023 2024',
  'European born CEO founder San Francisco unicorn startup funding',
  'Scandinavian Nordic founder San Francisco raised venture capital Series A B',
  'French founder Silicon Valley raised Series A B C funding',
  'German Swiss Dutch founder San Francisco raised venture funding',
  'British Irish founder Silicon Valley Series A B raised',
  'Eastern European founder San Francisco raised venture capital',
  'Forbes 30 under 30 European founder San Francisco startup',
  'European founder YC Y Combinator Series A raised San Francisco',
  'immigrant founder Europe Silicon Valley raised funding hundred million',
  'European co-founder American startup San Francisco raised Series',
]

// ── LinkedIn search queries — SF-based founders at funded companies ───────────
const LINKEDIN_QUERIES = [
  'site:linkedin.com/in founder "San Francisco" "Series A" OR "Series B" Sweden OR Norway OR Denmark OR Finland',
  'site:linkedin.com/in founder "San Francisco" "Series A" OR "Series B" Germany OR France OR Netherlands',
  'site:linkedin.com/in founder "San Francisco" "Series A" OR "Series B" "United Kingdom" OR Ireland',
  'site:linkedin.com/in founder "San Francisco" "raised" Spain OR Portugal OR Italy OR Switzerland',
  'site:linkedin.com/in founder "San Francisco" "Series A" Poland OR Czech OR Romania OR Sweden',
  'site:linkedin.com/in founder "San Francisco" Spotify OR Klarna OR Revolut OR N26 OR Wise OR Bolt',
  'site:linkedin.com/in founder "San Francisco" "ETH Zurich" OR "Oxford" OR "Cambridge" OR "INSEAD" OR "HEC"',
  'site:linkedin.com/in founder "San Francisco" "previously" Europe "Series" raised funding',
]

const SF_BAY_KEYWORDS = [
  'san francisco', 'bay area', 'palo alto', 'mountain view', 'menlo park',
  'redwood city', 'sunnyvale', 'san jose', 'santa clara', 'south san francisco',
  'berkeley', 'oakland', 'sf,', 'silicon valley',
]

function isInSFBayArea(text) {
  const t = (text || '').toLowerCase()
  return SF_BAY_KEYWORDS.some((k) => t.includes(k))
}

// ── Claude: extract CURRENT founders from article text ────────────────────────
async function extractFoundersFromArticle(title, url, text) {
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Extract European founders CURRENTLY based in Silicon Valley / San Francisco from this article.

Article: "${title}"
URL: ${url}

Text:
${text.slice(0, 6000)}

Return a JSON array. Include ONLY founders who:
1. Are European by origin/background
2. Are currently based in Silicon Valley or SF Bay Area (not historical figures from decades ago)
3. Have a current active company that has raised funding (any amount mentioned is a good signal)

Each object: { founder_name, company_name, european_country, funding_stage (e.g. "Series A", "Seed", "$10M raise" — whatever is mentioned), linkedin_url (if mentioned) }
Omit fields not present.

If none match, return [].
Return ONLY valid JSON, nothing else.`,
    }],
  })

  const raw = response.content[0].text.trim()
  try {
    const match = raw.match(/\[[\s\S]*\]/)
    if (match) return JSON.parse(match[0])
  } catch { /* skip */ }
  return []
}

// ── Claude: validate a LinkedIn profile is a current SF-based European founder ─
async function validateLinkedInProfile(name, company, snippet, linkedinUrl) {
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 128,
    messages: [{
      role: 'user',
      content: `LinkedIn profile: ${name} | ${company}
URL: ${linkedinUrl}
Snippet: ${snippet}

Is this person:
1. Currently based in San Francisco / Bay Area? (look for SF/Bay Area location in snippet)
2. Of European background? (European name, mentions European company/university/country)
3. A current startup founder or co-founder (not investor, not employee)?

Reply with ONLY: YES or NO`,
    }],
  })
  return response.content[0].text.trim().toUpperCase().startsWith('YES')
}

// ── main ──────────────────────────────────────────────────────────────────────
async function main() {
  const outDir = resolve(__dirname, 'output')
  mkdirSync(outDir, { recursive: true })

  const allFounders = []
  const seenNames = new Set()

  // ── Track 1: Article search ───────────────────────────────────────────────
  console.log('Track 1: Article search…\n')

  for (const query of ARTICLE_QUERIES) {
    process.stdout.write(`  "${query.slice(0, 60)}…" `)
    try {
      const res = await exa.searchAndContents(query, {
        numResults: 5,
        type: 'neural',
        text: { maxCharacters: 5000 },
        startPublishedDate: '2019-01-01',  // avoid historical articles
      })

      let hits = 0
      for (const article of res.results) {
        if (!article.text) continue
        const extracted = await extractFoundersFromArticle(article.title, article.url, article.text)
        for (const f of extracted) {
          const key = (f.founder_name || '').toLowerCase().trim()
          if (!key || seenNames.has(key)) continue
          seenNames.add(key)
          allFounders.push({ ...f, source: 'article', article_url: article.url })
          hits++
        }
      }
      console.log(`→ ${hits} new founders`)
    } catch (err) {
      console.log(`→ error: ${err.message}`)
    }
    await new Promise((r) => setTimeout(r, 300))
  }

  console.log(`\nTrack 1 total: ${allFounders.length} founders from articles\n`)

  // ── Track 2: LinkedIn direct search with SF validation ───────────────────
  console.log('Track 2: LinkedIn search (validating SF location)…\n')

  for (const query of LINKEDIN_QUERIES) {
    process.stdout.write(`  "${query.slice(0, 60)}…" `)
    try {
      const res = await exa.searchAndContents(query, {
        numResults: 10,
        type: 'neural',
        text: { maxCharacters: 800 },
      })

      let hits = 0
      for (const result of res.results) {
        if (!result.url.includes('linkedin.com/in/')) continue

        // Quick pre-filter: SF keywords must appear in the snippet
        if (!isInSFBayArea(result.text) && !isInSFBayArea(result.title)) continue

        const name = result.author || result.title?.split('|')[0]?.trim() || ''
        const key = name.toLowerCase().trim()
        if (!key || seenNames.has(key)) continue

        const company = result.title?.split('|')[1]?.trim() || ''
        const snippet = result.text || ''

        // Claude validates: SF-based + European background + current founder
        const valid = await validateLinkedInProfile(name, company, snippet, result.url)
        if (!valid) continue

        seenNames.add(key)
        allFounders.push({
          founder_name: name,
          company_name: company,
          linkedin_url: result.url,
          location_snippet: snippet.slice(0, 400),
          source: 'linkedin_search',
        })
        hits++
      }
      console.log(`→ ${hits} new valid profiles`)
    } catch (err) {
      console.log(`→ error: ${err.message}`)
    }
    await new Promise((r) => setTimeout(r, 400))
  }

  // ── Save ─────────────────────────────────────────────────────────────────
  const outPath = resolve(outDir, 'exa-founders.json')
  writeFileSync(outPath, JSON.stringify(allFounders, null, 2))

  const withLinkedIn = allFounders.filter((f) => f.linkedin_url).length
  const bySource = {}
  allFounders.forEach((f) => { bySource[f.source] = (bySource[f.source] || 0) + 1 })

  console.log(`\n─── Done ───`)
  console.log(`Total unique founders    : ${allFounders.length}`)
  console.log(`With LinkedIn URL        : ${withLinkedIn}`)
  console.log(`By source:`)
  Object.entries(bySource).forEach(([k, v]) => console.log(`  ${k.padEnd(20)} ${v}`))
  console.log(`Output: scripts/output/exa-founders.json`)
}

main().catch((err) => { console.error(err); process.exit(1) })
