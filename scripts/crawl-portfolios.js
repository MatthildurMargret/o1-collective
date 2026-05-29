import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { writeFileSync, mkdirSync } from 'fs'
import { chromium } from 'playwright'
import Anthropic from '@anthropic-ai/sdk'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env') })

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Defaults — overridden by CLI flags (--max-detail N, --no-detail, --source-timeout N)
let MAX_DETAIL_PAGES = 20
let SKIP_DETAILS = false
let SOURCE_TIMEOUT_MS = 120_000  // 2 min hard cap per source

const SOURCES = [
  { name: 'Y Combinator',        url: 'https://www.ycombinator.com/companies' },
  { name: 'Sequoia Capital',     url: 'https://www.sequoiacap.com/companies' },
  { name: 'a16z',                url: 'https://a16z.com/portfolio' },
  { name: 'Founders Fund',       url: 'https://foundersfund.com/portfolio' },
  { name: 'Khosla Ventures',     url: 'https://www.khoslaventures.com/portfolio' },
  { name: 'Benchmark',           url: 'https://www.benchmark.com/companies' },
  { name: 'Lightspeed',          url: 'https://lsvp.com/companies' },
  { name: 'General Catalyst',    url: 'https://www.generalcatalyst.com/portfolio' },
  { name: 'NEA',                 url: 'https://www.nea.com/portfolio' },
  { name: 'First Round Capital', url: 'https://firstround.com/companies' },
  { name: 'Initialized Capital', url: 'https://initialized.com/portfolio' },
  { name: 'Pear VC',             url: 'https://pear.vc/portfolio' },
  { name: 'Bessemer',            url: 'https://www.bvp.com/portfolio' },
  { name: 'Lux Capital',         url: 'https://luxcapital.com/companies' },
  { name: 'Soma Capital',        url: 'https://somacap.com/portfolio' },
  { name: 'Abstract Ventures',   url: 'https://abstractvc.com/portfolio' },
  { name: 'Alchemist',           url: 'https://alchemistaccelerator.com/portfolio' },
  { name: '500 Global',          url: 'https://500.co/portfolio' },
  { name: 'Plug and Play',       url: 'https://www.plugandplaytechcenter.com/portfolio' },
  { name: 'Balderton Capital',   url: 'https://www.balderton.com/portfolio' },
  { name: 'Index Ventures',      url: 'https://www.indexventures.com/companies' },
  { name: 'Accel',               url: 'https://www.accel.com/companies' },
  { name: 'Atomico',             url: 'https://www.atomico.com/portfolio' },
]

// ─── page helpers ────────────────────────────────────────────────────────────

async function loadAndScroll(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await page.waitForTimeout(3000)

  for (let i = 0; i < 6; i++) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(1200)
  }

  const loadMoreSelectors = [
    'button:has-text("Load more")', 'button:has-text("Show more")',
    'button:has-text("View more")', 'button:has-text("See more")',
    '[class*="load-more"]', '[class*="loadmore"]',
  ]
  for (const sel of loadMoreSelectors) {
    try {
      const btn = page.locator(sel).first()
      if (await btn.isVisible({ timeout: 1000 })) {
        await btn.click()
        await page.waitForTimeout(2000)
        break
      }
    } catch { /* not found */ }
  }
}

async function getPageText(page) {
  return page.evaluate(() => {
    document.querySelectorAll('script, style, nav, footer, header, [class*="cookie"], [class*="banner"]')
      .forEach((el) => el.remove())
    const main = document.querySelector('main, [role="main"], #main, #content') || document.body
    return main.innerText.replace(/\n{3,}/g, '\n\n').trim()
  })
}

// ─── company detail links ─────────────────────────────────────────────────────

