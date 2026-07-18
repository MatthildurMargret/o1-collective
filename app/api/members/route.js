import { NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '../../../lib/supabase-server'

function cleanCompany(raw) {
  if (!raw) return ''
  return raw.replace(/\s*\(https?:\/\/[^)]+\)/g, '').trim()
}

function adminClient() {
  return createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
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

  const { data: profiles } = await adminClient()
    .from('profiles')
    .select('email, name, job_title, company, location, linkedin, bio, avatar_url')

  const profileByEmail = new Map(
    (profiles ?? [])
      .filter((p) => p.email)
      .map((p) => [p.email.toLowerCase(), p])
  )

  const members = data.data
    .map((record) => {
      const v = record.values
      const email = v.email_addresses?.[0]?.email_address ?? ''
      const profile = profileByEmail.get(email.toLowerCase())
      return {
        id: record.id.record_id,
        name: profile?.name || v.name?.[0]?.full_name || '',
        jobTitle: profile?.job_title || v.job_title?.[0]?.value || '',
        company: profile?.company || cleanCompany(v.company_7?.[0]?.value),
        location: profile?.location || v.primary_location?.[0]?.locality || '',
        linkedin: profile?.linkedin || v.linkedin?.[0]?.value || '',
        description: profile?.bio || v.description?.[0]?.value || '',
        avatar: profile?.avatar_url || v.avatar_url?.[0]?.value || '',
        roles: (v.role_5 ?? []).map((x) => x.option.title),
      }
    })
    .filter((m) => m.name)
    .sort((a, b) => a.name.localeCompare(b.name))

  return NextResponse.json(members)
}
