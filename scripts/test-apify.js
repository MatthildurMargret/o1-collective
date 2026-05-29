import 'dotenv/config'
import { createRequire } from 'module'

// Load .env from repo root
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env') })

const TOKEN = process.env.APIFY_API_TOKEN

if (!TOKEN) {
  console.error('APIFY_API_TOKEN not found in .env')
  process.exit(1)
}

async function main() {
  console.log('Testing Apify connection…\n')

  // 1. Verify the token by fetching account info
  const meRes = await fetch(`https://api.apify.com/v2/users/me?token=${TOKEN}`)
  if (!meRes.ok) {
    console.error(`Auth failed: ${meRes.status} ${meRes.statusText}`)
    process.exit(1)
  }
  const me = await meRes.json()
  const { username, email, plan } = me.data
  console.log('Account:')
  console.log(`  Username : ${username}`)
  console.log(`  Email    : ${email}`)
  console.log(`  Plan     : ${plan?.id ?? 'unknown'}\n`)

  // 2. List recent actor runs (last 5) to confirm API access
  const runsRes = await fetch(`https://api.apify.com/v2/actor-runs?token=${TOKEN}&limit=5&desc=1`)
  if (!runsRes.ok) {
    console.error(`Could not fetch runs: ${runsRes.status}`)
    process.exit(1)
  }
  const runs = await runsRes.json()
  const items = runs.data?.items ?? []
  if (items.length === 0) {
    console.log('No recent actor runs found (account is fresh).')
  } else {
    console.log(`Last ${items.length} actor run(s):`)
    items.forEach((r) => {
      console.log(`  [${r.status}] ${r.actId}  started: ${new Date(r.startedAt).toLocaleString()}`)
    })
  }

  console.log('\nApify key is working.')
}

main().catch((err) => { console.error(err); process.exit(1) })