// Returns same-domain links that look like individual company pages.
// Skips nav, footer, and external links so we don't crawl the whole site.
async function findCompanyDetailLinks(page, portfolioUrl) {
  const host = new URL(portfolioUrl).hostname
  const portfolioPath = new URL(portfolioUrl).pathname  // e.g. /companies or /portfolio

  return page.evaluate(({ host, portfolioPath }) => {
    // Path segments that signal a company detail page
    const detailPatterns = [
      /^\/(portfolio|companies|company|startups|investments|portfolio-companies)\/[^/?#]+\/?$/i,
    ]

    const seen = new Set()
    return Array.from(document.querySelectorAll('a[href]'))
      .map((a) => {
        try {
          const url = new URL(a.href)
          return { href: url.href, pathname: url.pathname, hostname: url.hostname }
        } catch { return null }
      })
      .filter((link) => {
        if (!link) return false
        if (link.hostname !== host) return false                   // skip external
        if (link.pathname === portfolioPath) return false          // skip the portfolio page itself
        if (!detailPatterns.some((re) => re.test(link.pathname))) return false
        if (seen.has(link.href)) return false
        seen.add(link.href)
        return true
      })
      .map((l) => l.href)
  }, { host, portfolioPath })
}

// ─── modal / card click approach ─────────────────────────────────────────────

// For sites where clicking a card opens an in-page modal rather than navigating.
// Returns text from the modal if one appeared, otherwise null.
async function tryClickForModal(page, cardLocator) {
  const overlaySelectors = [
    '[role="dialog"]', '[class*="modal"]', '[class*="overlay"]',
    '[class*="drawer"]', '[class*="panel"]', '[class*="lightbox"]',
  ]

  try {
    await cardLocator.click({ timeout: 3000 })
    await page.waitForTimeout(800)

    for (const sel of overlaySelectors) {
      const el = page.locator(sel).first()
      if (await el.isVisible({ timeout: 500 })) {
        const text = await el.innerText()
        // Close it — try Escape, then a close button
        await page.keyboard.press('Escape')
        await page.waitForTimeout(400)
        const closeBtn = page.locator('[aria-label="Close"], button:has-text("Close"), [class*="close"]').first()
        if (await closeBtn.isVisible({ timeout: 400 })) await closeBtn.click()
        return text
      }
    }
  } catch { /* click failed or no modal */ }

  return null
}

// ─── Claude extraction ────────────────────────────────────────────────────────

async function extractCompanyList(text, sourceName) {
  const CHUNK = 10000
  const allCompanies = []

  for (let i = 0; i < Math.min(text.length, 50000); i += CHUNK) {
    const chunk = text.slice(i, i + CHUNK)
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `Extract portfolio companies from this ${sourceName} page excerpt.

Return a JSON array. Include only fields actually present:
- name (string, required)
- description (string)
- founders (string array — only if explicitly listed)
- website (string)
- sector (string)
- stage (string)

Page excerpt:
${chunk}

Return ONLY a valid JSON array, nothing else.`,
      }],
    })

    const raw = response.content[0].text.trim()
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) allCompanies.push(...parsed)
    } catch {
      const match = raw.match(/\[[\s\S]*\]/)
      if (match) {
        try { allCompanies.push(...JSON.parse(match[0])) } catch { /* skip */ }
      }
    }
  }

  const seen = new Set()
  return allCompanies.filter((c) => {
    const key = (c.name ?? '').toLowerCase().trim()
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

async function enrichFromDetailText(text, companyName) {
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `This is a detail page for portfolio company "${companyName}".

Extract any additional information present:
- founders (string array)
- description (string)
- website (string)
- sector (string)
- stage (string)
- location (string)
- founded (string — year or date)

Page text:
${text.slice(0, 6000)}

Return ONLY a JSON object with the fields you found. Omit fields not present.`,
    }],
  })

  const raw = response.content[0].text.trim()
  try { return JSON.parse(raw) } catch {
    const match = raw.match(/\{[\s\S]*\}/)
    if (match) { try { return JSON.parse(match[0]) } catch { /* skip */ } }
  }
  return {}
}

// ─── merge helpers ────────────────────────────────────────────────────────────

