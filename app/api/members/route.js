import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '../../../lib/supabase-server'

function cleanCompany(raw) {
  if (!raw) return ''
  return raw.replace(/\s*\(https?:\/\/[^)]+\)/g, '').trim()
}

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let res
  try {
    res = await fetch('https://api.attio.com/v2/objects/people/records/query', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.ATTIO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ limit: 500 }),
      cache: 'no-store',
    })
  } catch (err) {
    console.error('Attio request failed:', err.message)
    return NextResponse.json([], { status: 500 })
  }

  if (!res.ok) {
    return NextResponse.json([], { status: 500 })
  }

  const data = await res.json()

  const members = data.data
    .map((record) => {
      const v = record.values
      return {
        id: record.id.record_id,
        name: v.name?.[0]?.full_name ?? '',
        jobTitle: v.job_title?.[0]?.value ?? '',
        company: cleanCompany(v.company_7?.[0]?.value),
        location: v.primary_location?.[0]?.locality ?? '',
        linkedin: v.linkedin?.[0]?.value ?? '',
        email: v.email_addresses?.[0]?.email_address ?? '',
        description: v.description?.[0]?.value ?? '',
        avatar: v.avatar_url?.[0]?.value ?? '',
        roles: (v.role_5 ?? []).map((x) => x.option.title),
      }
    })
    .filter((m) => m.name)
    .sort((a, b) => a.name.localeCompare(b.name))

  return NextResponse.json(members)
}
