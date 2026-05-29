import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function cleanCompany(raw) {
  if (!raw) return ''
  return raw.replace(/\s*\(https?:\/\/[^)]+\)/g, '').trim()
}

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

async function checkApproved(email) {
  try {
    const { data } = await adminClient()
      .from('applications')
      .select('name, role, company, linkedin')
      .eq('email', email)
      .eq('status', 'approved')
      .maybeSingle()
    return data ?? null
  } catch {
    return null
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')?.toLowerCase().trim()

  if (!email) return NextResponse.json({ found: false })

  const [attioRes, hasAccount, approved] = await Promise.all([
    fetch('https://api.attio.com/v2/objects/people/records/query', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.ATTIO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ limit: 500 }),
      next: { revalidate: 60 },
    }),
    checkHasAccount(email),
    checkApproved(email),
  ])

  // Check Attio first
  if (attioRes.ok) {
    const data = await attioRes.json()
    for (const record of data.data ?? []) {
      const v = record.values
      const emails = (v.email_addresses ?? []).map((e) => e.email_address?.toLowerCase()).filter(Boolean)
      if (emails.includes(email)) {
        return NextResponse.json({
          found: true,
          hasAccount,
          name: v.name?.[0]?.full_name ?? '',
          jobTitle: v.job_title?.[0]?.value ?? '',
          company: cleanCompany(v.company_7?.[0]?.value),
          location: v.primary_location?.[0]?.locality ?? '',
          linkedin: v.linkedin?.[0]?.value ?? '',
          description: v.description?.[0]?.value ?? '',
          attioId: record.id.record_id,
        })
      }
    }
  }

  // Fall back to approved application
  if (approved) {
    return NextResponse.json({
      found: true,
      hasAccount,
      name: approved.name ?? '',
      jobTitle: approved.role ?? '',
      company: approved.company ?? '',
      location: '',
      linkedin: approved.linkedin ?? '',
      description: '',
      attioId: null,
    })
  }

  return NextResponse.json({ found: false })
}
