import { NextResponse } from 'next/server'

function cleanCompany(raw) {
  if (!raw) return ''
  return raw.replace(/\s*\(https?:\/\/[^)]+\)/g, '').trim()
}

export async function GET() {
  const res = await fetch('https://api.attio.com/v2/objects/people/records/query', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.ATTIO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ limit: 500 }),
    cache: 'no-store',
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
  }

  const data = await res.json()

  const members = data.data
    .map((record) => {
      const v = record.values
      return {
        id: record.id.record_id,
        name: v.name[0]?.full_name ?? '',
        jobTitle: v.job_title[0]?.value ?? '',
        company: cleanCompany(v.company_7[0]?.value),
        location: v.primary_location[0]?.locality ?? '',
        linkedin: v.linkedin[0]?.value ?? '',
        description: v.description[0]?.value ?? '',
        avatar: v.avatar_url[0]?.value ?? '',
        roles: (v.role_5 ?? []).map((x) => x.option.title),
      }
    })
    .filter((m) => m.name)
    .sort((a, b) => a.name.localeCompare(b.name))

  return NextResponse.json(members)
}