function normalise(name) {
  return (name ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

function mergeCompany(base, detail) {
  const merged = { ...base }
  for (const [k, v] of Object.entries(detail)) {
    if (!v || (Array.isArray(v) && v.length === 0)) continue
    // Prefer detail data for founders/location/founded; keep base description if longer
    if (k === 'description' && base.description && base.description.length > (v?.length ?? 0)) continue
    merged[k] = v
  }
  return merged
}

// ─── per-source scrape ────────────────────────────────────────────────────────

async function scrapeSource(browser, source) {
  console.log(`\n[${source.name}] Loading ${source.url}`)
  const page = await browser.newPage()

  try {
    await loadAndScroll(page, source.url)
    const pageText = await getPageText(page)
    console.log(`[${source.name}] ${pageText.length.toLocaleString()} chars — extracting company list…`)

    let companies = await extractCompanyList(pageText, source.name)
    console.log(`[${source.name}] ${companies.length} companies from main page`)

    // ── Try detail pages ──────────────────────────────────────────────────────
    if (!SKIP_DETAILS) {
      const detailLinks = await findCompanyDetailLinks(page, source.url)
      const toVisit = detailLinks.slice(0, MAX_DETAIL_PAGES)

      if (toVisit.length > 0) {
        console.log(`[${source.name}] Found ${detailLinks.length} detail links — visiting up to ${toVisit.length}`)

        for (const href of toVisit) {
          try {
            await page.goto(href, { waitUntil: 'domcontentloaded', timeout: 15000 })
            await page.waitForTimeout(1000)
            const detailText = await getPageText(page)

            const slug = href.split('/').filter(Boolean).pop() ?? ''
            const companyName = slug.replace(/-/g, ' ')

            const detail = await enrichFromDetailText(detailText, companyName)

            const matchKey = normalise(companyName)
            const idx = companies.findIndex((c) => normalise(c.name) === matchKey)
            if (idx !== -1) {
              companies[idx] = mergeCompany(companies[idx], detail)
            } else if (detail && Object.keys(detail).length > 0) {
              companies.push({ name: companyName, ...detail })
            }

            process.stdout.write('.')
          } catch { process.stdout.write('x') }

          await new Promise((r) => setTimeout(r, 400))
        }
        console.log()
      } else {
        console.log(`[${source.name}] No navigable detail links found — skipping modal clicks`)
      }
    }

    // Back to portfolio page for next source
    await page.goto(source.url, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {})

    return { source: source.name, url: source.url, companies, scrapedAt: new Date().toISOString() }
  } catch (err) {
    console.error(`[${source.name}] FAILED: ${err.message}`)
    return { source: source.name, url: source.url, companies: [], error: err.message, scrapedAt: new Date().toISOString() }
  } finally {
    await page.close()
  }
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  const outDir = resolve(__dirname, 'output')
  mkdirSync(outDir, { recursive: true })

  // Parse CLI args — flags first, then source name filters
  // Flags: --max-detail N, --no-detail, --source-timeout N (ms), --out <file>
  const rawArgs = process.argv.slice(2)
  const flags = new Set()
  const sourceNames = []
  let customOut = null

  for (let i = 0; i < rawArgs.length; i++) {
    const a = rawArgs[i]
    if (a === '--no-detail') { SKIP_DETAILS = true }
    else if (a === '--max-detail') { MAX_DETAIL_PAGES = parseInt(rawArgs[++i] ?? '20', 10) }
    else if (a === '--source-timeout') { SOURCE_TIMEOUT_MS = parseInt(rawArgs[++i] ?? '120000', 10) }
    else if (a === '--out') { customOut = rawArgs[++i] }
    else { sourceNames.push(a) }
  }

  const sources = sourceNames.length > 0
    ? SOURCES.filter((s) => sourceNames.some((a) => s.name.toLowerCase().includes(a.toLowerCase())))
    : SOURCES

  if (sourceNames.length > 0 && sources.length === 0) {
    console.error(`No sources matched: ${sourceNames.join(', ')}`)
    console.error(`Available: ${SOURCES.map((s) => s.name).join(', ')}`)
    process.exit(1)
  }

  const outFile = customOut ?? (sourceNames.length > 0 ? 'portfolio-test.json' : 'portfolio-companies.json')
  const outPath = resolve(outDir, outFile)

  console.log(`Crawling ${sources.length} source(s)`)
  console.log(`  detail pages : ${SKIP_DETAILS ? 'SKIPPED' : `up to ${MAX_DETAIL_PAGES}`}`)
  console.log(`  source timeout : ${SOURCE_TIMEOUT_MS / 1000}s`)
  console.log(`  output : scripts/output/${outFile}\n`)

  const browser = await chromium.launch({ headless: true })
  const results = []

  const withTimeout = (promise, ms, source) => Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timed out after ${ms / 1000}s`)), ms)
    ),
  ]).catch((err) => ({
    source: source.name, url: source.url, companies: [],
    error: err.message, scrapedAt: new Date().toISOString(),
  }))

  try {
    for (const source of sources) {
      const result = await withTimeout(scrapeSource(browser, source), SOURCE_TIMEOUT_MS, source)
      results.push(result)
      writeFileSync(outPath, JSON.stringify(results, null, 2))
      await new Promise((r) => setTimeout(r, 1500))
    }
  } finally {
    await browser.close()
  }

  const totalCompanies = results.reduce((sum, r) => sum + r.companies.length, 0)
  const withFounders = results.reduce(
    (sum, r) => sum + r.companies.filter((c) => c.founders?.length > 0).length, 0
  )
  const failed = results.filter((r) => r.error).map((r) => r.source)

  console.log(`\n─── Done ───`)
  console.log(`Sources crawled    : ${results.length}`)
  console.log(`Total companies    : ${totalCompanies}`)
  console.log(`With founder names : ${withFounders}`)
  if (failed.length) console.log(`Failed             : ${failed.join(', ')}`)
  console.log(`Output             : scripts/output/portfolio-companies.json`)
}

main().catch((err) => { console.error(err); process.exit(1) })
