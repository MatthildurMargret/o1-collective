import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { findApprovedMember } from '../../../../lib/membership'

function adminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

async function checkHasAccount(email) {
  try {
    const { data } = await adminClient().from('profiles').select('id').eq('email', email).maybeSingle()
    return !!data
  } catch {
    return null
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')?.toLowerCase().trim()

  if (!email) return NextResponse.json({ found: false })

  const [hasAccount, member] = await Promise.all([
    checkHasAccount(email),
    findApprovedMember(email),
  ])

  if (!member) return NextResponse.json({ found: false })

  // This endpoint is unauthenticated (it powers the pre-login email check), so it must
  // not leak member PII — only enough to route the user to sign-in vs. account creation.
  return NextResponse.json({ found: true, hasAccount })
}
