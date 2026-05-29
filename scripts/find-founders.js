import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env') })

const TOKEN = process.env.APIFY_API_TOKEN
const ACTOR = 'harvestapi/linkedin-profile-search'

// European countries used to filter results post-scrape.
// We match against education (school locations) and past experience locations.
const EUROPEAN_COUNTRIES = [
  'Sweden', 'Norway', 'Denmark', 'Finland', 'Iceland',
  'Germany', 'Austria', 'Switzerland',
  'France', 'Belgium', 'Netherlands', 'Luxembourg',
  'United Kingdom', 'Ireland',
  'Spain', 'Portugal', 'Italy', 'Greece',
  'Poland', 'Czech', 'Hungary', 'Romania', 'Bulgaria',
  'Estonia', 'Latvia', 'Lithuania',
]

function looksEuropean(profile) {
  const text = JSON.stringify([
    profile.education ?? [],
    profile.experience ?? [],
    profile.about ?? '',
  ]).toLowerCase()

  return EUROPEAN_COUNTRIES.some((c) => text.includes(c.toLowerCase()))
}

async function startRun() {
  const input = {
    profileScraperMode: 'Short',
    currentJobTitles: ['Founder', 'Co-Founder', 'CEO', 'CTO', 'Founding CEO'],
    locations: ['San Francisco, California, United States'],
    maxItems: 20,
    takePages: 1,
  }

  console.log('Starting Apify actor run…')
  console.log('Input:', JSON.stringify(input, null, 2), '\n')

  const res = await fetch(
    `https://api.apify.com/v2/acts/${encodeURIComponent(ACTOR)}/runs?token=${TOKEN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }
  )

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Failed to start run: ${res.status} — ${body}`)
  }

  const { data } = await res.json()
  console.log(`Run started. ID: ${data.id}  Status: ${data.status}`)
  return data.id
}

async function waitForRun(runId) {
  const pollInterval = 5000
  process.stdout.write('Waiting for run to finish')

  while (true) {
    await new Promise((r) => setTimeout(r, pollInterval))
    process.stdout.write('.')

    const res = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${TOKEN}`)
    const { data } = await res.json()

    if (data.status === 'SUCCEEDED') {
      console.log(' done.\n')
      return data
    }
    if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(data.status)) {
      console.log()
      throw new Error(`Run ended with status: ${data.status}`)
    }
  }
}

async function fetchResults(defaultDatasetId) {
  const res = await fetch(
    `https://api.apify.com/v2/datasets/${defaultDatasetId}/items?token=${TOKEN}&format=json`
  )
  if (!res.ok) throw new Error(`Failed to fetch results: ${res.status}`)
  return res.json()
}

function printProfile(p) {
  const name = [p.firstName, p.lastName].filter(Boolean).join(' ')
  const title = p.headline ?? ''
  const location = [p.location?.city, p.location?.country].filter(Boolean).join(', ')
  const url = p.linkedinUrl ?? ''
  console.log(`  ${name}`)
  console.log(`    ${title}`)
  console.log(`    ${location}`)
  console.log(`    ${url}`)
  console.log()
}

async function main() {
  const runId = await startRun()
  const run = await waitForRun(runId)

  const profiles = await fetchResults(run.defaultDatasetId)
  console.log(`Total profiles returned: ${profiles.length}`)

  const europeanFounders = profiles.filter(looksEuropean)
  console.log(`Likely European (education/experience match): ${europeanFounders.length}\n`)

  if (europeanFounders.length > 0) {
    console.log('--- Likely European founders ---\n')
    europeanFounders.forEach(printProfile)
  }

  console.log('--- All profiles ---\n')
  profiles.forEach(printProfile)
}

main().catch((err) => { console.error(err); process.exit(1) })
